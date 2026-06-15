import dummyImg from '../assets/images/dummy.jpg'

interface MemberCardProps {
  designation: string
  name: string
  club?: string
  mobile: string
  email: string
  dob: string
  doa: string
  photo: string
  headerColor: string
  bodyColor: string
  classification?: string
  spouseName?: string
  spouseDob?: string
  spousePhoto?: string
}

const Field = ({ label, value }: { label: string; value: string | undefined }) => (
  <div className="pro-name filed">
    <span>{label}:</span> {value ?? ''}
  </div>
)

export function MemberCard({
  designation, name, club, mobile, email, dob, doa, photo,
  headerColor, bodyColor, classification, spouseName, spouseDob, spousePhoto,
}: MemberCardProps) {
  const hasSpouse = spouseName !== undefined

  return (
    <div className="executive-card" style={{ backgroundColor: bodyColor }}>
      <div className="card-header" style={{ backgroundColor: headerColor }}>
        {designation}
      </div>
      <div style={{ padding: '12px 8px 8px' }}>

        {/* Photo + primary fields */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <div style={{ flexShrink: 0 }}>
            <img
              src={photo || dummyImg}
              alt={name}
              className="pro-img"
              onError={e => { (e.target as HTMLImageElement).src = dummyImg }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Field label="Name" value={name} />
            {club !== undefined && <Field label="Club" value={club} />}
            <Field label="Classification" value={classification} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: '7 1 0', minWidth: 0 }}><Field label="M" value={mobile} /></div>
              <div style={{ flex: '5 1 0', minWidth: 0 }}><Field label="DOB" value={dob} /></div>
            </div>
          </div>
        </div>

        {/* Email + DOA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ flex: '9 1 0', minWidth: 0 }}><Field label="Email" value={email} /></div>
          <div style={{ flex: '3 1 0', minWidth: 0 }}><Field label="DOA" value={doa} /></div>
        </div>

        {/* Spouse section */}
        {hasSpouse && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {spousePhoto !== undefined && (
                <div style={{ flexShrink: 0 }}>
                  <img
                    src={spousePhoto || dummyImg}
                    alt="Spouse"
                    className="pro-img"
                    onError={e => { (e.target as HTMLImageElement).src = dummyImg }}
                  />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: '7 1 0', minWidth: 0 }}><Field label="Spouse Name" value={spouseName} /></div>
                  <div style={{ flex: '5 1 0', minWidth: 0 }}><Field label="Spouse DOB" value={spouseDob} /></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
