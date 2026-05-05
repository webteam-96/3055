import { createFileRoute } from '@tanstack/react-router'
import { useDistrictCommittee } from '../api/useDistrictCommittee'
import { MemberCard } from '../components/MemberCard'
import { Preloader } from '../components/Preloader'
import { CARD_BODY_COLORS, CARD_HEADER_COLORS, COMMITTEE_COLORS } from '../types/api'
import { formatDateToDDMM } from '../utils/formatDate'
import bannerBg from '../assets/images/banner/bg-image.png'
import unionImg from '../assets/images/Union.png'

export const Route = createFileRoute('/directory')({
  component: DirectoryPage,
})

const GROUP_ID = '34307'
const YEAR = '2026-2027'

function DirectoryPage() {
  const { data, isLoading, isError } = useDistrictCommittee(GROUP_ID, YEAR)

  if (isLoading) return <Preloader isLoading />
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load data.</div>

  return (
    <>
      {/* Hero Banner */}
      <section
        className="relative py-16"
        style={{
          backgroundImage: `url(${bannerBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="auto-container">
          <div className="flex flex-wrap items-center gap-8">
            <div className="w-full md:w-1/2 text-white">
              <h4 className="text-lg font-semibold mb-2">Rotary District 3170</h4>
              <h2 className="text-4xl font-bold mb-4">Digital Directory 2026-2027</h2>
              <p className="mb-1">Connecting Clubs • Empowering Members • Serving Communities</p>
              <p className="mb-1">Welcome to the official digital directory of Rotary District 3170.</p>
              <p>Find details of every club, members, and leadership designed with clarity and simplicity for all Rotarians.</p>
            </div>
            <div className="hidden md:block w-full md:w-5/12 text-center">
              <img src={unionImg} alt="District" className="mx-auto max-h-64 object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Executive Committee */}
      <section className="py-12">
        <div className="auto-container">
          <div className="flex justify-center mb-8">
            <div className="club-crd w-full md:w-1/2">Executive Committee</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data?.members ?? []).map((member, i) => (
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

      {/* Committee Categories */}
      <section className="py-12 bg-gray-50">
        <div className="auto-container">
          <div className="flex justify-center mb-8">
            <a href="/bod" className="club-crd w-full md:w-1/2">
              Rotary Clubs of District 3170
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(data?.categories ?? []).map((committee, i) => (
              <a
                key={committee.Fk_DistrictCommitteeID}
                href={`/sub-committee?committeeId=${committee.Fk_DistrictCommitteeID}&name=${encodeURIComponent(committee.name)}`}
                className="avenu-crd"
                style={{ backgroundColor: COMMITTEE_COLORS[i % 4] }}
              >
                {committee.name}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
