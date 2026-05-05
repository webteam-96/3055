import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import logo1 from '../assets/images/logo1.png'
import phoenix from '../assets/images/phoenix-1.png'
import logo2 from '../assets/images/logo-2.png'

const NAV_LINKS = [
  { label: 'HOME', to: '/', internal: true },
  { label: 'CALENDAR', href: '', external: true },
  { label: 'DISTRICT WEBSITE', href: '', external: true },
  { label: 'DIGITAL DIRECTORY', to: '/directory', internal: true },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sticky, setSticky] = useState(false)

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`w-full z-50 transition-all duration-300 ${
          sticky ? 'fixed top-0 left-0 shadow-lg bg-white' : 'relative bg-white'
        }`}
      >
        <div className="auto-container py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link to="/">
                <img src={logo1} alt="District 3170" className="h-14 object-contain" />
              </Link>
              <Link to="/">
                <img src={phoenix} alt="Phoenix" className="h-10 object-contain" />
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(link =>
                link.internal ? (
                  <Link
                    key={link.label}
                    to={link.to!}
                    className="text-sm font-semibold text-[#3b251a] hover:text-[#E59E2C] transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-[#3b251a] hover:text-[#E59E2C] transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}
            </nav>

            <button
              aria-label="menu"
              className="md:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMobileOpen(v => !v)}
            >
              <span className="block w-6 h-0.5 bg-[#3b251a]" />
              <span className="block w-6 h-0.5 bg-[#3b251a]" />
              <span className="block w-6 h-0.5 bg-[#3b251a]" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <nav
          aria-label="mobile navigation"
          className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 transform translate-x-0 transition-transform duration-300"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <img src={logo2} alt="Logo" className="h-10 object-contain" />
                <img src={phoenix} alt="Phoenix" className="h-8 object-contain" />
              </div>
              <button
                aria-label="close"
                onClick={() => setMobileOpen(false)}
                className="text-2xl text-[#3b251a]"
              >
                ✕
              </button>
            </div>
            <ul className="flex flex-col gap-4">
              {NAV_LINKS.map(link =>
                link.internal ? (
                  <li key={link.label}>
                    <Link
                      to={link.to!}
                      className="block text-base font-semibold text-[#3b251a] hover:text-[#E59E2C]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ) : (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-base font-semibold text-[#3b251a] hover:text-[#E59E2C]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </nav>
      )}

      {mobileOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
