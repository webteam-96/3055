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
  // Add more static categories below as they are provided, e.g.:
  // { name: 'District Vision', to: '/vision' },
]
