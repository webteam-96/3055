import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { SheetBg } from '../components/SheetBg'
import { sheetBgForRoute } from '../data/sectionColors'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  // Give every framed print sheet on the current route its section's background tint.
  // Covers the live page and window.print (the static pages' Download PDF). The
  // off-screen "Download PDF" / "Download All" paths re-provide it themselves, since
  // they render in a fresh React root outside this provider.
  const location = useRouterState({ select: (s) => s.location })
  const sheetBg = sheetBgForRoute(location.pathname, location.search as Record<string, unknown>)

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Club details is the club QR code's landing page — logos centred there. */}
      <Header centered={location.pathname === '/club-details'} />
      <main className="flex-1">
        <SheetBg color={sheetBg}>
          <Outlet />
        </SheetBg>
      </main>
      <Footer />
    </div>
  )
}
