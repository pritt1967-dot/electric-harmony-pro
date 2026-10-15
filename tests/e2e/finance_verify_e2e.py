"""Сквозная проверка: браузер -> страница /verify -> серверная функция -> (тестовая) финансовая база."""
import asyncio, json, os, sys, urllib.request
from playwright.async_api import async_playwright

BASE = os.environ.get("E2E_BASE", "http://localhost:8090")
OUT = os.environ.get("E2E_OUT", "/tmp/finance-e2e")
DB = os.environ.get("E2E_DB", "http://localhost:9911")
docs = {d["label"]: d for d in json.load(open(f"{OUT}/docs.json"))}
A, B = docs["A"], docs["B"]
results = []

def check(name, ok, detail=""):
    results.append(ok); print(("PASS " if ok else "FAIL ") + name + (f" — {detail}" if detail and not ok else ""))

async def title(page):
    h = page.get_by_role("heading", level=1)
    await page.wait_for_function("() => !document.querySelector('h1')?.textContent.includes('Проверяем')", timeout=30000)
    return (await h.text_content()).strip()

async def upload(page, path):
    await page.get_by_label("Загрузить PDF для проверки").set_input_files(path)
    await page.wait_for_timeout(300)
    return await title(page)

async def main():
    check("повторная запись отпечатка PDF запрещена", A["rewriteBlocked"] and B["rewriteBlocked"])
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        page = await b.new_page()
        await page.goto(BASE + A["verifyPath"]); t = await title(page)
        check("неизменённый документ по QR", t == "Документ подлинный, содержимое совпадает", t)
        t = await upload(page, f"{OUT}/A-original.pdf")
        check("загрузка исходного PDF", t == "Документ подлинный, содержимое совпадает" and await page.get_by_text("Файл PDF сверён").count() == 1, t)
        t = await upload(page, f"{OUT}/A-modified.pdf")
        check("загрузка PDF с изменённой суммой", t == "Обнаружено изменение документа", t)
        t = await upload(page, f"{OUT}/B-original.pdf")
        check("настоящий QR документа A на PDF документа B", t == "Обнаружено изменение документа", t)
        await page.goto(BASE + f"/verify/{A['id']}?s=" + "0" * 32); t = await title(page)
        check("поддельный QR", t == "Документ не найден", t)
        req = urllib.request.Request(f"{DB}/rest/v1/operations?id=eq.op-2", data=json.dumps({"amount": 26000}).encode(), method="PATCH", headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req).read()
        await page.goto(BASE + A["verifyPath"]); t = await title(page)
        check("исходные данные изменены после формирования", t == "Исходные финансовые данные изменились после формирования", t)
        t = await upload(page, f"{OUT}/A-original.pdf")
        check("исходный PDF при изменённых данных", t == "Исходные финансовые данные изменились после формирования", t)
        body = await page.locator("main").inner_text()
        check("сумма и участники не раскрываются", not any(s in body for s in ["1000", "26000", "Заказчик", "Поставщик", "Кабель"]))
        await b.close()
    print(f"{sum(results)}/{len(results)} passed"); sys.exit(0 if all(results) else 1)

asyncio.run(main())
