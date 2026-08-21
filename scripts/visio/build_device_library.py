"""БИБЛИОТЕКА №2 — физические модульные устройства для раскладки щита.

Источник: «Набор электрика для Visio» (4 архива = одна библиотека, дедупликация по md5).
Геометрия берётся ТОЛЬКО из исходных Visio-мастеров (libvisio → SVG).
Ничего не дорисовывается; отсутствующие данные остаются null.

Запуск: python3 scripts/visio/build_device_library.py [out.ts]
"""
import hashlib
import json
import os
import re
import subprocess
import sys
import zipfile
import xml.etree.ElementTree as ET

SRC = os.environ.get("LIB_SRC", "/tmp/lib")
BIN = os.environ.get(
    "LIBVISIO_BIN",
    "/nix/store/fmz1cmjy80xa86ln04vdmqs942vancf6-libvisio-0.1.8-bin/bin",
)
SVG_DIR = os.environ.get("SVG_DIR", "public/device-library")
OUT = sys.argv[1] if len(sys.argv) > 1 else "src/lib/shape-library/device-library-generated.ts"
MM = 25.4
PT_MM = 25.4 / 72.0
NS = "{http://schemas.microsoft.com/office/visio/2012/main}"
RNS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

# ------------------------------------------------------------------ категории
TYPE_RULES = [
    ("rcbo", "Дифавтоматы", (r"авдт", r"дифавтомат", r"диф\.? ?авт", r"\bad-?\d", r"\bdpn\b.*vigi", r"\bad12\b")),
    ("rcd", "УЗО", (r"\bузо\b", r"вд-?\d", r"\brccb\b", r"\bвдт\b", r"устройство защитного", r"^вдт[ \-]", r"^[вbв][дd][тt][ \-]")),
    ("breaker", "Автоматические выключатели", (r"автоматическ", r"\bва ?47", r"\bва47", r"\bмодульн\w* автомат", r"\bmcb\b", r"\bавтомат\b", r"выключатель автомат", r"^ав[ \-]", r"^ав\d", r"\bав [1-4]", r"\bмодульный автоматический", r"^[аa][вbв][ \-]")),
    ("switch", "Рубильники и переключатели", (r"рубильник", r"переключател", r"разъединит", r"\bвн-?32", r"\bвыключатель нагрузки", r"^вн[ \-]", r"\bвн [1-4]", r"^[вbв][нhн][ \-]")),
    ("contactor", "Контакторы", (r"контактор", r"\bкм\b", r"\besc\b")),
    ("voltage_relay", "Реле напряжения", (r"реле напряж", r"\bурм\b", r"\bcp-?\d", r"\bову\b")),
    ("relay", "Реле", (r"\bреле\b", r"таймер", r"\bрэк\b")),
    ("spd", "Ограничители перенапряжения", (r"опн", r"\bувз\b", r"узип", r"\bспд\b", r"\bovr\b", r"\bspd\b", r"ограничител")),
    ("fuse", "Предохранители", (r"предохранит", r"\bпвц\b", r"\bппн\b", r"\bfuse\b")),
    ("terminal", "Клеммы и шины", (r"клемм", r"\bшина\b", r"шинк", r"кросс-?модул", r"\bнуле")),
    ("meter", "Счётчики и приборы учёта", (r"счетчик", r"счётчик", r"\bмеркурий\b", r"\bнева\b", r"\bце\d", r"измерител", r"вольтметр", r"амперметр")),
    ("transformer", "Трансформаторы", (r"трансформ", r"\bбп\b", r"блок питания", r"источник питания")),
    ("indicator", "Индикаторы и лампы", (r"индикатор", r"лампа", r"светодиод", r"сигнальн")),
    ("button", "Кнопки", (r"кнопк", r"\bпост управлен")),
    ("selector", "Переключатели режимов", (r"галетн", r"\bпмов\b", r"кулачков")),
    ("enclosure", "Щиты, боксы, корпуса", (r"\bщит", r"\bбокс", r"корпус", r"шкаф", r"\bщрн\b", r"\bщру\b")),
    ("automation", "Автоматика и модули", (r"wiren", r"\bплк\b", r"модуль", r"контроллер", r"датчик", r"диммер")),
]
TYPE_LABEL = {k: v for k, v, _ in TYPE_RULES}
TYPE_LABEL["other"] = "Другие устройства"

SYMBOL_BY_TYPE = {
    "breaker": "qf",
    "rcd": "qd",
    "rcbo": "qfd",
    "switch": "qs",
    "contactor": "km",
    "relay": "kv",
    "voltage_relay": "kv",
    "spd": "fu",
    "fuse": "fu",
    "meter": "pi",
    "terminal": "point",
    "transformer": "t",
}


def classify(*parts: str) -> str:
    low = " ".join(p for p in parts if p).lower()
    for key, _l, pats in TYPE_RULES:
        for p in pats:
            if re.search(p, low):
                return key
    return "other"


# ------------------------------------------------------------------ парсинг подписи
def parse_poles(text: str):
    m = re.search(r"\b([1-4])\s*[pрPР]\b", text, re.I)
    if m:
        return int(m.group(1))
    m = re.search(r"\b([1-4])\s*\+\s*[nNнН]\b", text)
    if m:
        return int(m.group(1)) + 1
    return None


def parse_current(text: str):
    m = re.search(r"\b([ABCDКkСc])\s?(\d{1,3})\b(?!\s*м[АA])", text)
    if m:
        return int(m.group(2)), m.group(1).upper()
    m = re.search(r"\b(\d{1,4})\s?[АA]\b", text)
    if m:
        return int(m.group(1)), None
    return None, None


def parse_leakage(text: str):
    m = re.search(r"\b(\d{2,4})\s?м[АA]\b", text, re.I)
    return int(m.group(1)) if m else None


def parse_article(text: str):
    m = re.search(r"\b([A-Z]{2,}[0-9][A-Z0-9\-]{3,})\b", text)
    return m.group(1) if m else None


# ------------------------------------------------------------------ svg
NUM = r"-?\d+(?:\.\d+)?"
SVG_BLOCK = re.compile(r"<svg:svg .*?</svg:svg>", re.S)


def content_bbox(svg: str):
    xs, ys = [], []
    for m in re.finditer(r'd=" (.*?)"', svg, re.S):
        for x, y in re.findall(rf"[MLC]({NUM}),({NUM})", m.group(1)):
            xs.append(float(x))
            ys.append(float(y))
    for m in re.finditer(rf'<svg:(?:text|rect|image)[^>]*?x="({NUM})"[^>]*?y="({NUM})"', svg):
        xs.append(float(m.group(1)))
        ys.append(float(m.group(2)))
    for m in re.finditer(rf'<svg:ellipse[^>]*?cx="({NUM})"[^>]*?cy="({NUM})"[^>]*?rx="({NUM})"[^>]*?ry="({NUM})"', svg):
        cx, cy, rx, ry = (float(g) for g in m.groups())
        xs += [cx - rx, cx + rx]
        ys += [cy - ry, cy + ry]
    if not xs:
        return None
    return min(xs), min(ys), max(xs), max(ys)


def normalize(svg: str, pad: float = 2.0):
    bb = content_bbox(svg)
    if not bb:
        return "", None
    body = re.sub(r"</?svg:svg[^>]*>", "", svg).replace("svg:", "")
    body = re.sub(r"\s+", " ", body).strip()
    x0, y0, x1, y1 = bb
    w = max(x1 - x0, 0.5) + pad * 2
    h = max(y1 - y0, 0.5) + pad * 2
    out = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0 - pad:.2f} {y0 - pad:.2f} {w:.2f} {h:.2f}" '
        f'width="100%" height="100%" preserveAspectRatio="xMidYMid meet">{body}</svg>'
    )
    return out, (w, h)


def texts_of(svg: str):
    out = []
    for t in re.findall(r"<svg:tspan[^>]*>(.*?)</svg:tspan>", svg, re.S):
        t = re.sub(r"<[^>]+>", "", t).strip()
        if t and t not in out:
            out.append(t)
    return out


def convert(path: str, tool: str):
    p = subprocess.run([os.path.join(BIN, tool), path], capture_output=True, timeout=180)
    if p.returncode != 0:
        raise RuntimeError(p.stderr.decode("utf-8", "replace")[:200])
    return p.stdout.decode("utf-8", "replace")


def raw_names(path: str, tool: str):
    try:
        p = subprocess.run([os.path.join(BIN, tool), path], capture_output=True, timeout=180)
        return re.findall(r"startPage\(draw:name: (.*?), svg:height", p.stdout.decode("utf-8", "replace"))
    except Exception:
        return []


# ------------------------------------------------------------------ vssx metadata
def vssx_masters(path: str):
    """Точки подключения, Shape Data и размеры из исходного XML (Visio 2013+)."""
    res = []
    try:
        with zipfile.ZipFile(path) as z:
            names = z.namelist()
            if "visio/masters/masters.xml" not in names:
                return res
            rels = {
                r.get("Id"): os.path.basename(r.get("Target"))
                for r in ET.fromstring(z.read("visio/masters/_rels/masters.xml.rels"))
            }
            for m in ET.fromstring(z.read("visio/masters/masters.xml")):
                rel = m.find(f"{NS}Rel")
                fn = rels.get(rel.get(f"{RNS}id")) if rel is not None else None
                conns, props, w, h = [], [], None, None
                if fn and f"visio/masters/{fn}" in names:
                    root = ET.fromstring(z.read(f"visio/masters/{fn}"))
                    top = root.find(f"{NS}Shapes/{NS}Shape")
                    if top is not None:
                        cells = {c.get("N"): c.get("V") for c in top.findall(f"{NS}Cell")}
                        try:
                            w = round(float(cells.get("Width")) * MM, 2)
                            h = round(float(cells.get("Height")) * MM, 2)
                        except (TypeError, ValueError):
                            pass
                        for sec in top.iter(f"{NS}Section"):
                            kind = sec.get("N")
                            for row in sec.findall(f"{NS}Row"):
                                cc = {c.get("N"): c.get("V") for c in row.findall(f"{NS}Cell")}
                                if kind == "Connection":
                                    try:
                                        conns.append({
                                            "id": row.get("N") or str(len(conns)),
                                            "x_mm": round(float(cc.get("X", 0) or 0) * MM, 2),
                                            "y_mm": round(float(cc.get("Y", 0) or 0) * MM, 2),
                                        })
                                    except ValueError:
                                        pass
                                elif kind == "Property":
                                    props.append({
                                        "key": row.get("N") or "",
                                        "label": cc.get("Label") or "",
                                        "value": cc.get("Value") or "",
                                    })
                res.append({
                    "name": m.get("NameU") or m.get("Name") or "",
                    "master_id": m.get("ID") or "",
                    "conns": conns,
                    "props": props,
                    "width_mm": w,
                    "height_mm": h,
                })
    except Exception:
        return res
    return res


# ------------------------------------------------------------------ сборка
def slug(*parts):
    s = "-".join(str(p) for p in parts if p)
    s = "".join(ch if ch.isalnum() else "-" for ch in s.lower())
    while "--" in s:
        s = s.replace("--", "-")
    return s.strip("-") or "device"


def prop(props, *keys):
    for p in props:
        k = (p["key"] + " " + p["label"]).lower()
        for want in keys:
            if want in k and p["value"]:
                return p["value"]
    return None


def build():
    devices, errors, protected, seen_hash, seen_key = [], [], [], {}, {}
    stencils = 0
    for root, _d, files in os.walk(SRC):
        for f in sorted(files):
            p = os.path.join(root, f)
            ext = f.lower().rsplit(".", 1)[-1]
            if ext not in ("vss", "vssx", "rar"):
                continue
            digest = hashlib.md5(open(p, "rb").read()).hexdigest()
            if digest in seen_hash:
                continue
            seen_hash[digest] = p
            rel = os.path.relpath(p, SRC)
            parts = rel.split(os.sep)
            vendor = parts[1] if len(parts) > 2 else parts[0]
            stencil_name = f.rsplit(".", 1)[0]
            if ext == "rar":
                protected.append({"file": rel, "vendor": vendor, "name": stencil_name,
                                  "size_kb": round(os.path.getsize(p) / 1024, 1)})
                continue
            stencils += 1
            tool_x = "vss2xhtml" if ext == "vss" else "vsd2xhtml"
            tool_r = "vss2raw" if ext == "vss" else "vsd2raw"
            try:
                xhtml = convert(p, tool_x)
            except Exception as e:
                errors.append({"file": rel, "error": str(e)[:180]})
                continue
            svgs = SVG_BLOCK.findall(xhtml)
            names = raw_names(p, tool_r)
            meta = vssx_masters(p) if ext == "vssx" else []
            for i, raw_svg in enumerate(svgs):
                name = (names[i] if i < len(names) else "").strip() or f"{stencil_name} #{i + 1}"
                md = meta[i] if i < len(meta) else None
                if md and md["name"]:
                    name = md["name"]
                svg, size = normalize(raw_svg)
                texts = texts_of(raw_svg)
                hay = " ".join([name, stencil_name] + texts[:12])
                dtype = classify(name, stencil_name, " ".join(texts[:6]))
                poles = parse_poles(name) or parse_poles(" ".join(texts[:6])) or parse_poles(stencil_name)
                cur, curve = parse_current(name)
                if cur is None:
                    cur, curve = parse_current(" ".join(texts[:6]))
                leak = parse_leakage(hay)
                props = md["props"] if md else []
                w_mm = md["width_mm"] if md and md["width_mm"] else (round(size[0] * PT_MM, 2) if size else None)
                h_mm = md["height_mm"] if md and md["height_mm"] else (round(size[1] * PT_MM, 2) if size else None)
                modules = None
                mp = prop(props, "модул", "module")
                if mp and re.search(r"\d", mp):
                    modules = int(re.search(r"\d+", mp).group())
                elif w_mm and 8 <= w_mm <= 400:
                    # 17.5 мм — стандартный модуль DIN; берём только если ширина кратна с допуском
                    k = w_mm / 17.5
                    if abs(k - round(k)) < 0.12 and round(k) >= 1:
                        modules = round(k)
                sm_id = SYMBOL_BY_TYPE.get(dtype)
                key = (vendor, rel, md["master_id"] if md else str(i))
                if key in seen_key:
                    continue
                seen_key[key] = True
                did = slug(vendor, stencil_name, name, i)
                devices.append({
                    "id": did,
                    "manufacturer": vendor,
                    "series": stencil_name,
                    "model": name,
                    "article": prop(props, "артикул", "article", "код") or parse_article(hay),
                    "deviceType": dtype,
                    "subType": prop(props, "тип", "type"),
                    "poles": poles,
                    "nominal": prop(props, "номинал", "rating"),
                    "ratedCurrent": cur,
                    "curve": curve if curve in ("A", "B", "C", "D") else None,
                    "leakageCurrent": leak,
                    "modules": modules,
                    "moduleWidthMm": w_mm,
                    "width": w_mm,
                    "height": h_mm,
                    "aspectRatio": round(size[0] / size[1], 3) if size and size[1] else None,
                    "svg": svg,
                    "sourceFile": rel,
                    "sourceMasterId": md["master_id"] if md else f"page-{i + 1}",
                    "connectionPoints": md["conns"] if md else [],
                    "connectionPointsSource": ("visio-master" if md and md["conns"] else "unavailable"),
                    "labelFields": texts[:8],
                    "shapeData": props[:8],
                    "schematicSymbolId": sm_id,
                    "format": ext,
                })
    return devices, errors, protected, stencils


def ts_literal(v):
    return json.dumps(v, ensure_ascii=False)


def main():
    devices, errors, protected, stencils = build()
    # SVG выносим в статические файлы по производителям — исходная графика не меняется,
    # только очень тяжёлые растровые вставки (>300 КБ) убираются ради веса страницы.
    os.makedirs(SVG_DIR, exist_ok=True)
    for fn in os.listdir(SVG_DIR):
        os.remove(os.path.join(SVG_DIR, fn))
    for d in devices:
        svg = d.pop("svg")
        if len(svg) > 200_000:
            # исходная растровая вставка слишком тяжёлая для веба — векторная часть сохраняется
            svg = re.sub(r"<image[^>]*/?>", "", svg)
            d["rasterStripped"] = True
        svg = re.sub(r"(\d+\.\d{2})\d+", r"\1", svg)
        d["svgAsset"] = f"/device-library/{d['id']}.svg"
        d["hasSvg"] = bool(svg)
        if svg:
            with open(os.path.join(SVG_DIR, d["id"] + ".svg"), "w", encoding="utf-8") as fh:
                fh.write(svg)

    cats = sorted({d["deviceType"] for d in devices})
    vendors = sorted({d["manufacturer"] for d in devices})
    stats = {
        "stencilsScanned": stencils,
        "imported": len(devices),
        "duplicatesSkipped": 0,
        "errors": len(errors),
        "noSvg": sum(1 for d in devices if not d["hasSvg"]),
        "noConnectionPoints": sum(1 for d in devices if not d["connectionPoints"]),
        "noManufacturer": sum(1 for d in devices if not d["manufacturer"]),
        "noModel": sum(1 for d in devices if not d["model"]),
        "noNominal": sum(1 for d in devices if not d["ratedCurrent"] and not d["nominal"]),
        "noModules": sum(1 for d in devices if not d["modules"]),
        "protectedArchives": len(protected),
        "vendors": len(vendors),
        "categories": len(cats),
        "linkedToSymbol": sum(1 for d in devices if d["schematicSymbolId"]),
        "unlinked": sum(1 for d in devices if not d["schematicSymbolId"]),
        "connectionPointsTotal": sum(len(d["connectionPoints"]) for d in devices),
    }
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("/* АВТОГЕНЕРАЦИЯ — scripts/visio/build_device_library.py. Не редактировать вручную. */\n")
        fh.write("/* Библиотека №2 — физические модульные устройства (источник: «Набор электрика для Visio»). */\n\n")
        fh.write("import type { PhysicalDevice, DeviceLibraryStats, ProtectedArchive } from './device-library-types';\n\n")
        fh.write("export const DEVICE_TYPE_LABELS: Record<string, string> = " + ts_literal(TYPE_LABEL) + ";\n\n")
        fh.write("export const PHYSICAL_DEVICES: PhysicalDevice[] = " + ts_literal(devices) + ";\n\n")
        fh.write("export const PROTECTED_ARCHIVES: ProtectedArchive[] = " + ts_literal(protected) + ";\n\n")
        fh.write("export const IMPORT_ERRORS: { file: string; error: string }[] = " + ts_literal(errors) + ";\n\n")
        fh.write("export const DEVICE_LIBRARY_STATS: DeviceLibraryStats = " + ts_literal(stats) + ";\n")
    print(json.dumps(stats, ensure_ascii=False, indent=2))
    print("errors sample:", json.dumps(errors[:5], ensure_ascii=False))


if __name__ == "__main__":
    main()
