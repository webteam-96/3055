import { useState } from 'react'
import type { Person } from '../data/profileMessages'
import { LeaderPage } from './LeaderPage'

/**
 * A person's Profile + Message rendered as stacked B5 LeaderPage sheets — the exact
 * body of the /message-details page, extracted so BOTH the live route and the bulk
 * PDF export render it identically (the two never diverge). When a person has both,
 * the Profile renders first and reports its sheet count so the Message picks up the
 * right/left frame alternation where the Profile left off (reads as one booklet).
 * Renders nothing if the person has neither a profile nor a message.
 */
export function PersonDoc({ person }: { person: Person }) {
  const [profilePages, setProfilePages] = useState(0)
  if (!(person.profile || person.message)) return null

  return (
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
          maxPages={person.profileMaxPages}
          contentTop={person.contentTop}
          bodyFontDeltaPx={person.profileBodyFontDeltaPx}
          bodyFontCqw={person.profileBodyFontCqw}
          bodyLineHeight={person.profileBodyLineHeight}
          photoVariant={person.profilePhotoVariant}
        />
      )}
      {person.message && (
        <LeaderPage
          kind="message"
          startIndex={person.profile ? profilePages : 0}
          name={person.name}
          designation={person.designation}
          year={person.year}
          photo={person.messagePhoto ?? person.photo}
          body={person.message}
          maxPages={person.messageMaxPages}
          contentTop={person.contentTop}
          bodyFontDeltaPx={person.messageBodyFontDeltaPx}
        />
      )}
    </>
  )
}
