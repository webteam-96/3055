import { createFileRoute } from '@tanstack/react-router'
import mapImg from '../assets/images/map.png'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <>
      {/* Page Title */}
      <section className="page-banner bg-[#9EDFFD] text-center py-8">
        <div className="auto-container">
          <h1 className="text-4xl font-medium text-black">About Us</h1>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-gray-50">
        <div className="auto-container">
          <div className="flex flex-wrap items-center gap-8">
            <div className="w-full md:w-1/2">
              <img src={mapImg} alt="District Map" className="w-full rounded-xl shadow-md" />
            </div>
            <div className="w-full md:flex-1">
              <span className="text-sm font-semibold text-[#E59E2C] uppercase tracking-wide">
                Our Introductions
              </span>
              <h2 className="text-3xl font-bold text-[#3b251a] mt-2 mb-4">
                Welcome to Digital District 3170 Directory
              </h2>
              <p className="text-[#7c6f68] leading-relaxed">
                R.I. District 3170 is part of Rotary International Zone 7, encompassing clubs across the region.
                The district is committed to promoting peace, fighting disease, providing clean water and sanitation,
                saving mothers and children, supporting education, and growing local economies.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
