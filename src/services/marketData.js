const FX_API_URL = 'https://open.er-api.com/v6/latest/TRY'
const METALS_API_URL = 'https://metalmetric.com/api/gpt?action=spot_prices&metal=all'

const OUNCE_TO_GRAM = 31.1034768
const GRAM_GOLD_IN_QUARTER = 1.75

function makeBidAsk(midPrice, spreadRatio) {
  return {
    buy: midPrice * (1 - spreadRatio),
    sell: midPrice * (1 + spreadRatio),
  }
}

export async function fetchMarketBoardData() {
  const [fxResponse, metalsResponse] = await Promise.all([
    fetch(FX_API_URL),
    fetch(METALS_API_URL),
  ])

  if (!fxResponse.ok || !metalsResponse.ok) {
    throw new Error('Canli piyasa verisi alinamadi.')
  }

  const fxData = await fxResponse.json()
  const metalsData = await metalsResponse.json()

  const usdTry = 1 / fxData.rates.USD
  const eurTry = 1 / fxData.rates.EUR
  const gbpTry = 1 / fxData.rates.GBP

  const goldUsdPerOunce = metalsData?.prices?.gold?.price_per_oz ?? 0
  const gramGoldTry = (goldUsdPerOunce * usdTry) / OUNCE_TO_GRAM
  const quarterGoldTry = gramGoldTry * GRAM_GOLD_IN_QUARTER

  return [
    { id: 'usd', name: 'Dolar', ...makeBidAsk(usdTry, 0.0025) },
    { id: 'eur', name: 'Euro', ...makeBidAsk(eurTry, 0.0025) },
    { id: 'gbp', name: 'Pound', ...makeBidAsk(gbpTry, 0.003) },
    { id: 'gram', name: 'Gram Altin', ...makeBidAsk(gramGoldTry, 0.004) },
    { id: 'quarter', name: 'Ceyrek Altin', ...makeBidAsk(quarterGoldTry, 0.006) },
  ]
}
