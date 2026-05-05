# React + TanStack Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Rotary District 3170 static HTML/jQuery site in `old/` into a React 18 + TypeScript SPA using TanStack Router, TanStack Query, and Tailwind CSS.

**Architecture:** Vite-bundled SPA with file-based TanStack Router routes, TanStack Query hooks for all 5 external API endpoints, and Tailwind CSS component layer replacing Bootstrap + jQuery. All assets copied from `old/assets/`. No backend changes.

**Tech Stack:** React 18, TypeScript, Vite, TanStack Router v1, TanStack Query v5, Tailwind CSS v3, Vitest, React Testing Library

---

## File Map

```
src/
  routes/
    __root.tsx                  # Root layout: Header + Outlet + Footer
    index.tsx                   # Homepage /
    about.tsx                   # About /about
    directory.tsx               # Directory /directory
    executive-committee.tsx     # Exec committee /executive-committee
    club-details.tsx            # Club detail /club-details?groupId=X
    sub-committee.tsx           # Sub-committee /sub-committee?committeeId=X&name=Y
    committee-details.tsx       # Committee details /committee-details?committeeID=X&title=Y&subCommitteeID=Z&subCommitteeName=W
    bod.tsx                     # BOD /bod
    digital.tsx                 # Digital /digital
  components/
    Preloader.tsx               # Animated boxes spinner
    Header.tsx                  # Logo + nav + mobile menu
    Footer.tsx                  # Logos + copyright
    MemberCard.tsx              # Reusable member/exec card
    ClubCard.tsx                # Colored category nav card
  api/
    queryClient.ts              # QueryClient with 5-min staleTime
    useDistrictCommittee.ts     # POST /api/DistrictCommittee/districtCommitteeList
    useCommitteeDetails.ts      # POST /api/DistrictCommittee/districtCommitteeDetails/
    useClubDetails.ts           # POST /api/District/Get_Clubs_BOD_Details
    useClubMembers.ts           # POST /api/FindClub/GetClubMembers
    useClubsBOD.ts              # POST /api/District/Get_Clubs_BOD
  types/
    api.ts                      # All API response types
  utils/
    formatDate.ts               # formatDateToDDMM + formatDayMonth
  index.css                     # Tailwind directives + @layer components
  main.tsx                      # App entry point
index.html                      # CDN links: Font Awesome, Google Fonts
vite.config.ts
tailwind.config.ts
postcss.config.js
tsconfig.json
```

---

## Task 1: Initialize Project + Git

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`

- [ ] **Step 1: Initialize git and Vite project**

Run in `E:\websites\directory\3055\`:
```powershell
git init
npm create vite@latest . -- --template react-ts
```
When prompted "Current directory is not empty. Remove existing files and continue?" → choose **No, keep files** (or type `n`). If Vite refuses, run:
```powershell
npm create vite@latest temp-react -- --template react-ts
```
Then manually copy `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/` from `temp-react/` into `3055/`, then delete `temp-react/`.

Expected: `package.json` created with `react`, `react-dom`, `typescript` dependencies.

- [ ] **Step 2: Install dependencies**

```powershell
npm install
npm install @tanstack/react-router @tanstack/react-query
npm install -D @tanstack/router-plugin @tanstack/router-devtools @tanstack/react-query-devtools
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 3: Replace `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: './src/routes' }),
    react(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

- [ ] **Step 4: Create `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to `package.json`**

In the `scripts` section, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Update `tsconfig.json` to include test files**

Add `"src/test-setup.ts"` to the `include` array if not already there. Ensure `"types": ["vitest/globals"]` is in `compilerOptions`.

- [ ] **Step 7: Commit**

```powershell
git add .
git commit -m "feat: scaffold Vite + React + TS project with TanStack + Vitest"
```

---

## Task 2: Configure Tailwind CSS

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.js`, `src/index.css`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install Tailwind**

```powershell
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p --ts
```

Expected: `tailwind.config.ts` and `postcss.config.js` created.

- [ ] **Step 2: Replace `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'rotary-blue': '#17458F',
        'rotary-green': '#2E5339',
        'card-brown': '#372616',
        'card-gold': '#E59E2C',
        'card-navy': '#2F4366',
        'card-teal': '#2F5755',
        'header-peach': '#E8D8CE',
        'header-cream': '#FFE8C4',
        'header-slate': '#8D9FBE',
        'header-mint': '#88BAB5',
      },
      fontFamily: {
        geist: ['Geist', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 3: Write `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { margin: 0; padding: 0; border: none; outline: none; }
  body {
    @apply text-base text-[#7c6f68] leading-8 font-normal bg-white font-geist antialiased;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply relative font-geist font-normal text-[#3b251a] m-0 transition-all duration-500;
  }
  a { @apply no-underline transition-all duration-500; }
  a:hover { @apply no-underline outline-none; }
  ul, li { @apply list-none p-0 m-0; }
  p { @apply relative font-geist text-[#7c6f68] m-0 transition-all duration-500; }
}

@layer components {
  .auto-container {
    @apply static max-w-[1400px] px-4 mx-auto;
  }
  .boxed-wrapper {
    @apply relative overflow-x-hidden mx-auto w-full min-w-[300px];
  }
  .executive-card {
    @apply rounded-[10px] shadow-md mb-5;
  }
  .card-header-tab {
    @apply text-center px-3 py-2.5 font-normal text-lg rounded-b-[10px] w-4/5 mx-auto;
  }
  .pro-img {
    @apply w-[120px] h-[120px] rounded-xl object-cover mx-auto;
  }
  .pro-img-lg {
    @apply w-[150px] h-[150px] rounded-xl object-cover mx-auto;
  }
  .filed {
    @apply text-sm text-white mb-1;
  }
  .filed span {
    @apply font-semibold;
  }
  .address-line {
    @apply block whitespace-nowrap overflow-hidden text-ellipsis;
  }
  .avenu-crd {
    @apply flex items-center justify-center min-h-[80px] rounded-xl mb-4 cursor-pointer
           text-white text-center font-semibold text-lg p-4 transition-transform
           hover:scale-[1.02] hover:no-underline;
  }
  .club-crd {
    @apply flex items-center justify-center min-h-[60px] rounded-xl mb-4 cursor-pointer
           text-white text-center font-semibold text-base p-3 bg-[#2F4366]
           transition-transform hover:scale-[1.02] hover:no-underline w-full;
  }
  .page-banner {
    @apply relative py-8;
  }
  .bg-layer {
    @apply absolute inset-0 bg-cover bg-center bg-no-repeat;
  }
  .theme-btn {
    @apply inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium
           text-white bg-[#17458F] transition-all hover:bg-[#0f3270] hover:no-underline;
  }
  .yellow-btn {
    @apply inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium
           text-white bg-[#E59E2C] transition-all hover:bg-[#c88820] hover:no-underline;
  }
  .white-btn {
    @apply inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium
           text-[#17458F] bg-white border border-[#17458F] transition-all
           hover:bg-[#17458F] hover:text-white hover:no-underline;
  }
  .search-box {
    @apply flex items-center bg-white rounded-full px-3 py-1 border border-gray-200
           shadow-sm transition-all focus-within:border-[#0F6EB7] focus-within:shadow-md;
  }
}

/* Preloader animation */
.preloader {
  position: fixed;
  inset: 0;
  background: #fff;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preloader .boxes {
  --size: 32px;
  --duration: 800ms;
  height: calc(var(--size) * 2);
  width: calc(var(--size) * 3);
  position: relative;
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
  margin-top: calc(var(--size) * 1.5 * -1);
  transform: rotateX(60deg) rotateZ(45deg) rotateY(0deg) translateZ(0px);
}
.preloader .boxes .box {
  width: var(--size);
  height: var(--size);
  top: 0;
  left: 0;
  position: absolute;
  transform-style: preserve-3d;
}
.preloader .boxes .box:nth-child(1) { transform: translate(100%, 0); animation: box1 var(--duration) linear infinite; }
.preloader .boxes .box:nth-child(2) { transform: translate(0, 100%); animation: box2 var(--duration) linear infinite; }
.preloader .boxes .box:nth-child(3) { transform: translate(100%, 100%); animation: box3 var(--duration) linear infinite; }
.preloader .boxes .box:nth-child(4) { transform: translate(200%, 0); animation: box4 var(--duration) linear infinite; }
.preloader .boxes .box > div {
  --background: #2F4366;
  --top: auto;
  --right: auto;
  --bottom: auto;
  --left: auto;
  --translateZ: calc(var(--size) / 2);
  --rotateY: 0deg;
  --rotateX: 0deg;
  position: absolute;
  width: 100%;
  height: 100%;
  background: var(--background);
  top: var(--top);
  right: var(--right);
  bottom: var(--bottom);
  left: var(--left);
  transform: rotateY(var(--rotateY)) rotateX(var(--rotateX)) translateZ(var(--translateZ));
}
.preloader .boxes .box > div:nth-child(1) { --top: 0; --left: 0; }
.preloader .boxes .box > div:nth-child(2) { --background: #E59E2C; --right: 0; --rotateY: 90deg; }
.preloader .boxes .box > div:nth-child(3) { --background: #372616; --rotateX: -90deg; --bottom: 0; }
.preloader .boxes .box > div:nth-child(4) { --background: rgba(47,67,102,0.15); --top: 0; --left: 0; --translateZ: calc(var(--size) * -1); }
@keyframes box1 {
  0%,50% { transform: translate(100%, 0); }
  100% { transform: translate(200%, 0); }
}
@keyframes box2 {
  0% { transform: translate(0, 100%); }
  50% { transform: translate(0, 0); }
  100% { transform: translate(100%, 0); }
}
@keyframes box3 {
  0%,50% { transform: translate(100%, 100%); }
  100% { transform: translate(0, 100%); }
}
@keyframes box4 {
  0% { transform: translate(200%, 0); }
  50% { transform: translate(200%, 100%); }
  100% { transform: translate(100%, 100%); }
}
```

- [ ] **Step 4: Import CSS in `src/main.tsx`**

```tsx
import './index.css'
```

- [ ] **Step 5: Run dev server to verify Tailwind loads**

```powershell
npm run dev
```

Expected: Dev server starts at `http://localhost:5173` with no CSS errors.

- [ ] **Step 6: Commit**

```powershell
git add .
git commit -m "feat: configure Tailwind CSS with component layer and preloader animation"
```

---

## Task 3: Copy Assets

**Files:**
- Create: `src/assets/images/` (from `old/assets/images/`)
- Create: `src/assets/fonts/` (from `old/assets/fonts/`)
- Create: `src/assets/css/` (keep only flaticon.css + font-awesome-all.css for local fonts)

- [ ] **Step 1: Copy image assets**

```powershell
Copy-Item -Recurse "old\assets\images" "src\assets\images" -Force
```

Expected: `src/assets/images/` contains all PNG/JPG files from `old/assets/images/`.

- [ ] **Step 2: Copy font assets**

```powershell
Copy-Item -Recurse "old\assets\fonts" "src\assets\fonts" -Force
```

Expected: `src/assets/fonts/` contains all `.woff`, `.woff2`, `.eot`, `.ttf` files.

- [ ] **Step 3: Copy flaticon CSS (local font references)**

```powershell
Copy-Item "old\assets\css\flaticon.css" "src\assets\css\flaticon.css" -Force
Copy-Item "old\assets\css\font-awesome-all.css" "src\assets\css\font-awesome-all.css" -Force
```

- [ ] **Step 4: Update `index.html` with CDN links + asset paths**

Replace the contents of `index.html` with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/src/assets/images/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    <title>District 3170</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Jost:ital,wght@0,100..900;1,100..900&family=Outfit:wght@100..900&family=Onest:wght@100..900&display=swap" rel="stylesheet" />
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Commit**

```powershell
git add .
git commit -m "feat: copy static assets and update index.html with CDN links"
```

---

## Task 4: TypeScript Types

**Files:**
- Create: `src/types/api.ts`

- [ ] **Step 1: Write `src/types/api.ts`**

```ts
// District Committee API
export interface DistrictCommitteeMember {
  DistrictDesignation: string
  name: string
  ClubName: string
  MobileNumber: string
  BloodGroup: string
  Bloodgrp: string
  MailID: string
  Address: string
  DOB: string
  DOA: string
  RotaryID: string
  img: string
  SpouseName: string
  Spouse_Mobile_Number: string
  SpouseMobileNumber: string
  Keywords: string
  classification: string
  fk_District_sub_Committee_id?: string
}

export interface CommitteeCategory {
  Fk_DistrictCommitteeID: string
  name: string
}

export interface DistrictCommitteeResult {
  districtCommitteeWithoutCatList: DistrictCommitteeMember[]
  districtCommitteeWithCatList: CommitteeCategory[]
}

// Committee Details API
export interface SubCommittee {
  pk_District_sub_Committee_id: string
  name: string
}

export interface CommitteeDetailsResult {
  district_sub_Committee: SubCommittee[]
  district_sub_Committee_Details_list: DistrictCommitteeMember[]
  districtCommitteeWithoutCatList: DistrictCommitteeMember[]
}

// Club Details API (Get_Clubs_BOD_Details)
export interface ClubBasicInfo {
  Club_Name: string
  Club_ID: string
  Charter_Date: string
  Membership: string
}

export interface ClubPresident {
  President_name: string
  President_photo: string
  Mobile_number: string
  President_DOB: string
  President_EmialID: string
  DOA: string
  address: string
  RotaryID: string
}

export interface ClubSecretary {
  Secretary_name: string
  Secretary_photo: string
  Mobile_number: string
  Secretary_DOB: string
  Secretary_EmialID: string
  DOA: string
  address: string
  RotaryID: string
}

export interface ClubBODMember {
  Name: string
  Designation: string
  ClubName: string
  Mobile_number: string
  member_date_of_birth: string
  member_date_of_wedding: string
  Emailid: string
  address: string
  member_profile_photo_path: string
}

export interface ClubAG {
  Name: string
  Designation: string
  Mobile_number: string
  Emailid: string
  member_date_of_birth: string
}

export interface ClubDetailsResult {
  BasicInfo: ClubBasicInfo[]
  AG: ClubAG | ClubAG[]
  President: ClubPresident[]
  Secretary: ClubSecretary[]
  BOD: ClubBODMember[]
  President_Profile_Photo1: string
}

// Club Members API
export interface ClubMember {
  memberName: string
  MemberName: string
  membermobile: string
  MemberMobile: string
  designation: string
  Designation: string
  pic: string
  groupName: string
  MemberDOB: string
  MemberDOA: string
  MemberEmail: string
  MemberAddress: string
}

// Clubs BOD API (Get_Clubs_BOD)
export interface ClubBODSummary {
  grpID: string
  clubName: string
  AG_Name: string
  AG_MobileNumber: string
  AG_EmailID: string
  AG_DOB: string
  AG_Photo: string
  President_member_name: string
  President_member_email_id: string
  President_member_mobile_no: string
  President_Profile_Photo: string
  Secreatary_member_name: string
  Secreatary_email_id: string
  Secreatary_mobile_no: string
  Secreatary_Profile_Photo: string
}

// Color palettes (shared constants)
export const CARD_BODY_COLORS = ['#372616', '#E59E2C', '#2F4366', '#2F5755'] as const
export const CARD_HEADER_COLORS = ['#E8D8CE', '#FFE8C4', '#8D9FBE', '#88BAB5'] as const
export const COMMITTEE_COLORS = ['#372616', '#2F4366', '#E59E2C', '#17458F'] as const

export const DESIGNATION_MAP: Record<string, string> = {
  ZAC: 'Zonal Avenue Chair',
  GAH: 'Group Avenue Head',
  ZCC: 'Zonal Co-Chair',
  ZDC: 'Zonal District Chair',
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```powershell
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```powershell
git add src/types/api.ts
git commit -m "feat: add TypeScript types for all API responses"
```

---

## Task 5: Utility Functions + Tests

**Files:**
- Create: `src/utils/formatDate.ts`
- Create: `src/utils/formatDate.test.ts`

- [ ] **Step 1: Write failing tests in `src/utils/formatDate.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { formatDateToDDMM, formatDayMonth, createSlug, expandDesignation } from './formatDate'

describe('formatDateToDDMM', () => {
  it('formats ISO date string to DD/MM', () => {
    expect(formatDateToDDMM('1985-03-15')).toBe('15/03')
  })
  it('returns empty string for falsy input', () => {
    expect(formatDateToDDMM('')).toBe('')
    expect(formatDateToDDMM(null)).toBe('')
  })
  it('strips ordinal suffixes before parsing', () => {
    expect(formatDateToDDMM('15th March 1985')).toBe('15/03')
  })
})

describe('formatDayMonth', () => {
  it('formats DD/MM/YYYY to DD/MM', () => {
    expect(formatDayMonth('15/03/1985')).toBe('15/03')
  })
  it('returns empty string for invalid input', () => {
    expect(formatDayMonth('')).toBe('')
    expect(formatDayMonth('baddate')).toBe('')
  })
})

describe('createSlug', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(createSlug('Youth Service')).toBe('youth-service')
  })
  it('removes special characters', () => {
    expect(createSlug('Community & Development')).toBe('community-development')
  })
})

describe('expandDesignation', () => {
  it('expands known abbreviations', () => {
    expect(expandDesignation('ZAC - Zone 1')).toBe('Zonal Avenue Chair (ZAC) - Zone 1')
  })
  it('returns original for unknown designations', () => {
    expect(expandDesignation('District Governor')).toBe('District Governor')
  })
})
```

- [ ] **Step 2: Run to confirm tests fail**

```powershell
npm test
```

Expected: 4 test failures (module not found).

- [ ] **Step 3: Create `src/utils/formatDate.ts`**

```ts
import { DESIGNATION_MAP } from '../types/api'

export function formatDateToDDMM(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/i, '$1')
  const date = new Date(cleaned)
  if (!isNaN(date.getTime())) {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}`
  }
  const parts = cleaned.trim().split(' ')
  if (parts.length === 2) {
    const day = parts[0].padStart(2, '0')
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const monthIndex = monthNames.findIndex(m => m.toLowerCase() === parts[1].toLowerCase())
    if (monthIndex >= 0) return `${day}/${String(monthIndex + 1).padStart(2, '0')}`
  }
  return dateStr
}

export function formatDayMonth(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const trimmed = dateStr.trim()
  const parts = trimmed.split('/')
  if (parts.length < 2) return ''
  return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}`
}

export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function expandDesignation(designation: string): string {
  const key = designation.substring(0, 3).toUpperCase()
  const expanded = DESIGNATION_MAP[key]
  if (expanded) return `${expanded} (${key})${designation.slice(3)}`
  return designation
}

export function cleanText(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return ''
  return text.trim().replace(/\s+/g, ' ')
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```powershell
npm test
```

Expected: All 8 tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/utils/
git commit -m "feat: add date formatting and slug utilities with tests"
```

---

## Task 6: QueryClient

**Files:**
- Create: `src/api/queryClient.ts`

- [ ] **Step 1: Create `src/api/queryClient.ts`**

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})
```

- [ ] **Step 2: Commit**

```powershell
git add src/api/queryClient.ts
git commit -m "feat: configure TanStack QueryClient with 5-min cache"
```

---

## Task 7: Preloader Component

**Files:**
- Create: `src/components/Preloader.tsx`
- Create: `src/components/Preloader.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/Preloader.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Preloader } from './Preloader'

describe('Preloader', () => {
  it('renders when isLoading is true', () => {
    render(<Preloader isLoading={true} />)
    expect(document.querySelector('.preloader')).toBeInTheDocument()
  })
  it('does not render when isLoading is false', () => {
    render(<Preloader isLoading={false} />)
    expect(document.querySelector('.preloader')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```powershell
npm test
```

Expected: 2 failures (Preloader not found).

- [ ] **Step 3: Create `src/components/Preloader.tsx`**

```tsx
interface PreloaderProps {
  isLoading: boolean
}

export function Preloader({ isLoading }: PreloaderProps) {
  if (!isLoading) return null
  return (
    <div className="preloader">
      <div className="boxes">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="box">
            <div /><div /><div /><div />
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

```powershell
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/components/Preloader.tsx src/components/Preloader.test.tsx
git commit -m "feat: add Preloader component"
```

---

## Task 8: Footer Component

**Files:**
- Create: `src/components/Footer.tsx`
- Create: `src/components/Footer.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/Footer.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders copyright text', () => {
    render(<Footer />)
    expect(screen.getByText(/Kaizen Infotech/i)).toBeInTheDocument()
  })
  it('renders logo images', () => {
    render(<Footer />)
    const imgs = screen.getAllByRole('img')
    expect(imgs.length).toBeGreaterThanOrEqual(3)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```powershell
npm test
```

- [ ] **Step 3: Create `src/components/Footer.tsx`**

```tsx
import rlLogo from '../assets/images/rllogo.png'
import logo2 from '../assets/images/logo-2.png'
import kaizenLogo from '../assets/images/kaizenlogo.png'

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="auto-container py-8">
        <div className="flex flex-wrap justify-center items-center gap-8 pb-6 border-b border-white/10">
          <a href="/" className="block">
            <img src={rlLogo} alt="Rotary International" className="h-16 object-contain" />
          </a>
          <a href="/" className="block">
            <img src={logo2} alt="District 3170" className="h-16 object-contain" />
          </a>
          <a href="/" className="block">
            <img src={kaizenLogo} alt="Kaizen Infotech" className="h-16 object-contain" />
          </a>
        </div>
      </div>
      <div className="bg-[#111] py-4 text-center text-sm text-gray-400">
        <div className="auto-container">
          <p>
            &copy; {new Date().getFullYear()} Developed and maintained by{' '}
            <a
              href="https://kaizeninfotech.com/"
              target="_blank"
              rel="noreferrer"
              className="text-[#E59E2C] hover:underline"
            >
              Kaizen Infotech Solutions Pvt. Ltd.
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Run tests**

```powershell
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/components/Footer.tsx src/components/Footer.test.tsx
git commit -m "feat: add Footer component"
```

---

## Task 9: Header Component

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/Header.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/Header.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// We need a mock Link for TanStack Router — use a simple anchor fallback
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string; [key: string]: unknown }) => (
    <a href={to} {...props}>{children}</a>
  ),
  useRouterState: () => ({ location: { pathname: '/' } }),
}))

import { Header } from './Header'

describe('Header', () => {
  it('renders nav links', () => {
    render(<Header />)
    expect(screen.getByText('HOME')).toBeInTheDocument()
    expect(screen.getByText('DIGITAL DIRECTORY')).toBeInTheDocument()
  })
  it('toggles mobile menu on hamburger click', () => {
    render(<Header />)
    const toggler = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(toggler)
    expect(screen.getByRole('navigation', { name: /mobile/i })).toHaveClass('open')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```powershell
npm test
```

- [ ] **Step 3: Create `src/components/Header.tsx`**

```tsx
import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import logo1 from '../assets/images/logo1.png'
import phoenix from '../assets/images/phoenix-1.png'
import logo2 from '../assets/images/logo-2.png'

const NAV_LINKS = [
  { label: 'HOME', to: '/', internal: true },
  { label: 'CALENDAR', href: '', external: true },
  { label: 'DISTRICT WEBSITE', href: '', external: true },
  { label: 'DIGITAL DIRECTORY', to: '/directory', internal: true },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sticky, setSticky] = useState(false)

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`w-full z-50 transition-all duration-300 ${
          sticky ? 'fixed top-0 left-0 shadow-lg bg-white' : 'relative bg-white'
        }`}
      >
        <div className="auto-container py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link to="/">
                <img src={logo1} alt="District 3170" className="h-14 object-contain" />
              </Link>
              <Link to="/">
                <img src={phoenix} alt="Phoenix" className="h-10 object-contain" />
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(link =>
                link.internal ? (
                  <Link
                    key={link.label}
                    to={link.to!}
                    className="text-sm font-semibold text-[#3b251a] hover:text-[#E59E2C] transition-colors"
                    activeProps={{ className: 'text-[#E59E2C]' }}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-[#3b251a] hover:text-[#E59E2C] transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}
            </nav>

            {/* Mobile Hamburger */}
            <button
              aria-label="menu"
              className="md:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMobileOpen(v => !v)}
            >
              <span className="block w-6 h-0.5 bg-[#3b251a]" />
              <span className="block w-6 h-0.5 bg-[#3b251a]" />
              <span className="block w-6 h-0.5 bg-[#3b251a]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <nav
        aria-label="mobile"
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0 open' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <img src={logo2} alt="Logo" className="h-10 object-contain" />
              <img src={phoenix} alt="Phoenix" className="h-8 object-contain" />
            </div>
            <button
              aria-label="close menu"
              onClick={() => setMobileOpen(false)}
              className="text-2xl text-[#3b251a]"
            >
              <i className="fas fa-times" />
            </button>
          </div>
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map(link =>
              link.internal ? (
                <li key={link.label}>
                  <Link
                    to={link.to!}
                    className="block text-base font-semibold text-[#3b251a] hover:text-[#E59E2C]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ) : (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-base font-semibold text-[#3b251a] hover:text-[#E59E2C]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>
      </nav>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 4: Run tests**

```powershell
npm test
```

Expected: Header tests pass (mock handles TanStack Link).

- [ ] **Step 5: Commit**

```powershell
git add src/components/Header.tsx src/components/Header.test.tsx
git commit -m "feat: add Header component with sticky behavior and mobile menu"
```

---

## Task 10: MemberCard Component

**Files:**
- Create: `src/components/MemberCard.tsx`
- Create: `src/components/MemberCard.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/MemberCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemberCard } from './MemberCard'

const props = {
  designation: 'District Governor',
  name: 'John Doe',
  club: 'Rotary Club Test',
  mobile: '9999999999',
  email: 'john@test.com',
  dob: '15/03',
  doa: '20/06',
  address: '123 Test Street',
  photo: '',
  headerColor: '#E8D8CE',
  bodyColor: '#372616',
}

describe('MemberCard', () => {
  it('renders designation as card header', () => {
    render(<MemberCard {...props} />)
    expect(screen.getByText('District Governor')).toBeInTheDocument()
  })
  it('renders name and club', () => {
    render(<MemberCard {...props} />)
    expect(screen.getByText(/John Doe/)).toBeInTheDocument()
    expect(screen.getByText(/Rotary Club Test/)).toBeInTheDocument()
  })
  it('uses fallback image when photo is empty', () => {
    render(<MemberCard {...props} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', expect.stringContaining('dummy'))
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```powershell
npm test
```

- [ ] **Step 3: Create `src/components/MemberCard.tsx`**

```tsx
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
          <div className="flex-1">
            <div className="filed"><span>Name:</span> {name}</div>
            <div className="filed"><span>Club:</span> {club}</div>
            <div className="flex gap-4">
              <div className="filed flex-1"><span>M:</span> {mobile}</div>
              <div className="filed"><span>DOB:</span> {dob}</div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mb-1">
          <div className="filed flex-1 min-w-0"><span>Email:</span> {email}</div>
          <div className="filed"><span>DOA:</span> {doa}</div>
        </div>
        <div className="filed address-line"><span>Res. Address:</span> {address}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

```powershell
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/components/MemberCard.tsx src/components/MemberCard.test.tsx
git commit -m "feat: add reusable MemberCard component"
```

---

## Task 11: ClubCard Component

**Files:**
- Create: `src/components/ClubCard.tsx`
- Create: `src/components/ClubCard.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/ClubCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string; [key: string]: unknown }) => (
    <a href={to} {...props}>{children}</a>
  ),
}))

import { ClubCard } from './ClubCard'

describe('ClubCard', () => {
  it('renders label text', () => {
    render(<ClubCard label="Digital Directory" to="/directory" bgColor="#372616" />)
    expect(screen.getByText('Digital Directory')).toBeInTheDocument()
  })
  it('renders as internal link when to is provided', () => {
    render(<ClubCard label="Digital Directory" to="/directory" bgColor="#372616" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/directory')
  })
  it('renders as external anchor when href is provided', () => {
    render(<ClubCard label="External" href="https://example.com" bgColor="#372616" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```powershell
npm test
```

- [ ] **Step 3: Create `src/components/ClubCard.tsx`**

```tsx
import { Link } from '@tanstack/react-router'

interface ClubCardProps {
  label: string
  bgColor: string
  to?: string
  href?: string
}

export function ClubCard({ label, bgColor, to, href }: ClubCardProps) {
  const className = 'avenu-crd'
  const style = { backgroundColor: bgColor }
  const content = <div className="cat-text text-white font-semibold text-lg">{label}</div>

  if (to) {
    return (
      <Link to={to} className={className} style={style}>
        {content}
      </Link>
    )
  }
  return (
    <a href={href ?? '#'} className={className} style={style} target={href ? '_blank' : undefined} rel="noreferrer">
      {content}
    </a>
  )
}
```

- [ ] **Step 4: Run tests**

```powershell
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/components/ClubCard.tsx src/components/ClubCard.test.tsx
git commit -m "feat: add ClubCard navigation component"
```

---

## Task 12: API Hook — useDistrictCommittee

**Files:**
- Create: `src/api/useDistrictCommittee.ts`
- Create: `src/api/useDistrictCommittee.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/api/useDistrictCommittee.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useDistrictCommittee } from './useDistrictCommittee'

const mockData = {
  TBDistrictCommitteeResult: {
    Result: {
      districtCommitteeWithoutCatList: [{ name: 'Test Member', DistrictDesignation: 'DG' }],
      districtCommitteeWithCatList: [{ Fk_DistrictCommitteeID: '1', name: 'Youth Committee' }],
    },
  },
}

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockData,
  } as Response)
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('useDistrictCommittee', () => {
  it('returns committee members and categories', async () => {
    const { result } = renderHook(() => useDistrictCommittee('34307', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.members[0].name).toBe('Test Member')
    expect(result.current.data?.categories[0].name).toBe('Youth Committee')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```powershell
npm test
```

- [ ] **Step 3: Create `src/api/useDistrictCommittee.ts`**

```ts
import { useQuery } from '@tanstack/react-query'
import type { DistrictCommitteeResult } from '../types/api'

const API_BASE = 'https://rotaryindiaapi.rosteronwheels.com/api'

async function fetchDistrictCommittee(groupID: string, yearfilter: string): Promise<DistrictCommitteeResult> {
  const res = await fetch(`${API_BASE}/DistrictCommittee/districtCommitteeList`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupID, searchText: '', yearfilter }),
  })
  const data = await res.json()
  return {
    members: data?.TBDistrictCommitteeResult?.Result?.districtCommitteeWithoutCatList ?? [],
    categories: data?.TBDistrictCommitteeResult?.Result?.districtCommitteeWithCatList ?? [],
  }
}

export function useDistrictCommittee(groupID: string, yearfilter: string) {
  return useQuery({
    queryKey: ['districtCommittee', groupID, yearfilter],
    queryFn: () => fetchDistrictCommittee(groupID, yearfilter),
  })
}
```

**Note:** The return type needs the `DistrictCommitteeResult` interface updated to match — add `members` and `categories` keys to `src/types/api.ts`:

```ts
// Update src/types/api.ts — replace DistrictCommitteeResult with:
export interface DistrictCommitteeResult {
  members: DistrictCommitteeMember[]
  categories: CommitteeCategory[]
}
```

- [ ] **Step 4: Run tests**

```powershell
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/api/useDistrictCommittee.ts src/api/useDistrictCommittee.test.ts src/types/api.ts
git commit -m "feat: add useDistrictCommittee query hook"
```

---

## Task 13: API Hook — useCommitteeDetails

**Files:**
- Create: `src/api/useCommitteeDetails.ts`
- Create: `src/api/useCommitteeDetails.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/api/useCommitteeDetails.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useCommitteeDetails } from './useCommitteeDetails'

const mockData = {
  TBDistrictCommitteeDetailsResult: {
    Result: {
      district_sub_Committee: [{ pk_District_sub_Committee_id: '1', name: 'Zone A' }],
      district_sub_Committee_Details_list: [],
      districtCommitteeWithoutCatList: [{ name: 'Member A' }],
    },
  },
}

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockData } as Response)
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('useCommitteeDetails', () => {
  it('returns sub-committees and members', async () => {
    const { result } = renderHook(() => useCommitteeDetails('42', '34307'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.subCommittees[0].name).toBe('Zone A')
    expect(result.current.data?.directMembers[0].name).toBe('Member A')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```powershell
npm test
```

- [ ] **Step 3: Create `src/api/useCommitteeDetails.ts`**

```ts
import { useQuery } from '@tanstack/react-query'
import type { CommitteeDetailsResult } from '../types/api'

const API_BASE = 'https://rotaryindiaapi.rosteronwheels.com/api'

async function fetchCommitteeDetails(committeeId: string, groupID: string) {
  const res = await fetch(`${API_BASE}/DistrictCommittee/districtCommitteeDetails/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ DistrictCommitteID: committeeId, groupID }),
  })
  const data = await res.json()
  const result: CommitteeDetailsResult = data?.TBDistrictCommitteeDetailsResult?.Result ?? {
    district_sub_Committee: [],
    district_sub_Committee_Details_list: [],
    districtCommitteeWithoutCatList: [],
  }
  return {
    subCommittees: result.district_sub_Committee ?? [],
    subCommitteeMembers: result.district_sub_Committee_Details_list ?? [],
    directMembers: result.districtCommitteeWithoutCatList ?? [],
  }
}

export function useCommitteeDetails(committeeId: string, groupID = '34307') {
  return useQuery({
    queryKey: ['committeeDetails', committeeId, groupID],
    queryFn: () => fetchCommitteeDetails(committeeId, groupID),
    enabled: !!committeeId,
  })
}
```

- [ ] **Step 4: Run tests and commit**

```powershell
npm test
git add src/api/useCommitteeDetails.ts src/api/useCommitteeDetails.test.ts
git commit -m "feat: add useCommitteeDetails query hook"
```

---

## Task 14: API Hook — useClubDetails

**Files:**
- Create: `src/api/useClubDetails.ts`
- Create: `src/api/useClubDetails.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/api/useClubDetails.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useClubDetails } from './useClubDetails'

const mockData = {
  ClubListResult: {
    FinalResult: {
      BasicInfo: [{ Club_Name: 'RC Test', Club_ID: '1', Charter_Date: '', Membership: '30' }],
      AG: { Name: 'AG Name', Designation: 'AG', Mobile_number: '', Emailid: '', member_date_of_birth: '' },
      President: [{ President_name: 'President X', President_photo: '', Mobile_number: '', President_DOB: '', President_EmialID: '', DOA: '', address: '', RotaryID: '' }],
      Secretary: [],
      BOD: [],
    },
  },
}

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockData } as Response)
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('useClubDetails', () => {
  it('returns club basic info and president', async () => {
    const { result } = renderHook(() => useClubDetails('123', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.basicInfo.Club_Name).toBe('RC Test')
    expect(result.current.data?.president?.President_name).toBe('President X')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```powershell
npm test
```

- [ ] **Step 3: Create `src/api/useClubDetails.ts`**

```ts
import { useQuery } from '@tanstack/react-query'
import type { ClubBasicInfo, ClubPresident, ClubSecretary, ClubBODMember, ClubAG } from '../types/api'

const API_BASE = 'https://rotaryindiaapi.rosteronwheels.com/api'

export interface ClubDetailsData {
  basicInfo: ClubBasicInfo
  ag: ClubAG | null
  president: ClubPresident | null
  secretary: ClubSecretary | null
  bod: ClubBODMember[]
  presidentPhoto: string
}

async function fetchClubDetails(groupId: string, financialyear: string): Promise<ClubDetailsData> {
  const res = await fetch(`${API_BASE}/District/Get_Clubs_BOD_Details`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId, financialyear }),
  })
  const data = await res.json()
  const result = data?.ClubListResult?.FinalResult
  if (!result?.BasicInfo?.length) throw new Error('No club data')
  const ag = Array.isArray(result.AG) ? result.AG[0] ?? null : result.AG ?? null
  return {
    basicInfo: result.BasicInfo[0],
    ag,
    president: result.President?.[0] ?? null,
    secretary: result.Secretary?.[0] ?? null,
    bod: result.BOD ?? [],
    presidentPhoto: result.President_Profile_Photo1 ?? '',
  }
}

export function useClubDetails(groupId: string, financialyear: string) {
  return useQuery({
    queryKey: ['clubDetails', groupId, financialyear],
    queryFn: () => fetchClubDetails(groupId, financialyear),
    enabled: !!groupId,
  })
}
```

- [ ] **Step 4: Run tests and commit**

```powershell
npm test
git add src/api/useClubDetails.ts src/api/useClubDetails.test.ts
git commit -m "feat: add useClubDetails query hook"
```

---

## Task 15: API Hook — useClubMembers

**Files:**
- Create: `src/api/useClubMembers.ts`
- Create: `src/api/useClubMembers.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/api/useClubMembers.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useClubMembers } from './useClubMembers'

const mockData = {
  TBMemberList: { Result: { Table: [{ memberName: 'Alice', membermobile: '111', designation: 'Member', pic: '', groupName: '', MemberDOB: '', MemberDOA: '', MemberEmail: '', MemberAddress: '' }] } },
}

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockData } as Response)
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('useClubMembers', () => {
  it('returns array of members', async () => {
    const { result } = renderHook(() => useClubMembers('123', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.[0].memberName).toBe('Alice')
  })
})
```

- [ ] **Step 2: Create `src/api/useClubMembers.ts`**

```ts
import { useQuery } from '@tanstack/react-query'
import type { ClubMember } from '../types/api'

const API_BASE = 'https://rotaryindiaapi.rosteronwheels.com/api'

async function fetchClubMembers(grpID: string, financialyear: string): Promise<ClubMember[]> {
  const res = await fetch(`${API_BASE}/FindClub/GetClubMembers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grpID, searchText: '', financialyear }),
  })
  const data = await res.json()
  let members = data?.TBMemberList?.Result?.Table
  if (members && !Array.isArray(members)) members = [members]
  return Array.isArray(members) ? members : []
}

export function useClubMembers(grpID: string, financialyear: string) {
  return useQuery({
    queryKey: ['clubMembers', grpID, financialyear],
    queryFn: () => fetchClubMembers(grpID, financialyear),
    enabled: !!grpID,
  })
}
```

- [ ] **Step 3: Run tests and commit**

```powershell
npm test
git add src/api/useClubMembers.ts src/api/useClubMembers.test.ts
git commit -m "feat: add useClubMembers query hook"
```

---

## Task 16: API Hook — useClubsBOD

**Files:**
- Create: `src/api/useClubsBOD.ts`
- Create: `src/api/useClubsBOD.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/api/useClubsBOD.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useClubsBOD } from './useClubsBOD'

const mockData = {
  ClubListResult: { Clubs: [{ grpID: '1', clubName: 'RC Alpha', President_member_name: 'Pres A', Secreatary_member_name: 'Sec A' }] },
}

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockData } as Response)
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('useClubsBOD', () => {
  it('returns array of clubs', async () => {
    const { result } = renderHook(() => useClubsBOD('34307', '2026-2027'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.[0].clubName).toBe('RC Alpha')
  })
})
```

- [ ] **Step 2: Create `src/api/useClubsBOD.ts`**

```ts
import { useQuery } from '@tanstack/react-query'
import type { ClubBODSummary } from '../types/api'

const API_BASE = 'https://rotaryindiaapi.rosteronwheels.com/api'

async function fetchClubsBOD(groupId: string, financialyear: string): Promise<ClubBODSummary[]> {
  const res = await fetch(`${API_BASE}/District/Get_Clubs_BOD`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId, financialyear }),
  })
  const data = await res.json()
  return data?.ClubListResult?.Clubs ?? []
}

export function useClubsBOD(groupId: string, financialyear: string) {
  return useQuery({
    queryKey: ['clubsBOD', groupId, financialyear],
    queryFn: () => fetchClubsBOD(groupId, financialyear),
  })
}
```

- [ ] **Step 3: Run tests and commit**

```powershell
npm test
git add src/api/useClubsBOD.ts src/api/useClubsBOD.test.ts
git commit -m "feat: add useClubsBOD query hook"
```

---

## Task 17: TanStack Router Setup + Root Layout + main.tsx

**Files:**
- Create: `src/routes/__root.tsx`
- Create: `src/routes/index.tsx` (stub)
- Modify: `src/main.tsx`

- [ ] **Step 1: Create `src/routes/__root.tsx`**

```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="boxed-wrapper flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: Create stub `src/routes/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => <div className="p-8 text-center">Loading homepage...</div>,
})
```

- [ ] **Step 3: Update `src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { queryClient } from './api/queryClient'
import './index.css'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)
```

- [ ] **Step 4: Run dev server to verify router boots**

```powershell
npm run dev
```

Expected: App loads at `http://localhost:5173` with Header, "Loading homepage...", and Footer visible. No console errors.

- [ ] **Step 5: Commit**

```powershell
git add src/routes/ src/main.tsx
git commit -m "feat: set up TanStack Router with root layout and QueryClientProvider"
```

---

## Task 18: Homepage Route

**Files:**
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Replace stub with full homepage**

```tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import bannerImg from '../assets/images/banner/banner-main.png'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const CATEGORY_CARDS = [
  { label: 'A Glimpse of RI Dist. 3170', bgColor: '#372616', to: undefined },
  { label: 'DG Family & Friends', bgColor: '#2F4366', to: undefined },
  { label: 'Profile & Messages', bgColor: '#E59E2C', to: undefined },
  { label: 'Major, Endowment Donors & PHS Members', bgColor: '#E59E2C', to: undefined },
  { label: 'Digital Directory 2026-27', bgColor: '#372616', to: '/directory' },
  { label: 'Zone 7 Regional Leaders', bgColor: '#2F4366', to: undefined },
  { label: 'DCC', bgColor: '#2F4366', to: undefined },
  { label: 'Major, Endowment Donors & PHS Members', bgColor: '#E59E2C', to: undefined },
  { label: 'District Events', bgColor: '#372616', to: undefined },
]

function HomePage() {
  return (
    <>
      {/* Hero Banner */}
      <section
        className="relative py-16 min-h-[85vh] flex items-center"
        style={{ backgroundImage: `url(${bannerImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="auto-container w-full">
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="w-full md:w-1/2 text-left p-6 rounded-xl"
              style={{
                background: 'linear-gradient(95deg, rgba(204,204,204,0.80) 0%, rgba(168,168,168,0.56) 48.56%, rgba(255,255,255,0.30) 100%)',
                boxShadow: '0px 4px 4px 0px rgba(0,0,0,0.25)',
                backdropFilter: 'blur(2.75px)',
              }}
            >
              <h4 className="text-lg font-semibold text-[#372616] mb-2">Rotary District 3170</h4>
              <h2 className="text-3xl md:text-4xl font-bold text-[#3b251a] mb-4">
                Find Everything You Need — All in One Place
              </h2>
              <p className="text-[#3b251a] mb-1">Together, we connect • Together, we serve • Together, we inspire</p>
              <p className="text-[#3b251a] mb-1">Welcome to the official digital directory of Rotary District 3170.</p>
              <p className="text-[#3b251a] mb-6">
                Find details of every club, members, and leadership designed with clarity and simplicity for all Rotarians.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/directory" className="yellow-btn">Explore Directory</Link>
                <a href="#" className="white-btn">View Upcoming Events</a>
              </div>
            </div>
            <div className="hidden md:block w-full md:w-5/12" />
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-12 bg-gray-50">
        <div className="auto-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CATEGORY_CARDS.map((card, i) =>
              card.to ? (
                <Link
                  key={i}
                  to={card.to}
                  className="avenu-crd"
                  style={{ backgroundColor: card.bgColor }}
                >
                  {card.label}
                </Link>
              ) : (
                <div
                  key={i}
                  className="avenu-crd cursor-default"
                  style={{ backgroundColor: card.bgColor }}
                >
                  {card.label}
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 2: Check in browser**

```powershell
npm run dev
```

Open `http://localhost:5173`. Verify hero banner with text and category cards render correctly.

- [ ] **Step 3: Commit**

```powershell
git add src/routes/index.tsx
git commit -m "feat: implement homepage with hero banner and category cards"
```

---

## Task 19: About Route

**Files:**
- Create: `src/routes/about.tsx`

- [ ] **Step 1: Create `src/routes/about.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import mapImg from '../assets/images/map.png'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <>
      {/* Page Title */}
      <section className="page-banner bg-[#9EDFFD] text-center py-8">
        <div className="auto-container">
          <h1 className="text-4xl font-medium text-black">About Us</h1>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-gray-50">
        <div className="auto-container">
          <div className="flex flex-wrap items-center gap-8">
            <div className="w-full md:w-1/2">
              <img src={mapImg} alt="District Map" className="w-full rounded-xl shadow-md" />
            </div>
            <div className="w-full md:w-5/12">
              <span className="text-sm font-semibold text-[#E59E2C] uppercase tracking-wide">Our Introductions</span>
              <h2 className="text-3xl font-bold text-[#3b251a] mt-2 mb-4">
                Welcome to Digital District 3170 Directory
              </h2>
              <p className="text-[#7c6f68] leading-relaxed">
                R.I. District 3170 is part of Rotary International Zone 7, encompassing clubs across the region.
                The district is committed to promoting peace, fighting disease, providing clean water and sanitation,
                saving mothers and children, supporting education, and growing local economies.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:5173/about`. Verify map image and text render.

- [ ] **Step 3: Commit**

```powershell
git add src/routes/about.tsx
git commit -m "feat: implement About page"
```

---

## Task 20: Directory Route

**Files:**
- Create: `src/routes/directory.tsx`

- [ ] **Step 1: Create `src/routes/directory.tsx`**

```tsx
import { createFileRoute, Link } from '@tanstack/react-router'
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
        style={{ backgroundImage: `url(${bannerBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
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
            <Link to="/bod" className="club-crd w-full md:w-1/2">
              Rotary Clubs of District 3170
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(data?.categories ?? []).map((committee, i) => (
              <Link
                key={committee.Fk_DistrictCommitteeID}
                to="/sub-committee"
                search={{ committeeId: committee.Fk_DistrictCommitteeID, name: committee.name }}
                className="avenu-crd"
                style={{ backgroundColor: COMMITTEE_COLORS[i % 4] }}
              >
                {committee.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:5173/directory`. Verify executive committee cards load from API and committee categories are listed.

- [ ] **Step 3: Commit**

```powershell
git add src/routes/directory.tsx
git commit -m "feat: implement Directory page with executive committee and committee list"
```

---

## Task 21: Executive Committee Route

**Files:**
- Create: `src/routes/executive-committee.tsx`

- [ ] **Step 1: Create `src/routes/executive-committee.tsx`**

```tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { useDistrictCommittee } from '../api/useDistrictCommittee'
import { MemberCard } from '../components/MemberCard'
import { Preloader } from '../components/Preloader'
import { CARD_BODY_COLORS, CARD_HEADER_COLORS } from '../types/api'
import { formatDateToDDMM } from '../utils/formatDate'

export const Route = createFileRoute('/executive-committee')({
  component: ExecutiveCommitteePage,
})

const GROUP_ID = '34307'
const YEAR = '2026-2027'

function ExecutiveCommitteePage() {
  const { data, isLoading, isError } = useDistrictCommittee(GROUP_ID, YEAR)

  const members = (() => {
    const seen = new Set<string>()
    return (data?.members ?? []).filter(m => {
      const key = (m.DistrictDesignation ?? '').toUpperCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  })()

  if (isLoading) return <Preloader isLoading />
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load data.</div>

  return (
    <>
      <section className="page-banner bg-[#9EDFFD] py-8">
        <div className="auto-container">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-black">Executive Committee</h1>
            <Link to="/" className="theme-btn">Back</Link>
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="auto-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member, i) => (
              <MemberCard
                key={i}
                designation={member.DistrictDesignation || 'Member'}
                name={member.name || ''}
                club={member.ClubName || ''}
                mobile={member.MobileNumber || ''}
                email={member.MailID || ''}
                dob={member.DOB || ''}
                doa={member.DOA || ''}
                address={member.Address || ''}
                photo={member.img || ''}
                headerColor={CARD_HEADER_COLORS[i % 4]}
                bodyColor={CARD_BODY_COLORS[i % 4]}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/routes/executive-committee.tsx
git commit -m "feat: implement Executive Committee page with deduplication"
```

---

## Task 22: Club Details Route

**Files:**
- Create: `src/routes/club-details.tsx`

- [ ] **Step 1: Create `src/routes/club-details.tsx`**

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useClubDetails } from '../api/useClubDetails'
import { useClubMembers } from '../api/useClubMembers'
import { MemberCard } from '../components/MemberCard'
import { Preloader } from '../components/Preloader'
import { CARD_BODY_COLORS, CARD_HEADER_COLORS } from '../types/api'
import { formatDateToDDMM } from '../utils/formatDate'
import dummyImg from '../assets/images/dummy.jpg'

export const Route = createFileRoute('/club-details')({
  validateSearch: (search: Record<string, unknown>) => ({
    groupId: (search.groupId as string) ?? '',
  }),
  component: ClubDetailsPage,
})

const YEAR = '2026-2027'

function ClubDetailsPage() {
  const { groupId } = Route.useSearch()
  const navigate = useNavigate()
  const [bodOpen, setBodOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)

  const { data: club, isLoading: clubLoading, isError: clubError } = useClubDetails(groupId, YEAR)
  const { data: members, isLoading: membersLoading } = useClubMembers(groupId, YEAR)

  if (clubLoading) return <Preloader isLoading />
  if (clubError || !club) return <div className="p-8 text-center text-red-500">Failed to load club details.</div>

  const { basicInfo, ag, president, secretary, bod, presidentPhoto } = club

  return (
    <>
      {/* Page Title */}
      <section className="py-6 bg-[#17458F]">
        <div className="auto-container">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white">{basicInfo.Club_Name}</h1>
            <button onClick={() => window.history.back()} className="theme-btn bg-white text-black hover:bg-gray-100">
              ← Back
            </button>
          </div>
        </div>
      </section>

      {/* Club Info Bar */}
      <div className="bg-[#C4D4EE] py-4">
        <div className="auto-container">
          <div className="flex flex-wrap gap-6 justify-center text-sm font-medium text-black">
            <span><strong>Club ID:</strong> {basicInfo.Club_ID}</span>
            <span><strong>Charter Date:</strong> {formatDateToDDMM(basicInfo.Charter_Date)}</span>
            <span><strong>Membership:</strong> {basicInfo.Membership}</span>
          </div>
        </div>
      </div>

      {/* AG Card */}
      {ag?.Name && (
        <div className="auto-container mt-6">
          <div className="executive-card" style={{ backgroundColor: '#2F4366' }}>
            <div className="card-header-tab" style={{ backgroundColor: '#8D9FBE' }}>
              {ag.Designation || 'Assistant Governor'}
            </div>
            <div className="p-3 m-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-full md:w-1/4 text-center">
                  <img
                    src={presidentPhoto || dummyImg}
                    alt="AG"
                    className="pro-img-lg"
                    onError={e => { (e.target as HTMLImageElement).src = dummyImg }}
                  />
                </div>
                <div className="flex-1">
                  <div className="filed"><span>Name:</span> {ag.Name}</div>
                  <div className="filed"><span>Mobile:</span> {ag.Mobile_number}</div>
                  <div className="filed"><span>Email:</span> {ag.Emailid}</div>
                  <div className="filed"><span>DOB:</span> {formatDateToDDMM(ag.member_date_of_birth)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* President + Secretary */}
      <section className="py-8">
        <div className="auto-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {president && (
              <MemberCard
                designation="President"
                name={president.President_name || ''}
                club={basicInfo.Club_Name}
                mobile={president.Mobile_number || ''}
                email={president.President_EmialID || ''}
                dob={formatDateToDDMM(president.President_DOB)}
                doa={formatDateToDDMM(president.DOA)}
                address={president.address || ''}
                photo={president.President_photo || ''}
                headerColor="#FFE8C4"
                bodyColor="#E59E2C"
              />
            )}
            {secretary && (
              <MemberCard
                designation="Secretary"
                name={secretary.Secretary_name || ''}
                club={basicInfo.Club_Name}
                mobile={secretary.Mobile_number || ''}
                email={secretary.Secretary_EmialID || ''}
                dob={formatDateToDDMM(secretary.Secretary_DOB)}
                doa={formatDateToDDMM(secretary.DOA)}
                address={secretary.address || ''}
                photo={secretary.Secretary_photo || ''}
                headerColor="#FFE8C4"
                bodyColor="#E59E2C"
              />
            )}
          </div>
        </div>
      </section>

      {/* BOD Accordion */}
      <div className="auto-container mb-6">
        <button
          onClick={() => setBodOpen(v => !v)}
          className="w-full md:w-72 mx-auto block theme-btn text-center py-4"
        >
          {bodOpen ? '▲' : '▼'} Board of Directors
        </button>
        {bodOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {bod.map((member, i) => (
              <MemberCard
                key={i}
                designation={member.Designation || 'Board Member'}
                name={member.Name || ''}
                club={member.ClubName || basicInfo.Club_Name}
                mobile={member.Mobile_number || ''}
                email={member.Emailid || ''}
                dob={formatDateToDDMM(member.member_date_of_birth)}
                doa={formatDateToDDMM(member.member_date_of_wedding)}
                address={member.address || ''}
                photo={member.member_profile_photo_path || ''}
                headerColor={CARD_HEADER_COLORS[i % 4]}
                bodyColor={CARD_BODY_COLORS[i % 4]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Members Accordion */}
      <div className="auto-container mb-12">
        <button
          onClick={() => setMembersOpen(v => !v)}
          className="w-full md:w-72 mx-auto block theme-btn text-center py-4"
        >
          {membersOpen ? '▲' : '▼'} Members
        </button>
        {membersOpen && !membersLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {(members ?? []).map((member, i) => (
              <MemberCard
                key={i}
                designation={member.designation || member.Designation || 'Rotarian'}
                name={member.memberName || member.MemberName || ''}
                club={member.groupName || ''}
                mobile={member.membermobile || member.MemberMobile || ''}
                email={member.MemberEmail || ''}
                dob={formatDateToDDMM(member.MemberDOB)}
                doa={formatDateToDDMM(member.MemberDOA)}
                address={member.MemberAddress || ''}
                photo={member.pic || ''}
                headerColor={CARD_HEADER_COLORS[i % 4]}
                bodyColor={CARD_BODY_COLORS[i % 4]}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:5173/club-details?groupId=XXXXX` (use a real groupId from the directory page's committee links). Verify club details, President, Secretary, and BOD accordion.

- [ ] **Step 3: Commit**

```powershell
git add src/routes/club-details.tsx
git commit -m "feat: implement Club Details page with BOD and Members accordions"
```

---

## Task 23: Sub-Committee Route

**Files:**
- Create: `src/routes/sub-committee.tsx`

- [ ] **Step 1: Create `src/routes/sub-committee.tsx`**

```tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { useCommitteeDetails } from '../api/useCommitteeDetails'
import { MemberCard } from '../components/MemberCard'
import { Preloader } from '../components/Preloader'
import { CARD_BODY_COLORS, CARD_HEADER_COLORS, COMMITTEE_COLORS } from '../types/api'
import { formatDayMonth, expandDesignation } from '../utils/formatDate'

export const Route = createFileRoute('/sub-committee')({
  validateSearch: (search: Record<string, unknown>) => ({
    committeeId: (search.committeeId as string) ?? '',
    name: (search.name as string) ?? '',
    subCommitteeId: (search.subCommitteeId as string) ?? '',
    subCommitteeName: (search.subCommitteeName as string) ?? '',
  }),
  component: SubCommitteePage,
})

const GROUP_ID = '34307'

function SubCommitteePage() {
  const { committeeId, name, subCommitteeId, subCommitteeName } = Route.useSearch()
  const { data, isLoading, isError } = useCommitteeDetails(committeeId, GROUP_ID)

  if (isLoading) return <Preloader isLoading />
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load data.</div>

  const displayTitle = subCommitteeName || name || 'Committee'

  const displayMembers = (() => {
    if (subCommitteeId && data?.subCommitteeMembers) {
      return data.subCommitteeMembers
        .filter(m => m.fk_District_sub_Committee_id === subCommitteeId)
        .sort((a, b) => (a.ClubName ?? '').localeCompare(b.ClubName ?? ''))
    }
    return (data?.directMembers ?? []).sort((a, b) => (a.ClubName ?? '').localeCompare(b.ClubName ?? ''))
  })()

  const showSubCommittees = !subCommitteeId && (data?.subCommittees ?? []).length > 0
  const showMembers = displayMembers.length > 0
  const showDivider = !subCommitteeId && showMembers && showSubCommittees

  return (
    <>
      <section className="py-6 bg-[#17458F]">
        <div className="auto-container flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">{displayTitle}</h1>
          <Link to="/directory" className="theme-btn bg-white text-black hover:bg-gray-100">← Back</Link>
        </div>
      </section>

      <section className="py-10">
        <div className="auto-container">
          {showMembers && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {displayMembers.map((member, i) => (
                <MemberCard
                  key={i}
                  designation={expandDesignation(member.DistrictDesignation || '')}
                  name={member.name || ''}
                  club={member.ClubName || ''}
                  mobile={member.MobileNumber || ''}
                  email={member.MailID || ''}
                  dob={formatDayMonth(member.DOB)}
                  doa={formatDayMonth(member.DOA)}
                  address={member.Address || ''}
                  photo={member.img || ''}
                  headerColor={CARD_HEADER_COLORS[i % 4]}
                  bodyColor={CARD_BODY_COLORS[i % 4]}
                />
              ))}
            </div>
          )}

          {showDivider && (
            <div className="text-center my-10">
              <h2 className="text-2xl font-semibold text-[#2E5339] inline-block relative px-5
                before:content-[''] before:absolute before:top-1/2 before:right-full before:w-24 before:h-0.5 before:bg-[#2E5339]
                after:content-[''] after:absolute after:top-1/2 after:left-full after:w-24 after:h-0.5 after:bg-[#2E5339]">
                Sub Committees
              </h2>
            </div>
          )}

          {showSubCommittees && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data!.subCommittees.map((sub, i) => (
                <Link
                  key={sub.pk_District_sub_Committee_id}
                  to="/sub-committee"
                  search={{
                    committeeId,
                    name,
                    subCommitteeId: sub.pk_District_sub_Committee_id,
                    subCommitteeName: sub.name,
                  }}
                  className="avenu-crd"
                  style={{ backgroundColor: COMMITTEE_COLORS[i % 4] }}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/routes/sub-committee.tsx
git commit -m "feat: implement Sub-Committee page with member and sub-committee views"
```

---

## Task 24: Committee Details Route

**Files:**
- Create: `src/routes/committee-details.tsx`

- [ ] **Step 1: Create `src/routes/committee-details.tsx`**

```tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { useCommitteeDetails } from '../api/useCommitteeDetails'
import { MemberCard } from '../components/MemberCard'
import { Preloader } from '../components/Preloader'
import { CARD_BODY_COLORS, CARD_HEADER_COLORS, COMMITTEE_COLORS } from '../types/api'
import { formatDayMonth, expandDesignation } from '../utils/formatDate'

export const Route = createFileRoute('/committee-details')({
  validateSearch: (search: Record<string, unknown>) => ({
    committeeID: (search.committeeID as string) ?? '',
    title: (search.title as string) ?? '',
    subCommitteeID: (search.subCommitteeID as string) ?? '',
    subCommitteeName: (search.subCommitteeName as string) ?? '',
  }),
  component: CommitteeDetailsPage,
})

const GROUP_ID = '34307'

function CommitteeDetailsPage() {
  const { committeeID, title, subCommitteeID, subCommitteeName } = Route.useSearch()
  const { data, isLoading, isError } = useCommitteeDetails(committeeID, GROUP_ID)

  if (isLoading) return <Preloader isLoading />
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load data.</div>

  const displayTitle = subCommitteeName || title || 'District Committee Members'

  const displayMembers = (() => {
    if (subCommitteeID) {
      return (data?.subCommitteeMembers ?? [])
        .filter(m => m.fk_District_sub_Committee_id === subCommitteeID)
        .sort((a, b) => (a.ClubName ?? '').localeCompare(b.ClubName ?? ''))
    }
    return (data?.directMembers ?? []).sort((a, b) => (a.ClubName ?? '').localeCompare(b.ClubName ?? ''))
  })()

  const showSubCommittees = !subCommitteeID && (data?.subCommittees ?? []).length > 0
  const showDivider = !subCommitteeID && displayMembers.length > 0 && showSubCommittees

  return (
    <>
      <section className="py-6 bg-[#9EDFFD]">
        <div className="auto-container flex justify-between items-center">
          <h1 className="text-3xl font-medium text-black">{displayTitle}</h1>
          <Link to="/directory" className="theme-btn">Back</Link>
        </div>
      </section>

      <section className="py-10">
        <div className="auto-container">
          {displayMembers.length > 0 && (
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
                  address={record.Address || ''}
                  photo={record.img || ''}
                  headerColor={CARD_HEADER_COLORS[i % 4]}
                  bodyColor={CARD_BODY_COLORS[i % 4]}
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
              {data!.subCommittees.map((sub, i) => (
                <Link
                  key={sub.pk_District_sub_Committee_id}
                  to="/committee-details"
                  search={{
                    committeeID,
                    title,
                    subCommitteeID: sub.pk_District_sub_Committee_id,
                    subCommitteeName: sub.name,
                  }}
                  className="avenu-crd"
                  style={{ backgroundColor: COMMITTEE_COLORS[i % 4] }}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/routes/committee-details.tsx
git commit -m "feat: implement Committee Details page"
```

---

## Task 25: BOD Route

**Files:**
- Create: `src/routes/bod.tsx`

- [ ] **Step 1: Create `src/routes/bod.tsx`**

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
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

function BODPage() {
  const [search, setSearch] = useState('')
  const { data: clubs, isLoading, isError } = useClubsBOD(GROUP_ID, YEAR)

  const filtered = useMemo(() => {
    if (!clubs) return []
    const q = search.toLowerCase()
    if (!q) return clubs.filter(c => c.President_member_name || c.Secreatary_member_name)
    return clubs.filter(c =>
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
        <div className="auto-container flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Rotary Clubs of 3170</h1>
          <button onClick={() => window.history.back()} className="theme-btn bg-white text-black">← Back</button>
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
              className="flex-1 py-2.5 text-sm bg-transparent border-none outline-none"
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
            <h2 className="text-2xl font-bold text-center mb-4 text-[#3b251a]">{cleanText(club.clubName)}</h2>

            {/* AG */}
            <div className="executive-card mb-4" style={{ backgroundColor: '#2F4366' }}>
              <div className="card-header-tab" style={{ backgroundColor: '#8D9FBE' }}>ASSISTANT GOVERNOR</div>
              <div className="p-3 m-2">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-full md:w-1/4 text-center">
                    <img
                      src={club.AG_Photo && club.AG_Photo !== 'null' ? club.AG_Photo : dummyImg}
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

            {/* President + Secretary */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-2">
                <div className="executive-card" style={{ backgroundColor: '#E59E2C' }}>
                  <div className="card-header-tab" style={{ backgroundColor: '#FFE8C4' }}>PRESIDENT</div>
                  <div className="p-3 m-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <img
                        src={club.President_Profile_Photo && club.President_Profile_Photo !== 'null' ? club.President_Profile_Photo : dummyImg}
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

              {/* QR + Link */}
              <div className="md:col-span-1 flex flex-col items-center">
                <div className="executive-card w-full text-center p-4" style={{ backgroundColor: '#2F4366' }}>
                  <button
                    onClick={() => navigate({ to: '/club-details', search: { groupId: club.grpID } })}
                    className="theme-btn w-full mb-3 text-xs"
                  >
                    TO KNOW MORE
                  </button>
                  <div className="text-white text-xs">Club ID: {club.grpID}</div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="executive-card" style={{ backgroundColor: '#E59E2C' }}>
                  <div className="card-header-tab" style={{ backgroundColor: '#FFE8C4' }}>SECRETARY</div>
                  <div className="p-3 m-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <img
                        src={club.Secreatary_Profile_Photo && club.Secreatary_Profile_Photo !== 'null' ? club.Secreatary_Profile_Photo : dummyImg}
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
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/routes/bod.tsx
git commit -m "feat: implement BOD page with club listings and search"
```

---

## Task 26: Digital Route

**Files:**
- Create: `src/routes/digital.tsx`

- [ ] **Step 1: Create `src/routes/digital.tsx`**

```tsx
import { createFileRoute, Link } from '@tanstack/react-router'
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
        style={{ backgroundImage: `url(${bannerImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="auto-container w-full">
          <div
            className="inline-block px-8 py-4 rounded-xl text-center"
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
            <Link to="/bod" className="club-crd w-full md:w-1/2">Rotary Clubs of Dist 3020</Link>
          </div>
          <div className="py-4 text-center mb-6">
            <h2 className="text-2xl font-bold text-[#3b251a]">District</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(data?.categories ?? []).map((committee, i) => (
              <Link
                key={committee.Fk_DistrictCommitteeID}
                to="/committee-details"
                search={{ committeeID: committee.Fk_DistrictCommitteeID, title: committee.name }}
                className="avenu-crd"
                style={{ backgroundColor: COMMITTEE_COLORS[i % 4] }}
              >
                {committee.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/routes/digital.tsx
git commit -m "feat: implement Digital directory page (2025-26)"
```

---

## Task 27: Build Verification

**Files:**
- No new files — verify everything compiles and builds

- [ ] **Step 1: Run full test suite**

```powershell
npm test
```

Expected: All tests pass with 0 failures.

- [ ] **Step 2: Run TypeScript check**

```powershell
npx tsc --noEmit
```

Expected: No errors. If errors appear, fix them before proceeding.

- [ ] **Step 3: Run production build**

```powershell
npm run build
```

Expected: `dist/` folder created. No build errors.

- [ ] **Step 4: Preview production build**

```powershell
npm run preview
```

Open `http://localhost:4173`. Test all routes:
- `/` — Homepage with hero + category cards
- `/about` — About page with map
- `/directory` — Executive committee cards + committee list
- `/executive-committee` — Deduplicated committee list
- `/directory` → click a committee → `/sub-committee?committeeId=X&name=Y` — sub-committee members
- `/bod` — Club listings with search
- `/club-details?groupId=XXXXX` — Club detail with accordions
- `/digital` — 2025-26 version

- [ ] **Step 5: Final commit**

```powershell
git add .
git commit -m "feat: complete React + TanStack conversion of Rotary District 3170 directory"
```

---

## Spec Corrections (discovered during planning)

The original spec listed 3 API hooks. After reading all HTML files, 5 are needed:

| Hook | Endpoint | Pages |
|---|---|---|
| `useDistrictCommittee` | `districtCommitteeList` | directory, executive-committee, digital |
| `useCommitteeDetails` | `districtCommitteeDetails/` | sub-committee, committee-details |
| `useClubDetails` | `Get_Clubs_BOD_Details` | club-details |
| `useClubMembers` | `GetClubMembers` | club-details |
| `useClubsBOD` | `Get_Clubs_BOD` | bod |

The `digital.html` page is the 2025-26 version of `directory.html` — same structure, different year filter (`2025-2026` vs `2026-2027`).

The `sub-committee.html` hash-based navigation is replaced by URL search params in `sub-committee.tsx` and `committee-details.tsx`.
