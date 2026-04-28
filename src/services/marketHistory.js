const DAY_MS = 24 * 60 * 60 * 1000
const OUNCE_TO_GRAM = 31.1034768

const YAHOO_API = 'https://query1.finance.yahoo.com/v8/finance/chart'
const MARKET_HISTORY_API_URL = '/api/market/history'

const instrumentMap = {
  usd: { type: 'pair', symbol: 'USDTRY=X' },
  eur: { type: 'pair', symbol: 'EURTRY=X' },
  gbp: { type: 'pair', symbol: 'GBPTRY=X' },
  gram: { type: 'gold_derived', multiplier: 1 },
  quarter: { type: 'gold_derived', multiplier: 1.75 },
  half: { type: 'gold_derived', multiplier: 3.5 },
  full: { type: 'gold_derived', multiplier: 7 },
  republic: { type: 'gold_derived', multiplier: 7.216 },
  silver: { type: 'silver_derived', multiplier: 1 },
}

function getPeriod(range) {
  const end = new Date()
  const start = new Date(
    end.getTime() - (range === '6m' ? 180 * DAY_MS : 90 * DAY_MS),
  )
  return { start, end }
}

function toUnix(date) {
  return Math.floor(date.getTime() / 1000)
}

function getStepDays(interval) {
  return interval === '1wk' ? 7 : 1
}

async function fetchYahooSeries(symbol, range, interval) {
  const { start, end } = getPeriod(range)
  const url = `${YAHOO_API}/${encodeURIComponent(symbol)}?period1=${toUnix(
    start,
  )}&period2=${toUnix(end)}&interval=${interval}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Gecmis veri alinamadi.')
  }

  const data = await response.json()
  const result = data?.chart?.result?.[0]
  const timestamps = result?.timestamp ?? []
  const closes = result?.indicators?.quote?.[0]?.close ?? []

  return timestamps
    .map((t, index) => ({
      timestamp: t,
      close: closes[index],
    }))
    .filter((point) => Number.isFinite(point.close))
}

function mapByDate(points) {
  const map = new Map()
  points.forEach((point) => {
    const dateKey = new Date(point.timestamp * 1000).toISOString().slice(0, 10)
    map.set(dateKey, point.close)
  })
  return map
}

function buildDerivedSeries(baseSeries, usdTrySeries, divisor, multiplier) {
  const usdMap = mapByDate(usdTrySeries)

  return baseSeries
    .map((point) => {
      const dateKey = new Date(point.timestamp * 1000).toISOString().slice(0, 10)
      const usdTry = usdMap.get(dateKey)
      if (!Number.isFinite(usdTry)) {
        return null
      }

      const tlValue = (point.close * usdTry * multiplier) / divisor
      return {
        timestamp: point.timestamp,
        close: tlValue,
      }
    })
    .filter(Boolean)
}

export async function fetchInstrumentHistory(instrumentId, range, interval) {
  try {
    const query = new URLSearchParams({
      instrumentId,
      range,
      interval,
    })

    const response = await fetch(`${MARKET_HISTORY_API_URL}?${query.toString()}`)
    if (!response.ok) {
      throw new Error('proxy failed')
    }

    return response.json()
  } catch {
    // Local fallback when serverless endpoint is unavailable.
  }

  const config = instrumentMap[instrumentId]
  if (!config) {
    throw new Error('Desteklenmeyen enstruman secimi.')
  }

  if (config.type === 'pair') {
    return fetchYahooSeries(config.symbol, range, interval)
  }

  if (config.type === 'gold_derived') {
    const [goldUsdSeries, usdTrySeries] = await Promise.all([
      fetchYahooSeries('GC=F', range, interval),
      fetchYahooSeries('USDTRY=X', range, interval),
    ])

    return buildDerivedSeries(
      goldUsdSeries,
      usdTrySeries,
      OUNCE_TO_GRAM,
      config.multiplier,
    )
  }

  if (config.type === 'silver_derived') {
    const [silverUsdSeries, usdTrySeries] = await Promise.all([
      fetchYahooSeries('SI=F', range, interval),
      fetchYahooSeries('USDTRY=X', range, interval),
    ])

    return buildDerivedSeries(
      silverUsdSeries,
      usdTrySeries,
      OUNCE_TO_GRAM,
      config.multiplier,
    )
  }

  return []
}

export function buildFallbackHistory(range, interval, basePrice) {
  const { start, end } = getPeriod(range)
  const stepDays = getStepDays(interval)
  const points = []
  const safeBase = Number.isFinite(basePrice) && basePrice > 0 ? basePrice : 1

  let index = 0
  for (
    let current = new Date(start);
    current <= end;
    current = new Date(current.getTime() + stepDays * DAY_MS)
  ) {
    const seasonal = Math.sin(index / 3.5) * 0.018
    const trend = (index / 220) * 0.03
    const wave = Math.cos(index / 5.2) * 0.009
    const factor = 1 + seasonal + trend + wave

    points.push({
      timestamp: Math.floor(current.getTime() / 1000),
      close: safeBase * factor,
    })
    index += 1
  }

  return points
}
