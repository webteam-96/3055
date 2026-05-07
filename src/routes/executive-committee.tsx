import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useDistrictCommittee } from '../api/useDistrictCommittee'
import { MemberCard } from '../components/MemberCard'
import { PdfDownloadButtons } from '../components/PdfDownloadButtons'
import { Preloader } from '../components/Preloader'
import { CARD_BODY_COLORS, CARD_HEADER_COLORS } from '../types/api'
import { formatDayMonth } from '../utils/formatDate'
import { downloadSinglePDF } from '../utils/pdf/downloadSinglePDF'

export const Route = createFileRoute('/executive-committee')({
  component: ExecutiveCommitteePage,
})

const GROUP_ID = '34307'
const YEAR = '2026-2027'

function ExecutiveCommitteePage() {
  const { data, isLoading, isError } = useDistrictCommittee(GROUP_ID, YEAR)
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null)

  if (isLoading) return <Preloader isLoading />
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load data.</div>

  const members = data?.members ?? []

  return (
    <section className="py-10">
      <div className="auto-container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#3b251a]">Executive Committee</h2>
          <div className="flex items-center gap-2">
            <PdfDownloadButtons
              members={members}
              title="Executive_Committee"
              getColors={(i) => ({ header: CARD_HEADER_COLORS[i % 4], body: CARD_BODY_COLORS[i % 4] })}
              getDesignation={(m) => m.DistrictDesignation || 'Member'}
              externalBusy={downloadingIndex !== null}
            />
            <button onClick={() => window.history.back()} className="theme-btn">← Back</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member, i) => (
            <MemberCard
              key={i}
              designation={member.DistrictDesignation || 'Member'}
              name={member.name || ''}
              club={member.ClubName || ''}
              mobile={member.MobileNumber || ''}
              email={member.MailID || ''}
              dob={formatDayMonth(member.DOB)}
              doa={formatDayMonth(member.DOA)}
              photo={member.img || ''}
              headerColor={CARD_HEADER_COLORS[i % 4]}
              bodyColor={CARD_BODY_COLORS[i % 4]}
              classification={member.classification || member.Keywords || ''}
              spouseName={member.SpouseName || ''}
              spouseDob={member.SpouseDOB || member.Spouse_DOB || ''}
              onDownloadPdf={async () => {
                setDownloadingIndex(i)
                try {
                  await downloadSinglePDF(
                    member,
                    { header: CARD_HEADER_COLORS[i % 4], body: CARD_BODY_COLORS[i % 4] },
                    member.DistrictDesignation || 'Member',
                  )
                } finally {
                  setDownloadingIndex(null)
                }
              }}
              isDownloading={downloadingIndex === i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
