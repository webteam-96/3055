import { saveAs } from 'file-saver'
import type { ReactElement } from 'react'
import { withOffscreen } from './renderOffscreen'
import {
  inlineImages,
  rasterizeBackgrounds,
  waitForImages,
  newSheetPdf,
  appendSheetsToPdf,
  addBlankPage,
  buildFontEmbedCSS,
} from './captureToPdf'
import {
  loadAdBundle,
  drawFullAdPage,
  drawPairPage,
  appendTwoUp,
  buildAdUnits,
  drawAdInBox,
  splitGapForQuarter,
  splitGapForHalf,
  bottomGapBox,
  drawPageNumber,
  GAP_AD_MIN_MM,
  type AdUnit,
} from './placeAds'
import { loadFillerQueue, drawFillerInBox, drawFullPageFiller, FILLER_MIN_MM } from './placeFillers'

export interface CombinedDoc {
  /** Section label shown in the progress overlay. */
  label: string
  /** The React element to render off-screen and capture. */
  element: ReactElement
  /**
   * Off-screen settle time (ms) before capture. Async-paginating pages (the static
   * reference sheets and the profile/message leader sheets measure their content and
   * set the sheet count over ~400-500ms) need a larger value; the directory sheets
   * are static layouts and settle quickly. Defaults to `withOffscreen`'s 150ms.
   */
  settleMs?: number
  /**
   * Force this document to begin on a right-hand (recto) page, like a book chapter
   * opener. Page 1 is a recto, so recto = odd 1-based page numbers; if the next page
   * would be a verso (left), a blank page is inserted first. Used for the committee
   * title-page separators.
   */
  startOnRight?: boolean
  /**
   * This document IS a section title page (a `ReferenceTitlePage`). Set at build time —
   * NOT inferred from `element.type`, because every doc is wrapped in `<SheetBg>` by
   * `withBg()` so the element type is always `SheetBg`. The ad overlay must never tuck an
   * ad onto a title page, so it checks this flag.
   */
  isTitlePage?: boolean
  /**
   * Never tuck an ad or filler onto this document's pages (beyond the title-page rule) —
   * e.g. the blank hand-fill Personal Profile form, whose empty ruled lines must stay
   * empty. Set at build time.
   */
  noOverlay?: boolean
  /**
   * Prefer a FILLER over an advertisement in this document's empty page bottoms — used
   * where a page has only a little leftover space, so a cramped ad looks bad but a
   * size-matched quote filler fits nicely. The ad tuck is skipped; a filler is placed if
   * the gap qualifies. Set at build time.
   */
  fillerOnly?: boolean
}

export type ProgressCallback = (label: string, current: number, total: number) => void

/**
 * Render every document off-screen — reusing the EXACT on-screen components, so the
 * output always matches the live pages and the individual "Download PDF" — and
 * rasterize their B5 sheets into ONE combined, multi-page PDF in the given order,
 * then save it. Each document is rendered and torn down on its own host (bounded
 * memory) while all pages accumulate into a single shared jsPDF.
 */
export async function downloadCombinedPdf(
  docs: CombinedDoc[],
  filename: string,
  onProgress: ProgressCallback,
  fontFamilies?: string[],
  includeAds?: boolean,
  numberPages?: boolean,
): Promise<void> {
  const pdf = newSheetPdf()
  const state = { drawn: 0 }

  // Build the minimal font embed ONCE for the whole export (see buildFontEmbedCSS):
  // every sheet reuses it instead of html-to-image re-embedding all ~10 Google
  // families per sheet — the difference between a smooth run and a stall partway.
  // Undefined (no families given, or the fetch failed) ⇒ auto-embed fallback.
  const fontEmbedCSS = fontFamilies?.length ? await buildFontEmbedCSS(fontFamilies) : undefined

  // Advertiser ads (master export only): full ads fill the blank recto-padding pages
  // instead of leaving them blank; half/quarter ads are tucked into the empty bottom of
  // content pages as they're captured; any leftover small ads + pair + back cover append.
  const ads = includeAds ? await loadAdBundle() : null
  let adIdx = 0
  // Next "half + half = full" pair to place. Once the full-ad pool is spent, a recto-padding
  // page is filled with a PAIR ad (stacked half+half) before falling back to a full-page
  // filler — so a blank padding page that needs ads gets a real ad. The first pair in the
  // manifest (RC Kalol + Khushal Khatri) therefore lands on the first such page.
  let pairIdx = 0
  // Tuck-in ads (half + quarter) ordered so the quarter ad(s) are spread AMONG the halves,
  // not clustered by type.
  const adUnits: AdUnit[] = ads ? buildAdUnits(ads.half, ads.quarter) : []
  // Spread those ad units EVENLY across the book's half-page gaps instead of filling the
  // first few — so advertisements and fillers interleave throughout (not "ads in the 1st
  // half, fillers in the 2nd"). The exact gap count isn't known up front, so ads are spaced
  // by a stride from a rough expected number of half-page gaps; any ad not placed inline is
  // appended two-up at the end. Tune EXPECTED_AD_GAPS if the real spread looks off.
  const EXPECTED_AD_GAPS = 30
  const adStride = adUnits.length ? Math.max(4, Math.round(EXPECTED_AD_GAPS / adUnits.length)) : 0
  const adTarget = (k: number) => Math.floor((k + 0.5) * adStride) // 0-based gap index for unit k
  let eligibleGaps = 0 // half-page gaps seen so far (a tucked ad could go here)
  let adsPlaced = 0

  // Fillers (Rotary quotes/graphics) fill the empty bottom of content pages that did NOT
  // get an ad — each item used once, sized to the gap. Master export only; a load failure
  // returns null and fillers are simply skipped. Reuses the minimal font embed so the
  // rendered quotes match the book's Petrona/Geist.
  const fillerQ = includeAds ? await loadFillerQueue(fontEmbedCSS) : null

  for (let i = 0; i < docs.length; i++) {
    onProgress(docs[i].label, i, docs.length)
    // Never tuck an ad onto a section TITLE page (ReferenceTitlePage) — its big centered
    // title leaves an empty bottom that would otherwise look like a free ad slot. Read the
    // build-time flag, NOT element.type: withBg() wraps every element in <SheetBg>, so the
    // type is always SheetBg and a `=== ReferenceTitlePage` check would never match.
    const isTitlePage = docs[i].isTitlePage === true
    // Book-style recto opener: if this doc must start on a right-hand page and the next
    // page would be a verso (state.drawn odd ⇒ next page even), that verso page would be
    // blank — fill it with the next full-page ad when ads are enabled, else leave it blank.
    if (docs[i].startOnRight && state.drawn % 2 === 1) {
      if (ads && adIdx < ads.blankPool.length) {
        drawFullAdPage(pdf, state, ads.blankPool[adIdx++])
      } else if (ads && pairIdx < ads.pair.length) {
        // Full-page ads are spent, but a "half + half = full" PAIR still fits this padding
        // page — draw it (stacked) rather than a filler, so a blank page that needs ads gets a
        // real ad. The first pair (RC Kalol + Khushal Khatri) fills the first such page.
        drawPairPage(pdf, state, ads.pair[pairIdx], ads.pair[pairIdx + 1])
        pairIdx += 2
      } else {
        // No full-page ad or pair left for this padding page — add the page (so the opener
        // still lands on a recto) and fill it with a full-page FILLER instead of leaving it
        // blank. The filler repeats from the library if the fresh pool is spent, so a padding
        // page is NEVER blank. Only a missing filler library (non-ads export) falls back to blank.
        addBlankPage(pdf, state)
        if (fillerQ) await drawFullPageFiller(pdf, fillerQ)
      }
    }
    await withOffscreen(
      docs[i].element,
      async (root) => {
        await inlineImages(root)
        await rasterizeBackgrounds(root)
        await waitForImages(root)
        // Report per SHEET so the progress bar keeps moving inside multi-sheet
        // documents (the club book alone is ~52 sheets). `current` carries the
        // fractional position within this document (i + done/total) so the bar
        // advances smoothly instead of jumping once per document and looking frozen.
        await appendSheetsToPdf(
          root,
          pdf,
          state,
          fontEmbedCSS,
          (done, total) => {
            const label = total > 1 ? `${docs[i].label} — sheet ${Math.min(done + 1, total)} of ${total}` : docs[i].label
            onProgress(label, i + (total ? done / total : 0), docs.length)
          },
          // Overlay this content page's empty bottom. Title pages and noOverlay docs (e.g.
          // the blank Personal Profile form) are excluded outright; title/full pages are
          // also skipped by the shared detector (bottomGapBox).
          // The overlay runs when there's anything to draw: the running page NUMBER (master
          // export — on every framed sheet, including title/profile pages) and/or a tucked
          // ad/filler (content pages only). Pages drawn OUTSIDE this loop (full-page ads,
          // two-up ad sheets, blank recto padding) never get a number but still consume a
          // page slot via state.drawn, so the printed numbers run continuously with gaps on
          // the ad pages — "count the ads, but don't write a number on them."
          !numberPages && (isTitlePage || docs[i].noOverlay || (!adUnits.length && !fillerQ))
            ? undefined
            : async (canvas) => {
                // Running page number: white, centered in the frame's navy corner disc. Uses
                // state.drawn (already incremented for THIS page) = the true 1-based PDF page
                // position, so numbering stays correct no matter how docs/ads/order change.
                if (numberPages) drawPageNumber(pdf, canvas, state.drawn)
                // The ad/filler tuck is for eligible CONTENT pages only — skip it on title /
                // noOverlay pages, or when neither ads nor fillers were loaded.
                if (isTitlePage || docs[i].noOverlay || (!adUnits.length && !fillerQ)) return
                const box = bottomGapBox(canvas)
                if (!box) return
                // Place a SCHEDULED advertisement when this is an ad-eligible (half-page)
                // gap and we've reached this ad unit's spread position — unless the doc is
                // filler-only (e.g. Ahmedabad Supreme p2). A half ad fills the whole gap; a
                // quarter ad takes the left half and a filler the right half (= half page).
                if (!docs[i].fillerOnly && box.h >= GAP_AD_MIN_MM && adsPlaced < adUnits.length) {
                  const idx = eligibleGaps++
                  if (idx >= adTarget(adsPlaced)) {
                    const unit = adUnits[adsPlaced++]
                    if (unit.kind === 'quarter') {
                      const { adBox, fillerBox } = splitGapForQuarter(box)
                      drawAdInBox(pdf, adBox, unit.ad)
                      // allowRepeat: this filler COMPANIONS the quarter ad (quarter + filler =
                      // half page), so it must appear even after the fresh quote pool is spent —
                      // otherwise the ad sits alone with an empty half beside it.
                      if (fillerQ) await drawFillerInBox(pdf, fillerBox, fillerQ, true)
                    } else {
                      // Bottom-align the half ad and fill the space ABOVE it with a filler,
                      // instead of centering the ad and leaving empty bands top & bottom.
                      const { adBox, fillerBox } = splitGapForHalf(box, unit.ad)
                      drawAdInBox(pdf, adBox, unit.ad)
                      // allowRepeat: the companion filler ABOVE the ad must never come up empty
                      // (late in the book the 100 fresh quotes are exhausted) — else the ad is
                      // left alone with blank space above it, which is the "odd alone" look.
                      if (fillerQ && fillerBox && fillerBox.h >= FILLER_MIN_MM) {
                        await drawFillerInBox(pdf, fillerBox, fillerQ, true)
                      }
                    }
                    return
                  }
                }
                // Otherwise fill the gap with a size-matched filler (its own content once).
                if (fillerQ && box.h >= FILLER_MIN_MM) await drawFillerInBox(pdf, box, fillerQ)
              },
        )
      },
      { settleMs: docs[i].settleMs },
    )
  }

  // Append the remaining ads: any full ads that didn't land on a blank page get their own
  // page, then any tuck-in ads that didn't find a half-page gap go two-up, the half+half
  // pairs stacked, and the back cover last.
  if (ads) {
    for (; adIdx < ads.blankPool.length; adIdx++) drawFullAdPage(pdf, state, ads.blankPool[adIdx])
    // Tuck-in ad UNITS that were never placed inline (book had fewer half-page gaps than
    // the spread schedule expected) — append them two-up so no ad is dropped.
    appendTwoUp(pdf, state, adUnits.slice(adsPlaced).map((u) => u.ad))
    // Pairs not already placed on a padding page (see pairIdx) — stacked two-up at the end.
    appendTwoUp(pdf, state, ads.pair.slice(pairIdx))
    // Back cover (VR Ventures / Vijaysinh Vaghela): held aside per the client's request —
    // NOT placed in the PDF. The asset stays in the manifest (ads.back) so it can be
    // re-enabled later by restoring: if (ads.back) drawFullAdPage(pdf, state, ads.back)
  }

  if (!state.drawn) throw new Error('No pages were produced for the PDF.')
  onProgress('Saving…', docs.length, docs.length)
  saveAs(pdf.output('blob'), filename)
}
