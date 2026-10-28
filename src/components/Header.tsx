import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import logo1 from '../assets/images/rotary-3055.png'
import nirman from '../assets/images/theme/team-nirman.jpg'

export function Header({ centered = false }: { centered?: boolean }) {
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
        <div className={`flex items-center gap-3${centered ? ' justify-center' : ''}`}>
          <Link to="/directory">
            <img src={logo1} alt="District 3055" className="h-14 object-contain" />
          </Link>
          <Link to="/directory">
            <img src={nirman} alt="Team NIRMAN" className="h-30 object-contain" />
          </Link>
        </div>
      </div>
    </header>
  )
}
