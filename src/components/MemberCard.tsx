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
  onDownloadPdf?: () => void
  isDownloading?: boolean
}

const Field = ({ label, value }: { label: string; value: string | undefined }) => (
  <div className="pro-name filed">
    <span>{label}:</span> {value ?? ''}
  </div>
)

export function MemberCard({
  designation, name, club, mobile, email, dob, doa, photo,
  headerColor, bodyColor, classification, spouseName, spouseDob, spousePhoto,
  onDownloadPdf, isDownloading,
}: MemberCardProps) {
  const hasSpouse = spouseName !== undefined

  return (
    <div className="executive-card" style={{ backgroundColor: bodyColor }}>
      <div className="card-header" style={{ backgroundColor: headerColor }}>
        {designation}
      </div>
      <div style={{ padding: '12px 8px 8px' }}>

        {/* Photo + primary fields */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
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
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}><Field label="M" value={mobile} /></div>
              <Field label="DOB" value={dob} />
            </div>
          </div>
        </div>

        {/* Email + DOA */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <div style={{ flex: 1, minWidth: 0 }}><Field label="Email" value={email} /></div>
          <Field label="DOA" value={doa} />
        </div>

        {/* Spouse section */}
        {hasSpouse && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
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
                <Field label="Spouse Name" value={spouseName} />
                <Field label="Spouse DOB" value={spouseDob} />
              </div>
            </div>
          </div>
        )}

        {/* Per-card PDF download button */}
        {onDownloadPdf !== undefined && (
          <div style={{ textAlign: 'center', marginTop: '12px', paddingBottom: '4px' }}>
            <button
              onClick={onDownloadPdf}
              disabled={isDownloading}
              className="theme-btn"
              style={{ fontSize: '13px', padding: '6px 16px' }}
            >
              {isDownloading ? 'Generating…' : '↓ PDF'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
