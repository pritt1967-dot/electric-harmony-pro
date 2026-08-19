"""Сборка тестовой библиотеки фигур из «Щит зарядки.vsdx».

Всё (геометрия, EMF-вставки, тексты, номиналы, точки подключения)
берётся из исходного VSDX. Ничего не дорисовывается.
"""
import json, os, sys, xml.etree.ElementTree as ET

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vsdx_to_svg import (  # noqa: E402
    N, R, SRC, cells, f, transformer, geom_paths, walk, render, rels_for,
    connections, shape_text,
)

PROP_KEYS = ('Nominal', 'Curve', 'Leakage', 'Name', 'Article', 'Length', 'Poles')


def props(shape):
    out = {}
    for sec in shape.findall(f'{N}Section'):
        if sec.get('N') != 'Property':
            continue
        for row in sec.findall(f'{N}Row'):
            c = {x.get('N'): x.get('V') for x in row.findall(f'{N}Cell')}
            if row.get('N') in PROP_KEYS:
                out[row.get('N')] = c.get('Value')
    return out


def texts(shape):
    res = []
    for sh in shape.iter(f'{N}Shape'):
        t = shape_text(sh)
        if t:
            res.append(t)
    return res


def convert_shape(shape, rels):
    out, conns = [], []
    stats = {'foreign': 0, 'emf_ok': 0, 'texts': 0}
    c = cells(shape)
    w, h = f(c, 'Width'), f(c, 'Height')
    local = {'Width': w, 'Height': h, 'PinX': w / 2, 'PinY': h / 2,
             'LocPinX': w / 2, 'LocPinY': h / 2, 'Angle': 0, 'FlipX': 0, 'FlipY': 0}
    t = transformer(local)
    geom_paths(shape, t, c, out)
    connections(shape, t, conns)
    for sub in shape.findall(f'{N}Shapes/{N}Shape'):
        walk(sub, t, out, stats, rels, conns)
    return out, c, stats, conns


def slugify(name):
    s = ''.join(ch if ch.isalnum() else '-' for ch in name.lower()).strip('-')
    while '--' in s:
        s = s.replace('--', '-')
    return s


def entry(shape, name, source_file, source_master, rels):
    out, c, stats, conns = convert_shape(shape, rels)
    svg, info = render(out, conns)
    p = props(shape)
    return {
        'slug': slugify(name),
        'name': name,
        'source_file': source_file,
        'source_master': source_master,
        'width_mm': round(f(c, 'Width') * 25.4, 2) or (info or {}).get('bbox_w_mm', 0),
        'height_mm': round(f(c, 'Height') * 25.4, 2) or (info or {}).get('bbox_h_mm', 0),
        'paths': len(out),
        'foreign_parts': stats['foreign'],
        'emf_vector_parts': stats['emf_ok'],
        'text_parts': stats['texts'],
        'visio_props': {k: v for k, v in p.items() if v not in (None, '')},
        'visio_texts': texts(shape),
        'connection_points': (info or {}).get('conn_mm', []),
        'svg': svg,
    }


def collect(masters_xml, source_file):
    res = []
    base = os.path.dirname(masters_xml)
    rels_masters = {r.get('Id'): r.get('Target') for r in
                    ET.parse(os.path.join(base, '_rels', 'masters.xml.rels')).getroot()}
    for m in ET.parse(masters_xml).getroot():
        rel = m.find(f'{N}Rel')
        fname = os.path.basename(rels_masters[rel.get(f'{R}id')])
        path = os.path.join(base, fname)
        rels = rels_for(path)
        top = ET.parse(path).getroot().find(f'{N}Shapes/{N}Shape')
        res.append(entry(top, m.get('NameU'), source_file, f'{m.get("NameU")} ({fname})', rels))
        seen = set()
        for sub in top.iter(f'{N}Shape'):
            nu = sub.get('NameU') or ''
            if 'Klemsan' in nu:
                b = nu.split('.')[0]
                if b in seen:
                    continue
                seen.add(b)
                e = entry(sub, f'{b} (клемма)', source_file,
                          f'{m.get("NameU")} / {nu} ({fname})', rels)
                if e['svg'] and not any(x['slug'] == e['slug'] for x in res):
                    res.append(e)
    return res


TS_HEADER = '''/** АВТОГЕНЕРАЦИЯ. Извлечено из «Щит зарядки.vsdx» скриптом scripts/visio/build_library.py.
 *  Векторная геометрия, EMF-вставки (дисплеи/шильдики), тексты и точки подключения —
 *  всё из исходных Visio Master. Не редактировать вручную. */

export type VisioConnectionPoint = { id: string; x_mm: number; y_mm: number };

export type VisioShapeGeometry = {
  slug: string;
  name: string;
  source_file: string;
  source_master: string;
  width_mm: number;
  height_mm: number;
  paths: number;
  foreign_parts: number;
  emf_vector_parts: number;
  text_parts: number;
  visio_props: Record<string, string>;
  visio_texts: string[];
  connection_points: VisioConnectionPoint[];
  svg: string;
};

export const VISIO_SHAPES: VisioShapeGeometry[] = '''


if __name__ == '__main__':
    all_ = collect(f'{SRC}/visio/masters/masters.xml', 'Щит зарядки.vsdx')
    emb = f'{SRC}/emb/visio/masters/masters.xml'
    if os.path.exists(emb):
        all_ += collect(emb, 'Щит зарядки.vsdx / embedded')
    uniq, seen = [], set()
    for e in all_:
        if e['slug'] in seen or not e['svg']:
            continue
        seen.add(e['slug'])
        uniq.append(e)
    ts = TS_HEADER + json.dumps(uniq, ensure_ascii=False, indent=2) + ';\n'
    out = sys.argv[1] if len(sys.argv) > 1 else 'src/lib/shape-library/generated.ts'
    open(out, 'w').write(ts)
    for e in uniq:
        print(e['slug'], '|', e['width_mm'], 'x', e['height_mm'], '| paths', e['paths'],
              '| emf', e['emf_vector_parts'], '| foreign', e['foreign_parts'],
              '| texts', e['text_parts'], '| conn', len(e['connection_points']),
              '| props', e['visio_props'].get('Nominal'), '|', e['visio_texts'][:2])
