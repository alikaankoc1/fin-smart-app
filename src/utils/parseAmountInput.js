/**
 * Parses amount strings with Turkish-style grouping (e.g. 100.000) or decimals.
 * @param {string} rawValue
 * @returns {number}
 */
export function parseAmountInput(rawValue) {
  const cleaned = rawValue.replace(/\s/g, '')
  if (!cleaned) {
    return 0
  }

  if (/^\d{1,3}([.,]\d{3})+$/.test(cleaned)) {
    return Number(cleaned.replace(/[.,]/g, ''))
  }

  const hasDot = cleaned.includes('.')
  const hasComma = cleaned.includes(',')

  if (hasDot && hasComma) {
    const lastDot = cleaned.lastIndexOf('.')
    const lastComma = cleaned.lastIndexOf(',')
    const decimalSeparator = lastDot > lastComma ? '.' : ','
    const thousandsSeparator = decimalSeparator === '.' ? ',' : '.'
    const normalized = cleaned
      .replaceAll(thousandsSeparator, '')
      .replace(decimalSeparator, '.')
    return Number(normalized) || 0
  }

  if (hasComma || hasDot) {
    const separator = hasComma ? ',' : '.'
    const parts = cleaned.split(separator)
    if (parts.length === 2 && parts[1].length === 3 && parts[0].length >= 1) {
      return Number(parts.join('')) || 0
    }
    return Number(cleaned.replace(',', '.')) || 0
  }

  return Number(cleaned) || 0
}
