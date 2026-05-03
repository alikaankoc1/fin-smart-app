const FX_API_URL = 'https://open.er-api.com/v6/latest/TRY'
const METALS_API_URL = 'https://metalmetric.com/api/gpt?action=spot_prices&metal=all'
const MARKET_LATEST_API_URL = '/api/market/latest'

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

/**
 * @returns {Promise<{ rows: Array<{ id: string, name: string, buy: number, sell: number }>, sourceUpdatedAt: string | null }>}
 */
export async function fetchMarketBoardData() {
  try {
    const response = await fetch(MARKET_LATEST_API_URL, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('proxy failed')
    }
    const payload = await response.json()
    if (Array.isArray(payload)) {
      return { rows: payload, sourceUpdatedAt: null }
    }
    if (payload?.rows) {
      return {
        rows: payload.rows,
        sourceUpdatedAt: payload.sourceUpdatedAt ?? null,
      }
    }
    throw new Error('invalid payload')
  } catch {
    // Local fallback when serverless endpoint is unavailable.
  }

  const [fxResponse, metalsResponse] = await Promise.all([
    fetch(FX_API_URL, { cache: 'no-store' }),
    fetch(METALS_API_URL, { cache: 'no-store' }),
  ])

  if (!fxResponse.ok || !metalsResponse.ok) {
    throw new Error('Canlı piyasa verisi alınamadı.')
  }

  const fxData = await fxResponse.json()
  const metalsData = await metalsResponse.json()

  const usdTry = 1 / fxData.rates.USD
  const eurTry = 1 / fxData.rates.EUR
  const gbpTry = 1 / fxData.rates.GBP

  const goldUsdPerOunce = metalsData?.prices?.gold?.price_per_oz ?? 0
  const silverUsdPerOunce = metalsData?.prices?.silver?.price_per_oz ?? 0
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
    { id: 'gram', name: 'Gram Altın', ...makeBidAsk(gramGoldTry, 0.004) },
    { id: 'quarter', name: 'Çeyrek Altın', ...makeBidAsk(quarterGoldTry, 0.006) },
    { id: 'half', name: 'Yarım Altın', ...makeBidAsk(halfGoldTry, 0.0065) },
    { id: 'full', name: 'Tam Altın', ...makeBidAsk(fullGoldTry, 0.007) },
    {
      id: 'republic',
      name: 'Cumhuriyet Altını',
      ...makeBidAsk(republicGoldTry, 0.0075),
    },
    { id: 'silver', name: 'Gram Gümüş', ...makeBidAsk(gramSilverTry, 0.0055) },
  ]

  return {
    rows,
    sourceUpdatedAt: fxData?.time_last_update_utc ?? null,
  }
}
