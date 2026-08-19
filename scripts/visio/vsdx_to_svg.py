"""VSDX -> SVG converter (vector geometry only, no redrawing).

Извлекает из Visio Master:
  * векторную геометрию (Geometry sections);
  * векторные вставки EMF (ForeignData) — конвертируются libemf2svg и
    встраиваются с исходными пропорциями (дисплей реле, шильдики);
  * текст фигур (номиналы, обозначения) — берётся из <Text>/Field Visio;
  * точки подключения (Connection sections) на всех уровнях вложенности;
  * Shape Data (Property) — номинал, артикул, наименование.

Ничего не дорисовывается вручную.
"""
import json, math, os, re, subprocess, sys, xml.etree.ElementTree as ET

N = '{http://schemas.microsoft.com/office/visio/2012/main}'
R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
SRC = '/tmp/vs/x'
EMF_DIR = '/tmp/vs/emf'
S = 100.0  # visio units -> svg px


def cells(shape):
    return {c.get('N'): c.get('V') for c in shape.findall(f'{N}Cell')}


def f(d, k, dflt=0.0):
    try:
        return float(d.get(k))
    except (TypeError, ValueError):
        return dflt


def transformer(c):
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
        return (x * ca - y * sa + px, x * sa + y * ca + py)
    return t


def compose(outer, inner):
    return lambda x, y: outer(*inner(x, y))


def color(v, dflt):
    if v is None:
        return dflt
    v = v.strip()
    return v if v.startswith('#') else dflt


# ---------------------------------------------------------------- EMF assets
def emf_to_svg(emf_path):
    """Конвертирует EMF (векторный метафайл Visio) в SVG через libemf2svg."""
    os.makedirs(EMF_DIR, exist_ok=True)
    out = os.path.join(EMF_DIR, os.path.basename(emf_path) + '.svg')
    if not os.path.exists(out):
        subprocess.run(['emf2svg-conv', '-i', emf_path, '-o', out],
                       check=True, capture_output=True)
    txt = open(out).read()
    m = re.search(r'<svg[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"', txt)
    if not m:
        return None
    inner = txt[txt.index('>', txt.index('<svg')) + 1: txt.rindex('</svg>')]
    return {'w': float(m.group(1)), 'h': float(m.group(2)), 'inner': inner}


def rels_for(xml_path):
    p = os.path.join(os.path.dirname(xml_path), '_rels',
                     os.path.basename(xml_path) + '.rels')
    if not os.path.exists(p):
        return {}
    return {r.get('Id'): os.path.normpath(os.path.join(os.path.dirname(xml_path), r.get('Target')))
            for r in ET.parse(p).getroot()}


# ------------------------------------------------------------------ geometry
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
        for row in sec.findall(f'{N}Row'):
            rc = {x.get('N'): x.get('V') for x in row.findall(f'{N}Cell')}
            T = row.get('T')
            if T == 'Ellipse':
                cx, cy = f(rc, 'X'), f(rc, 'Y')
                ax, ay = f(rc, 'A'), f(rc, 'B')
                bx, by = f(rc, 'C'), f(rc, 'D')
                rx = math.hypot(ax - cx, ay - cy)
                ry = math.hypot(bx - cx, by - cy)
                p0, p1, pt = tr(cx - rx, cy), tr(cx + rx, cy), tr(cx, cy + ry)
                RX = math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / 2
                RY = math.hypot(pt[0] - (p0[0] + p1[0]) / 2, pt[1] - (p0[1] + p1[1]) / 2)
                out.append(dict(kind='ellipse', cx=(p0[0] + p1[0]) / 2, cy=(p0[1] + p1[1]) / 2,
                                rx=RX, ry=RY, fill='none' if g_nofill else fill,
                                stroke=None if (nostroke or g_noline) else stroke, lw=lw))
                continue
            p = tr(f(rc, 'X'), f(rc, 'Y'))
            if T == 'MoveTo':
                d.append(f'M {p[0]:.5f} {p[1]:.5f}')
            elif T == 'LineTo':
                d.append(f'L {p[0]:.5f} {p[1]:.5f}')
            elif T == 'EllipticalArcTo':
                cp = tr(f(rc, 'A'), f(rc, 'B'))
                d.append(f'Q {cp[0]:.5f} {cp[1]:.5f} {p[0]:.5f} {p[1]:.5f}')
        if d:
            out.append(dict(kind='path', d=' '.join(d), fill='none' if g_nofill else fill,
                            stroke=None if (nostroke or g_noline) else stroke, lw=lw))
    return out


def shape_text(shape):
    t = shape.find(f'{N}Text')
    if t is None:
        return ''
    parts = []
    if t.text:
        parts.append(t.text)
    for el in t:
        if el.tag == f'{N}fld':
            # значение поля берём из секции Field той же фигуры
            parts.append(field_value(shape, el.get('IX')))
        if el.tail:
            parts.append(el.tail)
    return ''.join(parts).strip()


def field_value(shape, ix):
    for sec in shape.findall(f'{N}Section'):
        if sec.get('N') != 'Field':
            continue
        for row in sec.findall(f'{N}Row'):
            if row.get('IX') == ix or ix is None:
                rc = {x.get('N'): x.get('V') for x in row.findall(f'{N}Cell')}
                return rc.get('Value', '')
    return ''


def char_size(shape):
    for sec in shape.findall(f'{N}Section'):
        if sec.get('N') == 'Character':
            for row in sec.findall(f'{N}Row'):
                rc = {x.get('N'): x.get('V') for x in row.findall(f'{N}Cell')}
                if rc.get('Size'):
                    return float(rc['Size'])
    return 0.11


def text_color(shape):
    for sec in shape.findall(f'{N}Section'):
        if sec.get('N') == 'Character':
            for row in sec.findall(f'{N}Row'):
                rc = {x.get('N'): x.get('V') for x in row.findall(f'{N}Cell')}
                v = (rc.get('Color') or '').strip()
                if v.startswith('#'):
                    return v
    return '#000000'


def connections(shape, tr, out):
    """Все Connection-точки фигуры в координатах корневой фигуры."""
    for sec in shape.findall(f'{N}Section'):
        if sec.get('N') != 'Connection':
            continue
        for i, row in enumerate(sec.findall(f'{N}Row')):
            rc = {x.get('N'): x.get('V') for x in row.findall(f'{N}Cell')}
            if 'X' not in rc or 'Y' not in rc:
                continue
            p = tr(f(rc, 'X'), f(rc, 'Y'))
            out.append({'id': row.get('N') or f'{shape.get("ID")}-{i + 1}',
                        'x': p[0], 'y': p[1]})


def walk(shape, tr, out, stats, rels, conns):
    c = cells(shape)
    if c.get('NoShow') == '1':
        return
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
            except Exception as e:  # noqa: BLE001
                print('EMF fail', target, e, file=sys.stderr)
        if asset:
            w, h = f(c, 'Width'), f(c, 'Height')
            out.append(dict(kind='image', asset=asset,
                            o=t(0, h), u=t(w, h), v=t(0, 0)))
            stats['emf_ok'] += 1
        else:
            stats['foreign'] += 1

    txt = shape_text(shape)
    if txt:
        w, h = f(c, 'Width'), f(c, 'Height')
        tx = f(c, 'TxtPinX', w / 2)
        ty = f(c, 'TxtPinY', h / 2)
        p = t(tx, ty)
        out.append(dict(kind='text', x=p[0], y=p[1], text=txt,
                        size=char_size(shape), color=text_color(shape)))
        stats['texts'] += 1

    for sub in shape.findall(f'{N}Shapes/{N}Shape'):
        walk(sub, t, out, stats, rels, conns)


def render(out, conns=(), pad=0.05, mark_connections=True):
    xs, ys = [], []
    for o in out:
        if o['kind'] == 'ellipse':
            xs += [o['cx'] - o['rx'], o['cx'] + o['rx']]
            ys += [o['cy'] - o['ry'], o['cy'] + o['ry']]
        elif o['kind'] == 'image':
            for p in (o['o'], o['u'], o['v'],
                      (o['u'][0] + o['v'][0] - o['o'][0], o['u'][1] + o['v'][1] - o['o'][1])):
                xs.append(p[0])
                ys.append(p[1])
        elif o['kind'] == 'text':
            xs.append(o['x'])
            ys.append(o['y'])
        else:
            nums = [float(v) for v in o['d'].replace('M', ' ').replace('L', ' ').replace('Q', ' ').split()]
            xs += nums[0::2]
            ys += nums[1::2]
    if not xs:
        return None, None
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    w = maxx - minx or 1
    h = maxy - miny or 1
    W, H = w * S + 2 * pad * S, h * S + 2 * pad * S

    def X(v):
        return (v - minx) * S + pad * S

    def Y(v):
        return (maxy - v) * S + pad * S

    body = []
    for o in out:
        if o['kind'] == 'image':
            a = o['asset']
            ox, oy = X(o['o'][0]), Y(o['o'][1])
            ux, uy = X(o['u'][0]) - ox, Y(o['u'][1]) - oy
            vx, vy = X(o['v'][0]) - ox, Y(o['v'][1]) - oy
            m = (ux / a['w'], uy / a['w'], vx / a['h'], vy / a['h'], ox, oy)
            body.append('<g transform="matrix(%.6f %.6f %.6f %.6f %.4f %.4f)">%s</g>'
                        % (*m, a['inner']))
            continue
        if o['kind'] == 'text':
            fs = max(o['size'] * S, 1.2)
            lines = o['text'].split('\n')
            dy0 = -(len(lines) - 1) * fs * 0.6
            spans = ''.join(
                f'<tspan x="{X(o["x"]):.2f}" dy="{(fs * 1.15) if i else dy0:.2f}">'
                f'{ln.replace("&", "&amp;").replace("<", "&lt;")}</tspan>'
                for i, ln in enumerate(lines))
            body.append(
                f'<text x="{X(o["x"]):.2f}" y="{Y(o["y"]):.2f}" font-family="Arial, sans-serif" '
                f'font-size="{fs:.2f}" fill="{o["color"]}" text-anchor="middle" '
                f'dominant-baseline="central">{spans}</text>')
            continue
        st = o['stroke']
        sw = max(o['lw'] * S, 0.35)
        attrs = f'fill="{o["fill"]}"' + (
            f' stroke="{st}" stroke-width="{sw:.2f}" stroke-linejoin="round" stroke-linecap="round"'
            if st else ' stroke="none"')
        if o['kind'] == 'ellipse':
            body.append(f'<ellipse cx="{X(o["cx"]):.2f}" cy="{Y(o["cy"]):.2f}" '
                        f'rx="{o["rx"]*S:.2f}" ry="{o["ry"]*S:.2f}" {attrs}/>')
        else:
            dd, toks, i = [], o['d'].split(), 0
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

    pts = []
    for c in conns:
        px, py = X(c['x']), Y(c['y'])
        pts.append(f'<circle cx="{px:.2f}" cy="{py:.2f}" r="{max(W, H) * 0.012:.2f}" '
                   f'fill="#e11d48" fill-opacity="0.85" data-connection-id="{c["id"]}"/>')
    marks = (f'<g data-role="connection-points">{"".join(pts)}</g>'
             if (mark_connections and pts) else '')

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.2f} {H:.2f}" '
           f'width="{W:.2f}" height="{H:.2f}">' + ''.join(body) + marks + '</svg>')
    # координаты точек подключения в мм от левого-нижнего угла bbox
    conn_mm = [{'id': c['id'],
                'x_mm': round((c['x'] - minx) * 25.4, 2),
                'y_mm': round((c['y'] - miny) * 25.4, 2)} for c in conns]
    return svg, {'w': W, 'h': H, 'bbox_w_mm': round(w * 25.4, 2),
                 'bbox_h_mm': round(h * 25.4, 2), 'conn_mm': conn_mm}
