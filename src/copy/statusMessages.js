/**
 * Shared TR/EN strings for loading, errors, and empty states across the app.
 * @param {'tr' | 'en'} lang
 */
export function getStatusMessages(lang) {
  const en = lang === 'en'
  return {
    loadFailed: en
      ? 'Could not load data. Please try again.'
      : 'Veri yüklenemedi. Lütfen tekrar deneyin.',
    emptyTable: en
      ? 'No data to display.'
      : 'Gösterilecek veri yok.',
    loadingMarket: en
      ? 'Loading market data...'
      : 'Piyasa verileri yükleniyor...',
    loadingChart: en
      ? 'Loading chart...'
      : 'Grafik yükleniyor...',
    chartInsufficient: en
      ? 'Not enough data to draw the chart.'
      : 'Grafik için yeterli veri yok.',
    historyFallback: en
      ? 'Live history is unavailable; showing an approximate trend from the current price.'
      : 'Canlı geçmiş verisi alınamadı; grafik güncel fiyata göre yaklaşık bir trend olarak gösteriliyor.',
    unsupportedInstrument: en
      ? 'History is not supported for this instrument.'
      : 'Bu enstrüman için geçmiş veri desteklenmiyor.',
    scenarioCalculating: en
      ? 'Calculating scenarios...'
      : 'Senaryo hesaplanıyor...',
    scenarioFailed: en
      ? 'Scenario could not be calculated.'
      : 'Senaryo hesaplanamadı.',
  }
}

const GENERIC_FETCH_ERRORS = new Set([
  'proxy failed',
  'Canlı piyasa verisi alınamadı.',
  'Geçmiş veri alınamadı.',
])

/**
 * Map internal service Error messages to user-facing copy (correct language).
 */
export function resolveFetchErrorMessage(rawMessage, messages) {
  if (!rawMessage) {
    return messages.loadFailed
  }
  if (rawMessage === 'Desteklenmeyen enstrüman seçimi.') {
    return messages.unsupportedInstrument
  }
  if (GENERIC_FETCH_ERRORS.has(rawMessage)) {
    return messages.loadFailed
  }
  return rawMessage
}
