import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import {
  selectExecutiveCommittee,
  selectCategories,
  selectCommitteeDetails,
  selectClubsBOD,
  selectClubDetails,
  selectClubMembers,
} from './districtDirectory'
import type { DistrictDirectoryResponse } from '../types/api'

const FILE = 'design/new-api-response.json'
const present = existsSync(FILE)
const data: DistrictDirectoryResponse | null = present
  ? JSON.parse(readFileSync(FILE, 'utf8'))
  : null

const httpOrEmpty = (s: string) => s === '' || /^https?:\/\//.test(s)

describe.skipIf(!present)('REAL data selector sanity', () => {
  it('exec committee maps cleanly', () => {
    const ex = selectExecutiveCommittee(data!)
    expect(ex.length).toBe(data!.districtCommittee.length)
    ex.forEach((m) => {
      expect(m.name).not.toBe('')
      expect(httpOrEmpty(m.img)).toBe(true)
      expect(m.DOB === '' || /^\d{2}\/\d{2}$/.test(m.DOB)).toBe(true)
    })
    console.log('EXEC:', ex.map((m) => `${m.name} / ${m.DistrictDesignation} / img=${m.img ? 'Y' : '-'}`))
  })

  it('categories = all groups', () => {
    const cats = selectCategories(data!)
    expect(cats.length).toBe(data!.groups.length)
    cats.forEach((c) => expect(c.Fk_DistrictCommitteeID).toMatch(/^\d+$/))
  })

  it('every group resolves to committee details with matching sub-committee counts', () => {
    data!.groups.forEach((g) => {
      const d = selectCommitteeDetails(data!, String(g.id))
      expect(d.subCommittees.length).toBe((g.subGroups ?? []).length)
      expect(d.directMembers.length).toBe((g.members ?? []).length)
      const expectedSubMembers = (g.subGroups ?? []).reduce((n, s) => n + (s.members ?? []).length, 0)
      expect(d.subCommitteeMembers.length).toBe(expectedSubMembers)
      // every sub member is tagged with a real sub-committee id
      const ids = new Set(d.subCommittees.map((s) => s.pk_District_sub_Committee_id))
      d.subCommitteeMembers.forEach((m) => expect(ids.has(m.fk_District_sub_Committee_id!)).toBe(true))
      d.directMembers.forEach((m) => expect(httpOrEmpty(m.img)).toBe(true))
    })
  })

  it('clubs BOD: all 87 clubs, exact president/secretary, numeric ids, resolved photos', () => {
    const clubs = selectClubsBOD(data!)
    expect(clubs.length).toBe(data!.clubs.length)
    let withPres = 0
    let withSec = 0
    const ids = new Set<string>()
    clubs.forEach((c) => {
      expect(c.grpID).toMatch(/^\d+$/)
      ids.add(c.grpID)
      expect(httpOrEmpty(c.President_Profile_Photo)).toBe(true)
      expect(httpOrEmpty(c.Secreatary_Profile_Photo)).toBe(true)
      if (c.President_member_name) withPres++
      if (c.Secreatary_member_name) withSec++
    })
    expect(ids.size).toBe(clubs.length) // unique club ids
    console.log(`CLUBS: ${clubs.length}, withPresident=${withPres}, withSecretary=${withSec}`)
  })

  it('club details + members resolve for every club; board deduped, excludes pres/sec persons', () => {
    const pk = (b: any) => (b.pk_member_master_profile_id != null ? `p${b.pk_member_master_profile_id}` : `e${b.id}`)
    data!.clubs.forEach((entry) => {
      const id = String(entry.club.pk_club_id)
      const d = selectClubDetails(data!, id)
      expect(d).not.toBeNull()
      const pres = entry.boardOfDirectors.find((b) => (b.designationName ?? '').trim() === 'Club President')
      const sec = entry.boardOfDirectors.find((b) => (b.designationName ?? '').trim() === 'Club Secretary')
      // president, if present, is an exact "Club President"
      if (d!.president) expect(pres).toBeTruthy()
      // expected board = distinct persons minus the pres/sec persons
      const excluded = new Set([pres, sec].filter(Boolean).map((b) => pk(b!)))
      const expectedKeys = new Set(
        entry.boardOfDirectors.map(pk).filter((k) => !excluded.has(k)),
      )
      expect(d!.bod.length).toBe(expectedKeys.size)
      const members = selectClubMembers(data!, id)
      expect(members.length).toBe((entry.members ?? []).length)
    })
  })
})
