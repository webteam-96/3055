import { createFileRoute } from '@tanstack/react-router'
import { STATIC_CATEGORIES } from '../data/staticCategories'
import { COMMITTEE_COLORS } from '../types/api'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="auto-container">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#3b251a]">Rotary District 3055</h1>
          <button onClick={() => window.history.back()} className="theme-btn">← Back</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATIC_CATEGORIES.map((cat, i) => (
            <a
              key={cat.to}
              href={cat.to}
              className="avenu-crd"
              style={{ backgroundColor: COMMITTEE_COLORS[i % 4] }}
            >
              <div className="cat-text">{cat.name}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
