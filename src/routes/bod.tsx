import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useClubsBOD } from '../api/useClubsBOD'
import { Preloader } from '../components/Preloader'
import { cleanText } from '../utils/formatDate'
import dummyImg from '../assets/images/dummy.jpg'

export const Route = createFileRoute('/bod')({
  component: BODPage,
})

const GROUP_ID = '34307'
const YEAR = '2026-2027'

const getImg = (v: string | null | undefined) =>
  v && v !== 'null' ? v : dummyImg

function BODPage() {
  const [search, setSearch] = useState('')
  const { data: clubs, isLoading, isError } = useClubsBOD(GROUP_ID, YEAR)

  const filtered = useMemo(() => {
    if (!clubs) return []
    const q = search.toLowerCase().trim()
    const base = clubs.filter(c => c.President_member_name || c.Secreatary_member_name)
    if (!q) return base
    return base.filter(c =>
      (c.clubName ?? '').toLowerCase().includes(q) ||
      (c.President_member_name ?? '').toLowerCase().includes(q) ||
      (c.Secreatary_member_name ?? '').toLowerCase().includes(q) ||
      (c.AG_Name ?? '').toLowerCase().includes(q) ||
      (c.President_member_mobile_no ?? '').toLowerCase().includes(q) ||
      (c.Secreatary_mobile_no ?? '').toLowerCase().includes(q)
    )
  }, [clubs, search])

  if (isLoading) return <Preloader isLoading />
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load clubs.</div>

  return (
    <>
      <section className="py-6 bg-[#17458F]">
        <div className="auto-container flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-white">Rotary Clubs of 3170</h1>
          <button onClick={() => window.history.back()} className="theme-btn bg-white hover:bg-gray-100" style={{ color: 'black' }}>
            ← Back
          </button>
        </div>
      </section>

      {/* Search */}
      <section className="py-4 bg-gray-50">
        <div className="auto-container flex justify-end">
          <div className="search-box w-full md:w-96">
            <i className="fas fa-search text-gray-400 mx-3" />
            <input
              type="text"
              placeholder="Search by name, club..."
              className="flex-1 py-2.5 text-sm bg-transparent outline-none border-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Clubs */}
      <div className="auto-container py-8 space-y-12">
        {filtered.map(club => (
          <div key={club.grpID}>
            <h2 className="text-2xl font-bold text-center mb-4 text-[#3b251a]">
              {cleanText(club.clubName)}
            </h2>

            {/* AG */}
            <div className="executive-card mb-4" style={{ backgroundColor: '#2F4366' }}>
              <div className="card-header-tab" style={{ backgroundColor: '#8D9FBE' }}>
                ASSISTANT GOVERNOR
              </div>
              <div className="p-3 m-2">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-full md:w-1/4 text-center">
                    <img
                      src={getImg(club.AG_Photo)}
                      alt="AG"
                      className="pro-img-lg"
                      onError={e => { (e.target as HTMLImageElement).src = dummyImg }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="filed"><span>Name:</span> {cleanText(club.AG_Name)}</div>
                    <div className="filed"><span>Mobile:</span> {cleanText(club.AG_MobileNumber)}</div>
                    <div className="filed"><span>Email:</span> {cleanText(club.AG_EmailID)}</div>
                    <div className="filed"><span>DOB:</span> {cleanText(club.AG_DOB)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* President + QR + Secretary */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-2">
                <div className="executive-card" style={{ backgroundColor: '#E59E2C' }}>
                  <div className="card-header-tab" style={{ backgroundColor: '#FFE8C4' }}>PRESIDENT</div>
                  <div className="p-3 m-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <img
                        src={getImg(club.President_Profile_Photo)}
                        alt="President"
                        className="pro-img"
                        onError={e => { (e.target as HTMLImageElement).src = dummyImg }}
                      />
                      <div className="flex-1">
                        <div className="filed"><span>Name:</span> {cleanText(club.President_member_name)}</div>
                        <div className="filed"><span>Email:</span> {cleanText(club.President_member_email_id)}</div>
                        <div className="filed"><span>Mobile:</span> {cleanText(club.President_member_mobile_no)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 flex flex-col items-center">
                <div className="executive-card w-full text-center p-4" style={{ backgroundColor: '#2F4366' }}>
                  <a
                    href={`/club-details?groupId=${club.grpID}`}
                    className="theme-btn w-full mb-3 text-xs block text-center"
                  >
                    TO KNOW MORE →
                  </a>
                  <div className="text-white text-xs">Club ID: {club.grpID}</div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="executive-card" style={{ backgroundColor: '#E59E2C' }}>
                  <div className="card-header-tab" style={{ backgroundColor: '#FFE8C4' }}>SECRETARY</div>
                  <div className="p-3 m-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <img
                        src={getImg(club.Secreatary_Profile_Photo)}
                        alt="Secretary"
                        className="pro-img"
                        onError={e => { (e.target as HTMLImageElement).src = dummyImg }}
                      />
                      <div className="flex-1">
                        <div className="filed"><span>Name:</span> {cleanText(club.Secreatary_member_name)}</div>
                        <div className="filed"><span>Email:</span> {cleanText(club.Secreatary_email_id)}</div>
                        <div className="filed"><span>Mobile:</span> {cleanText(club.Secreatary_mobile_no)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No clubs found.</p>
        )}
      </div>
    </>
  )
}
