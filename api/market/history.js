const DAY_MS = 24 * 60 * 60 * 1000
const OUNCE_TO_GRAM = 31.1034768
const YAHOO_API = 'https://query1.finance.yahoo.com/v8/finance/chart'

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

async function fetchYahooSeries(symbol, range, interval) {
  const { start, end } = getPeriod(range)
  const url = `${YAHOO_API}/${encodeURIComponent(symbol)}?period1=${toUnix(
    start,
  )}&period2=${toUnix(end)}&interval=${interval}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Yahoo source unavailable')
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const instrumentId = String(req.query.instrumentId || '')
  const range = String(req.query.range || '3m')
  const interval = String(req.query.interval || '1d')
  const config = instrumentMap[instrumentId]

  if (!config) {
    res.status(400).json({ error: 'Unsupported instrument' })
    return
  }

  try {
    let series = []

    if (config.type === 'pair') {
      series = await fetchYahooSeries(config.symbol, range, interval)
    } else if (config.type === 'gold_derived') {
      const [goldUsdSeries, usdTrySeries] = await Promise.all([
        fetchYahooSeries('GC=F', range, interval),
        fetchYahooSeries('USDTRY=X', range, interval),
      ])
      series = buildDerivedSeries(
        goldUsdSeries,
        usdTrySeries,
        OUNCE_TO_GRAM,
        config.multiplier,
      )
    } else if (config.type === 'silver_derived') {
      const [silverUsdSeries, usdTrySeries] = await Promise.all([
        fetchYahooSeries('SI=F', range, interval),
        fetchYahooSeries('USDTRY=X', range, interval),
      ])
      series = buildDerivedSeries(
        silverUsdSeries,
        usdTrySeries,
        OUNCE_TO_GRAM,
        config.multiplier,
      )
    }

    res.status(200).json(series)
  } catch {
    res.status(502).json({ error: 'Gecmis veri alinamadi' })
  }
}
