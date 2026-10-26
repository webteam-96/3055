import { describe, it, expect } from 'vitest'
import { firstName } from './firstName'

describe('firstName', () => {
  it('returns the given name, Title-Cased', () => {
    expect(firstName('Naimish Ravani')).toBe('Naimish')
    expect(firstName('naimish ravani')).toBe('Naimish')
    expect(firstName('SHYAM KUMAR')).toBe('Shyam')
  })

  it('skips leading honorifics / titles', () => {
    expect(firstName('Pdg. Dr. Jayprakash Vyas')).toBe('Jayprakash')
    expect(firstName('Rtn. Naimish Ravani')).toBe('Naimish')
  })

  it('strips a glued leading-initials run', () => {
    // the Uma Shyam spouse case: "K.A.Shyam Kumar" -> "Shyam"
    expect(firstName('K.A.Shyam Kumar')).toBe('Shyam')
    expect(firstName('A.Kumar')).toBe('Kumar')
  })

  it('skips standalone leading initials to the first spelled-out name', () => {
    expect(firstName('L. B. Kushwaha')).toBe('Kushwaha')
    expect(firstName('A. S. Saiyed')).toBe('Saiyed')
    expect(firstName('D Ram Rajak')).toBe('Ram')
    expect(firstName('K K Hirani')).toBe('Hirani')
    expect(firstName('T.S.D. Menon')).toBe('Menon')
    expect(firstName('A.L. Sanghvi')).toBe('Sanghvi')
  })

  it('keeps a pure-initials token (nothing real left after stripping)', () => {
    // firstName strips the trailing dot, then the initials run is preserved
    expect(firstName('K.A.')).toBe('K.A')
  })

  it('leaves a normal trailing initial alone', () => {
    expect(firstName('Jayram V.')).toBe('Jayram')
  })

  it('handles empty input', () => {
    expect(firstName('')).toBe('')
  })
})
