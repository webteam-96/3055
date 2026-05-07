# Committee PDF Download — Design Spec
**Date:** 2026-05-07  
**Status:** Approved  

---

## Overview

Add a PDF download feature to all committee pages in the District 3055 directory app. Members can download individual member cards as PDFs, or all members at once bundled in a ZIP file. The PDF must be a pixel-accurate replica of the web `MemberCard` component, at print quality (400 DPI), sized 180 × 240 mm with 3 mm bleed on all sides — suitable for a printed magazine/directory book.

---

## Requirements

| # | Requirement |
|---|---|
| 1 | PDF design is an exact visual replica of the web `MemberCard` — same layout, fonts, colors, photo |
| 2 | PDF page size: 186 × 246 mm (180 × 240 mm live area + 3 mm bleed on all four sides) |
| 3 | Resolution: 400 DPI minimum |
| 4 | Member photos fetched as base64 before rendering to bypass CORS |
| 5 | Single shared render function — changes reflect in both individual and bulk paths |
| 6 | Individual download: one PDF per member, triggered immediately |
| 7 | Bulk download: all member PDFs bundled in a ZIP file |
| 8 | Feature appears on all committee pages: `executive-committee`, `committee-details`, and any future pages |
| 9 | Buttons use the existing `theme-btn` CSS class to match site style |
| 10 | Bulk generation shows a progress overlay: "Generating X of Y PDFs…" |

---

## PDF Dimensions & Resolution

| Property | Value |
|---|---|
| Live area | 180 × 240 mm |
| Full page (with bleed) | 186 × 246 mm |
| Bleed per side | 3 mm |
| Target DPI | 400 |
| Canvas width (px) | 2929 px (186 ÷ 25.4 × 400) |
| Canvas height (px) | 3874 px (246 ÷ 25.4 × 400) |
| Hidden card container width | 469 px |
| html2canvas scale factor | 6.243 (2929 ÷ 469) |
| Effective DPI | 400.0 ✓ |

jsPDF configuration:
- Unit: `mm`
- Page format: `[186, 246]`
- Card image placed at: `x=3, y=3, w=180, h=240`
- Image format: `PNG` (lossless)
- html2canvas `backgroundColor`: `null` (card's own `bodyColor` fills bleed edge-to-edge)

---

## Architecture

### File Structure

```
src/
├── utils/pdf/
│   ├── fetchImageAsBase64.ts     # URL → base64 data URL (CORS bypass)
│   ├── renderMemberToPDF.ts      # Core engine: member + colors → jsPDF instance
│   ├── downloadSinglePDF.ts      # Wrapper: renderMemberToPDF → .save()
│   └── downloadBulkPDF.ts        # Wrapper: loop + JSZip → .zip download
│
└── components/
    └── PdfDownloadButtons.tsx    # Reusable button group for all pages
```

### Data Flow

```
[Button click]
      │
      ├─ Individual ──→ downloadSinglePDF(member, colors)
      │
      └─ Bulk ──────→ downloadBulkPDF(members[], title, getColors)
                               │
                    Both call: renderMemberToPDF(member, colors)
                               │
                    ┌──────────┴──────────────────┐
                    │ 1. fetchImageAsBase64(url)   │
                    │ 2. Mount hidden MemberCard   │
                    │ 3. html2canvas (scale 6.243) │
                    │ 4. jsPDF embed PNG           │
                    │ 5. Unmount + cleanup         │
                    └──────────────────────────────┘
```

### Core Function Signature

```ts
renderMemberToPDF(
  member: DistrictCommitteeMember,
  colors: { header: string; body: string },
): Promise<jsPDF>
```

Returns a `jsPDF` instance. The caller decides:
- Individual: `doc.save('Rtn_Name_Designation.pdf')`
- Bulk: `doc.output('arraybuffer')` → added as a ZIP entry

---

## Image Handling

- `fetchImageAsBase64(url)` uses `fetch()` → `blob()` → `FileReader.readAsDataURL()`
- The base64 data URL is injected as the `src` of the hidden `<img>` before html2canvas runs
- On failure (404, CORS error, empty URL): falls back to the bundled `dummyImg`
- Spouse photo (when present) follows the same pre-fetch pattern

---

## Hidden Render Target

```
document.body
  └── <div style="position:absolute; left:-9999px; top:0; width:469px">
        <MemberCard ...allProps />
      </div>
```

- Mounted imperatively with `ReactDOM.createRoot` outside the React tree
- Inherits all global CSS (`index.css`, Tailwind) automatically
- Cleaned up with `root.unmount()` + `div.remove()` immediately after `html2canvas` resolves

---

## UI — Button Placement

Two separate download surfaces:

**1. Per-card individual download** — a small `↓ PDF` button added to the bottom of each `MemberCard`. Clicking it downloads only that one member's card.

```
┌─────────────────────────────────┐
│  [Designation Header]           │
│  [Photo]  Name / Club / Fields  │
│  Email / DOA / Spouse           │
│           [ ↓ PDF ]             │  ← new, bottom of card
└─────────────────────────────────┘
```

**2. Page-level bulk download** — in the existing header row, between the title and the Back button:

```
[Page Title]    [↓ All as ZIP]    [← Back]
```

### `PdfDownloadButtons` Props (page-level bulk only)

```ts
interface PdfDownloadButtonsProps {
  members: DistrictCommitteeMember[]
  title: string                                         // used as ZIP filename
  getColors: (index: number) => { header: string; body: string }
}
```

### `MemberCard` — new optional props for individual download

```ts
onDownloadPdf?: () => void   // injected by the page; card renders the button when present
isDownloading?: boolean      // true while that card's PDF is generating → shows spinner
```

### Button States

| State | Per-card ↓ PDF | Page-level ↓ All as ZIP |
|---|---|---|
| Idle | Active | Active |
| This card generating | Disabled + spinner | Disabled |
| Any card generating | Active (others unaffected) | Disabled |
| No members | Hidden | Hidden (renders `null`) |

### Progress Overlay (Bulk)

- Full-screen semi-transparent overlay
- Text: `"Generating 4 of 18 PDFs…"`
- Members processed **sequentially** (not in parallel) to avoid browser memory issues
- Overlay dismisses automatically when ZIP download triggers

---

## File Naming

| Download type | File name |
|---|---|
| Individual PDF | `Rtn_<Name>_<Designation>.pdf` |
| Bulk ZIP | `<CommitteeTitle>_Cards.zip` |
| Entry inside ZIP | `<index+1>_<Name>_<Designation>.pdf` |

---

## Page Integration

One JSX addition per page — no other changes to page files:

```tsx
<PdfDownloadButtons
  members={data.members}
  title="Executive Committee"
  getColors={(i) => ({ header: CARD_HEADER_COLORS[i % 4], body: CARD_BODY_COLORS[i % 4] })}
/>
```

Pages receiving this addition:
1. `src/routes/executive-committee.tsx`
2. `src/routes/committee-details.tsx` (only when `displayMembers.length > 0`)

---

## New Dependencies

```
html2canvas       DOM → canvas at high scale
jspdf             canvas → PDF document
jszip             bundle multiple PDFs into ZIP
file-saver        trigger browser file download
@types/file-saver TypeScript types for file-saver
```

---

## Out of Scope

- Server-side PDF generation
- PDF compression or file-size optimisation
- Per-card download buttons on individual `MemberCard` components
- PDF preview modal before download
