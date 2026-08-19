import json, os, sys, xml.etree.ElementTree as ET
sys.path.insert(0, '/tmp/vs')
from conv import (N, cells, f, transformer, compose, geom_paths, walk, render, SRC)


def convert_shape(shape):
    """Convert a single shape (with children) placed at its own origin."""
    out, stats = [], {'foreign': 0}
    c = cells(shape)
    w, h = f(c, 'Width'), f(c, 'Height')
    # neutralize the shape's own placement: draw in local coords
    local = {'Width': w, 'Height': h, 'PinX': w / 2, 'PinY': h / 2,
             'LocPinX': w / 2, 'LocPinY': h / 2, 'Angle': 0, 'FlipX': 0, 'FlipY': 0}
    t = transformer(local)
    geom_paths(shape, t, c, out)
    for sub in shape.findall(f'{N}Shapes/{N}Shape'):
        walk(sub, t, out, stats)
    return out, c, stats


def conn_points(shape):
    pts = []
    for sec in shape.findall(f'{N}Section'):
        if sec.get('N') == 'Connection':
            for row in sec.findall(f'{N}Row'):
                cc = {x.get('N'): x.get('V') for x in row.findall(f'{N}Cell')}
                pts.append({'id': row.get('N') or f'P{len(pts)+1}',
                            'x_mm': round(f(cc, 'X') * 25.4, 2),
                            'y_mm': round(f(cc, 'Y') * 25.4, 2)})
    return pts


def slugify(name):
    s = ''.join(ch if ch.isalnum() else '-' for ch in name.lower()).strip('-')
    while '--' in s:
        s = s.replace('--', '-')
    return s


def entry(shape, name, source_file, source_master):
    out, c, stats = convert_shape(shape)
    svg, size = render(out, c)
    w_mm = round(f(c, 'Width') * 25.4, 2)
    h_mm = round(f(c, 'Height') * 25.4, 2)
    return {
        'slug': slugify(name),
        'name': name,
        'source_file': source_file,
        'source_master': source_master,
        'width_mm': w_mm,
        'height_mm': h_mm,
        'paths': len(out),
        'foreign': stats['foreign'],
        'connection_points': conn_points(shape),
        'svg': svg,
    }


def collect(root_dir, masters_xml, source_file):
    res = []
    masters = ET.parse(masters_xml).getroot()
    rels = {r.get('Id'): r.get('Target') for r in ET.parse(
        os.path.join(os.path.dirname(masters_xml), '_rels', 'masters.xml.rels')).getroot()}
    for m in masters:
        rel = m.find(f'{N}Rel')
        rid = rel.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
        fname = os.path.basename(rels[rid])
        path = os.path.join(os.path.dirname(masters_xml), fname)
        top = ET.parse(path).getroot().find(f'{N}Shapes/{N}Shape')
        res.append(entry(top, m.get('NameU'), source_file, f'{m.get("NameU")} ({fname})'))
        # named Klemsan sub-groups become their own library entities
        seen = set()
        for sub in top.iter(f'{N}Shape'):
            nu = sub.get('NameU') or ''
            if 'Klemsan' in nu:
                base = nu.split('.')[0]
                if base in seen:
                    continue
                seen.add(base)
                e = entry(sub, f'{base} (клемма)', source_file, f'{m.get("NameU")} / {nu} ({fname})')
                if e['svg'] and not any(x['slug'] == e['slug'] for x in res):
                    res.append(e)
    return res


if __name__ == '__main__':
    all_ = collect(SRC, f'{SRC}/visio/masters/masters.xml', 'Щит зарядки.vsdx')
    all_ += collect(f'{SRC}/emb', f'{SRC}/emb/visio/masters/masters.xml',
                    'Щит зарядки.vsdx / embedded')
    # de-dup by slug
    uniq, seen = [], set()
    for e in all_:
        if e['slug'] in seen:
            continue
        seen.add(e['slug'])
        uniq.append(e)
    json.dump(uniq, open('/tmp/vs/library.json', 'w'), ensure_ascii=False)
    for e in uniq:
        print(e['slug'], '|', e['name'], '|', e['width_mm'], 'x', e['height_mm'],
              '| paths', e['paths'], '| foreign', e['foreign'], '| conn',
              len(e['connection_points']), '| svg', bool(e['svg']))
