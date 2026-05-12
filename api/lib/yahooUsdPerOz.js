const YAHOO_CHART = 'https://query1.finance.yahoo.com/v8/finance/chart'

/**
 * Son işlem / kapanış fiyatı (USD / troy ons). Yahoo chart; sunucu veya tarayıcıdan çağrılabilir.
 * @param {string} symbol Örn. GC=F (altın), SI=F (gümüş)
 * @returns {Promise<number | null>}
 */
export async function yahooUsdPerOz(symbol) {
  const sym = String(symbol || '').trim()
  if (!sym) {
    return null
  }
  const now = Math.floor(Date.now() / 1000)
  const from = now - 14 * 24 * 60 * 60
  const url = `${YAHOO_CHART}/${encodeURIComponent(sym)}?period1=${from}&period2=${now}&interval=1d`
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; FinSmartApp/1.0; +https://github.com/alikaankoc1/fin-smart-app)',
        Accept: 'application/json',
      },
    })
    if (!res.ok) {
      return null
    }
    const data = await res.json()
    const result = data?.chart?.result?.[0]
    const closes = result?.indicators?.quote?.[0]?.close ?? []
    for (let i = closes.length - 1; i >= 0; i -= 1) {
      const c = closes[i]
      if (Number.isFinite(c) && c > 0) {
        return c
      }
    }
    const meta = result?.meta
    const r = meta?.regularMarketPrice
    if (Number.isFinite(r) && r > 0) {
      return r
    }
    return null
  } catch {
    return null
  }
}
