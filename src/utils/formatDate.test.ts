import { describe, it, expect } from 'vitest'
import { formatDateToDDMM, formatDayMonth, createSlug, expandDesignation, cleanText } from './formatDate'

describe('formatDateToDDMM', () => {
  it('formats ISO date string to DD/MM', () => {
    expect(formatDateToDDMM('1985-03-15')).toBe('15/03')
  })
  it('returns empty string for null input', () => {
    expect(formatDateToDDMM(null)).toBe('')
  })
  it('returns empty string for empty string', () => {
    expect(formatDateToDDMM('')).toBe('')
  })
  it('strips ordinal suffixes before parsing', () => {
    const result = formatDateToDDMM('15th March 1985')
    expect(result).toMatch(/15\/03/)
  })
})

describe('formatDayMonth', () => {
  it('formats DD/MM/YYYY to DD/MM', () => {
    expect(formatDayMonth('15/03/1985')).toBe('15/03')
  })
  it('returns empty string for empty input', () => {
    expect(formatDayMonth('')).toBe('')
  })
  it('returns empty string for input without slash', () => {
    expect(formatDayMonth('baddate')).toBe('')
  })
  it('pads single digit day and month', () => {
    expect(formatDayMonth('5/3')).toBe('05/03')
  })
})

describe('createSlug', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(createSlug('Youth Service')).toBe('youth-service')
  })
  it('removes special characters', () => {
    expect(createSlug('Community & Development')).toBe('community-development')
  })
  it('trims leading and trailing hyphens', () => {
    expect(createSlug('  test  ')).toBe('test')
  })
})

describe('expandDesignation', () => {
  it('returns original for unknown designations', () => {
    expect(expandDesignation('District Governor')).toBe('District Governor')
  })
  it('expands ZAC abbreviation', () => {
    const result = expandDesignation('ZAC - Zone 1')
    expect(result).toContain('Zonal Avenue Chair')
    expect(result).toContain('ZAC')
  })
})

describe('cleanText', () => {
  it('trims whitespace', () => {
    expect(cleanText('  hello  ')).toBe('hello')
  })
  it('collapses multiple spaces', () => {
    expect(cleanText('hello   world')).toBe('hello world')
  })
  it('returns empty string for null', () => {
    expect(cleanText(null)).toBe('')
  })
})
