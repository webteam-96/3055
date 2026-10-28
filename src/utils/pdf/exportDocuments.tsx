import { PEOPLE } from '../../data/profileMessages'
import { ReferenceTitlePage } from '../../components/ReferencePage'
import { PersonalProfilePage } from '../../components/PersonalProfilePage'
import { PersonDoc } from '../../components/PersonDoc'
import { IndexPage, tocKey, type PageMap } from '../../routes/contents'
import { FounderPage } from '../../routes/founder'
import { ZonesDistrictsPage } from '../../routes/zones-districts'
import { RotaryLeadersZone4Page } from '../../routes/rotary-leaders-zone4'
import { RiSouthAsiaOfficePage } from '../../routes/ri-south-asia-office'
import { ClubExcellenceAwardPage } from '../../routes/club-excellence-award'
import { RotaryProtocolPage } from '../../routes/rotary-protocol'
import { DonorsPage } from '../../routes/donors'
import { RotaryInformationPage } from '../../routes/rotary-information'
import { PresidentialMessagePage, NirmanThemePage } from '../../routes/message-and-theme'
import { MyJourneyPage } from '../../routes/my-journey'
import { RotaryClubSupremePage } from '../../routes/rotary-club-supreme'
import { DistrictGoalsPage } from '../../routes/district-goals'
import { buildSeparatedDocs, type NamedDoc } from './committeeSeparators'
import type { CombinedDoc } from './downloadCombinedPdf'
import {
  fetchDistrictDirectory,
  selectCategories,
  selectCommitteeDetails,
  selectClubsBOD,
  selectMemberPhotos,
} from '../../api/districtDirectory'
import { expandDesignation } from '../formatDate'
import { CommitteeDirectory } from '../../components/CommitteeDirectory'
import { ZonalTeamDirectory } from '../../components/ZonalTeamDirectory'
import { DirectorySheet } from '../../components/DirectorySheet'
import { ClubBODCard } from '../../components/ClubBODCard'
import { orderClubsByZone } from '../../data/zoneClubOrder'
import { DgOtherDistricts } from '../../components/DgOtherDistricts'
import { BirthdayPages } from '../../components/BirthdayPages'
import { BibliographyPages } from '../../components/BibliographyPages'
import type { PeopleCollector } from './collectPeople'
import { COUNCIL_OF_GOVERNORS, cogWithApiPhotos } from '../../data/councilOfGovernors'
import type { DistrictCommitteeMember } from '../../types/api'
import { SheetBg } from '../../components/SheetBg'
import { SECTION_BG, sheetBgForCommitteeName } from '../../data/sectionColors'

// Wrap a document's element so its framed sheets render on the given section tint.
// (The border frames are transparent inside; the sheet paints its own background.)
const withBg = (color: string, doc: CombinedDoc): CombinedDoc => ({
  ...doc,
  element: <SheetBg color={color}>{doc.element}</SheetBg>,
})

// The reference / leader pages paginate asynchronously (they measure their content
// and set the sheet count over ~400-500ms), so give them room to settle before we
// capture. Plain single-sheet covers settle almost instantly.
const REF_SETTLE = 900
const COVER_SETTLE = 350
// Directory sheets are static layouts; a small settle covers font/image loading.
const DIR_SETTLE = 250

/**
 * Every built STATIC page, in the book/reading order defined by
 * "Format for the Download all.txt" (the client's ordering for the printed book).
 * Only the pages we actually have are included — sections listed in that file but
 * not built yet (My Journey, Pictures of fellowship, Rotary Club of Supreme, COGs,
 * District Administration, DOBs, Bibliography, …) are simply skipped: "use the pages
 * we have and leave the ones which we don't have." Each entry renders the very same
 * component the live route renders, so the PDF matches the on-screen pages 1:1.
 * (The order can be revised later — the format file is the current source of truth.)
 */
export function buildStaticDocuments(): CombinedDoc[] {
  const docs: CombinedDoc[] = []
  const add = (section: number, label: string, element: CombinedDoc['element'], settleMs = REF_SETTLE) =>
    docs.push(withBg(SECTION_BG[section], { label, element, settleMs }))

  // Front matter (section 1).
  add(1, 'Founder of Rotary', <FounderPage />)
  add(1, 'Rotary Zones & Districts', <ZonesDistrictsPage />)
  add(1, 'Index', <IndexPage />)

  // Our Leaders: Profiles & Messages (section 3) — section cover, each person's Profile +
  // Message, then the Rotary Leaders from Zone 4 table (the last item under this heading).
  add(3, 'Profile & Message', <ReferenceTitlePage title="PROFILE & MESSAGE" pageIndex={0} />, COVER_SETTLE)
  for (const person of PEOPLE) {
    if (person.profile || person.message) add(3, person.name, <PersonDoc person={person} />)
  }
  add(3, 'Rotary Leaders from Zone 4', <RotaryLeadersZone4Page />)

  // Club Tool-Kit (section 9) — the built subset, in the format file's order.
  add(9, "RI President's Club Excellence Award", <ClubExcellenceAwardPage />)
  add(9, 'Rotary Protocol & Decorum', <RotaryProtocolPage />)
  add(9, 'Donors from RI District 3055', <DonorsPage />)
  add(9, 'Rotary International South Asia Office', <RiSouthAsiaOfficePage />)

  // Rotary Information (section 10) — renders its own section cover + all its sheets.
  add(10, 'Rotary Information', <RotaryInformationPage />)

  return docs
}

/**
 * Every DYNAMIC (API-driven) directory document — committees, sub-committees, clubs,
 * assistant governors, DGs of other districts — reusing the exact same builder as the
 * directory ZIP export. The committee section is re-ordered to follow the client's
 * Directory format sheet: only the sheet's main titles are included, in its order,
 * each preceded by a recto title page; sub-committees continue unchanged; the
 * Executive Committee / Clubs / AGs / DGs documents keep their positions. See
 * {@link reorderCommitteeDocs}.
 */
export async function buildDynamicDocuments(): Promise<CombinedDoc[]> {
  const data = await fetchDistrictDirectory()
  const expandRoles = (members: DistrictCommitteeMember[]) =>
    members.map((m) => ({ ...m, DistrictDesignation: expandDesignation(m.DistrictDesignation || '') }))

  // Each API committee, rendered exactly like its individual print (sub-committee.tsx
  // print view): the committee's own members, then every sub-committee as its own
  // titled section, all in ONE CommitteeDirectory so CommitteeDirectory.paginate()
  // packs them CONTINUOUSLY across sheets — no page break between a committee and its
  // sub-committees (this is what "sub-committee in continuation" means).
  const committees: NamedDoc[] = selectCategories(data)
    .map((cat) => {
      const det = selectCommitteeDetails(data, cat.Fk_DistrictCommitteeID)
      const sections = [
        ...(det.directMembers.length ? [{ title: cat.name, members: expandRoles(det.directMembers) }] : []),
        ...det.subCommittees
          .map((sub) => ({
            title: sub.name,
            members: expandRoles(
              det.subCommitteeMembers.filter(
                (m) => String(m.fk_District_sub_Committee_id) === String(sub.pk_District_sub_Committee_id),
              ),
            ),
          }))
          .filter((s) => s.members.length > 0),
      ]
      return { name: cat.name, sections }
    })
    .filter((c) => c.sections.length > 0)
    .map((c) => {
      // The Zonal Team renders exactly like its individual print (sub-committee.tsx):
      // each zone as its own Assistant-Governors-style sheet (ZonalTeamDirectory), not
      // the generic committee layout. Every other committee — including Regional
      // Co-ordinators — uses CommitteeDirectory.
      const isZonal = /^zonal team/i.test(c.name)
      return {
        name: c.name,
        element: isZonal ? (
          <>
            {c.sections.map((s, i) => (
              <ZonalTeamDirectory key={i} zoneName={s.title} members={s.members} mode="print" />
            ))}
          </>
        ) : (
          <CommitteeDirectory sections={c.sections} mode="print" />
        ),
        settleMs: DIR_SETTLE,
      }
    })

  // Static pages that fulfil a sheet title (matched by exact normalized name). The
  // Council of Governors is not an API committee — it renders from COUNCIL_OF_GOVERNORS
  // through the same card path as the /council-of-governors page. NB: the `name` MUST
  // equal the separator title "Council of Governors" (buildSeparatedDocs matches
  // statics by `norm(name) === norm(title)`); a shorthand like "COGs" would not match
  // and the section would silently drop out of the Download-All PDF.
  const statics: NamedDoc[] = []
  if (COUNCIL_OF_GOVERNORS.length) {
    statics.push({
      name: 'Council of Governors',
      element: (
        <CommitteeDirectory sections={[{ title: 'Council of Governors', members: cogWithApiPhotos(selectMemberPhotos(data)) }]} mode="print" />
      ),
    })
  }

  // Merge Regional Co-ordinators + Zonal Teams under ONE combined title page — exactly
  // like the 2025-26 directory's single "Regional Coordinators, Assistant Governors &
  // Zone Leaders" divider (one title page + subtitle, then both sections' content in
  // sequence). Drop the second (Zonal Teams) title page so the two flow together.
  const COMBINED_TITLE = 'Regional Coordinators, Assistant Governors & Zone Leaders'
  const COMBINED_SUBTITLE =
    'The Assistant Governor serves as an important resource for both the clubs and the District Governor, ' +
    'helping to ensure smooth running of the district. The relation they built with club leaders make Rotary stronger.'
  const merged: CombinedDoc[] = []
  for (const d of buildSeparatedDocs(committees, statics)) {
    if (d.label === 'Title — Zonal Teams') continue // second title page removed
    if (d.label === 'Title — Regional Co-ordinators') {
      merged.push({
        label: `Title — ${COMBINED_TITLE}`,
        element: <ReferenceTitlePage title={COMBINED_TITLE.toUpperCase()} subtitle={COMBINED_SUBTITLE} pageIndex={0} />,
        settleMs: COVER_SETTLE,
        startOnRight: true,
        isTitlePage: true,
      })
      continue
    }
    merged.push(d)
  }

  // Each doc's label is its separator title (bare, or "Title — X" for a title page),
  // which maps to the committee's section (Council of Governors → 4; admin committees
  // → 5; avenues/focus committees → 6; Regional/Zonal → 7). Tint each accordingly.
  return merged.map((d) => withBg(sheetBgForCommitteeName(d.label), d))
}


function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/**
 * "Rotary Clubs of District 3055" — the /bod section, rebuilt for the book: a recto
 * title page then the board-of-directors sheets (two clubs per sheet, alternating
 * verso/recto starting on the left, exactly like the live /bod print). Clubs with NO
 * officer info at all (neither a President nor a Secretary name) are hidden — the same
 * rule the /bod page and the ZIP export use.
 */
async function buildClubDocuments(): Promise<CombinedDoc[]> {
  const data = await fetchDistrictDirectory()
  const clubs = selectClubsBOD(data).filter(
    (c) => Boolean((c.President_member_name ?? '').trim()) || Boolean((c.Secreatary_member_name ?? '').trim()),
  )
  if (!clubs.length) return []
  // Zone-wise ORDER (same as the live /bod section): zone 1's clubs first, then zone 2's,
  // … then any unlisted club. No zone headings — two cards per sheet, like before.
  const sheets = chunk(orderClubsByZone(clubs), 2).map((pair, i) => (
    <DirectorySheet key={i} pageNumber={i + 2} side={i % 2 === 0 ? 'left' : 'right'}>
      <div className="dir-clubs">
        {pair.map((club) => (
          <ClubBODCard key={club.grpID} club={club} />
        ))}
      </div>
    </DirectorySheet>
  ))
  return [
    {
      label: 'Rotary Clubs of District 3055',
      element: <ReferenceTitlePage title="ROTARY CLUBS OF DISTRICT 3055" pageIndex={0} />,
      settleMs: COVER_SETTLE,
      startOnRight: true,
      isTitlePage: true,
    },
    { label: 'Rotary Clubs — cards', element: <>{sheets}</>, settleMs: DIR_SETTLE },
  ].map((d) => withBg(SECTION_BG[8], d))
}

/** "District Governors: Zone 4,5,6 & 7" — the DGs of the other districts (static JSON),
 *  the same component the /dg-other-districts print uses. Opens on a recto page. */
async function buildDgZoneDocuments(): Promise<CombinedDoc[]> {
  try {
    const districts = await (await fetch('/data/otherDistricts.json')).json()
    if (!Array.isArray(districts) || !districts.length) return []
    // Recto title page, then the DG sheets (same pattern as the Clubs section). The
    // title page carries startOnRight, so downloadCombinedPdf inserts a blank verso
    // before it when needed — no blank page has to be added by hand.
    return [
      {
        label: 'District Governors — Other Districts',
        element: <ReferenceTitlePage title="DISTRICT GOVERNORS — OTHER DISTRICTS" subtitle="Zone 4, 5, 6 & 7" pageIndex={0} />,
        settleMs: COVER_SETTLE,
        startOnRight: true,
        isTitlePage: true,
      },
      {
        label: 'District Governors: Zone 4,5,6 & 7',
        element: <DgOtherDistricts districts={districts} mode="print" />,
        settleMs: DIR_SETTLE,
      },
    ].map((d) => withBg(SECTION_BG[11], d))
  } catch {
    return []
  }
}

/**
 * The whole book, in the client's "Download all" order (see the format list): front
 * matter, My Journey, Our Leaders, then the API directory (Council of Governors +
 * committees, then the clubs), the Club Tool-Kit static pages, Rotary Information, and
 * finally the other-district DGs. Only the pages we actually have are included — listed
 * sections not built yet (Pictures of fellowship, some Club Tool-Kit items, DOBs,
 * Bibliography, …) are simply absent.
 *
 * RECTO RULE: every section opens on a right-hand (recto) page — `startOnRight` on the
 * first document of each section. `downloadCombinedPdf` inserts a blank page before it
 * whenever it would otherwise fall on a left-hand (verso) page, so no title/opener page
 * ever lands on the left. The committee title pages carry their own `startOnRight`
 * (see buildSeparatedDocs), so each committee opener is recto too.
 */
export async function buildMasterDocuments(): Promise<CombinedDoc[]> {
  const docs: CombinedDoc[] = []
  const recto = (d: CombinedDoc): CombinedDoc => ({ ...d, startOnRight: true })

  // --- Personal Profile (page 1): the blank hand-fill form. Recto, so it is page 1; the
  // next document (Founder, also recto) then forces a padding page at page 2, which the ad
  // pipeline fills with a full-page advertisement. noOverlay keeps the form's ruled lines
  // clear of any ad/filler. ---
  docs.push(recto(withBg(SECTION_BG[1], { label: 'Personal Profile', element: <PersonalProfilePage />, settleMs: COVER_SETTLE, noOverlay: true })))

  // --- Front matter (section 1; My Journey is section 2; each opens recto) ---
  docs.push(recto(withBg(SECTION_BG[1], { label: 'Founder of Rotary', element: <FounderPage />, settleMs: REF_SETTLE })))
  // The RI Presidential Message and the District Theme (NIRMAN) are pushed as TWO
  // separate recto documents (not one combined doc) so NIRMAN opens on a right-hand
  // page: the recto flag forces a padding page before it, which the ad pipeline fills
  // with a full-page advertisement on the facing left page.
  docs.push(recto(withBg(SECTION_BG[1], { label: 'RI Presidential Message', element: <PresidentialMessagePage />, settleMs: REF_SETTLE })))
  docs.push(recto(withBg(SECTION_BG[1], { label: 'District Theme — NIRMAN', element: <NirmanThemePage />, settleMs: REF_SETTLE })))
  docs.push(recto(withBg(SECTION_BG[1], { label: 'Rotary Zones & Districts', element: <ZonesDistrictsPage />, settleMs: REF_SETTLE })))
  docs.push(recto(withBg(SECTION_BG[1], { label: 'Index', element: <IndexPage />, settleMs: REF_SETTLE })))
  docs.push(recto(withBg(SECTION_BG[2], { label: 'My Journey — DG Naimish N. Ravani', element: <MyJourneyPage />, settleMs: REF_SETTLE })))

  // --- Our Leaders: Profiles & Messages (section 3) ---
  docs.push(recto(withBg(SECTION_BG[3], { label: 'Profile & Message', element: <ReferenceTitlePage title="PROFILE & MESSAGE" pageIndex={0} />, settleMs: COVER_SETTLE, isTitlePage: true })))
  // Protocol order for the leaders' profiles/messages (the client's "Download all" order).
  // People are matched by name; anyone in PEOPLE not listed here is appended after (safety).
  // The two RIDE (RI Director ELECT, Zone 4&7 / 5&6) slots have no profile data yet, so they
  // are simply absent here (and show a dash in the Index until their data is added).
  const PROFILE_ORDER = [
    'Olayinka Hakeem Babalola', // RI President
    'Naimish N. Ravani', // District Governor
    'Rtn. Dr. Geetika Saluja', // Editorial (District Directory Committee Chair)
    'Rtn. A.S. Venkatesh (Venky)', // Trustee, The Rotary Foundation 2026-30
    'K. P. Nagesh', // RI Director, Zone 4 & 7
    'Muruganandam M', // RI Director, Zone 5 & 6
    'Gurjeet S. Sekhon', // RIDE Zone 4 & 7
    'Basu Dev Golyan', // RIDE Zone 5 & 6
    'Rtn. Dr. J. P. Vyas', // DLF
    'Rtn. K.A. Shyam Kumar', // DGE
    'Rtn. Vikram Thakkar', // DGN
    'PHF Rtr. Aneri Bhatt', // DRR
    'Varsha Bhavesh Shah', // IWSC
  ]
  const rank = (name: string) => {
    const i = PROFILE_ORDER.indexOf(name)
    return i < 0 ? PROFILE_ORDER.length : i
  }
  const orderedPeople = [...PEOPLE].sort((a, b) => rank(a.name) - rank(b.name))
  for (const person of orderedPeople) {
    if (person.profile || person.message) docs.push(withBg(SECTION_BG[3], { label: person.name, element: <PersonDoc person={person} />, settleMs: REF_SETTLE }))
  }
  docs.push(withBg(SECTION_BG[3], { label: 'Rotary Leaders from Zone 4', element: <RotaryLeadersZone4Page />, settleMs: REF_SETTLE }))

  // --- Rotary Club of Ahmedabad Supreme (section 3) ---
  // fillerOnly: its 2nd sheet (the write-up overflow) has an empty bottom — the client wants
  // a FILLER there, not an advertisement. Page 1 fills with text (no gap), so this only
  // affects page 2.
  docs.push(recto(withBg(SECTION_BG[3], { label: 'Rotary Club of Supreme', element: <RotaryClubSupremePage />, settleMs: REF_SETTLE, fillerOnly: true })))

  // --- Council of Governors + all committees (sections 4-6; each already opens on a recto title page, tinted in buildDynamicDocuments) ---
  docs.push(...(await buildDynamicDocuments()))

  // --- Rotary Clubs of District 3055 (section 8; recto title page + club sheets) ---
  docs.push(...(await buildClubDocuments()))

  // --- Club Tool-Kit (section 9; the built subset, in the format order) ---
  docs.push(recto(withBg(SECTION_BG[9], { label: "RI President's Club Excellence Award", element: <ClubExcellenceAwardPage />, settleMs: REF_SETTLE })))
  docs.push(withBg(SECTION_BG[9], { label: 'District Goals', element: <DistrictGoalsPage />, settleMs: REF_SETTLE }))
  docs.push(withBg(SECTION_BG[9], { label: 'Rotary Protocol & Decorum', element: <RotaryProtocolPage />, settleMs: REF_SETTLE }))
  docs.push(withBg(SECTION_BG[9], { label: 'Donors from RI District 3055', element: <DonorsPage />, settleMs: REF_SETTLE }))
  docs.push(withBg(SECTION_BG[9], { label: 'Rotary International South Asia Office', element: <RiSouthAsiaOfficePage />, settleMs: REF_SETTLE }))

  // --- Rotary Information (section 10; renders its own recto section cover) ---
  // noOverlay: this doc's first sheet is a ReferenceTitlePage cover nested INSIDE the
  // component, so the per-sheet overlay can't see it's a title page via the doc's
  // isTitlePage flag. Excluding the whole doc keeps an ad/filler off that title page (its
  // content sheets are dense reference material that wouldn't take a filler anyway).
  docs.push(recto(withBg(SECTION_BG[10], { label: 'Rotary Information', element: <RotaryInformationPage />, settleMs: REF_SETTLE, noOverlay: true })))

  // --- District Governors: Zone 4,5,6 & 7 ---
  docs.push(...(await buildDgZoneDocuments()))

  return docs
}

/**
 * The back-matter appendix — the LAST two sections in the client's "Download all" order:
 * "DOBs" (everyone's birthday, month-wise) then "Bibliography" (every person A → Z with the
 * page numbers they appear on). Built from the people collected while the content pages were
 * rasterized (see downloadCombinedPdf / collectPeople), so it can't be a pre-built document —
 * `downloadCombinedPdf` calls this AFTER the content + ads, once every page number is final.
 */
/** Build the {tocKey → page} lookup from the collected {documentLabel → startPage} map, then
 *  render the Index with REAL page numbers (master export TOC overdraw — see downloadCombinedPdf).
 *  A committee's section opener is its "Title — <name>" doc, so that name is keyed too. */
export function renderTocElement(sectionPages: Record<string, number>) {
  const map: PageMap = {}
  const add = (k: string, page: number) => {
    if (k && !(k in map)) map[k] = page
  }
  for (const [label, page] of Object.entries(sectionPages)) {
    add(tocKey(label), page)
    if (label.startsWith('Title — ')) add(tocKey(label.slice('Title — '.length)), page)
  }
  return (
    <SheetBg color={SECTION_BG[1]}>
      <IndexPage pageMap={map} />
    </SheetBg>
  )
}

export function buildAppendixDocuments(collector: PeopleCollector): CombinedDoc[] {
  const people = collector.list()
  if (!people.length) return []
  return [
    { label: 'DOBs', element: <BirthdayPages months={collector.byMonth()} />, settleMs: DIR_SETTLE },
    // Bibliography follows the ads directly (no recto padding): it starts on whatever page
    // comes next — left (verso) or right (recto) — so there's no filler page before it.
    { label: 'Bibliography', element: <BibliographyPages entries={people} />, settleMs: DIR_SETTLE },
  ].map((d) => withBg(SECTION_BG[1], d))
}
