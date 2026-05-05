import { createFileRoute, Link } from '@tanstack/react-router'
import { useDistrictCommittee } from '../api/useDistrictCommittee'
import { MemberCard } from '../components/MemberCard'
import { Preloader } from '../components/Preloader'
import { CARD_BODY_COLORS, CARD_HEADER_COLORS } from '../types/api'
import { formatDateToDDMM } from '../utils/formatDate'

export const Route = createFileRoute('/executive-committee')({
  component: ExecutiveCommitteePage,
})

const GROUP_ID = '34307'
const YEAR = '2026-2027'

function ExecutiveCommitteePage() {
  const { data, isLoading, isError } = useDistrictCommittee(GROUP_ID, YEAR)

  const members = (() => {
    const seen = new Set<string>()
    return (data?.members ?? []).filter(m => {
      const key = (m.DistrictDesignation ?? '').toUpperCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  })()

  if (isLoading) return <Preloader isLoading />
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load data.</div>

  return (
    <>
      <section className="py-6 bg-[#9EDFFD]">
        <div className="auto-container">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-black">Executive Committee</h1>
            <Link to="/" className="theme-btn">Back</Link>
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="auto-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member, i) => (
              <MemberCard
                key={i}
                designation={member.DistrictDesignation || 'Member'}
                name={member.name || ''}
                club={member.ClubName || ''}
                mobile={member.MobileNumber || ''}
                email={member.MailID || ''}
                dob={formatDateToDDMM(member.DOB)}
                doa={formatDateToDDMM(member.DOA)}
                address={member.Address || ''}
                photo={member.img || ''}
                headerColor={CARD_HEADER_COLORS[i % 4]}
                bodyColor={CARD_BODY_COLORS[i % 4]}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
