// People shown on the "Profile & Message" page. This is the single source of
// truth — the user supplies this data.
//
// The /message page lists one card per person (by name). Clicking a card opens
// that person's detail page (/message-details), which shows their Profile and
// Message — each rendered the same way: photo on the left → name + designation
// → content below.
//
// Tips:
//   - A person can have a `profile`, a `message`, or both (omit either).
//   - Use \n\n inside content for paragraph breaks.
//   - Leave `photo` as '' to show the placeholder image until a real URL is given.
export interface Person {
  name: string
  designation: string
  photo: string
  profile?: string
  message?: string
}

// TODO: Replace these placeholders with the real people/content once shared.
export const PEOPLE: Person[] = [
  {
    name: 'Naimish N. Ravani',
    designation: 'District Governor 2026-27',
    photo: '',
    profile: 'Placeholder profile content. Share the real bio and photo and I will drop it in here.',
    message: 'Placeholder message content. Share the real message text and I will replace this.',
  },
]
