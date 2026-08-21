"""Каталог библиотеки «Набор электрика для Visio» (4 архива → одна библиотека).

Подготовка исходников (исходные архивы НЕ изменяются, работаем в /tmp):
  1. Распаковать 4 zip-архива из /mnt/user-uploads в /tmp/lib
     (части 01–03 — подмножество полного архива, дедупликация по md5).
  2. python3 scripts/visio/build_device_catalog.py src/lib/shape-library/device-catalog-generated.ts

Читает .vss (libvisio: vss2xhtml/vss2text) и .vssx (masters.xml).
.rar внутри набора защищены паролем — помечаются как locked.
"""
import json, os, re, subprocess, sys, zipfile, hashlib

SRC = os.environ.get("NABOR_DIR", "/tmp/lib")
BIN = os.environ.get(
    "LIBVISIO_BIN",
    "/nix/store/fmz1cmjy80xa86ln04vdmqs942vancf6-libvisio-0.1.8-bin/bin",
)

# Классификация по имени файла стенсила (порядок важен).
CLASS_RULES = [
    ("rcbo", "Дифавтоматы (АВДТ)", (r"авдт", r"дифференциальн\w* автомат", r"\bds2", r"\bdsh", r"\bad-?\d")),
    ("rcd", "УЗО и дифреле", (r"\bузо\b", r"устройство защитного", r"\bвдт\b", r"\bfh2", r"\bf20", r"\bcdd")),
    ("breaker", "Автоматические выключатели", (r"автоматическ\w* выключател", r"\bав\b", r"ва\s?47", r"\bs20", r"\bmcb", r"выключатель автоматич")),
    ("switch", "Рубильники, ВН, переключатели", (r"рубильник", r"\bвн\b", r"выключател\w* нагрузк", r"перекидн", r"переключател", r"разъединител")),
    ("contactor", "Контакторы и пускатели", (r"контактор", r"пускател", r"\besb", r"\bict")),
    ("relay", "Реле (напряжения, времени, импульсные)", (r"\bреле\b", r"\bрн\b", r"узм", r"таймер")),
    ("spd", "Ограничители перенапряжения (ОПН/УЗИП)", (r"опн", r"узип", r"ограничител\w* перенапряж", r"\bspd\b", r"\bovr\b", r"стример")),
    ("meter", "Счётчики и приборы учёта", (r"счетчик", r"счётчик", r"меркурий", r"mercury", r"энергомера", r"\bпу\b", r"\bmeter")),
    ("measure", "Измерительные приборы, индикаторы", (r"вольтметр", r"амперметр", r"мультиметр", r"индикатор", r"\bтт\b", r"трансформатор тока")),
    ("terminal", "Клеммы, клеммники, шины", (r"клемм", r"шина", r"\bpe\b", r"\bn\b", r"перемычк", r"гребен", r"\bkle")),
    ("enclosure", "Щиты, боксы, корпуса", (r"щит", r"бокс", r"шкаф", r"корпус", r"mistral", r"\bpragma", r"\bplank")),
    ("psu", "Блоки питания и преобразователи", (r"блок питания", r"\bбп\b", r"источник питания", r"meanwell", r"стабилизатор", r"\bups\b")),
    ("automation", "Автоматика, контроллеры, модули", (r"контроллер", r"\bплк\b", r"модул\w* ввода", r"wiren", r"\bowen", r"\bовен", r"умн")),
    ("socket", "Розетки, светильники, звонки", (r"розетк", r"светильник", r"лампа", r"звонок", r"\bhl\b")),
    ("schematic", "УГО однолинейной схемы", (r"timvisio", r"однолинейн", r"\bуго\b")),
    ("misc", "Прочее оборудование", ()),
]
CLASS_LABEL = {k: v for k, v, _ in CLASS_RULES}


def classify(name: str) -> str:
    low = name.lower()
    for key, _l, pats in CLASS_RULES:
        for p in pats:
            if re.search(p, low):
                return key
    return "misc"


def slug(*parts):
    s = "-".join(parts).lower()
    s = "".join(ch if ch.isalnum() else "-" for ch in s).strip("-")
    while "--" in s:
        s = s.replace("--", "-")
    return s[:80]


def read_vss(path):
    x = subprocess.run([os.path.join(BIN, "vss2xhtml"), path], capture_output=True, timeout=120)
    masters = x.stdout.count(b"<svg:svg")
    t = subprocess.run([os.path.join(BIN, "vss2text"), path], capture_output=True, timeout=120)
    texts = sorted({l.strip() for l in t.stdout.decode("utf8", "replace").splitlines() if l.strip()})
    return masters, texts


def read_vssx(path):
    with zipfile.ZipFile(path) as zf:
        m = [n for n in zf.namelist() if n.endswith("masters/masters.xml")]
        if not m:
            return 0, []
        names = re.findall(r'NameU="([^"]+)"', zf.read(m[0]).decode("utf8", "replace"))
        return len(names), sorted(set(names))


def collect():
    items, seen_hash = [], {}
    for root, _d, files in os.walk(SRC):
        for f in sorted(files):
            p = os.path.join(root, f)
            ext = f.lower().rsplit(".", 1)[-1]
            if ext not in ("vss", "vssx", "rar"):
                continue
            digest = hashlib.md5(open(p, "rb").read()).hexdigest()
            if digest in seen_hash:  # логическое объединение 4 архивов без дубликатов
                continue
            seen_hash[digest] = p
            vendor = os.path.relpath(p, SRC).split(os.sep)[0]
            name = f.rsplit(".", 1)[0]
            masters, texts, err = 0, [], None
            if ext == "vss":
                try:
                    masters, texts = read_vss(p)
                except Exception as e:  # noqa: BLE001
                    err = str(e)[:160]
            elif ext == "vssx":
                try:
                    masters, texts = read_vssx(p)
                except Exception as e:  # noqa: BLE001
                    err = str(e)[:160]
            items.append({
                "id": slug(vendor, name),
                "vendor": vendor,
                "name": name,
                "format": ext,
                "locked": ext == "rar",
                "category": classify(name),
                "masters": masters,
                "texts": texts[:40],
                "text_total": len(texts),
                "size_kb": round(os.path.getsize(p) / 1024, 1),
                "error": err,
            })
    # уникальные id
    used = set()
    for it in items:
        base, i = it["id"], 2
        while it["id"] in used:
            it["id"] = f"{base}-{i}"
            i += 1
        used.add(it["id"])
    return sorted(items, key=lambda x: (x["vendor"].lower(), x["name"].lower()))


HEADER = '''/** АВТОГЕНЕРАЦИЯ — scripts/visio/build_device_catalog.py.
 *  Источник: «Набор электрика для visio» (4 архива, объединены логически, дубликаты удалены).
 *  Каталог стенсилов: производитель → стенсил → категория → мастера/тексты.
 *  Не редактировать вручную. К рабочему визуализатору не подключено. */

export type DeviceStencil = {
  id: string;
  vendor: string;
  name: string;
  format: "vss" | "vssx" | "rar";
  locked: boolean;
  category: string;
  masters: number;
  texts: string[];
  text_total: number;
  size_kb: number;
  error: string | null;
};

export const DEVICE_CATEGORY_LABELS: Record<string, string> = '''


if __name__ == "__main__":
    items = collect()
    out = sys.argv[1] if len(sys.argv) > 1 else "src/lib/shape-library/device-catalog-generated.ts"
    ts = (
        HEADER
        + json.dumps(CLASS_LABEL, ensure_ascii=False, indent=2)
        + ";\n\nexport const DEVICE_STENCILS: DeviceStencil[] = "
        + json.dumps(items, ensure_ascii=False, indent=2)
        + ";\n"
    )
    open(out, "w").write(ts)
    print("stencils", len(items), "masters", sum(i["masters"] for i in items),
          "locked", sum(1 for i in items if i["locked"]),
          "vendors", len({i["vendor"] for i in items}))
