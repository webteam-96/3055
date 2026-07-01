// Resolve once web fonts (Petrona) are ready so the capture renders text with
// the correct typeface rather than a fallback. Never rejects.
export async function waitForFonts(): Promise<void> {
  try {
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    if (fonts?.ready) await fonts.ready
  } catch {
    /* ignore */
  }
}
