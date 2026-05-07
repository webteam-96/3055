# Committee PDF Download Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-card individual PDF download and bulk ZIP download to all committee pages, producing 180×240mm + 3mm bleed cards at 400 DPI that are pixel-accurate replicas of the web MemberCard.

**Architecture:** A shared `renderMemberToPDF(member, colors, designation?)` function mounts a hidden `MemberCard` DOM node off-screen, captures it with html2canvas at 6.243× scale (= 400 DPI), and embeds the result into a jsPDF document sized 186×246mm. `downloadSinglePDF` calls this and saves the file; `downloadBulkPDF` loops over it and packs results into a JSZip. Both pages wire up `PdfDownloadButtons` (page-level ZIP) and per-card `onDownloadPdf` callbacks on each `MemberCard`.

**Tech Stack:** html2canvas, jspdf, jszip, file-saver, @types/file-saver, React 18, TypeScript, Vitest + @testing-library/react

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/utils/pdf/fetchImageAsBase64.ts` | Fetch any URL → base64 data URL, CORS bypass |
| Create | `src/utils/pdf/fetchImageAsBase64.test.ts` | Unit tests |
| Create | `src/utils/pdf/renderMemberToPDF.ts` | Core engine: member + colors → jsPDF doc |
| Create | `src/utils/pdf/downloadSinglePDF.ts` | Individual: renderMemberToPDF → .save() |
| Create | `src/utils/pdf/downloadBulkPDF.ts` | Bulk: loop + JSZip → .zip download |
| Modify | `src/components/MemberCard.tsx` | Add `onDownloadPdf?` + `isDownloading?` + per-card button |
| Create | `src/components/MemberCard.test.tsx` | Tests for new props |
| Create | `src/components/PdfDownloadButtons.tsx` | Page-level bulk button + progress overlay |
| Create | `src/components/PdfDownloadButtons.test.tsx` | Tests |
| Modify | `src/routes/executive-committee.tsx` | Wire PdfDownloadButtons + per-card handlers |
| Modify | `src/routes/committee-details.tsx` | Wire PdfDownloadButtons + per-card handlers |

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json` (auto-updated by npm)

- [ ] **Step 1: Install packages**

```bash
npm install html2canvas jspdf jszip file-saver
npm install --save-dev @types/file-saver
```

- [ ] **Step 2: Verify installation**

```bash
npm list html2canvas jspdf jszip file-saver
```

Expected output (versions may differ):
```
directory-3055@0.0.0
├── file-saver@2.x.x
├── html2canvas@1.x.x
├── jszip@3.x.x
└── jspdf@2.x.x
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install html2canvas, jspdf, jszip, file-saver for PDF export"
```

---

## Task 2: `fetchImageAsBase64` Utility

**Files:**
- Create: `src/utils/pdf/fetchImageAsBase64.ts`
- Create: `src/utils/pdf/fetchImageAsBase64.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/utils/pdf/fetchImageAsBase64.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchImageAsBase64 } from './fetchImageAsBase64'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchImageAsBase64', () => {
  it('returns empty string for empty URL', async () => {
    const result = await fetchImageAsBase64('')
    expect(result).toBe('')
  })

  it('returns empty string for undefined', async () => {
    const result = await fetchImageAsBase64(undefined as unknown as string)
    expect(result).toBe('')
  })

  it('returns empty string when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))
    const result = await fetchImageAsBase64('https://example.com/photo.jpg')
    expect(result).toBe('')
  })

  it('returns empty string when response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const result = await fetchImageAsBase64('https://example.com/photo.jpg')
    expect(result).toBe('')
  })
})
```

- [ ] **Step 2: Run tests — expect 4 failures**

```bash
npm test -- fetchImageAsBase64
```

Expected: `FAIL` — `fetchImageAsBase64` is not defined.

- [ ] **Step 3: Implement `fetchImageAsBase64.ts`**

Create `src/utils/pdf/fetchImageAsBase64.ts`:

```ts
export async function fetchImageAsBase64(url: string): Promise<string> {
  if (!url) return ''
  try {
    const response = await fetch(url)
    if (!response.ok) return ''
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve('')
      reader.readAsDataURL(blob)
    })
  } catch {
    return ''
  }
}
```

- [ ] **Step 4: Run tests — expect 4 passes**

```bash
npm test -- fetchImageAsBase64
```

Expected:
```
✓ fetchImageAsBase64 > returns empty string for empty URL
✓ fetchImageAsBase64 > returns empty string for undefined
✓ fetchImageAsBase64 > returns empty string when fetch throws
✓ fetchImageAsBase64 > returns empty string when response is not ok
```

- [ ] **Step 5: Commit**

```bash
git add src/utils/pdf/fetchImageAsBase64.ts src/utils/pdf/fetchImageAsBase64.test.ts
git commit -m "feat: add fetchImageAsBase64 utility for CORS-safe image loading"
```

---

## Task 3: Core PDF Render Engine

**Files:**
- Create: `src/utils/pdf/renderMemberToPDF.ts`

> Note: This function requires a real browser canvas (html2canvas) and cannot be unit-tested in jsdom. It is verified manually in Task 9.

- [ ] **Step 1: Create `src/utils/pdf/renderMemberToPDF.ts`**

```ts
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import { MemberCard } from '../../components/MemberCard'
import type { DistrictCommitteeMember } from '../../types/api'
import { fetchImageAsBase64 } from './fetchImageAsBase64'
import { formatDayMonth } from '../formatDate'

const CARD_WIDTH_PX = 469
const HTML2CANVAS_SCALE = 6.243  // 186mm / 25.4 * 400 DPI / 469px ≈ 400 DPI
const PDF_PAGE_W_MM = 186
const PDF_PAGE_H_MM = 246
const PDF_BLEED_MM = 3
const PDF_LIVE_W_MM = 180
const PDF_LIVE_H_MM = 240

export async function renderMemberToPDF(
  member: DistrictCommitteeMember,
  colors: { header: string; body: string },
  designationOverride?: string,
): Promise<jsPDF> {
  const photoBase64 = member.img ? await fetchImageAsBase64(member.img) : ''
  const spousePhotoBase64 = member.SpousePhoto
    ? await fetchImageAsBase64(member.SpousePhoto)
    : undefined

  const container = document.createElement('div')
  container.style.cssText = `position:absolute;left:-9999px;top:0;width:${CARD_WIDTH_PX}px;`
  document.body.appendChild(container)

  const root = createRoot(container)

  await new Promise<void>(resolve => {
    root.render(
      createElement(MemberCard, {
        designation: designationOverride ?? member.DistrictDesignation ?? '',
        name: member.name || '',
        club: member.ClubName || '',
        mobile: member.MobileNumber || '',
        email: member.MailID || '',
        dob: formatDayMonth(member.DOB),
        doa: formatDayMonth(member.DOA),
        photo: photoBase64,
        classification: member.classification || member.Keywords || '',
        spouseName: member.SpouseName || '',
        spouseDob: member.SpouseDOB || member.Spouse_DOB || '',
        spousePhoto: spousePhotoBase64,
        headerColor: colors.header,
        bodyColor: colors.body,
      })
    )
    setTimeout(resolve, 150)
  })

  const cardEl = container.firstElementChild as HTMLElement
  const canvas = await html2canvas(cardEl, {
    scale: HTML2CANVAS_SCALE,
    useCORS: false,
    backgroundColor: null,
    logging: false,
  })

  root.unmount()
  container.remove()

  const doc = new jsPDF({
    unit: 'mm',
    format: [PDF_PAGE_W_MM, PDF_PAGE_H_MM],
    orientation: 'portrait',
  })

  doc.addImage(canvas.toDataURL('image/png'), 'PNG', PDF_BLEED_MM, PDF_BLEED_MM, PDF_LIVE_W_MM, PDF_LIVE_H_MM)

  return doc
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no errors. If you see `Cannot find module 'html2canvas'` or `'jspdf'`, run Task 1 first.

- [ ] **Step 3: Commit**

```bash
git add src/utils/pdf/renderMemberToPDF.ts
git commit -m "feat: add renderMemberToPDF core engine (html2canvas + jsPDF, 400 DPI)"
```

---

## Task 4: Individual and Bulk Download Wrappers

**Files:**
- Create: `src/utils/pdf/downloadSinglePDF.ts`
- Create: `src/utils/pdf/downloadBulkPDF.ts`

> These are thin wrappers over `renderMemberToPDF`. They are verified manually in Task 9.

- [ ] **Step 1: Create `src/utils/pdf/downloadSinglePDF.ts`**

```ts
import { renderMemberToPDF } from './renderMemberToPDF'
import type { DistrictCommitteeMember } from '../../types/api'

function toSafeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)
}

export async function downloadSinglePDF(
  member: DistrictCommitteeMember,
  colors: { header: string; body: string },
  designationOverride?: string,
): Promise<void> {
  const doc = await renderMemberToPDF(member, colors, designationOverride)
  const name = toSafeFilename(member.name || 'Member')
  const desig = toSafeFilename(designationOverride ?? member.DistrictDesignation ?? 'Member')
  doc.save(`Rtn_${name}_${desig}.pdf`)
}
```

- [ ] **Step 2: Create `src/utils/pdf/downloadBulkPDF.ts`**

```ts
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { renderMemberToPDF } from './renderMemberToPDF'
import type { DistrictCommitteeMember } from '../../types/api'

function toSafeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)
}

export async function downloadBulkPDF(
  members: DistrictCommitteeMember[],
  title: string,
  getColors: (index: number) => { header: string; body: string },
  getDesignation: (member: DistrictCommitteeMember) => string,
  onProgress: (current: number, total: number) => void,
): Promise<void> {
  const zip = new JSZip()

  for (let i = 0; i < members.length; i++) {
    onProgress(i + 1, members.length)
    const member = members[i]
    const designation = getDesignation(member)
    const doc = await renderMemberToPDF(member, getColors(i), designation)
    const pdfBuffer = doc.output('arraybuffer')
    const name = toSafeFilename(member.name || 'Member')
    const desig = toSafeFilename(designation || 'Member')
    zip.file(`${i + 1}_${name}_${desig}.pdf`, pdfBuffer)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `${toSafeFilename(title)}_Cards.zip`)
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/utils/pdf/downloadSinglePDF.ts src/utils/pdf/downloadBulkPDF.ts
git commit -m "feat: add downloadSinglePDF and downloadBulkPDF wrappers"
```

---

## Task 5: Update `MemberCard` with Per-Card Download Button

**Files:**
- Modify: `src/components/MemberCard.tsx`
- Create: `src/components/MemberCard.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/MemberCard.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemberCard } from './MemberCard'

const baseProps = {
  designation: 'Zone Chair',
  name: 'John Doe',
  mobile: '9876543210',
  email: 'john@example.com',
  dob: '01/01',
  doa: '15/03',
  photo: '',
  headerColor: '#E8D8CE',
  bodyColor: '#372616',
}

describe('MemberCard — PDF download button', () => {
  it('does not render download button when onDownloadPdf is not provided', () => {
    render(<MemberCard {...baseProps} />)
    expect(screen.queryByRole('button', { name: /↓ PDF/i })).toBeNull()
  })

  it('renders download button when onDownloadPdf is provided', () => {
    render(<MemberCard {...baseProps} onDownloadPdf={vi.fn()} />)
    expect(screen.getByRole('button', { name: /↓ PDF/i })).toBeDefined()
  })

  it('shows "Generating…" and disables button when isDownloading is true', () => {
    render(<MemberCard {...baseProps} onDownloadPdf={vi.fn()} isDownloading={true} />)
    const btn = screen.getByRole('button', { name: /Generating/i }) as HTMLButtonElement
    expect(btn).toBeDefined()
    expect(btn.disabled).toBe(true)
  })

  it('button is enabled when isDownloading is false', () => {
    render(<MemberCard {...baseProps} onDownloadPdf={vi.fn()} isDownloading={false} />)
    const btn = screen.getByRole('button', { name: /↓ PDF/i }) as HTMLButtonElement
    expect(btn.disabled).toBe(false)
  })

  it('calls onDownloadPdf when button is clicked', () => {
    const onDownloadPdf = vi.fn()
    render(<MemberCard {...baseProps} onDownloadPdf={onDownloadPdf} />)
    fireEvent.click(screen.getByRole('button', { name: /↓ PDF/i }))
    expect(onDownloadPdf).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run tests — expect 5 failures**

```bash
npm test -- MemberCard
```

Expected: `FAIL` — new props do not exist yet.

- [ ] **Step 3: Update `src/components/MemberCard.tsx`**

Replace the entire file contents with:

```tsx
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
```

- [ ] **Step 4: Run tests — expect 5 passes**

```bash
npm test -- MemberCard
```

Expected:
```
✓ MemberCard — PDF download button > does not render download button when onDownloadPdf is not provided
✓ MemberCard — PDF download button > renders download button when onDownloadPdf is provided
✓ MemberCard — PDF download button > shows "Generating…" and disables button when isDownloading is true
✓ MemberCard — PDF download button > button is enabled when isDownloading is false
✓ MemberCard — PDF download button > calls onDownloadPdf when button is clicked
```

- [ ] **Step 5: Commit**

```bash
git add src/components/MemberCard.tsx src/components/MemberCard.test.tsx
git commit -m "feat: add per-card PDF download button to MemberCard"
```

---

## Task 6: `PdfDownloadButtons` Component

**Files:**
- Create: `src/components/PdfDownloadButtons.tsx`
- Create: `src/components/PdfDownloadButtons.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/PdfDownloadButtons.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PdfDownloadButtons } from './PdfDownloadButtons'
import type { DistrictCommitteeMember } from '../types/api'

const mockMember: DistrictCommitteeMember = {
  DistrictDesignation: 'Zone Chair',
  name: 'John Doe',
  ClubName: 'Rotary Club Test',
  MobileNumber: '9876543210',
  BloodGroup: 'A+',
  Bloodgrp: 'A+',
  MailID: 'john@example.com',
  Address: '',
  DOB: '',
  DOA: '',
  RotaryID: '',
  img: '',
  SpouseName: '',
  SpousePhoto: '',
  SpouseDOB: '',
  Spouse_DOB: '',
  Spouse_Mobile_Number: '',
  SpouseMobileNumber: '',
  SpouseMobile: '',
  Keywords: '',
  classification: '',
}

const defaultProps = {
  members: [mockMember],
  title: 'Test Committee',
  getColors: () => ({ header: '#E8D8CE', body: '#372616' }),
  getDesignation: (m: DistrictCommitteeMember) => m.DistrictDesignation,
}

describe('PdfDownloadButtons', () => {
  it('renders null when members array is empty', () => {
    const { container } = render(
      <PdfDownloadButtons {...defaultProps} members={[]} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders ZIP download button when members are present', () => {
    render(<PdfDownloadButtons {...defaultProps} />)
    expect(screen.getByRole('button', { name: /↓ All as ZIP/i })).toBeDefined()
  })

  it('ZIP button is enabled initially', () => {
    render(<PdfDownloadButtons {...defaultProps} />)
    const btn = screen.getByRole('button', { name: /↓ All as ZIP/i }) as HTMLButtonElement
    expect(btn.disabled).toBe(false)
  })

  it('ZIP button is disabled when externalBusy is true', () => {
    render(<PdfDownloadButtons {...defaultProps} externalBusy={true} />)
    const btn = screen.getByRole('button', { name: /↓ All as ZIP/i }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests — expect 4 failures**

```bash
npm test -- PdfDownloadButtons
```

Expected: `FAIL` — component does not exist yet.

- [ ] **Step 3: Create `src/components/PdfDownloadButtons.tsx`**

```tsx
import { useState } from 'react'
import type { DistrictCommitteeMember } from '../types/api'
import { downloadBulkPDF } from '../utils/pdf/downloadBulkPDF'

interface PdfDownloadButtonsProps {
  members: DistrictCommitteeMember[]
  title: string
  getColors: (index: number) => { header: string; body: string }
  getDesignation: (member: DistrictCommitteeMember) => string
  externalBusy?: boolean
}

export function PdfDownloadButtons({
  members, title, getColors, getDesignation, externalBusy,
}: PdfDownloadButtonsProps) {
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const isBusy = progress !== null || (externalBusy ?? false)

  if (members.length === 0) return null

  async function handleBulkDownload() {
    setProgress({ current: 0, total: members.length })
    try {
      await downloadBulkPDF(members, title, getColors, getDesignation, (current, total) => {
        setProgress({ current, total })
      })
    } finally {
      setProgress(null)
    }
  }

  return (
    <>
      <button onClick={handleBulkDownload} disabled={isBusy} className="theme-btn">
        {progress !== null ? '…' : '↓ All as ZIP'}
      </button>

      {progress !== null && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '32px 48px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#3b251a', marginBottom: '8px' }}>
              Generating PDFs…
            </div>
            <div style={{ color: '#7c6f68', fontSize: '14px' }}>
              {progress.current} of {progress.total}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 4: Run tests — expect 4 passes**

```bash
npm test -- PdfDownloadButtons
```

Expected:
```
✓ PdfDownloadButtons > renders null when members array is empty
✓ PdfDownloadButtons > renders ZIP download button when members are present
✓ PdfDownloadButtons > ZIP button is enabled initially
✓ PdfDownloadButtons > ZIP button is disabled when externalBusy is true
```

- [ ] **Step 5: Commit**

```bash
git add src/components/PdfDownloadButtons.tsx src/components/PdfDownloadButtons.test.tsx
git commit -m "feat: add PdfDownloadButtons component with bulk ZIP and progress overlay"
```

---

## Task 7: Wire `executive-committee.tsx`

**Files:**
- Modify: `src/routes/executive-committee.tsx`

- [ ] **Step 1: Replace `src/routes/executive-committee.tsx` with:**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/routes/executive-committee.tsx
git commit -m "feat: wire PDF download into executive-committee page"
```

---

## Task 8: Wire `committee-details.tsx`

**Files:**
- Modify: `src/routes/committee-details.tsx`

- [ ] **Step 1: Replace `src/routes/committee-details.tsx` with:**

```tsx
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useCommitteeDetails } from '../api/useCommitteeDetails'
import { MemberCard } from '../components/MemberCard'
import { PdfDownloadButtons } from '../components/PdfDownloadButtons'
import { Preloader } from '../components/Preloader'
import { CARD_BODY_COLORS, CARD_HEADER_COLORS, COMMITTEE_COLORS } from '../types/api'
import { formatDayMonth, expandDesignation } from '../utils/formatDate'
import { downloadSinglePDF } from '../utils/pdf/downloadSinglePDF'

// @ts-ignore
export const Route = createFileRoute('/committee-details')({
  validateSearch: (search: Record<string, unknown>) => ({
    committeeId: (search.committeeId as string) ?? '',
    name: (search.name as string) ?? '',
    subCommitteeId: (search.subCommitteeId as string) ?? '',
    subCommitteeName: (search.subCommitteeName as string) ?? '',
  }),
  component: CommitteeDetailsPage,
})

interface CommitteeDetailsSearch {
  committeeId?: string
  name?: string
  subCommitteeId?: string
  subCommitteeName?: string
}

const GROUP_ID = '34307'

function CommitteeDetailsPage() {
  const search = Route.useSearch() as CommitteeDetailsSearch
  const committeeId = search?.committeeId ?? ''
  const name = search?.name ?? ''
  const subCommitteeId = search?.subCommitteeId ?? ''
  const subCommitteeName = search?.subCommitteeName ?? ''
  const { data, isLoading, isError } = useCommitteeDetails(committeeId, GROUP_ID)
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null)

  if (isLoading) return <Preloader isLoading />
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load data.</div>

  const displayTitle = subCommitteeName || name || 'Committee'

  const displayMembers = (() => {
    if (subCommitteeId && data?.subCommitteeMembers) {
      return [...data.subCommitteeMembers]
        .filter(m => m.fk_District_sub_Committee_id === subCommitteeId)
        .sort((a, b) => (a.ClubName ?? '').localeCompare(b.ClubName ?? ''))
    }
    return [...(data?.directMembers ?? [])].sort((a, b) => (a.ClubName ?? '').localeCompare(b.ClubName ?? ''))
  })()

  const showSubCommittees = !subCommitteeId && (data?.subCommittees ?? []).length > 0
  const showMembers = displayMembers.length > 0
  const showDivider = !subCommitteeId && showMembers && showSubCommittees

  return (
    <section className="py-10">
      <div className="auto-container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#3b251a]">{displayTitle}</h2>
          <div className="flex items-center gap-2">
            {showMembers && (
              <PdfDownloadButtons
                members={displayMembers}
                title={displayTitle}
                getColors={(i) => ({ header: CARD_HEADER_COLORS[i % 4], body: CARD_BODY_COLORS[i % 4] })}
                getDesignation={(m) => expandDesignation(m.DistrictDesignation || '')}
                externalBusy={downloadingIndex !== null}
              />
            )}
            <button onClick={() => window.history.back()} className="theme-btn">← Back</button>
          </div>
        </div>

        {showMembers && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {displayMembers.map((record, i) => (
              <MemberCard
                key={i}
                designation={expandDesignation(record.DistrictDesignation || '')}
                name={record.name || ''}
                club={record.ClubName || ''}
                mobile={record.MobileNumber || ''}
                email={record.MailID || ''}
                dob={formatDayMonth(record.DOB)}
                doa={formatDayMonth(record.DOA)}
                photo={record.img || ''}
                classification={record.classification || record.Keywords || ''}
                spouseName={record.SpouseName || ''}
                spouseDob={record.SpouseDOB || record.Spouse_DOB || ''}
                headerColor={CARD_HEADER_COLORS[i % 4]}
                bodyColor={CARD_BODY_COLORS[i % 4]}
                onDownloadPdf={async () => {
                  setDownloadingIndex(i)
                  try {
                    await downloadSinglePDF(
                      record,
                      { header: CARD_HEADER_COLORS[i % 4], body: CARD_BODY_COLORS[i % 4] },
                      expandDesignation(record.DistrictDesignation || ''),
                    )
                  } finally {
                    setDownloadingIndex(null)
                  }
                }}
                isDownloading={downloadingIndex === i}
              />
            ))}
          </div>
        )}

        {showDivider && (
          <div className="text-center my-8">
            <h2 className="text-2xl font-semibold text-[#2E5339]">Sub Committees</h2>
          </div>
        )}

        {showSubCommittees && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(data?.subCommittees ?? []).map((sub, i) => (
              <a
                key={sub.pk_District_sub_Committee_id}
                href={`/committee-details?committeeId=${committeeId}&name=${encodeURIComponent(name)}&subCommitteeId=${sub.pk_District_sub_Committee_id}&subCommitteeName=${encodeURIComponent(sub.name)}`}
                className="avenu-crd"
                style={{ backgroundColor: COMMITTEE_COLORS[i % 4] }}
              >
                <div className="cat-text">{sub.name}</div>
              </a>
            ))}
          </div>
        )}

        {!showMembers && !showSubCommittees && (
          <p className="text-center text-gray-500">No data available.</p>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/routes/committee-details.tsx
git commit -m "feat: wire PDF download into committee-details page"
```

---

## Task 9: Full Test Suite + Manual Browser Smoke Test

**Files:** none

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: all tests pass, including the new suites:
```
✓ src/utils/pdf/fetchImageAsBase64.test.ts (4 tests)
✓ src/components/MemberCard.test.tsx (5 tests)
✓ src/components/PdfDownloadButtons.test.tsx (4 tests)
```

- [ ] **Step 2: Open the app and navigate to Executive Committee**

Open `http://localhost:5173` in a browser. Navigate to the Executive Committee page.

Verify:
- `↓ All as ZIP` button appears in the header row next to `← Back`
- Each member card has a `↓ PDF` button at the bottom
- Both buttons use the site's blue `theme-btn` style

- [ ] **Step 3: Test individual PDF download**

Click `↓ PDF` on any member card.

Verify:
- Button shows `Generating…` and is disabled while generating
- A PDF file named `Rtn_<Name>_<Designation>.pdf` downloads
- Open the PDF — confirm it matches the web card visually (same colors, photo, all fields)
- PDF page is 186×246mm (check in PDF reader → Document Properties)

- [ ] **Step 4: Test bulk ZIP download**

Click `↓ All as ZIP`.

Verify:
- Progress overlay appears: `Generating PDFs… X of Y`
- A ZIP file named `Executive_Committee_Cards.zip` downloads after completion
- Open the ZIP — it contains one PDF per member, numbered `1_Name_Desig.pdf`, `2_Name_Desig.pdf`, etc.
- Open a PDF from the ZIP — confirm visual quality and page dimensions

- [ ] **Step 5: Test on committee-details page**

Navigate to any committee with members.

Verify:
- `↓ All as ZIP` appears only when members are shown (not on the sub-committee list view)
- Per-card `↓ PDF` buttons work correctly
- ZIP filename matches the committee title

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: complete committee PDF download feature (individual + bulk ZIP, 400 DPI, 180x240mm)"
```
