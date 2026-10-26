import { createFileRoute } from '@tanstack/react-router'
import { useDistrictCommittee } from '../api/useDistrictCommittee'
import { DownloadAllPdfButton } from '../components/DownloadAllPdfButton'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const GROUP_ID = '34307'
const YEAR = '2026-2027'

function HomePage() {
  // Dynamic data for the directory card. The page renders immediately — the
  // count fills in once the API responds, so there's no blank-screen wait.
  const { data } = useDistrictCommittee(GROUP_ID, YEAR)
  const committeeCount = data?.categories?.length ?? 0

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="auto-container">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#3b251a]">
            Rotary International District 3055
          </h1>
          <p className="text-lg text-[#2F4366] font-semibold mt-1">Directory 2026–27</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Static card — opens the listing of static categories */}
          <a href="/about" className="avenu-crd" style={{ backgroundColor: '#372616', flexDirection: 'column' }}>
            <div className="cat-text">Rotary District 3055</div>
            <div style={{ color: '#e7d9c8', fontSize: '14px', marginTop: '8px' }}>
              Team Nirman · Impactful Service, Building Futures
            </div>
          </a>

          {/* Dynamic card — opens the full directory listing */}
          <a href="/directory" className="avenu-crd" style={{ backgroundColor: '#2F4366', flexDirection: 'column' }}>
            <div className="cat-text">Digital Directory</div>
            <div style={{ color: '#cdd8ea', fontSize: '14px', marginTop: '8px' }}>
              {committeeCount > 0 ? `Browse ${committeeCount} committees` : 'Browse the full directory'}
            </div>
          </a>
        </div>

        {/* Master export — the whole book (static pages + full directory) as one PDF. */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <DownloadAllPdfButton scope="master" />
          <p className="text-sm text-gray-500 text-center">
            Download the entire directory — the static pages and the full committee &amp; club directory — as one PDF.
          </p>
        </div>
      </div>
    </section>
  )
}
