import { createFileRoute } from '@tanstack/react-router'
import { PEOPLE, type Person } from '../data/profileMessages'
import { createSlug } from '../utils/formatDate'
import dummyImg from '../assets/images/dummy.jpg'

export const Route = createFileRoute('/message-details')({
  validateSearch: (search: Record<string, unknown>) => ({
    person: (search.person as string) ?? '',
  }),
  component: MessageDetailsPage,
})

// Profile/message block: photo on the left, name + designation below, content below.
function EntryBlock({ person, content }: { person: Person; content: string }) {
  return (
    <div className="executive-card" style={{ backgroundColor: '#fff', padding: '20px', marginBottom: '20px' }}>
      <img
        src={person.photo || dummyImg}
        alt={person.name}
        onError={(e) => { (e.target as HTMLImageElement).src = dummyImg }}
        style={{ width: '120px', height: '140px', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
      />
      <div style={{ marginTop: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '18px', color: '#3b251a' }}>{person.name}</div>
        <div style={{ color: '#7c6f68', fontSize: '14px' }}>{person.designation}</div>
      </div>
      <div style={{ marginTop: '12px', whiteSpace: 'pre-line', lineHeight: 1.7, color: '#3b251a' }}>
        {content}
      </div>
    </div>
  )
}

function MessageDetailsPage() {
  const { person: personParam } = Route.useSearch()
  const person = PEOPLE.find((p) => createSlug(p.name) === personParam)

  return (
    <section className="py-10">
      <div className="auto-container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#3b251a]">{person?.name ?? 'Profile & Message'}</h2>
          <button onClick={() => window.history.back()} className="theme-btn">← Back</button>
        </div>

        {!person ? (
          <p className="text-center text-gray-500">Person not found.</p>
        ) : (
          <div className="max-w-3xl mx-auto">
            {person.profile && (
              <>
                <h3 className="text-xl font-semibold text-[#2F4366] mt-2 mb-3">Profile</h3>
                <EntryBlock person={person} content={person.profile} />
              </>
            )}
            {person.message && (
              <>
                <h3 className="text-xl font-semibold text-[#2F4366] mt-6 mb-3">Message</h3>
                <EntryBlock person={person} content={person.message} />
              </>
            )}
            {!person.profile && !person.message && (
              <p className="text-center text-gray-500">No content yet.</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
