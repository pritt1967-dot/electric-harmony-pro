"""Полный цикл: PDF собирается настоящим кодом сайта в браузере -> QR читается из PDF -> страница /verify -> сервер -> тестовая финансовая база."""
import asyncio, base64, json, os, subprocess, sys, urllib.request
from urllib.parse import urlparse
from playwright.async_api import async_playwright

BASE = os.environ["E2E_BASE"]; NOKEY = os.environ["E2E_BASE_NOKEY"]; OUT = os.environ["E2E_OUT"]; DB = os.environ["E2E_DB"]
docs = {d["label"]: d for d in json.load(open(f"{OUT}/docs.json"))}
A, B = docs["A"], docs["B"]
results = []
OK = "Документ подлинный, содержимое совпадает"; PDF_BAD = "Обнаружено изменение документа"
DATA = "Исходные финансовые данные изменились после формирования"; SIG = "Подпись недействительна"; NF = "Документ не найден"

def check(name, ok, detail=""):
    results.append((name, ok)); print(("PASS " if ok else "FAIL ") + name + ("" if ok else f" — получено: {detail}"))

def db(path, body, raw=False):
    h = {"Content-Type": "application/json"}
    if raw: h["x-e2e-raw"] = "1"
    return json.loads(urllib.request.urlopen(urllib.request.Request(f"{DB}/rest/v1/{path}", data=json.dumps(body).encode(), method="PATCH", headers=h)).read())

def read_codes(pdf):
    subprocess.run(["pdftoppm", "-r", "200", "-png", "-f", "1", "-l", "1", pdf, pdf[:-4]], check=True)
    pngs = [f for f in os.listdir(OUT) if f.startswith(os.path.basename(pdf[:-4])) and f.endswith(".png")]
    r = subprocess.run(["nix", "run", "nixpkgs#zbar", "--", "--quiet", "--raw", os.path.join(OUT, pngs[0])], capture_output=True, text=True)
    return [l for l in r.stdout.splitlines() if l]

async def title(page):
    await page.wait_for_function("() => { const t = document.querySelector('h1')?.textContent || ''; return t && !t.includes('Проверяем'); }", timeout=30000)
    return (await page.get_by_role("heading", level=1).text_content()).strip()

async def open_verify(page, base, url):
    u = urlparse(url); await page.goto(base + u.path + "?" + u.query); return await title(page)

async def upload(page, path):
    await page.wait_for_selector("input[type=file]")
    await page.get_by_label("Загрузить PDF для проверки").set_input_files(path)
    await page.wait_for_timeout(500); return await title(page)

BUILD = """async ({sec}) => {
  const { buildFinancePdf } = await import('/src/lib/finance-pdf.ts');
  const doc = await buildFinancePdf({ security: sec, customer: 'E2E Заказчик', projectName: 'E2E проект',
    income: 100000, expenses: 25000, remaining: 75000, byCategory: [{ name: 'Материалы', amount: 25000 }],
    balances: [], operations: [
      { operation_date: '2026-10-01', operation_type: 'income', from_name: 'Заказчик', to_name: 'S&M', amount: 100000, categoryName: 'Без статьи', comment: 'Аванс' },
      { operation_date: '2026-10-02', operation_type: 'expense', from_name: 'S&M', to_name: 'Поставщик', amount: 25000, categoryName: 'Материалы', comment: 'Кабель' }] });
  const b = new Uint8Array(doc.output('arraybuffer')); let s = ''; for (const x of b) s += String.fromCharCode(x); return btoa(s);
}"""

async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch(headless=True); page = await br.new_page()
        await page.goto(BASE + "/"); await page.wait_for_load_state("networkidle")
        for d in (A, B):
            sec = {k: d[k] for k in ("id", "verifyUrl", "checkCode", "issuedAt")}
            data = base64.b64decode(await page.evaluate(BUILD, {"sec": sec}))
            open(f"{OUT}/{d['label']}.pdf", "wb").write(data)
            reg = subprocess.run(["bun", "tests/e2e/register-pdf.ts", d["id"], f"{OUT}/{d['label']}.pdf"], capture_output=True, text=True)
            check(f"1. PDF {d['label']} сформирован кодом сайта и его отпечаток зафиксирован", data[:5] == b"%PDF-" and "registered" in reg.stdout, reg.stdout + reg.stderr)
        codes = read_codes(f"{OUT}/A.pdf")
        check("1. QR в PDF ведёт на проверку этого документа", A["verifyUrl"] in codes, codes)
        check("1. Code 128 в PDF содержит номер документа", A["id"] in codes, codes)
        t = await open_verify(page, BASE, A["verifyUrl"]); check("1. проверка по QR из PDF", t == OK, t)
        t = await upload(page, f"{OUT}/A.pdf")
        check("2. исходный PDF проходит проверку", t == OK and await page.get_by_text("Файл PDF сверён").count() == 1, t)
        raw = bytearray(open(f"{OUT}/A.pdf", "rb").read()); raw[len(raw) // 2] ^= 0x01
        open(f"{OUT}/A-1byte.pdf", "wb").write(raw)
        t = await upload(page, f"{OUT}/A-1byte.pdf"); check("3. изменение одного байта PDF выявлено", t == PDF_BAD, t)
        t = await upload(page, f"{OUT}/B.pdf"); check("4. настоящий QR документа A + PDF документа B — подмена выявлена", t == PDF_BAD, t)
        t = await open_verify(page, BASE, A["verifyUrl"].split("?s=")[0] + "?s=" + "0" * 32); check("4. поддельная QR-метка — документ не найден", t == NF, t)
        rec = subprocess.run(["bun", "tests/e2e/register-pdf.ts", A["id"], f"{OUT}/B.pdf"], capture_output=True, text=True)
        check("4. перезаписать отпечаток выданного PDF нельзя", rec.returncode == 3, rec.stdout)
        db("operations?id=eq.op-2", {"amount": 26000})
        t = await open_verify(page, BASE, A["verifyUrl"]); code_text = await page.locator("main").inner_text()
        check("5. изменение исходных данных обнаружено", t == DATA, t)
        check("5. контрольный код остаётся от зафиксированной версии", A["checkCode"] in code_text, code_text)
        t = await upload(page, f"{OUT}/A.pdf")
        check("5. исходный PDF по-прежнему сверяется со своей версией", t == DATA and await page.get_by_text("Файл PDF сверён").count() == 1, t)
        db("operations?id=eq.op-2", {"amount": 25000})
        t = await open_verify(page, BASE, A["verifyUrl"]); check("5. после возврата данных документ снова подлинный", t == OK, t)
        body = await page.locator("main").inner_text()
        check("публично не раскрываются суммы и участники", not any(s in body for s in ["100000", "25000", "Заказчик", "Поставщик", "Кабель"]), body)
        db(f"finance_documents?id=eq.{B['id']}", {"pdf_sha256": "f" * 64}, raw=True)
        t = await open_verify(page, BASE, B["verifyUrl"]); check("6. подмена отпечатка PDF в базе — подпись недействительна", t == SIG, t)
        db(f"finance_documents?id=eq.{A['id']}", {"fingerprint": "0" * 64}, raw=True)
        t = await open_verify(page, BASE, A["verifyUrl"]); check("6. подмена отпечатка данных в базе — подпись недействительна", t == SIG, t)
        db(f"finance_documents?id=eq.{A['id']}", {"signature": "0" * 64}, raw=True)
        t = await open_verify(page, BASE, A["verifyUrl"]); check("6. подменённая подпись записи — недействительна", t == SIG, t)
        t = await open_verify(page, NOKEY, B["verifyUrl"]); check("7. без серверного ключа (сайт) — не «подлинный»", t != OK and "недоступна" in t, t)
        r = subprocess.run(["bun", "tests/e2e/verify-no-key.ts", B["id"], B["verifyUrl"].split("?s=")[1]], capture_output=True, text=True)
        check("7. без серверного ключа (серверный код) — unavailable", r.stdout.strip() == "unavailable", r.stdout + r.stderr)
        await br.close()
    print(f"\nИТОГО: {sum(ok for _, ok in results)}/{len(results)} пройдено")
    sys.exit(0 if all(ok for _, ok in results) else 1)

asyncio.run(main())
