Rotary District 3055 — Directory Filler Library
===============================================

Purpose
-------
Fillers to drop into the EMPTY bottom space left when a page's real content ends
early (e.g. Rotary Club of Ahmedabad Supreme, page 2). Each filler is used only ONCE
across the whole directory — never repeated.

SINGLE DATA, SIZE ON DEMAND
---------------------------
Every quote/graphic is stored ONCE in content.json. There are NO duplicate per-size
files. render.js lays an item out to fit WHATEVER width x height the leftover space
is — wide gaps get a horizontal "band" layout, half-page gaps a "block", square gaps
a stacked layout — and auto-sizes the text to fit. (Open preview.html to see the same
quote rendered at band / block / square.)

Files
-----
  content.json   the single source of truth — all 30 items (quotes + Rotary graphics),
                 each with: id, type, theme, pool, verify, text/author/role (or motto /
                 test / graphic fields).
  render.js      renderFiller(item, w, h, {white,navy}) -> an SVG sized to the gap.
                 Used by preview now and by the Download-All auto-insert (Phase 2).
  preview.html   gallery (open in your NORMAL Chrome — many SVGs are heavy for a small
                 browser) + a "same quote, three gap sizes" demo.
  assets/        the authentic Rotary logos (masterbrand + white).
  images/SOURCES.md  vetted links for REAL licensed photos to download (not embedded).

Quote pools (30 items)
----------------------
  Rotary (official): Four-Way Test, Service Above Self, One Profits Most Who Serves
                     Best, the Rotary Vision + graphic fillers (People of Action, etc.)
  Founders/Rotarians: Paul Harris x4, Arthur Sheldon  (mark VERIFY — confirm wording)
  World leaders:     Gandhi, Tagore, Vivekananda, Mother Teresa, MLK, Mandela,
                     Schweitzer, Einstein, Churchill, Keller, Emerson, Wesley,
                     Washington, Pericles  (mark VERIFY — confirm wording/attribution)

  !! Quotes marked "verify" in content.json are widely circulated but should be
     confirmed against a primary source before print (many online Rotary/leader quotes
     are misattributed). Edit/add/remove freely in content.json.

Next step (Phase 2)
-------------------
Wire auto-insert into the Download-All: it measures each page's leftover space, calls
renderFiller() at that exact size, places it, and marks the item used so none repeats.
