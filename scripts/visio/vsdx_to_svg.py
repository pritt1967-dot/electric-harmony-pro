"""VSDX -> SVG converter (vector geometry only, no redrawing)."""
import json, math, os, sys, xml.etree.ElementTree as ET

N = '{http://schemas.microsoft.com/office/visio/2012/main}'
SRC = '/tmp/vs/x'


def cells(shape):
    d = {}
    for c in shape.findall(f'{N}Cell'):
        d[c.get('N')] = c.get('V')
    return d


def f(d, k, dflt=0.0):
    v = d.get(k)
    try:
        return float(v)
    except (TypeError, ValueError):
        return dflt


def transformer(c):
    """Return fn mapping local (x,y) -> parent (x,y)."""
    w, h = f(c, 'Width'), f(c, 'Height')
    px, py = f(c, 'PinX'), f(c, 'PinY')
    lx, ly = f(c, 'LocPinX', w / 2), f(c, 'LocPinY', h / 2)
    ang = f(c, 'Angle')
    fx, fy = f(c, 'FlipX'), f(c, 'FlipY')
    ca, sa = math.cos(ang), math.sin(ang)

    def t(x, y):
        if fx:
            x = w - x
        if fy:
            y = h - y
        x -= lx
        y -= ly
        rx = x * ca - y * sa
        ry = x * sa + y * ca
        return (rx + px, ry + py)
    return t


def compose(outer, inner):
    return lambda x, y: outer(*inner(x, y))


def color(v, dflt):
    if v is None:
        return dflt
    v = v.strip()
    if v.startswith('#'):
        return v
    return dflt


def geom_paths(shape, tr, c, out):
    lw = f(c, 'LineWeight', 0.01)
    stroke = color(c.get('LineColor'), '#000000')
    fill = color(c.get('FillForegnd'), 'none')
    if c.get('FillPattern') == '0' or c.get('NoFill') == '1':
        fill = 'none'
    nostroke = c.get('LinePattern') == '0' or c.get('NoLine') == '1'
    for sec in shape.findall(f'{N}Section'):
        if sec.get('N') != 'Geometry':
            continue
        gcells = {x.get('N'): x.get('V') for x in sec.findall(f'{N}Cell')}
        if gcells.get('NoShow') == '1':
            continue
        g_nofill = gcells.get('NoFill') == '1'
        g_noline = gcells.get('NoLine') == '1'
        d = []
        last = None
        for row in sec.findall(f'{N}Row'):
            rc = {x.get('N'): x.get('V') for x in row.findall(f'{N}Cell')}
            T = row.get('T')
            if T == 'Ellipse':
                cx, cy = f(rc, 'X'), f(rc, 'Y')
                ax, ay = f(rc, 'A'), f(rc, 'B')
                bx, by = f(rc, 'C'), f(rc, 'D')
                rx = math.hypot(ax - cx, ay - cy)
                ry = math.hypot(bx - cx, by - cy)
                p0 = tr(cx - rx, cy)
                p1 = tr(cx + rx, cy)
                pt = tr(cx, cy + ry)
                RX = math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / 2
                RY = math.hypot(pt[0] - ((p0[0] + p1[0]) / 2), pt[1] - ((p0[1] + p1[1]) / 2))
                out.append(dict(kind='ellipse', cx=(p0[0] + p1[0]) / 2, cy=(p0[1] + p1[1]) / 2,
                                rx=RX, ry=RY, fill='none' if g_nofill else fill,
                                stroke=None if (nostroke or g_noline) else stroke, lw=lw))
                continue
            x, y = f(rc, 'X'), f(rc, 'Y')
            p = tr(x, y)
            if T == 'MoveTo':
                d.append(f'M {p[0]:.5f} {p[1]:.5f}')
            elif T == 'LineTo':
                d.append(f'L {p[0]:.5f} {p[1]:.5f}')
            elif T == 'EllipticalArcTo':
                # approximate with quadratic through control point (A,B)
                cp = tr(f(rc, 'A'), f(rc, 'B'))
                d.append(f'Q {cp[0]:.5f} {cp[1]:.5f} {p[0]:.5f} {p[1]:.5f}')
            last = p
        if d:
            out.append(dict(kind='path', d=' '.join(d), fill='none' if g_nofill else fill,
                            stroke=None if (nostroke or g_noline) else stroke, lw=lw))
    return out


def walk(shape, tr, out, stats):
    c = cells(shape)
    if c.get('NoShow') == '1':
        return
    t = compose(tr, transformer(c))
    if shape.get('Type') == 'Foreign':
        stats['foreign'] += 1
    geom_paths(shape, t, c, out)
    for sub in shape.findall(f'{N}Shapes/{N}Shape'):
        walk(sub, t, out, stats)


def convert(master_file):
    root = ET.parse(master_file).getroot()
    out = []
    stats = {'foreign': 0, 'shapes': 0}
    ident = lambda x, y: (x, y)
    top = root.find(f'{N}Shapes/{N}Shape')
    for s in root.findall(f'{N}Shapes/{N}Shape'):
        walk(s, ident, out, stats)
    stats['shapes'] = len(out)
    tc = cells(top)
    return out, tc, stats


def render(out, tc, pad=0.05):
    xs, ys = [], []
    for o in out:
        if o['kind'] == 'ellipse':
            xs += [o['cx'] - o['rx'], o['cx'] + o['rx']]
            ys += [o['cy'] - o['ry'], o['cy'] + o['ry']]
        else:
            nums = [float(v) for v in o['d'].replace('M', ' ').replace('L', ' ').replace('Q', ' ').split()]
            xs += nums[0::2]
            ys += nums[1::2]
    if not xs:
        return None, None
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    w = maxx - minx or 1
    h = maxy - miny or 1
    S = 100.0  # units -> svg px scale
    W, H = w * S + 2 * pad * S, h * S + 2 * pad * S

    def X(v):
        return (v - minx) * S + pad * S

    def Y(v):
        return (maxy - v) * S + pad * S

    body = []
    for o in out:
        st = o['stroke']
        sw = max(o['lw'] * S, 0.35)
        attrs = f'fill="{o["fill"]}"' + (f' stroke="{st}" stroke-width="{sw:.2f}" stroke-linejoin="round" stroke-linecap="round"' if st else ' stroke="none"')
        if o['kind'] == 'ellipse':
            body.append(f'<ellipse cx="{X(o["cx"]):.2f}" cy="{Y(o["cy"]):.2f}" rx="{o["rx"]*S:.2f}" ry="{o["ry"]*S:.2f}" {attrs}/>')
        else:
            dd = []
            toks = o['d'].split()
            i = 0
            while i < len(toks):
                cmd = toks[i]
                if cmd == 'Q':
                    x1, y1, x2, y2 = map(float, toks[i + 1:i + 5])
                    dd.append(f'Q {X(x1):.2f} {Y(y1):.2f} {X(x2):.2f} {Y(y2):.2f}')
                    i += 5
                else:
                    x1, y1 = map(float, toks[i + 1:i + 3])
                    dd.append(f'{cmd} {X(x1):.2f} {Y(y1):.2f}')
                    i += 3
            body.append(f'<path d="{" ".join(dd)}" {attrs}/>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.2f} {H:.2f}" '
           f'width="{W:.2f}" height="{H:.2f}">' + ''.join(body) + '</svg>')
    return svg, (W, H)


if __name__ == '__main__':
    masters = ET.parse(f'{SRC}/visio/masters/masters.xml').getroot()
    rels = {r.get('Id'): r.get('Target') for r in ET.parse(f'{SRC}/visio/masters/_rels/masters.xml.rels').getroot()}
    outdir = sys.argv[1]
    os.makedirs(outdir, exist_ok=True)
    res = []
    for m in masters:
        rel = m.find(f'{N}Rel')
        target = rels[rel.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')]
        path = os.path.join(f'{SRC}/visio/masters', os.path.basename(target))
        out, tc, stats = convert(path)
        svg, size = render(out, tc)
        name = m.get('NameU')
        slug = ''.join(ch if ch.isalnum() else '-' for ch in name.lower()).strip('-')
        while '--' in slug:
            slug = slug.replace('--', '-')
        ok = svg is not None and len(out) >= 1
        if ok:
            open(os.path.join(outdir, slug + '.svg'), 'w').write(svg)
        res.append(dict(name=name, slug=slug, master=os.path.basename(path), shapes=len(out),
                        foreign=stats['foreign'], ok=ok, size=size,
                        widthMm=f(tc, 'Width') * 25.4 if tc.get('WidthUnit') else None,
                        vWidth=f(tc, 'Width'), vHeight=f(tc, 'Height')))
    print(json.dumps(res, ensure_ascii=False, indent=1))
