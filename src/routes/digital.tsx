import { createFileRoute } from '@tanstack/react-router'
import { useDistrictCommittee } from '../api/useDistrictCommittee'
import { MemberCard } from '../components/MemberCard'
import { Preloader } from '../components/Preloader'
import { CARD_BODY_COLORS, CARD_HEADER_COLORS, COMMITTEE_COLORS } from '../types/api'
import { formatDateToDDMM } from '../utils/formatDate'
import bannerImg from '../assets/images/banner/banner-4.jpg'

export const Route = createFileRoute('/digital')({
  component: DigitalPage,
})

const GROUP_ID = '34307'
const YEAR = '2025-2026'

function DigitalPage() {
  const { data, isLoading, isError } = useDistrictCommittee(GROUP_ID, YEAR)

  if (isLoading) return <Preloader isLoading />
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load data.</div>

  return (
    <>
      {/* Banner */}
      <section
        className="relative py-16 min-h-[40vh] flex items-center"
        style={{
          backgroundImage: `url(${bannerImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="auto-container w-full">
          <div
            className="inline-block px-8 py-4 rounded-xl"
            style={{
              background: 'linear-gradient(95deg, rgba(204,204,204,0.80) 0%, rgba(168,168,168,0.56) 48.56%, rgba(255,255,255,0.30) 100%)',
              backdropFilter: 'blur(2.75px)',
            }}
          >
            <h1 className="text-4xl font-bold text-black">DIGITAL DIRECTORY 2025-26</h1>
          </div>
        </div>
      </section>

      {/* Executive Committee */}
      <div className="py-4 text-center bg-gray-100">
        <h2 className="text-2xl font-bold text-[#3b251a]">Executive Committee</h2>
      </div>
      <section className="py-10">
        <div className="auto-container">
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
      <section className="py-10 bg-gray-50">
        <div className="auto-container">
          <div className="flex justify-center mb-6">
            <a href="/bod" className="club-crd w-full md:w-1/2">
              Rotary Clubs of Dist 3170
            </a>
          </div>
          <div className="py-4 text-center mb-6">
            <h2 className="text-2xl font-bold text-[#3b251a]">District</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(data?.categories ?? []).map((committee, i) => (
              <a
                key={committee.Fk_DistrictCommitteeID}
                href={`/committee-details?committeeID=${committee.Fk_DistrictCommitteeID}&title=${encodeURIComponent(committee.name)}`}
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
