import { describe, it, expect } from 'vitest'
import { titleCase } from './titleCase'

describe('titleCase', () => {
  it('title-cases ALL CAPS values', () => {
    expect(titleCase('DHARMESH M SHAH')).toBe('Dharmesh M Shah')
    expect(titleCase('RACHANA ABHISHEK DAVE')).toBe('Rachana Abhishek Dave')
    expect(titleCase('ANKIT SHAH')).toBe('Ankit Shah')
  })

  it('title-cases lower / mixed values', () => {
    expect(titleCase('milan navinchandra shah')).toBe('Milan Navinchandra Shah')
    expect(titleCase('Abhishek HARJIBHAI Patel')).toBe('Abhishek Harjibhai Patel')
    expect(titleCase('Usha jain')).toBe('Usha Jain')
  })

  it('leaves already-correct Title Case unchanged', () => {
    expect(titleCase('Naimish Ravani')).toBe('Naimish Ravani')
    expect(titleCase('Abhishek Dave')).toBe('Abhishek Dave')
  })

  it('preserves initials in names', () => {
    expect(titleCase('K.A. Shyam Kumar')).toBe('K.A. Shyam Kumar')
    expect(titleCase('T.S.D. Menon')).toBe('T.S.D. Menon')
    expect(titleCase('Jayram V.')).toBe('Jayram V.')
    expect(titleCase('Hetal H. Doshi')).toBe('Hetal H. Doshi')
  })

  it('does NOT treat a plain two-letter token as initials', () => {
    // no dot -> ordinary word
    expect(titleCase('KA PATEL')).toBe('Ka Patel')
  })

  it('preserves acronyms in classification', () => {
    expect(titleCase('CA')).toBe('CA')
    expect(titleCase('HR')).toBe('HR')
    expect(titleCase('FMCG DISTRIBUTORS')).toBe('FMCG Distributors')
    expect(titleCase('CHARTERED ACCOUNTANTS')).toBe('Chartered Accountants')
    expect(titleCase('INVESTMENT CONSULTANT')).toBe('Investment Consultant')
  })

  it('fixes a mis-cased acronym (Fmcg -> FMCG)', () => {
    expect(titleCase('Wholesale Fmcg')).toBe('Wholesale FMCG')
  })

  it('keeps honorifics / Md. as Title Case, not uppercase', () => {
    expect(titleCase('Dr. Samir Babaria')).toBe('Dr. Samir Babaria')
    expect(titleCase('md. arif shaikh')).toBe('Md. Arif Shaikh')
  })

  it('handles hyphen / slash sub-words', () => {
    expect(titleCase('Mandvi-Kutch')).toBe('Mandvi-Kutch')
    expect(titleCase('CHAIRMAN-CSR')).toBe('Chairman-CSR')
    expect(titleCase('sales/service')).toBe('Sales/Service')
  })

  it('capitalises after a comma with no following space', () => {
    expect(titleCase('NR,KARGIL PETROL PUMP')).toBe('Nr,Kargil Petrol Pump')
  })

  it('preserves leading punctuation', () => {
    expect(titleCase('(laptop printer sales)')).toBe('(Laptop Printer Sales)')
  })

  it('returns empty / nullish input as-is', () => {
    expect(titleCase('')).toBe('')
    expect(titleCase('   ')).toBe('   ')
    expect(titleCase(undefined)).toBe('')
    expect(titleCase(null)).toBe('')
  })
})
