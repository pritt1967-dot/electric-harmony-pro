"""Разбор оригинальной страницы «Щит зарядки.vsdx».

Выдаёт:
  * SVG-рендер оригинальной страницы (геометрия из Visio Master + провода
    по реальным BeginX/BeginY/EndX/EndY страницы);
  * список экземпляров оборудования с позициями/габаритами в мм;
  * связи проводников (Sheet.<id>!Connections.<name> из формул Visio);
  * счётчики точек подключения.

Ничего не дорисовывается: любые данные берутся из исходного файла.
"""
import json, os, re, sys, xml.etree.ElementTree as ET

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vsdx_to_svg import (  # noqa: E402
    N, R, SRC, cells, f, transformer, compose, geom_paths, render,
    rels_for, connections, shape_text, emf_to_svg, char_size, text_color,
)

MM = 25.4
PAGE = os.path.join(SRC, 'visio/pages/page1.xml')
MASTERS = os.path.join(SRC, 'visio/masters/masters.xml')


def slugify(name):
    s = ''.join(ch if ch.isalnum() else '-' for ch in name.lower()).strip('-')
    while '--' in s:
        s = s.replace('--', '-')
    return s


def base_name(nameu):
    """«Динрейка.45» -> «Динрейка»."""
    return re.sub(r'\.\d+$', '', nameu or '')


def load_masters():
    rels = rels_for(MASTERS)
    out = {}
    for m in ET.parse(MASTERS).getroot().findall(f'{N}Master'):
        rel = m.find(f'{N}Rel')
        path = rels.get(rel.get(f'{R}id')) if rel is not None else None
        if not path or not os.path.exists(path):
            continue
        root = ET.parse(path).getroot().find(f'{N}Shapes/{N}Shape')
        out[m.get('ID')] = {
            'name': m.get('NameU') or m.get('Name') or '',
            'file': os.path.basename(path),
            'root': root,
            'rels': rels_for(path),
        }
    return out


def walk_master(shape, tr, out, stats, rels, conns, overrides, hide_text=False):
    c = cells(shape)
    ov = overrides.get(shape.get('ID')) or {}
    c = {**c, **ov}
    if c.get('NoShow') == '1':
        return
    hide = hide_text or c.get('HideText') == '1'
    t = compose(tr, transformer(c))
    geom_paths(shape, t, c, out)
    connections(shape, t, conns)

    fd = shape.find(f'{N}ForeignData')
    if fd is not None:
        rel = fd.find(f'{N}Rel')
        target = rels.get(rel.get(f'{R}id')) if rel is not None else None
        asset = None
        if target and target.lower().endswith('.emf'):
            try:
                asset = emf_to_svg(target)
            except Exception:  # noqa: BLE001
                asset = None
        if asset:
            w, h = f(c, 'Width'), f(c, 'Height')
            out.append(dict(kind='image', asset=asset, o=t(0, h), u=t(w, h), v=t(0, 0)))
            stats['emf_ok'] += 1
        else:
            stats['foreign'] += 1

    txt = shape_text(shape)
    if txt and not hide:
        w, h = f(c, 'Width'), f(c, 'Height')
        p = t(f(c, 'TxtPinX', w / 2), f(c, 'TxtPinY', h / 2))
        out.append(dict(kind='text', x=p[0], y=p[1], text=txt,
                        size=char_size(shape), color=text_color(shape)))
        stats['texts'] += 1

    for sub in shape.findall(f'{N}Shapes/{N}Shape'):
        walk_master(sub, t, out, stats, rels, conns, overrides, hide)


def page_overrides(pshape):
    """Переопределения ячеек page-фигуры для под-фигур мастера (по MasterShape)."""
    ov = {}
    for sub in pshape.iter(f'{N}Shape'):
        ms = sub.get('MasterShape')
        if ms:
            ov[ms] = cells(sub)
    return ov


def wire_link(c):
    """Из формулы PAR(PNT(Sheet.53!Connections.TVC2.X,...)) -> (53, 'TVC2')."""
    res = {}
    for side, key in (('from', 'BeginX'), ('to', 'EndX')):
        pass
    return res


LINK_RE = re.compile(r'Sheet\.(\d+)!Connections\.([A-Za-z0-9_]+)')


def link_of(pshape, cell_name):
    for cel in pshape.findall(f'{N}Cell'):
        if cel.get('N') == cell_name:
            m = LINK_RE.search(cel.get('F') or '')
            if m:
                return {'shape': m.group(1), 'conn': m.group(2)}
    return None


def main():
    masters = load_masters()
    page = ET.parse(PAGE).getroot()
    prels = rels_for(PAGE)
    out, conns, stats = [], [], {'foreign': 0, 'emf_ok': 0, 'texts': 0}
    instances, wires = [], []
    ident = lambda x, y: (x, y)  # noqa: E731

    for sh in page.findall(f'{N}Shapes/{N}Shape'):
        mid = sh.get('Master')
        m = masters.get(mid) if mid else None
        mname = base_name(sh.get('NameU') or (m['name'] if m else ''))
        pc = cells(sh)
        is_wire = mname.startswith('Провод')

        if is_wire:
            x1, y1 = f(pc, 'BeginX'), f(pc, 'BeginY')
            x2, y2 = f(pc, 'EndX'), f(pc, 'EndY')
            out.append(dict(kind='path', d=f'M {x1:.5f} {y1:.5f} L {x2:.5f} {y2:.5f}',
                            fill='none', stroke='#1d4ed8', lw=0.012))
            wires.append({
                'id': sh.get('ID'), 'name': mname,
                'from': link_of(sh, 'BeginX'), 'to': link_of(sh, 'EndX'),
                'x1_mm': round(x1 * MM, 2), 'y1_mm': round(y1 * MM, 2),
                'x2_mm': round(x2 * MM, 2), 'y2_mm': round(y2 * MM, 2),
            })
            continue

        before = len(conns)
        if m is not None and m['root'] is not None:
            mc = cells(m['root'])
            merged = {**mc, **pc}
            tr = transformer(merged)
            geom_paths(m['root'], tr, merged, out)
            connections(m['root'], tr, conns)
            ov = page_overrides(sh)
            hide = merged.get('HideText') == '1'
            for sub in m['root'].findall(f'{N}Shapes/{N}Shape'):
                walk_master(sub, tr, out, stats, m['rels'], conns, ov, hide)
            w, h = f(merged, 'Width'), f(merged, 'Height')
            px, py = f(merged, 'PinX'), f(merged, 'PinY')
            instances.append({
                'id': sh.get('ID'), 'master_id': mid, 'name': mname,
                'slug': slugify(m['name']),
                'x_mm': round((px - f(merged, 'LocPinX', w / 2)) * MM, 2),
                'y_mm': round((py - f(merged, 'LocPinY', h / 2)) * MM, 2),
                'w_mm': round(abs(w) * MM, 2), 'h_mm': round(abs(h) * MM, 2),
                'connection_points': len(conns) - before,
                'text': shape_text(sh) or None,
            })
        else:
            walk_master(sh, ident, out, stats, prels, conns, {})

    svg, meta = render(out, conns, mark_connections=False)
    data = {
        'source': 'Щит зарядки.vsdx',
        'svg': svg,
        'stats': {
            'page_shapes': len(page.findall(f'{N}Shapes/{N}Shape')),
            'instances': len(instances),
            'wires': len(wires),
            'connection_points': len(conns),
            'emf_vector_parts': stats['emf_ok'],
            'texts': stats['texts'],
        },
        'instances': instances,
        'wires': wires,
        'bbox_w_mm': meta['bbox_w_mm'],
        'bbox_h_mm': meta['bbox_h_mm'],
    }
    dst = 'src/lib/shape-library/original-panel.ts'
    body = json.dumps(data, ensure_ascii=False, indent=1)
    with open(dst, 'w') as fh:
        fh.write('/** АВТОГЕНЕРАЦИЯ. Разбор страницы «Щит зарядки.vsdx»\n'
                 ' *  скриптом scripts/visio/build_original_panel.py. Не редактировать вручную. */\n\n'
                 'export type OriginalInstance = {\n'
                 '  id: string; master_id: string | null; name: string; slug: string;\n'
                 '  x_mm: number; y_mm: number; w_mm: number; h_mm: number;\n'
                 '  connection_points: number; text: string | null;\n};\n\n'
                 'export type OriginalWire = {\n'
                 '  id: string; name: string;\n'
                 '  from: { shape: string; conn: string } | null;\n'
                 '  to: { shape: string; conn: string } | null;\n'
                 '  x1_mm: number; y1_mm: number; x2_mm: number; y2_mm: number;\n};\n\n'
                 'export const ORIGINAL_PANEL = ' + body + ' as {\n'
                 '  source: string; svg: string;\n'
                 '  stats: Record<string, number>;\n'
                 '  instances: OriginalInstance[];\n'
                 '  wires: OriginalWire[];\n'
                 '  bbox_w_mm: number; bbox_h_mm: number;\n};\n')
    print(json.dumps(data['stats'], ensure_ascii=False, indent=1))
    print('instances:', len(instances), 'wires:', len(wires))
    for i in instances:
        print(' ', i['id'], i['slug'], i['x_mm'], i['y_mm'], i['w_mm'], i['h_mm'], i['connection_points'])


if __name__ == '__main__':
    main()
