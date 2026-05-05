import { createFileRoute, Link } from '@tanstack/react-router'
import bannerImg from '../assets/images/banner/banner-main.png'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const CATEGORY_CARDS = [
  { label: 'A Glimpse of RI Dist. 3170', bgColor: '#372616', to: undefined as any },
  { label: 'DG Family & Friends', bgColor: '#2F4366', to: undefined as any },
  { label: 'Profile & Messages', bgColor: '#E59E2C', to: undefined as any },
  { label: 'Major, Endowment Donors & PHS Members', bgColor: '#E59E2C', to: undefined as any },
  { label: 'Digital Directory 2026-27', bgColor: '#372616', to: '/directory' as any },
  { label: 'Zone 7 Regional Leaders', bgColor: '#2F4366', to: undefined as any },
  { label: 'DCC', bgColor: '#2F4366', to: undefined as any },
  { label: 'Major, Endowment Donors & PHS Members', bgColor: '#E59E2C', to: undefined as any },
  { label: 'District Events', bgColor: '#372616', to: undefined as any },
]

function HomePage() {
  return (
    <>
      {/* Hero Banner */}
      <section
        className="relative py-16 min-h-[85vh] flex items-center"
        style={{
          backgroundImage: `url(${bannerImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="auto-container w-full">
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div
              className="w-full md:w-1/2 text-left p-6 rounded-xl"
              style={{
                background: 'linear-gradient(95deg, rgba(204,204,204,0.80) 0%, rgba(168,168,168,0.56) 48.56%, rgba(255,255,255,0.30) 100%)',
                boxShadow: '0px 4px 4px 0px rgba(0,0,0,0.25)',
                backdropFilter: 'blur(2.75px)',
              }}
            >
              <h4 className="text-lg font-semibold text-[#372616] mb-2">Rotary District 3170</h4>
              <h2 className="text-3xl md:text-4xl font-bold text-[#3b251a] mb-4 leading-tight">
                Find Everything You Need — All in One Place
              </h2>
              <p className="text-[#3b251a] mb-1">Together, we connect • Together, we serve • Together, we inspire</p>
              <p className="text-[#3b251a] mb-1">Welcome to the official digital directory of Rotary District 3170.</p>
              <p className="text-[#3b251a] mb-6">
                Find details of every club, members, and leadership designed with clarity and simplicity for all Rotarians.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to={'/directory' as any} className="yellow-btn">Explore Directory</Link>
                <a href="#" className="white-btn">View Upcoming Events</a>
              </div>
            </div>
            <div className="hidden md:block w-full md:w-5/12" />
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-12 bg-gray-50">
        <div className="auto-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CATEGORY_CARDS.map((card, i) =>
              card.to ? (
                <Link
                  key={i}
                  to={card.to}
                  className="avenu-crd"
                  style={{ backgroundColor: card.bgColor }}
                >
                  {card.label}
                </Link>
              ) : (
                <div
                  key={i}
                  className="avenu-crd cursor-default"
                  style={{ backgroundColor: card.bgColor }}
                >
                  {card.label}
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </>
  )
}
