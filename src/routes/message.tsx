import { createFileRoute } from '@tanstack/react-router'
import { PEOPLE } from '../data/profileMessages'
import { COMMITTEE_COLORS } from '../types/api'
import { createSlug } from '../utils/formatDate'
import { ReferenceTitlePage } from '../components/ReferencePage'

export const Route = createFileRoute('/message')({
  component: ProfileMessageListPage,
})

// One card per person. Clicking a card opens that person's profile + message.
function ProfileMessageListPage() {
  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="auto-container">
        <div className="flex justify-end items-center mb-4">
          <button onClick={() => window.history.back()} className="theme-btn">← Back</button>
        </div>

        {/* Section title / cover page — same framed background + logos as the sheets,
            with the section title enlarged and centred in the middle of the page. */}
        <ReferenceTitlePage title="PROFILE & MESSAGE" pageIndex={0} />

        {PEOPLE.length === 0 ? (
          <p className="text-center text-gray-500">No entries yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {PEOPLE.map((person, i) => (
              <a
                key={createSlug(person.name) || i}
                href={`/message-details?person=${encodeURIComponent(createSlug(person.name))}`}
                className="avenu-crd"
                style={{ backgroundColor: COMMITTEE_COLORS[i % 4], flexDirection: 'column' }}
              >
                <div className="cat-text">{person.name}</div>
                {person.designation && (
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', marginTop: '6px' }}>
                    {person.designation}
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
