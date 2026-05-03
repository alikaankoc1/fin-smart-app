import { describe, expect, it } from 'vitest'
import { getStatusMessages, resolveFetchErrorMessage } from './statusMessages'

describe('statusMessages', () => {
  it('maps known Turkish API errors to localized loadFailed', () => {
    const tr = getStatusMessages('tr')
    expect(resolveFetchErrorMessage('Canlı piyasa verisi alınamadı.', tr)).toBe(tr.loadFailed)
    expect(resolveFetchErrorMessage('proxy failed', tr)).toBe(tr.loadFailed)
  })

  it('maps unsupported instrument to dedicated message', () => {
    const en = getStatusMessages('en')
    expect(resolveFetchErrorMessage('Desteklenmeyen enstrüman seçimi.', en)).toBe(
      en.unsupportedInstrument,
    )
  })
})
