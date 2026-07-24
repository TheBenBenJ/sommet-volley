#!/usr/bin/env python3
"""Détourage anti-aliasé + ancrage pieds — pipeline Sommet Volley (Phase 2).

Usage:
  python3 tools/cutout.py raw/volkoi assets/vladou

Entrée : PNG fond blanc (raw/<key>/*.png)
Sortie : PNG détourés + _contact.png (planche de contrôle)
"""
from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:
    print("Installe Pillow : pip install Pillow", file=sys.stderr)
    sys.exit(1)

WHITE_THR = 245          # au-dessus = candidat fond (mode blanc, legacy)
ALPHA_RAMP = 18          # largeur de rampe anti-alias (px distance)
FOOT_ALIGN = True
STAND_H = 512            # hauteur normalisée debout
MARGIN = 0.04

# ---------- Chroma key MAGENTA (#FF00FF) ----------
# Standard de génération : fond magenta uni → le blanc/clair des vêtements et
# drapeaux n'est JAMAIS confondu avec le fond (fini le blanc-sur-blanc). Le
# magenta (r ET b hauts, g bas) n'existe sur aucun perso/prop ; le violet du
# Sultan (r≈106) passe SOUS le seuil r≥150 → épargné. Auto-détecté : si le fond
# n'est pas magenta, on retombe sur le keying blanc historique.
def is_chroma_bg(im: Image.Image) -> bool:
    rgba = im.convert("RGBA"); w, h = rgba.size; px = rgba.load()
    def ism(x, y):
        r, g, b, a = px[x, y]
        return a > 10 and r > 170 and b > 170 and g < 110
    corners = [(1, 1), (w - 2, 1), (1, h - 2), (w - 2, h - 2)]
    return sum(ism(x, y) for x, y in corners) >= 3

def chroma_key_magenta(im: Image.Image) -> Image.Image:
    """Rend transparent le fond magenta + despill du liseré (anti-aliasé).
    Ne touche PAS aux couleurs non-magenta (peau, rouge, bleu, violet, olive…)."""
    rgba = im.convert("RGBA"); w, h = rgba.size; px = rgba.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            mag = min(r, b) - g            # dominance magenta (r&b hauts, g bas)
            if r >= 170 and b >= 170 and g <= 110:       # fond magenta franc
                px[x, y] = (r, g, b, 0)
            elif r >= 140 and b >= 140 and mag > 25:      # frange : despill + alpha
                na = int(a * (1.0 - min(1.0, (mag - 25) / 55.0)))
                g2 = min(min(r, b), g + (min(r, b) - g) // 2)  # remonte le vert → tue le magenta
                px[x, y] = (r, g2, b, max(0, min(a, na)))
    return rgba


def flood_bg_mask(im: Image.Image, soft: bool = True) -> Image.Image:
    """Masque du fond : flood fill depuis les bords (protège blancs internes).

    soft=False → masque binaire (drapeaux/props : moins de liseré blanc).
    """
    rgba = im.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    # seed : pixels quasi-blancs sur le bord
    from collections import deque
    seen = [[False] * w for _ in range(h)]
    q = deque()

    def is_white(x, y):
        r, g, b, a = px[x, y]
        return a > 10 and r >= WHITE_THR and g >= WHITE_THR and b >= WHITE_THR

    for x in range(w):
        for y in (0, h - 1):
            if is_white(x, y) and not seen[y][x]:
                seen[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_white(x, y) and not seen[y][x]:
                seen[y][x] = True
                q.append((x, y))

    while q:
        x, y = q.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and is_white(nx, ny):
                seen[ny][nx] = True
                q.append((nx, ny))

    mask = Image.new("L", (w, h), 0)
    mp = mask.load()
    for y in range(h):
        for x in range(w):
            if seen[y][x]:
                mp[x, y] = 255
    if soft:
        return mask.filter(ImageFilter.GaussianBlur(radius=ALPHA_RAMP / 3))
    return mask


def remove_orphan_blobs(im: Image.Image, min_keep: int = 80) -> Image.Image:
    """Supprime les îlots opaques minuscules (poussière / croix résiduelles)."""
    from collections import deque
    out = im.convert("RGBA")
    w, h = out.size
    px = out.load()
    seen = [[False] * w for _ in range(h)]
    components = []
    for y in range(h):
        for x in range(w):
            if seen[y][x] or px[x, y][3] < 40:
                continue
            q = deque([(x, y)])
            seen[y][x] = True
            cells = []
            while q:
                cx, cy = q.popleft()
                cells.append((cx, cy))
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and px[nx, ny][3] >= 40:
                        seen[ny][nx] = True
                        q.append((nx, ny))
            components.append(cells)
    if not components:
        return out
    components.sort(key=len, reverse=True)
    main = len(components[0])
    for cells in components[1:]:
        if len(cells) < min_keep or len(cells) < main * 0.02:
            for x, y in cells:
                r, g, b, _ = px[x, y]
                px[x, y] = (r, g, b, 0)
    return out


def punch_enclosed_white(
    im: Image.Image,
    thr: int = 250,
    min_size: int = 300,
    max_size: int = 11000,
) -> Image.Image:
    """Percer les îlots de blanc ENFERMÉS hors torse (bras/jambes), pas la chemise.

    La chemise / kurta blanche est aussi un îlot enfermé : on ne perce que les
    composantes dans les zones de trou (dos/bras arrière, entre-jambes), avec
    un plafond de taille pour ne pas manger un pantalon / plastron blanc.
    """
    from collections import deque
    out = im.convert("RGBA")
    w, h = out.size
    px = out.load()

    # bbox du personnage (non-blanc)
    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8:
                continue
            if r < thr - 5 or g < thr - 5 or b < thr - 5:
                xs.append(x)
                ys.append(y)
    if not xs:
        return out
    left, right, top, bot = min(xs), max(xs), min(ys), max(ys)
    bw, bh = max(1, right - left), max(1, bot - top)

    seen = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if seen[y][x] or a < 8 or not (r >= thr and g >= thr and b >= thr):
                continue
            q = deque([(x, y)])
            seen[y][x] = True
            cells = []
            touch_border = False
            while q:
                cx, cy = q.popleft()
                cells.append((cx, cy))
                if cx == 0 or cy == 0 or cx == w - 1 or cy == h - 1:
                    touch_border = True
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx]:
                        rr, gg, bb, aa = px[nx, ny]
                        if aa >= 8 and rr >= thr and gg >= thr and bb >= thr:
                            seen[ny][nx] = True
                            q.append((nx, ny))
            n = len(cells)
            if touch_border or n < min_size or n > max_size:
                continue
            xs_c = [p[0] for p in cells]
            ys_c = [p[1] for p in cells]
            cx = sum(xs_c) // n
            cy = sum(ys_c) // n
            iw = max(xs_c) - min(xs_c) + 1
            ih = max(ys_c) - min(ys_c) + 1
            rel_x = (cx - left) / bw
            rel_y = (cy - top) / bh
            # entre jambes uniquement (les « trous bras » mangent les manches
            # blanches type kurta — le flood fill suffit pour les aisselles ouvertes)
            between_legs = (
                0.38 < rel_x < 0.62
                and 0.65 < rel_y < 0.92
                and iw < bw * 0.42
                and ih > iw * 0.45
            )
            # Crook bras/torse fermé (ex. défaite à genoux) : gros îlot blanc
            # latéral enfermé — distinct des manchettes (<< 800 px).
            arm_gap = (
                not between_legs
                and 800 <= n <= 4500
                and iw < bw * 0.40
                and ih < bh * 0.40
                and 0.30 < rel_y < 0.78
                and (rel_x < 0.42 or rel_x > 0.58)
            )
            if not between_legs and not arm_gap:
                continue
            for px_, py_ in cells:
                r, g, b, _ = px[px_, py_]
                px[px_, py_] = (r, g, b, 0)
    return out


def punch_enclosed_white_prop(
    im: Image.Image,
    thr: int = 248,
    min_size: int = 40,
    max_size: int = 250000,
) -> Image.Image:
    """Percer TOUS les îlots de blanc enfermés (drapeaux, props).

    Contrairement au mode perso, on ne protège pas les tissus blancs :
    un drapeau / une bannière n'a pas de chemise à préserver.
    """
    from collections import deque
    out = im.convert("RGBA")
    w, h = out.size
    px = out.load()
    seen = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if seen[y][x] or a < 8 or not (r >= thr and g >= thr and b >= thr):
                continue
            q = deque([(x, y)])
            seen[y][x] = True
            cells = []
            touch_border = False
            while q:
                cx, cy = q.popleft()
                cells.append((cx, cy))
                if cx == 0 or cy == 0 or cx == w - 1 or cy == h - 1:
                    touch_border = True
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx]:
                        rr, gg, bb, aa = px[nx, ny]
                        if aa >= 8 and rr >= thr and gg >= thr and bb >= thr:
                            seen[ny][nx] = True
                            q.append((nx, ny))
            n = len(cells)
            if touch_border or n < min_size or n > max_size:
                continue
            for px_, py_ in cells:
                r, g, b, _ = px[px_, py_]
                px[px_, py_] = (r, g, b, 0)
    return out


def apply_cutout(im: Image.Image, prop: bool = False) -> Image.Image:
    rgba = im.convert("RGBA")
    # Fond magenta → chroma key (aucune machinerie blanc : rien à manger).
    if is_chroma_bg(rgba):
        out = chroma_key_magenta(rgba)
        if prop:
            out = remove_orphan_blobs(out, min_keep=60)
        else:
            out = remove_foot_shadow(out)
        return out
    rgba = punch_enclosed_white_prop(rgba) if prop else punch_enclosed_white(rgba)
    bg = flood_bg_mask(rgba, soft=not prop)
    out = rgba.copy()
    op, bp = out.load(), bg.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = op[x, y]
            # bg=255 → transparent ; bg=0 → opaque
            fade = bp[x, y] / 255.0
            na = int(a * (1.0 - fade))
            op[x, y] = (r, g, b, na)
    out = despill_white_fringe(out, protect_white_fabric=not prop)
    if prop:
        out = choke_light_silhouette(out)
        out = remove_orphan_blobs(out, min_keep=60)
    else:
        # perso : choke prudent (kurta / chemise / cheveux blancs)
        out = choke_light_silhouette(out, protect_white_fabric=True)
        out = remove_foot_shadow(out)
    return out


def process_prop(src: Path, dst: Path, target_h: int = 720, preserve_white: bool = False):
    """Détourage prop (drapeau…) : pas d'ancrage pieds.

    preserve_white=True pour drapeaux / bannières : on ne perce PAS les
    îlots blancs enfermés (sinon les bandes blanches deviennent transparentes).
    Le despill / choke tourne TOUJOURS (sinon halo blanc sur mât / contour).
    """
    im = Image.open(src).convert("RGBA")
    chroma = is_chroma_bg(im)
    if chroma:
        # Fond magenta : chroma key propre (le blanc des drapeaux est préservé
        # nativement → plus besoin de preserve_white / FLAG_KEEP_WHITE_MAPS).
        cut = apply_cutout(im, prop=True)
    elif preserve_white:
        bg = flood_bg_mask(im, soft=False)
        cut = im.copy()
        op, bp = cut.load(), bg.load()
        w, h = cut.size
        for y in range(h):
            for x in range(w):
                r, g, b, a = op[x, y]
                fade = bp[x, y] / 255.0
                op[x, y] = (r, g, b, int(a * (1.0 - fade)))
        # poussière blanche (pas la bande FR) : îlots minuscules seulement
        cut = punch_enclosed_white_prop(cut, thr=248, min_size=2, max_size=80)
        cut = despill_white_fringe(cut, protect_white_fabric=True)
        cut = choke_light_silhouette(cut, protect_white_fabric=True)
        cut = remove_orphan_blobs(cut, min_keep=60)
    else:
        cut = apply_cutout(im, prop=True)
    # crop contenu + scale hauteur
    bb = content_bbox(cut)
    cropped = cut.crop(bb)
    mw = max(4, int(cropped.width * 0.03))
    mh = max(4, int(cropped.height * 0.03))
    padded = Image.new(
        "RGBA",
        (cropped.width + 2 * mw, cropped.height + 2 * mh),
        (0, 0, 0, 0),
    )
    padded.paste(cropped, (mw, mh), cropped)
    scale = target_h / padded.height
    nw, nh = max(1, int(padded.width * scale)), target_h
    norm = padded.resize((nw, nh), Image.Resampling.LANCZOS)
    # LANCZOS recrée un liseré — second passage obligatoire
    if chroma:
        norm = chroma_key_magenta(norm)   # pas de despill blanc (mangerait le blanc du drapeau)
    else:
        norm = despill_white_fringe(norm, protect_white_fabric=preserve_white)
        norm = choke_light_silhouette(norm, protect_white_fabric=preserve_white)
    norm = remove_orphan_blobs(norm, min_keep=40)
    dst.parent.mkdir(parents=True, exist_ok=True)
    norm.save(dst)
    tag = "chroma" if chroma else ("blancs gardés" if preserve_white else "prop")
    print(f"  {src.name} → {dst} ({tag})")

def _has_transparent_neighbor(px, x, y, w, h, a_thr: int = 40) -> bool:
    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
        if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] < a_thr:
            return True
    return False


def _white_neighbor_count(px, x, y, w, h, rad: int = 2) -> int:
    """Combien de voisins quasi-blancs opaques (distingue frange fine vs tissu)."""
    n = 0
    for dy in range(-rad, rad + 1):
        for dx in range(-rad, rad + 1):
            if dx == 0 and dy == 0:
                continue
            nx, ny = x + dx, y + dy
            if not (0 <= nx < w and 0 <= ny < h):
                continue
            r, g, b, a = px[nx, ny]
            if a >= 180 and r >= 235 and g >= 235 and b >= 235:
                n += 1
    return n


def despill_white_fringe(im: Image.Image, protect_white_fabric: bool = False) -> Image.Image:
    """Supprime le halo blanc (matte) sans manger chemise / kurta / barbe.

    Les crânes chauves (Volkoï) et peaux pâles génèrent souvent un liseré
    quasi-blanc opaque au bord du silhouette : on le choke même sans voisin
    sombre, tant que ce n'est pas un gros massif de tissu blanc.
    """
    out = im.convert("RGBA")
    px = out.load()
    w, h = out.size

    def has_dark_neighbor(x, y):
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if not (0 <= nx < w and 0 <= ny < h):
                continue
            r, g, b, a = px[nx, ny]
            if a >= 180 and (r + g + b) / 3.0 < 90:
                return True
        return False

    def has_skin_neighbor(x, y):
        """Voisin peau (rose/beige) — le halo blanc collé au crâne/nez."""
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if not (0 <= nx < w and 0 <= ny < h):
                continue
            r, g, b, a = px[nx, ny]
            if a < 180:
                continue
            lum = (r + g + b) / 3.0
            if lum < 140 or lum > 235:
                continue
            # peau : R ≥ G ≥ B, saturation faible-moyenne
            if r >= g >= b - 8 and (r - b) >= 12 and (r - b) <= 90:
                return True
        return False

    # 1) bords semi-transparents quasi-blancs
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8 or a >= 250:
                continue
            if r >= 225 and g >= 225 and b >= 225:
                whiteness = (r + g + b) / (3 * 255.0)
                soft = a / 255.0
                if whiteness > 0.90 and soft < 0.90:
                    px[x, y] = (r, g, b, int(a * 0.12))
                elif whiteness > 0.85:
                    f = 0.45
                    px[x, y] = (int(r * f), int(g * f), int(b * f), a)

    # 2) choke : blanc/gris clair opaque entre le perso et le vide
    #    (= vrai halo). On évite le bord d'un tissu blanc massif.
    for _ in range(3):
        doomed = []
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a < 140:
                    continue
                lum = (r + g + b) / 3.0
                sat = max(r, g, b) - min(r, g, b)
                if lum < 195 or sat > 35:
                    continue
                if not _has_transparent_neighbor(px, x, y, w, h, 50):
                    continue
                # tissu blanc : beaucoup de voisins blancs → on garde
                white_keep = 4 if protect_white_fabric else 10
                if _white_neighbor_count(px, x, y, w, h, 2) >= white_keep:
                    continue
                # halo typique : collé à un contour sombre, à de la peau,
                # ou quasi-blanc pur en bordure (crâne chauve / nez)
                if (
                    has_dark_neighbor(x, y)
                    or has_skin_neighbor(x, y)
                    or (lum >= 242 and not protect_white_fabric)
                ):
                    doomed.append((x, y))
        for x, y in doomed:
            r, g, b, _ = px[x, y]
            px[x, y] = (r, g, b, 0)

    # 2b) matte ultra-blanc hors-contour (1–2 px) : crânes chauves / nez.
    #     Le specular intérieur a des voisins non-transparents → on ne le touche pas.
    #     Drapeaux (protect) : exige un voisin trait-noir, sinon on mange la bande blanche.
    for _ in range(2):
        doomed = []
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a < 80:
                    continue
                lum = (r + g + b) / 3.0
                sat = max(r, g, b) - min(r, g, b)
                if lum < 228 or sat > 28:
                    continue
                if not _has_transparent_neighbor(px, x, y, w, h, 60):
                    continue
                # gros îlot blanc (chemise / bande FR) : garder
                white_keep = 3 if protect_white_fabric else 8
                if _white_neighbor_count(px, x, y, w, h, 2) >= white_keep:
                    continue
                if protect_white_fabric and not has_dark_neighbor(x, y):
                    continue
                doomed.append((x, y))
        for x, y in doomed:
            r, g, b, _ = px[x, y]
            px[x, y] = (r, g, b, 0)

    # 3) assombrit les franges grises claires restantes en bordure
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 30 or a >= 250:
                continue
            if not _has_transparent_neighbor(px, x, y, w, h, 40):
                continue
            if protect_white_fabric and _white_neighbor_count(px, x, y, w, h, 2) >= 3:
                continue
            lum = (r + g + b) / 3.0
            if lum > 190 and abs(r - g) < 22 and abs(g - b) < 22:
                px[x, y] = (r, g, b, int(a * 0.15))
    return out


def remove_foot_shadow(im: Image.Image) -> Image.Image:
    """Enlève l'ombre douce sous les pieds (souvent un halo gris/blanc)."""
    out = im.convert("RGBA")
    w, h = out.size
    px = out.load()
    y0 = int(h * 0.85)
    for y in range(y0, h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8:
                continue
            # chaussure / pantalon sombre opaque — ne jamais toucher
            lum = (r + g + b) / 3.0
            if a >= 240 and lum < 90:
                continue
            sat = max(r, g, b) - min(r, g, b)
            # ombre / filaments blancs sous les pieds
            if sat <= 28 and lum >= 90 and a < 250:
                if a < 220 or _has_transparent_neighbor(px, x, y, w, h, 60):
                    px[x, y] = (r, g, b, 0)
    return out


def choke_light_silhouette(im: Image.Image, protect_white_fabric: bool = False) -> Image.Image:
    """1–2 px de matte clair hors-contour (visible sur fond sombre).

    Sur crâne chauve : le matte est souvent pêche/gris clair (pas blanc pur),
    collé entre le vide et le trait noir — on le retire même s'il a un peu
    de saturation peau.

    protect_white_fabric=True (drapeaux tricolores…) : ne pas mâcher les
    bandes blanches — on ne retire que le liseré hors-trait-noir.
    """
    out = im.convert("RGBA")
    px = out.load()
    w, h = out.size

    def has_dark_outline_neighbor(x, y):
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1),
                       (x - 1, y - 1), (x + 1, y - 1), (x - 1, y + 1), (x + 1, y + 1)):
            if not (0 <= nx < w and 0 <= ny < h):
                continue
            r, g, b, a = px[nx, ny]
            if a >= 200 and (r + g + b) / 3.0 < 55:
                return True
        return False

    for _ in range(2):
        doomed = []
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a < 30:
                    continue
                if not _has_transparent_neighbor(px, x, y, w, h, 40):
                    continue
                lum = (r + g + b) / 3.0
                sat = max(r, g, b) - min(r, g, b)
                # trait noir : garder
                if lum < 55:
                    continue
                # tissu blanc (bande FR, emblème…) : garder
                if protect_white_fabric and _white_neighbor_count(px, x, y, w, h, 2) >= 4:
                    continue
                if protect_white_fabric:
                    # drapeau : seulement le matte hors-contour (collé au trait)
                    if lum >= 200 and sat <= 35 and has_dark_outline_neighbor(x, y):
                        doomed.append((x, y))
                    elif a < 160 and lum >= 180 and sat <= 40:
                        doomed.append((x, y))
                    continue
                # matte blanc/gris
                if lum >= 150 and sat <= 45:
                    doomed.append((x, y))
                    continue
                # matte pêche/peau hors-contour : clair + collé au trait noir
                if lum >= 130 and has_dark_outline_neighbor(x, y):
                    doomed.append((x, y))
                    continue
                # AA semi-transparent clair
                if a < 200 and lum >= 110 and sat <= 50:
                    doomed.append((x, y))
        for x, y in doomed:
            r, g, b, _ = px[x, y]
            px[x, y] = (r, g, b, 0)
    return out


def content_bbox(im: Image.Image, alpha_min=8):
    a = im.split()[-1]
    return a.getbbox() if a.getbbox() else (0, 0, im.width, im.height)


def foot_y(im: Image.Image, alpha_min=20) -> int:
    """Ligne de sol = dernière rangée avec assez d'alpha."""
    a = im.split()[-1]
    px = a.load()
    w, h = im.size
    for y in range(h - 1, -1, -1):
        for x in range(w):
            if px[x, y] >= alpha_min:
                return y
    return h - 1


def normalize(im: Image.Image, target_h=STAND_H) -> Image.Image:
    bb = content_bbox(im)
    cropped = im.crop(bb)
    # marge
    mw = int(cropped.width * MARGIN)
    mh = int(cropped.height * MARGIN)
    padded = Image.new("RGBA", (cropped.width + 2 * mw, cropped.height + 2 * mh), (0, 0, 0, 0))
    padded.paste(cropped, (mw, mh), cropped)
    # scale to target_h
    scale = target_h / padded.height
    nw, nh = max(1, int(padded.width * scale)), target_h
    return padded.resize((nw, nh), Image.Resampling.LANCZOS)


def anchor_feet(im: Image.Image, canvas_h=STAND_H + 24) -> Image.Image:
    fy = foot_y(im)
    # place foot line at canvas_h - 4
    out = Image.new("RGBA", (im.width, canvas_h), (0, 0, 0, 0))
    dy = (canvas_h - 4) - fy
    out.paste(im, (0, dy), im)
    return out


def process_one(src: Path, dst: Path):
    im = Image.open(src)
    chroma = is_chroma_bg(im.convert("RGBA"))
    cut = apply_cutout(im)
    norm = normalize(cut)
    if FOOT_ALIGN:
        norm = anchor_feet(norm)
    if chroma:
        # le resize LANCZOS peut recréer un liseré magenta — re-despill magenta
        # (surtout PAS le despill blanc, qui mangerait vêtements/cheveux clairs)
        norm = chroma_key_magenta(norm)
    else:
        # protéger tissus/cheveux blancs (Gourou, chemise, etc.)
        norm = despill_white_fringe(norm, protect_white_fabric=True)
        norm = choke_light_silhouette(norm, protect_white_fabric=True)
    norm = remove_foot_shadow(norm)
    dst.parent.mkdir(parents=True, exist_ok=True)
    norm.save(dst)
    print(f"  {src.name} → {dst}{' [chroma]' if chroma else ''}")


def contact_sheet(paths, out: Path, cols=6):
    imgs = [Image.open(p) for p in paths if p.exists()]
    if not imgs:
        return
    tw, th = imgs[0].size
    rows = (len(imgs) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * tw, rows * th), (40, 40, 48, 255))
    for i, im in enumerate(imgs):
        x, y = (i % cols) * tw, (i // cols) * th
        sheet.paste(im, (x, y), im)
    sheet.save(out)
    print(f"  planche → {out}")


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    raw_dir, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    # Props maps : flag / warn / flower… — le reste passe en perso
    PROP_NAMES = {
        "flag", "warn", "flower", "palm", "net_post", "cart_0", "cart_1",
        "cannon", "cannon_fire", "snowman", "radar_0", "radar_1", "pigeon",
        "lantern", "carpet", "cow", "macaw", "whistle", "marchers_0", "marchers_1",
        "falcon", "peacock",
    }
    # Drapeaux avec bandes blanches (FR / US / RU…) : ne pas percer les îlots.
    # Les autres (matin, bebe, ashram…) : percer le blanc entre mât et toile.
    FLAG_KEEP_WHITE_MAPS = {"dorf", "country-club-dore", "cygne", "palais-du-coq", "volkoi", "place-ecarlate", "pont-des-deux-mondes"}
    outs = []
    for src in sorted(raw_dir.glob("*.png")):
        if src.name.startswith("_"):
            continue
        dst = out_dir / src.name
        stem = src.stem
        if stem in PROP_NAMES or src.name in {n + ".png" for n in PROP_NAMES}:
            keep_w = stem == "flag" and raw_dir.name in FLAG_KEEP_WHITE_MAPS
            process_prop(src, dst, preserve_white=keep_w)
        else:
            process_one(src, dst)
        outs.append(dst)
    contact_sheet(outs, out_dir / "_contact.png")


if __name__ == "__main__":
    main()
