# Design: Convert Static HTML Site to React + TanStack

**Date:** 2026-05-05
**Project:** Rotary District 3170 Digital Directory
**Source:** `old/` folder (static HTML/Bootstrap/jQuery)
**Target:** React 18 + TypeScript + TanStack Router + TanStack Query + Tailwind CSS

---

## 1. Overview

Convert a 9-page static HTML website for the Rotary District 3170 Digital Directory into a modern React SPA. The site fetches live member and club data from `rotaryindiaapi.rosteronwheels.com` via POST requests. The new stack replaces jQuery DOM manipulation and manual fetch calls with React components and TanStack Query, while preserving all existing UI patterns, colors, and functionality.

---

## 2. Stack

| Concern | Decision |
|---|---|
| Bundler | Vite |
| Framework | React 18 + TypeScript |
| Routing | TanStack Router (file-based) |
| Data fetching | TanStack Query (3 custom hooks) |
| Styling | Tailwind CSS v3 |
| Icons | Font Awesome 6 via CDN |
| Fonts | Google Fonts via CDN |
| Assets | Copied from `old/assets/images/` and `old/assets/fonts/` |

No Bootstrap. No jQuery. No Next.js.

---

## 3. Project Structure

```
3055/
├── src/
│   ├── routes/
│   │   ├── __root.tsx               # Root layout: Header + Footer + <Outlet />
│   │   ├── index.tsx                # Homepage (/)
│   │   ├── about.tsx                # About (/about)
│   │   ├── directory.tsx            # Digital Directory (/directory)
│   │   ├── club-details.tsx         # Club Details (/club-details?groupId=X)
│   │   ├── committee-details.tsx    # Committee Details (/committee-details)
│   │   ├── executive-committee.tsx  # Executive Committee (/executive-committee)
│   │   ├── sub-committee.tsx        # Sub Committees (/sub-committee)
│   │   ├── digital.tsx              # Digital (/digital)
│   │   └── bod.tsx                  # BOD (/bod)
│   ├── components/
│   │   ├── Header.tsx               # Logo + nav + mobile menu
│   │   ├── Footer.tsx               # Logos + copyright
│   │   ├── Preloader.tsx            # Animated boxes loader
│   │   ├── MemberCard.tsx           # Reusable member/executive card
│   │   └── ClubCard.tsx             # Colored navigation category card
│   ├── api/
│   │   ├── queryClient.ts           # QueryClient with 5min staleTime
│   │   ├── useDistrictCommittee.ts  # Hook for committee list + members
│   │   ├── useClubDetails.ts        # Hook for club BOD/president/secretary
│   │   └── useClubMembers.ts        # Hook for club member list
│   ├── types/
│   │   └── api.ts                   # TypeScript types for all API responses
│   ├── utils/
│   │   └── formatDate.ts            # formatDateToDDMM utility
│   ├── assets/
│   │   ├── images/                  # Copied from old/assets/images/
│   │   └── fonts/                   # Copied from old/assets/fonts/
│   └── main.tsx
├── public/
├── index.html                       # CDN links: Font Awesome, Google Fonts
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## 4. Route Mapping

| Old HTML file | New Route | URL path |
|---|---|---|
| `index.html` | `routes/index.tsx` | `/` |
| `about.html` | `routes/about.tsx` | `/about` |
| `directory.html` | `routes/directory.tsx` | `/directory` |
| `club-details.html?groupId=X` | `routes/club-details.tsx` | `/club-details?groupId=X` |
| `committee-details.html` | `routes/committee-details.tsx` | `/committee-details` |
| `executive-committee.html` | `routes/executive-committee.tsx` | `/executive-committee` |
| `sub_committee.html` | `routes/sub-committee.tsx` | `/sub-committee` |
| `digital.html` | `routes/digital.tsx` | `/digital` |
| `bod.html` | `routes/bod.tsx` | `/bod` |

The `__root.tsx` layout renders `Header`, `Footer`, and `<Outlet />`. All pages inherit this layout automatically.

---

## 5. API Hooks (TanStack Query)

### `useDistrictCommittee(groupID, yearfilter)`
- **Endpoint:** `POST /api/DistrictCommittee/districtCommitteeList`
- **Body:** `{ groupID: '34307', searchText: '', yearfilter: '2026-2027' }`
- **Returns:** `{ members, categories }`
- **Used by:** `directory.tsx`, `executive-committee.tsx`, `digital.tsx`

### `useCommitteeDetails(committeeId, groupID)`
- **Endpoint:** `POST /api/DistrictCommittee/districtCommitteeDetails/`
- **Body:** `{ DistrictCommitteID: committeeId, groupID }`
- **Returns:** `{ subCommittees, subCommitteeMembers, directMembers }`
- **Used by:** `sub-committee.tsx`, `committee-details.tsx`

### `useClubDetails(groupId, financialyear)`
- **Endpoint:** `POST /api/District/Get_Clubs_BOD_Details`
- **Body:** `{ groupId, financialyear }`
- **Returns:** `{ basicInfo, ag, president, secretary, bod, presidentPhoto }`
- **Used by:** `club-details.tsx`

### `useClubMembers(grpID, financialyear)`
- **Endpoint:** `POST /api/FindClub/GetClubMembers`
- **Body:** `{ grpID, searchText: '', financialyear }`
- **Returns:** array of members
- **Used by:** `club-details.tsx`

### `useClubsBOD(groupId, financialyear)`
- **Endpoint:** `POST /api/District/Get_Clubs_BOD`
- **Body:** `{ groupId, financialyear }`
- **Returns:** array of `ClubBODSummary` (club + President + Secretary + AG)
- **Used by:** `bod.tsx`

### QueryClient config
```ts
new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } }
})
```
5-minute cache prevents redundant API calls when navigating back to previously visited pages.

---

## 6. Components

### `MemberCard.tsx`
Reusable card for executive members, BOD members, president, secretary, and regular members.

Props:
```ts
interface MemberCardProps {
  name: string
  designation: string
  club: string
  mobile: string
  email: string
  dob: string
  doa: string
  address: string
  photo: string
  headerColor: string  // e.g. '#E8D8CE'
  bodyColor: string    // e.g. '#372616'
}
```

Color scheme (rotated by index):
- Header colors: `['#E8D8CE', '#FFE8C4', '#8D9FBE', '#88BAB5']`
- Body colors: `['#372616', '#E59E2C', '#2F4366', '#2F5755']`

### `ClubCard.tsx`
The colored category navigation cards.
```ts
interface ClubCardProps {
  label: string
  href: string
  bgColor: string
}
```

### `Header.tsx`
- Logos: `logo1.png` + `phoenix-1.png`
- Nav links: HOME `/`, CALENDAR (external), DISTRICT WEBSITE (external), DIGITAL DIRECTORY `/directory`
- Mobile menu: toggled via `useState`, no jQuery
- Sticky behavior: scroll listener via `useEffect`
- Active link highlight: TanStack Router's `Link` component with `activeProps`

### `Preloader.tsx`
Shown when `isLoading === true` from any query. Hidden once data resolves. Same animated boxes markup as original.

---

## 7. TypeScript Types (`src/types/api.ts`)

```ts
interface DistrictCommitteeMember {
  DistrictDesignation: string
  name: string
  ClubName: string
  MobileNumber: string
  BloodGroup: string
  MailID: string
  Address: string
  DOB: string
  DOA: string
  RotaryID: string
  img: string
  SpouseName: string
  Spouse_Mobile_Number: string
}

interface CommitteeCategory {
  Fk_DistrictCommitteeID: string
  name: string
}

interface ClubBasicInfo {
  Club_Name: string
  Club_ID: string
  Charter_Date: string
  Membership: string
}

interface ClubPresident {
  President_name: string
  President_photo: string
  Mobile_number: string
  President_DOB: string
  President_EmialID: string
  DOA: string
  address: string
}

interface ClubSecretary {
  Secretary_name: string
  Secretary_photo: string
  Mobile_number: string
  Secretary_DOB: string
  Secretary_EmialID: string
  DOA: string
  address: string
}

interface ClubBODMember {
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

interface ClubAG {
  Name: string
  Designation: string
  Mobile_number: string
  Emailid: string
  member_date_of_birth: string
}

interface ClubMember {
  memberName: string
  membermobile: string
  designation: string
  pic: string
  groupName: string
  MemberDOB: string
  MemberDOA: string
  MemberEmail: string
  MemberAddress: string
}
```

---

## 8. Behavioral Changes from Old Site

| Old behavior | New behavior |
|---|---|
| `localStorage` for committee data | TanStack Query cache |
| `#hash` anchor for sub-committee nav | URL search params |
| jQuery mobile menu toggle | React `useState` |
| `javascript:history.back()` | TanStack Router `useNavigate(-1)` |
| Re-fetches on every page load | 5-min Query cache |
| Duplicate `fetch` calls across pages | Shared Query hooks |
| Inline `<script>` tags in HTML | React components + hooks |

---

## 9. Error & Loading States

Every API-driven page handles three states:

- **Loading:** `<Preloader />` component displayed
- **Error:** Inline message `"Failed to load data."` (matches old site)
- **Empty:** Inline message `"No members found."` (matches old site)

---

## 10. Out of Scope

- No backend changes — all API endpoints remain unchanged
- No new pages beyond the existing 9
- No authentication layer
- No new features beyond what the old site had
