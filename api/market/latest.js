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

  try {
    const [fxResponse, metalsResponse] = await Promise.all([
      fetch(FX_API_URL),
      fetch(METALS_API_URL),
    ])

    if (!fxResponse.ok || !metalsResponse.ok) {
      throw new Error('Upstream data source failed')
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

    res.status(200).json(rows)
  } catch {
    res.status(502).json({ error: 'Canlı piyasa verisi alınamadı' })
  }
}
