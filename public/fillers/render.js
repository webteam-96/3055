// Dynamic filler renderer. ONE content item (from content.json) -> an SVG laid out
// to fit a given width x height gap. The layout mode is chosen from the gap's aspect
// ratio and text is auto-sized to fit, so each quote is stored once and sized to the
// leftover space on the page. Used by the preview now and by the Download-All auto-
// insert later. `logos` = { white, navy } image URLs (or base64 data URLs).

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Petrona:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&family=Geist:wght@500;600;700&display=swap');"
const SERIF = "'Petrona',Georgia,'Times New Roman',serif"
const SANS = "'Geist','Helvetica Neue',Arial,sans-serif"
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const THEME = {
  navy: { bg: 'url(#bg)', frame: '#caa24a', ink: '#eef2fb', hi: '#f3e4c4', accent: 'url(#gold)', soft: '#cdd8ee', cap: '#8fa0c6', mark: '#caa24a', qmark: '#32507f', capHi: '#e0b964' },
  cream: { bg: '#f6eee1', frame: '#c9a24a', ink: '#1d2d6c', hi: '#1d2d6c', accent: 'url(#gold)', soft: '#6b5a3c', cap: '#7a6a4e', mark: '#1d2d6c', qmark: '#e7cfa0', capHi: '#b9802a' },
}

function wrap(text, maxChars) {
  const words = String(text).split(/\s+/)
  const lines = []
  let cur = ''
  for (const w of words) {
    if (cur && (cur + ' ' + w).length > maxChars) { lines.push(cur); cur = w }
    else cur = cur ? cur + ' ' + w : w
  }
  if (cur) lines.push(cur)
  return lines
}
// largest serif font size (<=max) whose wrapped text fits availW x availH
function fitFont(text, availW, availH, max, min, cw = 0.5, lh = 1.32) {
  for (let fs = max; fs >= min; fs -= 1) {
    const maxChars = Math.max(6, Math.floor(availW / (fs * cw)))
    const lines = wrap(text, maxChars)
    const widest = Math.max(...lines.map((l) => l.length)) * fs * cw
    if (lines.length * fs * lh <= availH && widest <= availW) return { fs, lines }
  }
  return { fs: min, lines: wrap(text, Math.max(6, Math.floor(availW / (min * cw)))) }
}

const head = (w, h, theme) =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
  `<style>${FONT_IMPORT}.s{font-family:${SERIF}}.g{font-family:${SANS}}</style>` +
  `<defs><radialGradient id="bg" cx="50%" cy="34%" r="88%"><stop offset="0" stop-color="#1e3568"/><stop offset="1" stop-color="#0f1c40"/></radialGradient>` +
  `<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6cf7e"/><stop offset="1" stop-color="#d4a23f"/></linearGradient></defs>` +
  `<rect width="${w}" height="${h}" fill="${THEME[theme].bg}"/>`

const img = (href, cx, y, lw) => `<image xlink:href="${href}" x="${cx - lw / 2}" y="${y}" width="${lw}" height="${lw * 0.4}" preserveAspectRatio="xMidYMid meet"/>`
const txt = (cls, x, y, anchor, size, fill, extra, s) => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${fill}" ${extra}>${s}</text>`

export function renderFiller(item, w, h, logos) {
  const t = THEME[item.theme] || THEME.navy
  const logo = item.theme === 'cream' ? logos.navy : logos.white
  const aspect = w / h
  const mode = aspect >= 2.4 ? 'band' : aspect >= 1.15 ? 'block' : 'tall'
  const inset = Math.max(14, Math.min(w, h) * 0.045)
  const cx = w / 2
  let s = head(w, h, item.theme || 'navy')
  s += `<rect x="${inset}" y="${inset}" width="${w - 2 * inset}" height="${h - 2 * inset}" fill="none" stroke="${t.frame}" stroke-width="${Math.max(1.5, Math.min(w, h) / 300)}"/>`

  const margin = Math.max(w * 0.08, 36)
  const availW = w - 2 * margin

  // ---- MOTTO ----
  if (item.type === 'motto') {
    if (mode === 'band') {
      const lw = Math.min(h * 0.9, 240)
      s += img(logo, inset + lw * 0.65, h / 2 - lw * 0.2, lw)
      s += `<line x1="${inset + lw * 1.25}" y1="${h * 0.25}" x2="${inset + lw * 1.25}" y2="${h * 0.75}" stroke="${t.frame}" stroke-width="1.5" opacity="0.7"/>`
      const tx = (inset + lw * 1.25 + (w - inset)) / 2
      const fs = Math.min(h * 0.26, availW * 0.9 / Math.max(...item.big.map((l) => l.length)) / 0.52)
      s += txt('s', tx, h / 2 - fs * 0.12, 'middle', fs, t.hi, 'font-style="italic" font-weight="500"', esc(item.big[0]))
      s += txt('s', tx, h / 2 + fs * 0.98, 'middle', fs * 1.18, t.accent, 'font-style="italic" font-weight="700"', esc(item.big[1]))
    } else {
      const lw = Math.min(w * 0.42, 260)
      s += img(logo, cx, h * 0.14, lw)
      const fs = Math.min(w * 0.12, (availW / Math.max(...item.big.map((l) => l.length))) / 0.52)
      s += txt('s', cx, h * 0.54, 'middle', fs, t.hi, 'font-style="italic" font-weight="500"', esc(item.big[0]))
      s += txt('s', cx, h * 0.54 + fs * 1.22, 'middle', fs * 1.2, t.accent, 'font-style="italic" font-weight="700"', esc(item.big[1]))
      s += txt('g', cx, h - inset - h * 0.06, 'middle', Math.max(11, w * 0.02), t.capHi, 'font-weight="600" letter-spacing="5"', esc(item.cap || ''))
    }
    return s + '</svg>'
  }

  // ---- FOUR-WAY TEST ----
  if (item.type === 'test') {
    if (mode === 'band') {
      s += txt('s', cx, h * 0.34, 'middle', h * 0.22, t.accent, 'font-style="italic" font-weight="700"', esc(item.title))
      const items = item.lines.map((l, i) => `${i + 1} · ${l[1]}`).join('      ')
      s += txt('g', cx, h * 0.64, 'middle', Math.min(h * 0.14, availW / items.length / 0.62), '#f0c060', 'font-weight="700" letter-spacing="2"', esc(items))
      s += txt('g', cx, h * 0.88, 'middle', h * 0.1, t.cap, 'font-weight="500" letter-spacing="2"', 'of the things we think, say or do … ROTARY')
    } else {
      s += img(logo, cx, inset + h * 0.03, Math.min(w * 0.3, 170))
      s += txt('s', cx, h * 0.26, 'middle', Math.min(w * 0.075, 62), t.accent, 'font-style="italic" font-weight="700"', esc(item.title))
      s += txt('s', cx, h * 0.26 + w * 0.05, 'middle', Math.min(w * 0.03, 24), t.soft, 'font-style="italic" font-weight="500"', esc(item.subtitle))
      const x0 = Math.max(w * 0.12, 90)
      const fs = Math.min(w * 0.034, 33)
      let y = h * 0.42
      const gap = (h * 0.5) / item.lines.length
      item.lines.forEach((l, i) => {
        const r = fs * 0.82
        s += `<circle cx="${x0}" cy="${y - fs * 0.32}" r="${r}" fill="${t.accent}"/>` + txt('s', x0, y - fs * 0.02, 'middle', fs, '#12244c', 'font-weight="700"', String(i + 1))
        s += `<text class="s" x="${x0 + r + fs * 0.6}" y="${y}" font-size="${fs}" fill="${t.ink}">${esc(l[0])}<tspan fill="#f0c060" font-weight="700">${esc(l[1])}</tspan>${esc(l[2])}</text>`
        y += gap
      })
    }
    return s + '</svg>'
  }

  // ---- GRAPHIC ----
  if (item.type === 'graphic') {
    if (mode === 'band') {
      const lw = Math.min(h * 1.0, 240)
      s += img(logo, inset + lw * 0.65, h / 2 - lw * 0.2, lw)
      s += `<line x1="${inset + lw * 1.25}" y1="${h * 0.25}" x2="${inset + lw * 1.25}" y2="${h * 0.75}" stroke="${t.frame}" stroke-width="1.5" opacity="0.7"/>`
      const tx = (inset + lw * 1.25 + (w - inset)) / 2
      if (item.serifBig) {
        s += txt('s', tx, h / 2 - h * 0.02, 'middle', h * 0.14, t.hi, 'font-style="italic" font-weight="600"', esc(item.serifBig[0]))
        s += txt('s', tx, h / 2 + h * 0.15, 'middle', h * 0.14, t.accent, 'font-style="italic" font-weight="600"', esc(item.serifBig[1]))
      } else {
        if (item.caps) s += txt('g', tx, h / 2 - h * 0.02, 'middle', h * 0.09, t.ink, 'font-weight="700" letter-spacing="4"', esc(item.caps))
        if (item.serif) s += txt('s', tx, h / 2 + h * 0.14, 'middle', h * 0.09, item.theme === 'navy' ? t.accent : '#b9802a', 'font-style="italic" font-weight="600"', esc(item.serif))
      }
    } else {
      const lw = Math.min(w * 0.4, 300)
      const ly = h * 0.26
      const ry = ly + lw * 0.2
      s += `<g fill="none" stroke="${t.mark}" opacity="0.22"><circle cx="${cx}" cy="${ry}" r="${lw * 0.62}"/><circle cx="${cx}" cy="${ry}" r="${lw * 0.52}"/></g>`
      s += img(logo, cx, ly, lw)
      if (item.serifBig) {
        s += txt('s', cx, h * 0.68, 'middle', w * 0.038, t.hi, 'font-style="italic" font-weight="600"', esc(item.serifBig[0]))
        s += txt('s', cx, h * 0.68 + w * 0.045, 'middle', w * 0.038, t.accent, 'font-style="italic" font-weight="600"', esc(item.serifBig[1]))
        if (item.cap) s += txt('g', cx, h - inset - h * 0.05, 'middle', Math.max(11, w * 0.013), t.cap, 'font-weight="600" letter-spacing="5"', esc(item.cap))
      } else {
        if (item.caps) s += txt('g', cx, h * 0.72, 'middle', w * 0.026, t.ink, 'font-weight="700" letter-spacing="7"', esc(item.caps))
        if (item.serif) s += txt('s', cx, h * 0.72 + w * 0.045, 'middle', w * 0.026, item.theme === 'navy' ? t.accent : '#b9802a', 'font-style="italic" font-weight="600"', esc(item.serif))
        if (item.cap) s += txt('g', cx, h - inset - h * 0.05, 'middle', Math.max(11, w * 0.012), t.cap, 'font-weight="600" letter-spacing="3"', esc(item.cap))
      }
    }
    return s + '</svg>'
  }

  // ---- QUOTE (auto-fit) ----
  const horiz = mode === 'band'
  const logoW = horiz ? Math.min(h * 0.95, 150) : Math.min(w * 0.3, 190)
  const authorH = h * (horiz ? 0.22 : 0.16)
  if (horiz) {
    s += img(logo, inset + logoW * 0.7, h / 2 - logoW * 0.2, logoW)
    s += `<line x1="${inset + logoW * 1.35}" y1="${h * 0.22}" x2="${inset + logoW * 1.35}" y2="${h * 0.78}" stroke="${t.frame}" stroke-width="1.5" opacity="0.6"/>`
    const tLeft = inset + logoW * 1.35 + 24
    const tW = w - inset - tLeft - 16
    const tcx = tLeft + tW / 2
    const { fs, lines } = fitFont(item.text, tW, h * 0.56, Math.min(h * 0.17, 34), 13)
    const lh = fs * 1.3
    let y = h / 2 - ((lines.length - 1) * lh) / 2 + fs * 0.34 - h * 0.05
    s += `<g class="s" text-anchor="middle" font-style="italic" font-weight="500" font-size="${fs}" fill="${t.ink}">`
    lines.forEach((l) => { s += `<text x="${tcx}" y="${y}">${esc(l)}</text>`; y += lh })
    s += '</g>'
    s += txt('s', tcx, h - h * 0.14, 'middle', Math.max(13, h * 0.1), t.capHi, 'font-weight="700"', esc(item.author))
  } else {
    s += img(logo, cx, inset + h * 0.03, logoW)
    const logoBottom = inset + h * 0.03 + logoW * 0.4
    // reserve the bottom ~22% for rule + author + role; fit the quote in the band below the logo
    const authorZoneTop = h - h * 0.22
    const qmargin = Math.max(w * 0.13, 50) // wider side gutters so the quote marks sit at the sides
    const qAvailW = w - 2 * qmargin
    const textTop = logoBottom + h * 0.05
    const availH = Math.max(h * 0.2, authorZoneTop - textTop)
    const { fs, lines } = fitFont(item.text, qAvailW, availH, Math.min(w * 0.06, 46), 15)
    const lh = fs * 1.34
    const textMid = textTop + availH / 2
    let y = textMid - ((lines.length - 1) * lh) / 2 + fs * 0.34
    // Quotation marks at the SIDES (opening left, closing right) — in the gutters, well
    // below the logo, so they never overlap it. Decorative/faint.
    const qm = Math.min(w * 0.1, 80)
    s += txt('s', inset + w * 0.025, textTop + qm * 0.78, 'start', qm, t.qmark, 'font-weight="700" opacity="0.45"', '“')
    s += txt('s', w - inset - w * 0.025, authorZoneTop - h * 0.01, 'end', qm, t.qmark, 'font-weight="700" opacity="0.45"', '”')
    s += `<g class="s" text-anchor="middle" font-style="italic" font-weight="500" font-size="${fs}" fill="${t.ink}">`
    lines.forEach((l) => { s += `<text x="${cx}" y="${y}">${esc(l)}</text>`; y += lh })
    s += '</g>'
    const ruleY = authorZoneTop + h * 0.04
    s += `<g stroke="${t.accent}" stroke-width="2" fill="none"><line x1="${cx - 90}" y1="${ruleY}" x2="${cx - 20}" y2="${ruleY}"/><line x1="${cx + 20}" y1="${ruleY}" x2="${cx + 90}" y2="${ruleY}"/></g><circle cx="${cx}" cy="${ruleY}" r="4" fill="${t.accent}"/>`
    s += txt('s', cx, ruleY + h * 0.07, 'middle', Math.min(w * 0.034, 30), t.capHi, 'font-weight="700"', esc(item.author))
    if (item.role) s += txt('g', cx, ruleY + h * 0.11, 'middle', Math.max(10, w * 0.013), t.cap, 'font-weight="600" letter-spacing="2"', esc(item.role.toUpperCase()))
  }
  return s + '</svg>'
}
