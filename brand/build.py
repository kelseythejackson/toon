"""Generates the toon mascot cast as SVG: Dot, Brick, Zip and Loop.

Construction (the "hybrid" style): a flat geometric body, a hand-drawn ink outline drawn ~3px off-register,
and 2.4px rounded ink strokes for features and limbs. Every file is produced from the parameters below, so a
change here updates all of them.   Usage: python3 brand/build.py   → writes into brand/
"""
import math, os, random, pathlib

OUT = pathlib.Path(__file__).parent
INK = '#1A1A1A'
BRAND = {'dot': '#2F6BFF', 'brick': '#E8442A', 'zip': '#FFB020', 'loop': '#1F9E6E'}
STROKE = 2.4
OFFSET = (-3, -2.5)            # ink line sits up-left of the fill: the off-register "print" look

# ── geometry ───────────────────────────────────────────────────────────────
def circle_pts(cx, cy, r, n=48):
    return [(cx + r * math.cos(t), cy + r * math.sin(t)) for t in (2 * math.pi * i / n for i in range(n))]

def rrect_pts(x, y, w, h, rad, n=64):
    pts, per = [], 2 * (w + h - 4 * rad) + 2 * math.pi * rad
    for i in range(n):
        d = per * i / n
        # walk the perimeter: straight edges and quarter arcs
        segs = [('l', x + rad, y, 1, 0, w - 2 * rad), ('a', x + w - rad, y + rad, -90, rad),
                ('l', x + w, y + rad, 0, 1, h - 2 * rad), ('a', x + w - rad, y + h - rad, 0, rad),
                ('l', x + w - rad, y + h, -1, 0, w - 2 * rad), ('a', x + rad, y + h - rad, 90, rad),
                ('l', x, y + h - rad, 0, -1, h - 2 * rad), ('a', x + rad, y + rad, 180, rad)]
        for s in segs:
            L = s[5] if s[0] == 'l' else math.pi * rad / 2
            if d <= L:
                if s[0] == 'l': pts.append((s[1] + s[3] * d, s[2] + s[4] * d))
                else:
                    a = math.radians(s[3] + 90 * d / L); pts.append((s[1] + rad * math.cos(a), s[2] + rad * math.sin(a)))
                break
            d -= L
    return pts

def drop_pts(cx, cy, r, n=56):      # teardrop with its point to the left (trailing behind a rightward dash)
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        k = ((1 + math.cos(t - math.pi)) / 2) ** 6
        rr = r * (1 + 0.55 * k)
        pts.append((cx + rr * math.cos(t), cy + rr * 0.92 * math.sin(t)))
    return pts

def smooth_path(pts):
    """Closed Catmull-Rom → cubic Bézier path."""
    n, d = len(pts), []
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        if i == 0: d.append(f'M{p1[0]:.1f} {p1[1]:.1f}')
        d.append(f'C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}')
    return ' '.join(d) + ' Z'

def wobble(pts, seed, amp=1.3, every=4):
    """Hand-drawn feel: low-frequency jitter on a subsample of the outline, deterministic per character."""
    rnd = random.Random(seed)
    sub = pts[::every]
    cx = sum(p[0] for p in sub) / len(sub); cy = sum(p[1] for p in sub) / len(sub)
    out = []
    for x, y in sub:
        dx, dy = x - cx, y - cy; dist = math.hypot(dx, dy) or 1; j = rnd.uniform(-amp, amp)
        out.append((x + dx / dist * j + OFFSET[0], y + dy / dist * j + OFFSET[1]))
    return out

# ── faces ──────────────────────────────────────────────────────────────────
def face(c, mood, feat=INK):
    """c: character face spec. mood: neutral | happy | surprised | focused. feat: colour of features on the body."""
    (lx, ly), (rx, ry) = c['eyes']; s = c['scale']; mx, my = c['mouth']; style = c['eye']
    g = []
    line = lambda d, w=STROKE: g.append(f'<path d="{d}" fill="none" stroke="{feat}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>')
    def eye(x, y, kind):
        if kind == 'happy':
            line(f'M{x - 6 * s:.1f} {y + 2 * s:.1f} Q{x:.1f} {y - 6 * s:.1f} {x + 6 * s:.1f} {y + 2 * s:.1f}', STROKE + .4); return
        if kind == 'wink':
            line(f'M{x - 6 * s:.1f} {y:.1f} Q{x:.1f} {y - 5 * s:.1f} {x + 6 * s:.1f} {y:.1f}'); return
        big = 1.25 if kind == 'surprised' else 1
        if style == 'white':
            r = c['eye_r'] * big
            g.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="#FFFFFF" stroke="{feat}" stroke-width="1.8"/>')
            pr = r * (0.5 if kind == 'surprised' else 0.46)       # never tiny pupils
            gx, gy = (r * .38, r * .3) if kind == 'focused' else (.8, .8)   # focused: glancing at the task
            g.append(f'<circle cx="{x + gx:.1f}" cy="{y + gy:.1f}" r="{pr:.1f}" fill="{feat}"/>')
            if c.get('glint'): g.append(f'<circle cx="{x + 2.2 * s:.1f}" cy="{y - 1.6 * s:.1f}" r="{1.3 * s:.1f}" fill="#FFFFFF"/>')
        else:
            dx = c['eye_r'] * .45 if kind == 'focused' else 0
            g.append(f'<circle cx="{x + dx:.1f}" cy="{y + dx * .5:.1f}" r="{c["eye_r"] * big:.1f}" fill="{feat}"/>')

    # brows
    bl, br = (lx, ly - c['brow']), (rx, ry - c['brow'])
    w = 7 * s
    if mood == 'neutral':
        b = c['neutral_brow']
        if b == 'raised': line(f'M{bl[0] - w:.1f} {bl[1] + 2:.1f} Q{bl[0]:.1f} {bl[1] - 4:.1f} {bl[0] + w:.1f} {bl[1]:.1f}'); line(f'M{br[0] - w:.1f} {br[1]:.1f} Q{br[0]:.1f} {br[1] - 4:.1f} {br[0] + w:.1f} {br[1] + 2:.1f}')
        elif b == 'level': line(f'M{bl[0] - w:.1f} {bl[1] + 3:.1f} L{bl[0] + w:.1f} {bl[1] + 3:.1f}'); line(f'M{br[0] - w:.1f} {br[1] + 3:.1f} L{br[0] + w:.1f} {br[1] + 3:.1f}')
        elif b == 'cocked': line(f'M{bl[0] - w:.1f} {bl[1] + 1:.1f} Q{bl[0]:.1f} {bl[1] - 6:.1f} {bl[0] + w:.1f} {bl[1] - 1:.1f}'); line(f'M{br[0] - w:.1f} {br[1] + 2:.1f} L{br[0] + w:.1f} {br[1] + 3:.1f}')
    elif mood == 'happy':
        line(f'M{bl[0] - w:.1f} {bl[1]:.1f} Q{bl[0]:.1f} {bl[1] - 5:.1f} {bl[0] + w:.1f} {bl[1] - 1:.1f}'); line(f'M{br[0] - w:.1f} {br[1] - 1:.1f} Q{br[0]:.1f} {br[1] - 5:.1f} {br[0] + w:.1f} {br[1]:.1f}')
    elif mood == 'surprised':
        line(f'M{bl[0] - w:.1f} {bl[1] - 3:.1f} Q{bl[0]:.1f} {bl[1] - 11:.1f} {bl[0] + w:.1f} {bl[1] - 4:.1f}'); line(f'M{br[0] - w:.1f} {br[1] - 4:.1f} Q{br[0]:.1f} {br[1] - 11:.1f} {br[0] + w:.1f} {br[1] - 3:.1f}')
    elif mood == 'focused':
        line(f'M{bl[0] - w:.1f} {bl[1] + 3:.1f} L{bl[0] + w:.1f} {bl[1] + 3.5:.1f}'); line(f'M{br[0] - w:.1f} {br[1] + 3.5:.1f} L{br[0] + w:.1f} {br[1] + 3:.1f}')
    # eyes
    if mood == 'happy': eye(lx, ly, 'happy'); eye(rx, ry, 'happy')
    elif mood == 'neutral' and c.get('wink'): eye(lx, ly, 'open'); eye(rx, ry, 'wink')
    else: eye(lx, ly, mood); eye(rx, ry, mood)
    # mouth
    mw = c['mouth_w']
    if mood == 'neutral':
        line(f'M{mx - mw:.1f} {my:.1f} Q{mx:.1f} {my + c["smile"]:.1f} {mx + mw:.1f} {my - (1 if c.get("wink") else 0):.1f}', STROKE + .2)
    elif mood == 'happy':
        g.append(f'<path d="M{mx - mw - 2:.1f} {my - 1:.1f} Q{mx:.1f} {my + mw * 1.5:.1f} {mx + mw + 2:.1f} {my - 1:.1f} Z" fill="{feat}" stroke="{feat}" stroke-width="1.5" stroke-linejoin="round"/>')
    elif mood == 'surprised':
        g.append(f'<ellipse cx="{mx:.1f}" cy="{my + 3:.1f}" rx="{mw * .38:.1f}" ry="{mw * .52:.1f}" fill="{feat}"/>')
    elif mood == 'focused':
        tx, ty = mx + mw * .45, my + 2.5                  # tongue poking out of the corner: concentrating
        g.append(f'<ellipse cx="{tx:.1f}" cy="{ty + 2.6:.1f}" rx="{3.2 * c["scale"]:.1f}" ry="{3.6 * c["scale"]:.1f}" fill="#FF7A8A" stroke="{feat}" stroke-width="1.6"/>')
        line(f'M{mx - mw * .6:.1f} {my + 2:.1f} L{mx + mw * .7:.1f} {my + 2.5:.1f}', STROKE + .2)
    return '\n  '.join(g)

# ── characters (200 × 200 canvas, ground at y = 180) ────────────────────────
CHARS = {
    'dot': dict(name='Dot', role='the lead', shape=lambda: circle_pts(100, 132, 46), seed=11,
                face=dict(eyes=[(86, 124), (114, 124)], eye='white', eye_r=8, scale=1.1, brow=15, neutral_brow='raised',
                          mouth=(100, 146), mouth_w=10, smile=9)),
    'brick': dict(name='Brick', role='the heavy', shape=lambda: rrect_pts(46, 76, 108, 104, 20), seed=23, base=True,
                  face=dict(eyes=[(80, 124), (120, 124)], eye='dot', eye_r=5.5, scale=1.15, brow=11, neutral_brow='level',
                            mouth=(100, 148), mouth_w=10, smile=5)),
    'zip': dict(name='Zip', role='the light', shape=lambda: drop_pts(112, 108, 36), seed=37, hover=True,
                face=dict(eyes=[(104, 102), (128, 102)], eye='white', eye_r=8.5, scale=1, brow=14, neutral_brow='raised', glint=True,
                          mouth=(116, 120), mouth_w=8, smile=8)),
    'loop': dict(name='Loop', role='the show-off', shape=lambda: rrect_pts(74, 46, 54, 132, 27), seed=51, arms=True,
                 face=dict(eyes=[(91, 84), (113, 84)], eye='dot', eye_r=4.6, scale=.95, brow=11, neutral_brow='cocked', wink=True,
                           mouth=(102, 102), mouth_w=11, smile=10)),
}

def character(key, mood='neutral', fill=None, ink=INK, feat=INK, bg=None, standalone=True):
    c = CHARS[key]; fill = fill or BRAND[key]; pts = c['shape']()
    body = [f'<path d="{smooth_path(pts)}" fill="{fill}"/>']
    extra_back, extra_front = [], []
    ln = lambda d, w=STROKE, col=ink: f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
    if c.get('hover'):     # shadow on the ground + speed lines behind the tail
        extra_back.append(f'<ellipse cx="108" cy="178" rx="24" ry="3.5" fill="{ink}" opacity=".18"/>')
        for i, (x, y, l) in enumerate([(52, 96, 14), (46, 110, 18), (54, 124, 12)]):
            extra_back.append(ln(f'M{x} {y} L{x - l} {y}'))
    if c.get('arms'):
        arm_l = 'M75 118 L58 134 L70 146' if mood != 'surprised' else 'M75 112 L56 100 L50 86'
        arm_r = {'neutral': 'M127 106 L146 86 L152 66', 'happy': 'M127 106 L148 92 L160 76',
                 'surprised': 'M127 112 L146 100 L152 86', 'focused': 'M127 116 L142 124 L132 134'}[mood]
        extra_front += [ln(arm_l), ln(arm_r)]
        hand = {'neutral': (153, 62), 'happy': (161, 72), 'surprised': (153, 82), 'focused': (129, 136)}[mood]
        extra_front.append(f'<circle cx="{hand[0]}" cy="{hand[1]}" r="4.5" fill="{bg or "#FFFFFF"}" stroke="{ink}" stroke-width="2"/>')
        extra_front += [f'<ellipse cx="90" cy="181" rx="8" ry="3.5" fill="{ink}"/>', f'<ellipse cx="112" cy="181" rx="8" ry="3.5" fill="{ink}"/>']
    outline = ln(smooth_path(wobble(pts, c['seed'])))
    base = ln('M50 178.5 C80 180 120 180 150 178.5', STROKE + 1.2) if c.get('base') else ''
    svg = '\n  '.join(extra_back + body + [outline, base] + extra_front + [face(c['face'], mood, feat)])
    if not standalone: return svg
    title = f'{c["name"]}, {c["role"]} — {mood}'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200" role="img" aria-label="{title}">\n'
            f'  <title>{title}</title>\n  {svg}\n</svg>\n')

def logo(size):
    """Dot reduced to the mark: flat circle, white dot eyes, smile (dropped at 16px)."""
    eyes = '<circle cx="11.5" cy="15" r="2.6" fill="#FFFFFF"/><circle cx="20.5" cy="15" r="2.6" fill="#FFFFFF"/>' if size > 16 else \
           '<circle cx="11" cy="15" r="3" fill="#FFFFFF"/><circle cx="21" cy="15" r="3" fill="#FFFFFF"/>'
    smile = '<path d="M12.5 21 Q16 24 19.5 21" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/>' if size > 16 else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="{size}" height="{size}" role="img" aria-label="toon">\n'
            f'  <title>toon</title>\n  <circle cx="16" cy="16" r="15" fill="{BRAND["dot"]}"/>\n  {eyes}{smile}\n</svg>\n')

# ── themed samples: demo token slots from examples/demo.css ─────────────────
THEMES = {
    'riso-light':  dict(surface='#FFFDF8', ink='#1E1B2E', dot='#D92E86', loop='#0072B5', zip='#8F7600', brick='#1E1B2E', label='Riso Press · light'),
    'crayon-dark': dict(surface='#231E33', ink='#F4EFFF', dot='#B39BFF', loop='#FFB396', zip='#8FE0BE', brick='#D9D0F0', label='Crayon Cloud · dark'),
}
def on_body(hex_fill):       # features: dark ink on light bodies, white on dark bodies
    n = int(hex_fill[1:], 16); r, g, b = [((n >> s) & 255) / 255 for s in (16, 8, 0)]
    lum = lambda v: v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4
    L = .2126 * lum(r) + .7152 * lum(g) + .0722 * lum(b)
    return INK if (L + .05) / .05 >= (1.05) / (L + .05) else '#FFFFFF'

def lineup(theme=None):
    t = THEMES.get(theme)
    bg = t['surface'] if t else '#FBFAF6'; ink = t['ink'] if t else INK
    parts = [f'<rect width="880" height="250" rx="16" fill="{bg}"/>']
    if not t:   # grid paper for the brand line-up
        parts += [f'<path d="M0 {y}H880" stroke="#E7E3D8" stroke-width=".75"/>' for y in range(20, 250, 20)]
        parts += [f'<path d="M{x} 0V250" stroke="#E7E3D8" stroke-width=".75"/>' for x in range(20, 880, 20)]
    for i, key in enumerate(['dot', 'brick', 'zip', 'loop']):
        fill = t[key] if t else BRAND[key]
        parts.append(f'<g transform="translate({20 + i * 215},20)">{character(key, fill=fill, ink=ink, feat=on_body(fill), bg=bg, standalone=False)}</g>')
    parts.append(f'<path d="M20 200.5 C220 199 440 202 660 200 C760 199 820 201 860 200.5" fill="none" stroke="{ink}" stroke-width="2" stroke-linecap="round"/>')
    title = f'toon cast line-up{" — " + t["label"] if t else ""}'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 250" width="880" height="250" role="img" aria-label="{title}">\n'
            f'  <title>{title}</title>\n  ' + '\n  '.join(parts) + '\n</svg>\n')


def export_canvas_shapes(path):
    """Shapes and face specs for the canvas demos (examples/cast.js draws with these)."""
    import json
    meta = {'dot': dict(cx=100, cy=132, h=92), 'brick': dict(cx=100, cy=128, h=104),
            'zip': dict(cx=110, cy=108, h=66), 'loop': dict(cx=101, cy=112, h=132)}
    data = {}
    for key, c in CHARS.items():
        pts = c['shape']()
        d = dict(meta[key], body=smooth_path(pts), outline=smooth_path(wobble(pts, c['seed'])), face=c['face'],
                 brand=BRAND[key], name=c['name'])
        if key == 'zip': d['tail'] = [round(v, 1) for v in min(pts)]          # tip of the teardrop
        if key == 'loop': d['shoulders'] = [[75, 118], [127, 106]]
        data[key] = d
    path.write_text('/* Generated by brand/build.py: cast shapes for the canvas demos. Do not edit by hand. */\n'
                    'window.CastShapes = ' + json.dumps(data, separators=(',', ':')) + ';\n')

if __name__ == '__main__':
    (OUT / 'cast').mkdir(exist_ok=True); (OUT / 'logo').mkdir(exist_ok=True); (OUT / 'themed').mkdir(exist_ok=True)
    n = 0
    for key in CHARS:
        for mood in ['neutral', 'happy', 'surprised', 'focused']:
            (OUT / 'cast' / f'{key}-{mood}.svg').write_text(character(key, mood)); n += 1
    for s in (48, 32, 16): (OUT / 'logo' / f'toon-mark-{s}.svg').write_text(logo(s)); n += 1
    (OUT / 'cast-lineup.svg').write_text(lineup()); n += 1
    for th in THEMES: (OUT / 'themed' / f'cast-{th}.svg').write_text(lineup(th)); n += 1
    export_canvas_shapes(OUT.parent / 'examples' / 'cast-shapes.js')
    print(f'wrote {n} SVG files to {OUT} and examples/cast-shapes.js')
