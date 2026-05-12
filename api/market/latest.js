import { yahooUsdPerOz } from '../lib/yahooUsdPerOz.js'

const FX_API_URL = 'https://open.er-api.com/v6/latest/TRY'
const METALS_API_URL = 'https://metalmetric.com/api/gpt?action=spot_prices&metal=all'

const OUNCE_TO_GRAM = 31.1034768
const GRAM_GOLD_IN_QUARTER = 1.75
const GRAM_GOLD_IN_HALF = 3.5
const GRAM_GOLD_IN_FULL = 7
const GRAM_GOLD_IN_REPUBLIC = 7.216

function makeBidAsk(midPrice, spreadRatio) {
  return {
    buy: midPrice * (1 - spreadRatio),
    sell: midPrice * (1 + spreadRatio),
  }
}

async function resolveUsdPerOzFromMetals() {
  try {
    const metalsResponse = await fetch(METALS_API_URL, { cache: 'no-store' })
    if (!metalsResponse.ok) {
      return { gold: 0, silver: 0 }
    }
    const metalsData = await metalsResponse.json()
    return {
      gold: metalsData?.prices?.gold?.price_per_oz ?? 0,
      silver: metalsData?.prices?.silver?.price_per_oz ?? 0,
    }
  } catch {
    return { gold: 0, silver: 0 }
  }
}

function buildRows(usdTry, eurTry, gbpTry, goldUsdPerOunce, silverUsdPerOunce) {
  const gramGoldTry = (goldUsdPerOunce * usdTry) / OUNCE_TO_GRAM
  const gramSilverTry = (silverUsdPerOunce * usdTry) / OUNCE_TO_GRAM
  const quarterGoldTry = gramGoldTry * GRAM_GOLD_IN_QUARTER
  const halfGoldTry = gramGoldTry * GRAM_GOLD_IN_HALF
  const fullGoldTry = gramGoldTry * GRAM_GOLD_IN_FULL
  const republicGoldTry = gramGoldTry * GRAM_GOLD_IN_REPUBLIC

  const rows = [
    { id: 'usd', name: 'Dolar', ...makeBidAsk(usdTry, 0.0025) },
    { id: 'eur', name: 'Euro', ...makeBidAsk(eurTry, 0.0025) },
    { id: 'gbp', name: 'Pound', ...makeBidAsk(gbpTry, 0.003) },
  ]

  if (goldUsdPerOunce > 0) {
    rows.push(
      { id: 'gram', name: 'Gram Altın', ...makeBidAsk(gramGoldTry, 0.004) },
      { id: 'quarter', name: 'Çeyrek Altın', ...makeBidAsk(quarterGoldTry, 0.006) },
      { id: 'half', name: 'Yarım Altın', ...makeBidAsk(halfGoldTry, 0.0065) },
      { id: 'full', name: 'Tam Altın', ...makeBidAsk(fullGoldTry, 0.007) },
      {
        id: 'republic',
        name: 'Cumhuriyet Altını',
        ...makeBidAsk(republicGoldTry, 0.0075),
      },
    )
  }

  if (silverUsdPerOunce > 0) {
    rows.push({ id: 'silver', name: 'Gram Gümüş', ...makeBidAsk(gramSilverTry, 0.0055) })
  }

  return rows
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

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('Pragma', 'no-cache')

  try {
    const fxResponse = await fetch(FX_API_URL, { cache: 'no-store' })
    if (!fxResponse.ok) {
      throw new Error('Upstream FX failed')
    }
    const fxData = await fxResponse.json()

    let goldUsdPerOunce = 0
    let silverUsdPerOunce = 0
    const fromMetals = await resolveUsdPerOzFromMetals()
    goldUsdPerOunce = Number(fromMetals.gold) || 0
    silverUsdPerOunce = Number(fromMetals.silver) || 0

    if (!(goldUsdPerOunce > 0)) {
      const y = await yahooUsdPerOz('GC=F')
      if (y != null) {
        goldUsdPerOunce = y
      }
    }
    if (!(silverUsdPerOunce > 0)) {
      const y = await yahooUsdPerOz('SI=F')
      if (y != null) {
        silverUsdPerOunce = y
      }
    }

    const usdTry = 1 / fxData.rates.USD
    const eurTry = 1 / fxData.rates.EUR
    const gbpTry = 1 / fxData.rates.GBP

    const rows = buildRows(usdTry, eurTry, gbpTry, goldUsdPerOunce, silverUsdPerOunce)
    const sourceUpdatedAt = fxData?.time_last_update_utc ?? null

    res.status(200).json({ rows, sourceUpdatedAt })
  } catch {
    res.status(502).json({ error: 'Canlı piyasa verisi alınamadı' })
  }
}
