// Static (non-API) categories shown when you click the "Rotary District 3055"
// card on the home page. This is the single source of truth — add a new entry
// here as each category is finalised and it appears as a card automatically.
//
//   name: label shown on the card
//   to:   route it links to (create the matching page under src/routes/)
export interface StaticCategory {
  name: string
  to: string
}

export const STATIC_CATEGORIES: StaticCategory[] = [
  { name: 'Profile & Message', to: '/message' },
  { name: 'Message and Theme', to: '/message-and-theme' },
  { name: 'Rotary Club of Ahmedabad Supreme', to: '/rotary-club-supreme' },
  { name: 'My Journey - DG Naimish N Ravani', to: '/my-journey' },
  { name: 'Founder of Rotary', to: '/founder' },
  { name: 'Rotary Zones & Districts', to: '/zones-districts' },
  { name: 'Rotary Leaders from Zone 4', to: '/rotary-leaders-zone4' },
  { name: 'District Goals', to: '/district-goals' },
  { name: 'Rotary International South Asia Office', to: '/ri-south-asia-office' },
  { name: "RI President's Club Excellence Award", to: '/club-excellence-award' },
  { name: 'Rotary Protocol & Decorum', to: '/rotary-protocol' },
  { name: 'Donors from RI District 3055', to: '/donors' },
  { name: 'Rotary Information', to: '/rotary-information' },
]
