import { describe, expect, it } from 'vitest'
import { parseAmountInput } from './parseAmountInput'

describe('parseAmountInput', () => {
  it('parses plain integers', () => {
    expect(parseAmountInput('100000')).toBe(100000)
  })

  it('parses Turkish-style grouped thousands', () => {
    expect(parseAmountInput('100.000')).toBe(100000)
    expect(parseAmountInput('1.234.567')).toBe(1234567)
  })

  it('parses comma decimals', () => {
    expect(parseAmountInput('1000,5')).toBe(1000.5)
  })

  it('returns 0 for empty input', () => {
    expect(parseAmountInput('')).toBe(0)
    expect(parseAmountInput('   ')).toBe(0)
  })
})
