import dummyImg from '../assets/images/dummy.jpg'

interface MemberCardProps {
  designation: string
  name: string
  club: string
  mobile: string
  email: string
  dob: string
  doa: string
  address: string
  photo: string
  headerColor: string
  bodyColor: string
}

export function MemberCard({
  designation, name, club, mobile, email, dob, doa, address, photo, headerColor, bodyColor,
}: MemberCardProps) {
  return (
    <div className="executive-card" style={{ backgroundColor: bodyColor }}>
      <div className="card-header-tab" style={{ backgroundColor: headerColor }}>
        {designation}
      </div>
      <div className="p-3 m-2">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="w-full md:w-1/3 text-center">
            <img
              src={photo || dummyImg}
              alt={name}
              className="pro-img"
              onError={e => { (e.target as HTMLImageElement).src = dummyImg }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="filed"><span>Name:</span> {name}</div>
            <div className="filed"><span>Club:</span> {club}</div>
            <div className="flex gap-4 flex-wrap">
              <div className="filed flex-1"><span>M:</span> {mobile}</div>
              <div className="filed"><span>DOB:</span> {dob}</div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mb-1 flex-wrap">
          <div className="filed flex-1 min-w-0"><span>Email:</span> {email}</div>
          <div className="filed"><span>DOA:</span> {doa}</div>
        </div>
        <div className="filed address-line"><span>Res. Address:</span> {address}</div>
      </div>
    </div>
  )
}
