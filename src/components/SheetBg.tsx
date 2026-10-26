import { createContext, useContext, type ReactNode } from 'react'
import { DEFAULT_SHEET_BG } from '../data/sectionColors'

/**
 * The background colour of a framed print sheet, provided per book SECTION.
 *
 * The border-*.svg frames now have a transparent interior, so each sheet paints its
 * own background. This context carries the colour down to the sheet components
 * ({@link ReferencePage}, {@link DirectorySheet}, {@link LeaderPage}), which apply it
 * as an inline `background` on the sheet element — inline so it is captured by
 * html-to-image (Download PDF / Download All) and printed reliably.
 *
 * Default = the original cream, so any sheet rendered without a provider is unchanged.
 * Providers are set in three places: `__root` (from the current route, for the live
 * page + window.print), `DirectoryPage`'s off-screen Download-PDF render, and the
 * PDF export builders (per document/section).
 */
export const SheetBgContext = createContext<string>(DEFAULT_SHEET_BG)

/** Read the current sheet background colour. */
export function useSheetBg(): string {
  return useContext(SheetBgContext)
}

/** Provide a sheet background colour to everything rendered inside. */
export function SheetBg({ color, children }: { color: string; children: ReactNode }) {
  return <SheetBgContext.Provider value={color}>{children}</SheetBgContext.Provider>
}
