import { Fragment, type ReactElement } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import {
  fetchDistrictDirectory,
  selectExecutiveCommittee,
  selectCategories,
  selectCommitteeDetails,
  selectClubsBOD,
} from '../../api/districtDirectory'
import { expandDesignation } from '../formatDate'
import { CommitteeDirectory } from '../../components/CommitteeDirectory'
import { DirectorySheet } from '../../components/DirectorySheet'
import { ClubBODCard } from '../../components/ClubBODCard'
import { orderClubsByZone } from '../../data/zoneClubOrder'
import { AgZoneDirectory } from '../../components/AgZoneDirectory'
import { DgOtherDistricts } from '../../components/DgOtherDistricts'
import type { DistrictCommitteeMember } from '../../types/api'
import { withOffscreen } from './renderOffscreen'
import { inlineImages, rasterizeBackgrounds, waitForImages, sheetsToPdfBlob } from './captureToPdf'

export type ProgressCallback = (label: string, current: number, total: number) => void

export interface ExportDoc {
  path: string // folder path + filename inside the zip
  element: ReactElement
}

// Strip characters that are illegal in file/folder names across OSes.
function safeName(name: string): string {
  return (name || 'Untitled').replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Untitled'
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}


const expandRoles = (members: DistrictCommitteeMember[]) =>
  members.map((m) => ({ ...m, DistrictDesignation: expandDesignation(m.DistrictDesignation || '') }))

/** Build the full list of directory documents (with their zip folder paths, which
 *  the combined-PDF export reuses as section labels). Shared by the ZIP export and
 *  the "Download All (PDF)" / master PDF so the two never diverge. */
export async function buildDirectoryDocuments(): Promise<ExportDoc[]> {
  const data = await fetchDistrictDirectory()
  const docs: ExportDoc[] = []

  // Executive committee
  const exec = selectExecutiveCommittee(data)
  if (exec.length) {
    docs.push({
      path: 'Executive Committee.pdf',
      element: <CommitteeDirectory sections={[{ title: 'Executive Committee', members: expandRoles(exec) }]} mode="print" />,
    })
  }

  // Each committee → its own folder; sub-committees → a folder each.
  for (const cat of selectCategories(data)) {
    const det = selectCommitteeDetails(data, cat.Fk_DistrictCommitteeID)
    const folder = `Committees/${safeName(cat.name)}`

    if (det.directMembers.length) {
      docs.push({
        path: `${folder}/${safeName(cat.name)}.pdf`,
        element: <CommitteeDirectory sections={[{ title: cat.name, members: expandRoles(det.directMembers) }]} mode="print" />,
      })
    }

    for (const sub of det.subCommittees) {
      const members = det.subCommitteeMembers.filter(
        (m) => String(m.fk_District_sub_Committee_id) === String(sub.pk_District_sub_Committee_id),
      )
      if (!members.length) continue
      docs.push({
        path: `${folder}/${safeName(sub.name)}/${safeName(sub.name)}.pdf`,
        element: <CommitteeDirectory sections={[{ title: sub.name, members: expandRoles(members) }]} mode="print" />,
      })
    }
  }

  // Clubs (board of directors) — two cards per sheet, like the /bod page.
  // Match the "Rotary Clubs of 3055" section (bod.tsx): hide a club whose card has
  // NO officer info at all — neither a President nor a Secretary name. Kept local to
  // this Clubs section so no other export section (committees, AGs, DGs) is affected.
  const clubs = selectClubsBOD(data).filter(
    (c) => Boolean((c.President_member_name ?? '').trim()) || Boolean((c.Secreatary_member_name ?? '').trim()),
  )
  if (clubs.length) {
    const clubSheets = chunk(orderClubsByZone(clubs), 2).map((pair, i) => (
      <DirectorySheet key={i} pageNumber={i + 1} side={i % 2 === 0 ? 'right' : 'left'}>
        <div className="dir-clubs">
          {pair.map((club) => (
            <ClubBODCard key={club.grpID} club={club} />
          ))}
        </div>
      </DirectorySheet>
    ))
    docs.push({ path: 'Clubs (Board of Directors).pdf', element: <Fragment>{clubSheets}</Fragment> })
  }

  // Assistant Governors (zone-wise) and DGs of other districts, from JSON.
  try {
    const zones = await (await fetch('/data/agZones.json')).json()
    if (Array.isArray(zones) && zones.length) {
      docs.push({ path: 'Assistant Governors (Zone-wise).pdf', element: <AgZoneDirectory zones={zones} mode="print" /> })
    }
  } catch {
    /* skip if unavailable */
  }
  try {
    const districts = await (await fetch('/data/otherDistricts.json')).json()
    if (Array.isArray(districts) && districts.length) {
      docs.push({ path: 'DGs of Other Districts.pdf', element: <DgOtherDistricts districts={districts} mode="print" /> })
    }
  } catch {
    /* skip if unavailable */
  }

  return docs
}

/**
 * Render every directory document (reusing the exact print components, so the
 * bulk output always matches the individual "Download PDF") and bundle them into
 * a single ZIP that mirrors the directory's folder structure.
 */
export async function downloadDirectoryZip(onProgress: ProgressCallback): Promise<void> {
  onProgress('Preparing…', 0, 1)
  const docs = await buildDirectoryDocuments()
  const zip = new JSZip()

  for (let i = 0; i < docs.length; i++) {
    onProgress(docs[i].path, i + 1, docs.length)
    const blob = await withOffscreen(docs[i].element, async (root) => {
      await inlineImages(root)
      await rasterizeBackgrounds(root)
      await waitForImages(root)
      return sheetsToPdfBlob(root)
    })
    if (blob) zip.file(docs[i].path, blob)
  }

  onProgress('Zipping…', docs.length, docs.length)
  const out = await zip.generateAsync({ type: 'blob' })
  saveAs(out, 'District 3055 Directory.zip')
}
