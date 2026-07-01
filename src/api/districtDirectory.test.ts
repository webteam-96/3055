import { describe, it, expect } from 'vitest'
import {
  resolveImg,
  isoToDayMonth,
  isoToDMY,
  to12Hour,
  selectExecutiveCommittee,
  selectCategories,
  selectCommitteeDetails,
  selectClubsBOD,
  selectClubDetails,
  selectClubMembers,
  IMAGE_HOST,
} from './districtDirectory'
import { directoryFixture as fx } from '../test-fixtures/directoryResponse'

describe('resolveImg', () => {
  it('prefixes leading-slash paths with the image host', () => {
    expect(resolveImg('/Documents/directory/a.jpg')).toBe(`${IMAGE_HOST}/Documents/directory/a.jpg`)
  })
  it('treats bare filenames as living under /Documents/directory/', () => {
    expect(resolveImg('a.jpg')).toBe(`${IMAGE_HOST}/Documents/directory/a.jpg`)
  })
  it('passes through absolute URLs', () => {
    expect(resolveImg('https://cdn.example.com/a.jpg')).toBe('https://cdn.example.com/a.jpg')
  })
  it('returns empty for falsy / null-ish values', () => {
    expect(resolveImg('')).toBe('')
    expect(resolveImg(null)).toBe('')
    expect(resolveImg('null')).toBe('')
    expect(resolveImg(undefined)).toBe('')
  })
})

describe('isoToDayMonth', () => {
  it('extracts DD/MM from an ISO datetime', () => {
    expect(isoToDayMonth('1980-05-13T00:00:00')).toBe('13/05')
  })
  it('returns empty for null / unparseable', () => {
    expect(isoToDayMonth(null)).toBe('')
    expect(isoToDayMonth('')).toBe('')
  })
})

describe('isoToDMY', () => {
  it('extracts DD/MM/YYYY from an ISO datetime', () => {
    expect(isoToDMY('2013-10-25T00:00:00')).toBe('25/10/2013')
  })
  it('returns empty for null / unparseable', () => {
    expect(isoToDMY(null)).toBe('')
    expect(isoToDMY('not-a-date')).toBe('')
  })
})

describe('to12Hour', () => {
  it('converts 24h time to 12h with AM/PM', () => {
    expect(to12Hour('13:30:00')).toBe('01:30 PM')
    expect(to12Hour('09:05')).toBe('09:05 AM')
    expect(to12Hour('00:00')).toBe('12:00 AM')
    expect(to12Hour('12:00')).toBe('12:00 PM')
  })
  it('returns empty for missing / unparseable', () => {
    expect(to12Hour('')).toBe('')
    expect(to12Hour(null)).toBe('')
  })
})

describe('selectExecutiveCommittee', () => {
  it('maps the top-level districtCommittee with resolved image + DOB', () => {
    const [m] = selectExecutiveCommittee(fx)
    expect(m.name).toBe('Naimish N. Ravani')
    expect(m.DistrictDesignation).toBe('District Governor 2026-27')
    expect(m.MobileNumber).toBe('9879688811')
    expect(m.DOB).toBe('14/03')
    // ProfilePhotoPath is null → falls back to bare committeePhoto filename
    expect(m.img).toBe(`${IMAGE_HOST}/Documents/directory/DG_Photo.jpg`)
    expect(m.classification).toBe('Industrialist')
    expect(m.SpouseName).toBe('')
  })
})

describe('selectCategories', () => {
  it('maps groups to category cards sorted by sortOrder', () => {
    const cats = selectCategories(fx)
    expect(cats.map((c) => c.name)).toEqual(['Alpha Group', 'Beta Group'])
    expect(cats[0].Fk_DistrictCommitteeID).toBe('100')
  })
})

describe('selectCommitteeDetails', () => {
  it('returns direct members, sub-committees, and tagged sub-members', () => {
    const d = selectCommitteeDetails(fx, '100')
    expect(d.directMembers).toHaveLength(1)
    expect(d.directMembers[0].name).toBe('Direct Member')
    expect(d.subCommittees).toEqual([{ pk_District_sub_Committee_id: '300', name: 'Alpha Sub' }])
    expect(d.subCommitteeMembers).toHaveLength(1)
    expect(d.subCommitteeMembers[0].fk_District_sub_Committee_id).toBe('300')
    // bare filename image resolves under /Documents/directory/
    expect(d.subCommitteeMembers[0].img).toBe(`${IMAGE_HOST}/Documents/directory/subfile.jpg`)
  })
  it('returns empty structure for an unknown committee id', () => {
    const d = selectCommitteeDetails(fx, '999')
    expect(d.directMembers).toEqual([])
    expect(d.subCommittees).toEqual([])
  })
})

describe('selectClubsBOD', () => {
  it('picks the exact Club President/Secretary (not look-alikes) and uses pk_club_id', () => {
    const [c] = selectClubsBOD(fx)
    expect(c.grpID).toBe('32285')
    expect(c.clubName).toBe('Aadarsh Ahmedabad')
    expect(c.President_member_name).toBe('Pres Person')
    expect(c.President_member_mobile_no).toBe('901')
    expect(c.President_Profile_Photo).toBe(`${IMAGE_HOST}/Documents/directory/pres.jpg`)
    expect(c.Secreatary_member_name).toBe('Sec Person')
    // No AG / spouse data in the unified API
    expect(c.AG_Name).toBe('')
    expect(c.President_Spouse_member_name).toBe('')
  })

  it('maps club facts and officer DOB/DOA for the card info strip', () => {
    const [c] = selectClubsBOD(fx)
    expect(c.clubRotaryId).toBe('85453')
    expect(c.charterDate).toBe('25/10/2013')
    expect(c.memberCount).toBe('2')
    expect(c.meeting).toBe('Friday') // fixture has MeetingDay but no MeetingFromTime
    expect(c.venue).toBe('Sports Club')
    expect(c.President_DOB).toBe('02/01')
    expect(c.President_DOA).toBe('') // no AnniversaryDate in fixture
    expect(c.Secreatary_DOB).toBe('') // no BirthDate for the secretary
    expect(c.zoneNo).toBe('') // not in the unified API yet
  })
})

describe('selectClubDetails', () => {
  it('maps basic info, president, secretary and excludes them from the board list', () => {
    const d = selectClubDetails(fx, '32285')!
    expect(d).not.toBeNull()
    expect(d.basicInfo.Club_Name).toBe('Aadarsh Ahmedabad')
    expect(d.basicInfo.Club_ID).toBe('85453')
    expect(d.basicInfo.Membership).toBe('2')
    expect(d.president?.President_name).toBe('Pres Person')
    expect(d.president?.President_DOB).toBe('02/01')
    expect(d.secretary?.Secretary_name).toBe('Sec Person')
    expect(d.ag).toBeNull()
    // Board excludes the president (id 1) and secretary (id 2)
    const names = d.bod.map((b) => b.Name)
    expect(names).toContain('IPP Person')
    expect(names).toContain('Treasurer Person')
    expect(names).not.toContain('Pres Person')
    expect(names).not.toContain('Sec Person')
  })
  it('returns null for an unknown club id', () => {
    expect(selectClubDetails(fx, '0')).toBeNull()
  })
})

describe('selectClubMembers', () => {
  it('maps the club roster', () => {
    const members = selectClubMembers(fx, '32285')
    expect(members).toHaveLength(2)
    expect(members[0].MemberName).toBe('Member One')
    expect(members[0].MemberDOB).toBe('16/07')
    expect(members[0].Designation).toBe('')
  })
})
