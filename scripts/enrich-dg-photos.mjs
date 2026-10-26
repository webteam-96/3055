// Enriches public/data/otherDistricts.json with DG + spouse PHOTOS, matched from the
// rizones directory API by each DG's phone number (`contact`).
//
// For every district in otherDistricts.json we fetch that district's directory
// (GET /api/district-directory/<districtNo>) — the SAME rizones endpoint the app uses
// for 3055; it serves every zone-4..8 district by number with the same shape — then find
// the member whose PrimaryMobileNumber (or SecondaryMobileNumber) equals the DG's
// `contact`, and read `ProfilePhotoPath` (the DG's photo) and `spousePhoto` (the spouse's,
// which lives ON the DG's own record). Placeholder paths (…/photoplaceholder.png, null,
// empty) are skipped so the card keeps its silhouette rather than showing a placeholder.
// Best-effort: a district that 401/404s or a DG not found is simply left without a photo.
//
// No DG data is added or removed — only optional `photo`/`spousePhoto` fields are filled
// in. resolveImg() turns these /Documents/… paths into rotaryindia.org URLs at render.
//
// Run (needs a valid token; the API CORS-whitelists only the deployed origin, but Node
// has no CORS, so a direct call works):
//   VITE_RZ_API_TOKEN=<jwt> node scripts/enrich-dg-photos.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const DATA = join(ROOT, 'public', 'data', 'otherDistricts.json')
const API = 'https://rizones45678.org/API/api/district-directory'
const YEAR = '2026-27'

const TOKEN = process.env.VITE_RZ_API_TOKEN
if (!TOKEN) {
  console.error('Set VITE_RZ_API_TOKEN=<jwt> (a valid rizones bearer token) and re-run.')
  process.exit(1)
}

const norm10 = (s) => String(s ?? '').replace(/\D/g, '').slice(-10)
// A usable photo path: non-empty, not the API's placeholder image.
const realPhoto = (p) => {
  const s = String(p ?? '').trim()
  return !s || s === 'null' || /placeholder/i.test(s) ? '' : s
}

// Walk the whole district response for the member with this mobile; return their
// {photo, spousePhoto}. Prefers a match that actually carries a profile photo.
function findByMobile(resp, mob10) {
  let hit = null
  ;(function walk(o) {
    if (o == null || (hit && hit.photo)) return
    if (Array.isArray(o)) return o.forEach(walk)
    if (typeof o === 'object') {
      if (norm10(o.PrimaryMobileNumber) === mob10 || norm10(o.SecondaryMobileNumber) === mob10) {
        const photo = realPhoto(o.ProfilePhotoPath || o.profilePhoto)
        const spousePhoto = realPhoto(o.spousePhoto)
        if (!hit || (photo && !hit.photo)) hit = { photo, spousePhoto, name: o.MemberName }
      }
      for (const k of Object.keys(o)) walk(o[k])
    }
  })(resp)
  return hit
}

const districts = JSON.parse(readFileSync(DATA, 'utf8'))
let photosFound = 0
let dgsMatched = 0

for (const d of districts) {
  let resp = null
  try {
    const r = await fetch(`${API}/${d.districtNo}?rotaryYear=${YEAR}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
    if (r.ok) resp = await r.json()
    else console.warn(`  district ${d.districtNo}: HTTP ${r.status} — skipped`)
  } catch (e) {
    console.warn(`  district ${d.districtNo}: ${e.message} — skipped`)
  }

  for (const key of ['dgThisYear', 'dgNextYear']) {
    const p = d[key]
    delete p.photo
    delete p.spousePhoto // start clean so a rerun reflects the current API
    if (!resp) continue
    const hit = findByMobile(resp, norm10(p.contact))
    if (!hit) continue
    dgsMatched++
    if (hit.photo) { p.photo = hit.photo; photosFound++ }
    if (hit.spousePhoto) { p.spousePhoto = hit.spousePhoto; photosFound++ }
  }
  console.log(`district ${d.districtNo}: done`)
}

writeFileSync(DATA, JSON.stringify(districts, null, 2) + '\n')
console.log(`\nWrote ${DATA}\nDGs matched: ${dgsMatched}/${districts.length * 2}, photos filled: ${photosFound}`)
