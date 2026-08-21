"""БИБЛИОТЕКА №1 — УГО однолинейной схемы.

Источник: electricaldiagramTimVisio.vss (все мастера, без исключений).
Документ1.vsdx используется ТОЛЬКО как эталон: из его мастеров берутся точные
connection points и пользовательские свойства для одноимённых фигур VSS.

Ничего не дорисовывается: вся геометрия — из VSS (libvisio → SVG).

Запуск:
  python3 scripts/visio/build_schematic_library.py [out.ts]
"""
import hashlib
import json
import os
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

VSS = os.environ.get("VSS_PATH", "/mnt/user-uploads/electricaldiagramTimVisio.vss")
DOC1 = os.environ.get("DOC1_PATH", "/tmp/vss/doc1")
TMP = "/tmp/vss/build"
BIN = os.environ.get("LIBVISIO_BIN", "/nix/store/fmz1cmjy80xa86ln04vdmqs942vancf6-libvisio-0.1.8-bin/bin")
MM = 25.4

# ---------------------------------------------------------------- категории
CATEGORY_RULES = [
    ("service", "Служебные фигуры", (r"^обновить$", r"контекстное меню", r"^update$")),
    ("bus", "Шины и проводники", (r"^line", r"^\bn\b$", r"^pen$", r"^pe$", r"^pe line$", r"^point$", r"^ugo$", r"провод")),
    ("rcbo", "Дифавтоматы (QFD)", (r"^qfd", r"^afd", r"^asd")),
    ("rcd", "УЗО (QD)", (r"^qd",)),
    ("breaker", "Автоматические выключатели (QF)", (r"^qf",)),
    ("switch", "Рубильники, разъединители, переключатели", (r"^qs", r"^q\b", r"^q ", r"^q\+", r"переключател", r"блокировка")),
    ("meter", "Приборы учёта и измерения", (r"^pi", r"^pv", r"^pa", r"^pw", r"счёт", r"счет", r"meter")),
    ("transformer", "Трансформаторы", (r"^t$", r"^ta$", r"^tv$", r"трансформ")),
    ("contactor", "Контакторы, реле, катушки", (r"^km", r"^kv", r"^kt$", r"^kk$", r"^ru$", r"^k\b", r"реле", r"контактор")),
    ("contact", "Контакты и кнопки", (r"^no", r"^nc$", r"^sb", r"^sa")),
    ("protection", "Предохранители и защита", (r"^fu", r"^fv", r"опн", r"spd", r"предохран")),
    ("signal", "Сигнальная арматура", (r"^hl", r"^ha")),
    ("machine", "Машины и источники", (r"^m$", r"^g$", r"^gb$")),
    ("passive", "Пассивные элементы и преобразователи", (r"^r$", r"^c$", r"^vd$", r"^u\d?$")),
    ("load", "Электроприёмники", (r"электроприемник", r"электроприёмник", r"^load")),
    ("enclosure", "Щиты и шкафы", (r"щит", r"шкаф")),
    ("frame", "Рамки, боковики, оформление", (r"боковик", r"рамк", r"штамп", r"^title", r"таблиц")),
    ("cable", "Кабельные блоки", (r"cable",)),
    ("misc", "Прочие элементы", ()),

]
CATEGORY_LABEL = {k: v for k, v, _ in CATEGORY_RULES}


def categorize(name: str) -> str:
    low = name.strip().lower()
    for key, _label, pats in CATEGORY_RULES:
        for p in pats:
            if re.search(p, low):
                return key
    return "misc"


# ---------------------------------------------------------------- vss → svg
def run_xhtml(path: str) -> str:
    os.makedirs(TMP, exist_ok=True)
    out = subprocess.run([os.path.join(BIN, "vss2xhtml"), path], capture_output=True)
    if out.returncode != 0:
        raise SystemExit(out.stderr.decode()[:2000])
    return out.stdout.decode("utf-8", "replace")


def run_raw_names(path: str):
    out = subprocess.run([os.path.join(BIN, "vss2raw"), path], capture_output=True)
    txt = out.stdout.decode("utf-8", "replace")
    return re.findall(r"startPage\(draw:name: (.*?), svg:height", txt)


SVG_BLOCK = re.compile(r"<svg:svg .*?</svg:svg>", re.S)


def parse_svgs(xhtml: str):
    return SVG_BLOCK.findall(xhtml)


NUM = r"-?\d+(?:\.\d+)?"


def content_bbox(svg: str):
    xs, ys = [], []
    for m in re.finditer(r'd=" (.*?)"', svg, re.S):
        for x, y in re.findall(rf"[MLC]({NUM}),({NUM})", m.group(1)):
            xs.append(float(x))
            ys.append(float(y))
    for m in re.finditer(rf'<svg:(?:text|ellipse|rect)[^>]*?x="({NUM})"[^>]*?y="({NUM})"', svg):
        xs.append(float(m.group(1)))
        ys.append(float(m.group(2)))
    for m in re.finditer(rf'<svg:ellipse[^>]*?cx="({NUM})"[^>]*?cy="({NUM})"[^>]*?rx="({NUM})"[^>]*?ry="({NUM})"', svg):
        cx, cy, rx, ry = (float(g) for g in m.groups())
        xs += [cx - rx, cx + rx]
        ys += [cy - ry, cy + ry]
    if not xs:
        return None
    return min(xs), min(ys), max(xs), max(ys)


def endpoints(svg: str):
    """Крайние точки контуров — кандидаты в точки подключения (geometry-derived)."""
    pts = []
    for m in re.finditer(r'd=" (.*?)"', svg, re.S):
        seq = re.findall(rf"[MLC]({NUM}),({NUM})", m.group(1))
        if len(seq) >= 2:
            for x, y in (seq[0], seq[-1]):
                pts.append((round(float(x), 2), round(float(y), 2)))
    uniq = []
    for p in pts:
        if p not in uniq:
            uniq.append(p)
    return uniq


def texts_of(svg: str):
    return [t.strip() for t in re.findall(r"<svg:tspan[^>]*>(.*?)</svg:tspan>", svg, re.S) if t.strip()]


def normalize(svg: str, pad: float = 2.0):
    """Убираем префикс svg:, ставим viewBox по реальному содержимому (в пунктах 1/72in)."""
    bb = content_bbox(svg)
    body = re.sub(r"</?svg:svg[^>]*>", "", svg)
    body = body.replace("svg:", "")
    if not bb:
        return "", None
    x0, y0, x1, y1 = bb
    w = max(x1 - x0, 0.5) + pad * 2
    h = max(y1 - y0, 0.5) + pad * 2
    view = f"{x0 - pad:.3f} {y0 - pad:.3f} {w:.3f} {h:.3f}"
    out = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" '
        f'width="100%" height="100%" preserveAspectRatio="xMidYMid meet">'
        f"{body.strip()}</svg>"
    )
    return out, (x0, y0, x1, y1)


# ---------------------------------------------------------------- Документ1
NS = "{http://schemas.microsoft.com/office/visio/2012/main}"


def doc1_masters(base: str):
    mx = os.path.join(base, "visio", "masters", "masters.xml")
    if not os.path.exists(mx):
        return {}
    rels = {
        r.get("Id"): r.get("Target")
        for r in ET.parse(os.path.join(base, "visio", "masters", "_rels", "masters.xml.rels")).getroot()
    }
    res = {}
    for m in ET.parse(mx).getroot():
        rel = m.find(f"{NS}Rel")
        rid = rel.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
        fn = os.path.basename(rels[rid])
        root = ET.parse(os.path.join(base, "visio", "masters", fn)).getroot()
        top = root.find(f"{NS}Shapes/{NS}Shape")
        conns, props = [], []
        if top is not None:
            for sec in top.findall(f"{NS}Section"):
                kind = sec.get("N")
                for row in sec.findall(f"{NS}Row"):
                    cells = {c.get("N"): c.get("V") for c in row.findall(f"{NS}Cell")}
                    if kind == "Connection":
                        conns.append(
                            {
                                "id": row.get("N") or str(len(conns)),
                                "x_mm": round(float(cells.get("X", 0) or 0) * MM, 2),
                                "y_mm": round(float(cells.get("Y", 0) or 0) * MM, 2),
                            }
                        )
                    elif kind == "Property":
                        props.append(
                            {
                                "key": row.get("N") or "",
                                "label": cells.get("Label") or "",
                                "value": cells.get("Value") or "",
                            }
                        )
        res[m.get("NameU")] = {
            "master_id": m.get("ID"),
            "base_id": m.get("BaseID"),
            "unique_id": m.get("UniqueID") or "",
            "file": fn,
            "conns": conns,
            "props": props,
        }
    return res


# ---------------------------------------------------------------- сборка
def slugify(name: str) -> str:
    s = "".join(ch if ch.isalnum() else "-" for ch in name.lower()).strip("-")
    while "--" in s:
        s = s.replace("--", "-")
    return s or "shape"


HEADER = '''/** АВТОГЕНЕРАЦИЯ — БИБЛИОТЕКА №1 (УГО однолинейной схемы).
 *  Источник: electricaldiagramTimVisio.vss — ВСЕ мастера VSS.
 *  Точки подключения и пользовательские свойства для фигур, встречающихся
 *  в эталоне «Документ1.vsdx», взяты из его мастеров (source: "visio-master").
 *  Скрипт: scripts/visio/build_schematic_library.py. Не редактировать вручную. */

export type SchematicConnPoint = {
  id: string;
  x_mm: number;
  y_mm: number;
  /** visio-master — точные данные Visio; geometry — вычислено по концам контуров VSS. */
  source: "visio-master" | "geometry";
};

export type SchematicProp = { key: string; label: string; value: string };

export type SchematicSymbol = {
  /** внутренний ID библиотеки */
  id: string;
  name: string;
  category: string;
  /** Master ID из Visio (из Документ1.vsdx, если фигура там используется) */
  master_id: string | null;
  /** BaseID / UniqueID мастера Visio */
  base_id: string | null;
  /** порядковый Shape ID мастера внутри VSS */
  shape_id: number;
  source_vss: string;
  source_master: string;
  width_mm: number;
  height_mm: number;
  aspect_ratio: number;
  bbox_mm: { w: number; h: number };
  paths: number;
  texts: string[];
  props: SchematicProp[];
  connection_points: SchematicConnPoint[];
  conn_source: "visio-master" | "geometry" | "none";
  svg: string;
  errors: string[];
};

export const SCHEMATIC_SYMBOLS: SchematicSymbol[] = '''


def build():
    xhtml = run_xhtml(VSS)
    svgs = parse_svgs(xhtml)
    names = run_raw_names(VSS)
    d1 = doc1_masters(DOC1)
    items, seen_hash, used_ids = [], {}, set()
    dup = 0
    for i, svg in enumerate(svgs):
        name = names[i] if i < len(names) else f"Master {i + 1}"
        head = re.search(rf'width="({NUM})in" height="({NUM})in"', svg)
        w_mm = round(float(head.group(1)) * MM, 2) if head else 0.0
        h_mm = round(float(head.group(2)) * MM, 2) if head else 0.0
        norm, bb = normalize(svg)
        errors = []
        if not norm:
            errors.append("Пустая геометрия в VSS-мастере")
        bw = round((bb[2] - bb[0]) / 72 * MM, 2) if bb else 0.0
        bh = round((bb[3] - bb[1]) / 72 * MM, 2) if bb else 0.0
        digest = hashlib.md5((name + norm).encode()).hexdigest()
        if digest in seen_hash:
            dup += 1
            continue
        seen_hash[digest] = True

        ref = d1.get(name)
        if ref and ref["conns"]:
            conns = [dict(c, source="visio-master") for c in ref["conns"]]
            csrc = "visio-master"
        else:
            pts = endpoints(svg)
            conns = [
                {"id": f"p{j + 1}", "x_mm": round(x / 72 * MM, 2), "y_mm": round(y / 72 * MM, 2), "source": "geometry"}
                for j, (x, y) in enumerate(pts)
            ]
            csrc = "geometry" if conns else "none"
            if not conns:
                errors.append("Точки подключения отсутствуют: нет контуров в мастере")
            else:
                errors.append("Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)")

        base = slugify(name)
        lid, n = base, 2
        while lid in used_ids:
            lid = f"{base}-{n}"
            n += 1
        used_ids.add(lid)

        txts = texts_of(svg)
        if not txts:
            errors.append("Текстовые поля в мастере отсутствуют")

        items.append(
            {
                "id": lid,
                "name": name,
                "category": categorize(name),
                "master_id": ref["master_id"] if ref else None,
                "base_id": (ref["base_id"] or ref["unique_id"]) if ref else None,
                "shape_id": i + 1,
                "source_vss": "electricaldiagramTimVisio.vss",
                "source_master": f"{name} (VSS master #{i + 1})",
                "width_mm": w_mm,
                "height_mm": h_mm,
                "aspect_ratio": round(w_mm / h_mm, 3) if h_mm else 0,
                "bbox_mm": {"w": bw, "h": bh},
                "paths": len(re.findall(r"<svg:path", svg)),
                "texts": txts,
                "props": ref["props"] if ref else [],
                "connection_points": conns,
                "conn_source": csrc,
                "svg": norm,
                "errors": errors,
            }
        )
    return items, len(svgs), dup


if __name__ == "__main__":
    items, total, dup = build()
    out = sys.argv[1] if len(sys.argv) > 1 else "src/lib/shape-library/schematic-generated.ts"
    cat_used = [(k, CATEGORY_LABEL[k]) for k, _l, _p in CATEGORY_RULES if any(i["category"] == k for i in items)]
    ts = (
        HEADER
        + json.dumps(items, ensure_ascii=False, indent=2)
        + ";\n\nexport const SCHEMATIC_CATEGORIES: { key: string; label: string }[] = "
        + json.dumps([{"key": k, "label": l} for k, l in cat_used], ensure_ascii=False, indent=2)
        + ";\n"
    )
    open(out, "w").write(ts)
    cats = {}
    for it in items:
        cats[it["category"]] = cats.get(it["category"], 0) + 1
    print("VSS masters:", total, "| imported:", len(items), "| duplicates skipped:", dup)
    for k, v in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  {k:<10} {v}")
    print("with visio-master conns:", sum(1 for i in items if i["conn_source"] == "visio-master"))
    print("with geometry conns:", sum(1 for i in items if i["conn_source"] == "geometry"))
    print("no conns:", sum(1 for i in items if i["conn_source"] == "none"))
    print("with texts:", sum(1 for i in items if i["texts"]))
    print("with props:", sum(1 for i in items if i["props"]))
    print("PI:", [i["id"] for i in items if i["name"].strip().lower().startswith("pi")])
