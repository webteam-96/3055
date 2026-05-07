import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import logo1 from '../assets/images/logo1.png'
import phoenix from '../assets/images/phoenix-1.png'

export function Header() {
  const [sticky, setSticky] = useState(false)

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`w-full z-50 transition-all duration-300 ${
        sticky ? 'fixed top-0 left-0 shadow-lg bg-white' : 'relative bg-white'
      }`}
    >
      <div className="auto-container py-3">
        <div className="flex items-center gap-3">
          <Link to="/directory">
            <img src={logo1} alt="District 3055" className="h-14 object-contain" />
          </Link>
          <Link to="/directory">
            <img src={phoenix} alt="Phoenix" className="h-10 object-contain" />
          </Link>
        </div>
      </div>
    </header>
  )
}
