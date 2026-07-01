import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PEOPLE } from '../data/profileMessages'
import { createSlug } from '../utils/formatDate'
import { LeaderPage, downloadLeaderPdf } from '../components/LeaderPage'

export const Route = createFileRoute('/message-details')({
  validateSearch: (search: Record<string, unknown>) => ({
    person: (search.person as string) ?? '',
  }),
  component: MessageDetailsPage,
})

function MessageDetailsPage() {
  const { person: personParam } = Route.useSearch()
  const person = PEOPLE.find((p) => createSlug(p.name) === personParam)
  const hasContent = person && (person.profile || person.message)

  // How many sheets the Profile rendered, so the Message picks up the right/left
  // alternation where the Profile left off (the document reads as one booklet).
  const [profilePages, setProfilePages] = useState(0)

  return (
    <div
      className="lp-detail-wrap"
      style={{ background: '#e9eaee', minHeight: '100vh', padding: '18px 0 32px' }}
    >
      <div
        className="auto-container no-print"
        style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between', gap: 12 }}
      >
        <button onClick={() => window.history.back()} className="theme-btn">
          ← Back
        </button>
        {hasContent && (
          <button
            onClick={() => downloadLeaderPdf(`${person!.name} — Rotary District 3055`)}
            className="theme-btn"
          >
            ⬇ Download PDF
          </button>
        )}
      </div>

      {!person ? (
        <p className="text-center text-gray-500" style={{ padding: '40px 0' }}>
          Person not found.
        </p>
      ) : !hasContent ? (
        <p className="text-center text-gray-500" style={{ padding: '40px 0' }}>
          No content yet.
        </p>
      ) : (
        <>
          {person.profile && (
            <LeaderPage
              kind="profile"
              startIndex={0}
              onPageCount={setProfilePages}
              name={person.name}
              designation={person.designation}
              year={person.year}
              photo={person.photo}
              body={person.profile}
            />
          )}
          {person.message && (
            <LeaderPage
              kind="message"
              startIndex={person.profile ? profilePages : 0}
              name={person.name}
              designation={person.designation}
              year={person.year}
              photo={person.photo}
              body={person.message}
            />
          )}
        </>
      )}
    </div>
  )
}
