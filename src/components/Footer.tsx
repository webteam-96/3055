import rlLogo from '../assets/images/rllogo.png'
import logo2 from '../assets/images/logo-2.png'
import kaizenLogo from '../assets/images/kaizenlogo.png'

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="auto-container py-8">
        <div className="flex flex-wrap justify-center items-center gap-8 pb-6 border-b border-white/10">
          <a href="/" className="block">
            <img src={rlLogo} alt="Rotary International" className="h-16 object-contain" />
          </a>
          <a href="/" className="block">
            <img src={logo2} alt="District 3170" className="h-16 object-contain" />
          </a>
          <div className="block">
            <img src={kaizenLogo} alt="Kaizen Infotech Logo" className="h-16 object-contain" />
          </div>
        </div>
      </div>
      <div className="bg-[#111] py-4 text-center text-sm text-gray-400">
        <div className="auto-container">
          <p>
            &copy; {new Date().getFullYear()} Developed and maintained by{' '}
            <a
              href="https://kaizeninfotech.com/"
              target="_blank"
              rel="noreferrer"
              className="text-[#E59E2C] hover:underline"
            >
              Kaizen Infotech Solutions Pvt. Ltd.
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
