import { describe, it, expect } from 'vitest'
import { PeopleCollector } from './collectPeople'

describe('PeopleCollector dedup', () => {
  it('merges the same person seen on two pages under the same name', () => {
    const c = new PeopleCollector()
    c.add('Amit Patel', '12/05', 50)
    c.add('Amit Patel', '12/05', 120)
    const list = c.list()
    expect(list).toHaveLength(1)
    expect(list[0].pages).toEqual([50, 120])
  })

  it('merges a leading honorific with the bare name', () => {
    const c = new PeopleCollector()
    c.add('Dr. Amit Patel', '', 10)
    c.add('Amit Patel', '', 20)
    expect(c.list()).toHaveLength(1)
    expect(c.list()[0].pages).toEqual([10, 20])
  })

  it('merges a TRAILING honorific with the leading/bare form (Gyaneshwar Rao case)', () => {
    const c = new PeopleCollector()
    c.add('Gyaneshwar Rao', '23/04', 57) // College-of-Governors spelling (Dr. dropped)
    c.add('Dr. Gyaneshwar Rao', '23/04', 194) // committee spelling
    const list = c.list()
    expect(list).toHaveLength(1)
    expect(list[0].pages).toEqual([57, 194])
  })

  it('merges two DIFFERENT spellings of one person by shared member id (Naimish case)', () => {
    const c = new PeopleCollector()
    // CoG card: short name, with the member id
    c.add('Naimish Ravani', '19/11', 57, 952818)
    // committee card: full name, SAME member id
    c.add('Naimish N. Ravani', '19/11', 82, 952818)
    // another committee appearance by name only
    c.add('Naimish N. Ravani', '19/11', 200)
    const list = c.list()
    expect(list).toHaveLength(1)
    expect(list[0].pages).toEqual([57, 82, 200])
  })

  it('does NOT merge two different people who merely share a first name', () => {
    const c = new PeopleCollector()
    c.add('Nilesh Kantibhai Patel', '', 137, 111)
    c.add('Nilesh N Gandhi', '', 125, 222)
    expect(c.list()).toHaveLength(2)
  })

  it('byMonth groups a merged person once, under their birthday month', () => {
    const c = new PeopleCollector()
    c.add('Naimish Ravani', '19/11', 57, 952818)
    c.add('Naimish N. Ravani', '19/11', 82, 952818)
    const nov = c.byMonth()[10] // index 10 = November
    expect(nov.filter((p) => p.name.includes('Naimish'))).toHaveLength(1)
  })
})
