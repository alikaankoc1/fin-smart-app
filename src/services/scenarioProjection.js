const DAY_MS = 24 * 60 * 60 * 1000
const TRADING_DAYS_PER_YEAR = 252

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function mean(values) {
  if (values.length === 0) {
    return 0
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function standardDeviation(values) {
  if (values.length < 2) {
    return 0
  }
  const avg = mean(values)
  const variance =
    values.reduce((sum, value) => sum + (value - avg) ** 2, 0) /
    (values.length - 1)
  return Math.sqrt(variance)
}

function getStepDays(series) {
  if (series.length < 2) {
    return 1
  }
  const first = series[0].timestamp * 1000
  const second = series[1].timestamp * 1000
  const diff = Math.max(1, Math.round((second - first) / DAY_MS))
  return diff
}

function buildReturnSeries(series) {
  const returns = []

  for (let index = 1; index < series.length; index += 1) {
    const previous = Number(series[index - 1]?.close)
    const current = Number(series[index]?.close)
    if (!Number.isFinite(previous) || !Number.isFinite(current) || previous <= 0) {
      continue
    }
    returns.push(current / previous - 1)
  }

  return returns
}

function annualizeReturn(stepAverage, periodsPerYear) {
  return (1 + stepAverage) ** periodsPerYear - 1
}

function annualizeVolatility(stepVolatility, periodsPerYear) {
  return stepVolatility * Math.sqrt(periodsPerYear)
}

function projectValue(principal, annualReturn, years) {
  return principal * (1 + annualReturn) ** years
}

function roundMoney(value) {
  return Number(value.toFixed(2))
}

export function calculateScenarioProjection({
  principal,
  series,
  horizonYears,
  volatilityMultiplier = 1,
}) {
  const safePrincipal = Number(principal)
  const safeYears = Number(horizonYears)
  const safeSeries = Array.isArray(series) ? series : []

  if (!Number.isFinite(safePrincipal) || safePrincipal <= 0) {
    throw new Error('Principal must be a positive number.')
  }
  if (!Number.isFinite(safeYears) || safeYears <= 0) {
    throw new Error('Horizon years must be a positive number.')
  }
  if (safeSeries.length < 3) {
    const fallback = roundMoney(safePrincipal)
    return {
      base: fallback,
      pessimistic: fallback,
      optimistic: fallback,
      annualReturn: 0,
      annualVolatility: 0,
      confidence: 'low',
    }
  }

  const returns = buildReturnSeries(safeSeries)
  if (returns.length < 2) {
    const fallback = roundMoney(safePrincipal)
    return {
      base: fallback,
      pessimistic: fallback,
      optimistic: fallback,
      annualReturn: 0,
      annualVolatility: 0,
      confidence: 'low',
    }
  }

  const stepDays = getStepDays(safeSeries)
  const periodsPerYear = TRADING_DAYS_PER_YEAR / stepDays
  const avgStepReturn = mean(returns)
  const stepVolatility = standardDeviation(returns)
  const annualReturnRaw = annualizeReturn(avgStepReturn, periodsPerYear)
  const annualVolatilityRaw = annualizeVolatility(stepVolatility, periodsPerYear)
  const multiplier = Number(volatilityMultiplier || 1)

  // Reduce overfitting to short-term drift in limited samples.
  const reliability = clamp(returns.length / 120, 0.25, 1)
  const annualReturn = annualReturnRaw * reliability
  const annualVolatility = clamp(annualVolatilityRaw * multiplier, 0.04, 0.55)

  // Keep base scenario realistic for free-data MVP projections.
  const baseReturn = clamp(annualReturn, -0.2, 0.28)

  // Optimistic: upside with bounded expansion.
  const optimisticBoost = Math.max(0.04, annualVolatility * 0.6)
  const optimisticReturn = clamp(baseReturn + optimisticBoost, -0.05, 0.5)

  // Pessimistic: include explicit tail-risk penalty so losses can appear.
  const tailRiskPenalty = Math.max(0.06, annualVolatility * 0.9)
  let pessimisticReturn = clamp(baseReturn - tailRiskPenalty, -0.5, 0.18)
  if (pessimisticReturn > -0.01 && annualVolatility > 0.1) {
    pessimisticReturn = -0.01
  }
  pessimisticReturn = Math.min(pessimisticReturn, baseReturn - 0.03)

  const base = roundMoney(projectValue(safePrincipal, baseReturn, safeYears))
  const optimistic = roundMoney(
    projectValue(safePrincipal, optimisticReturn, safeYears),
  )
  const pessimistic = roundMoney(
    projectValue(safePrincipal, pessimisticReturn, safeYears),
  )

  const confidence = returns.length >= 50 ? 'medium' : 'low'

  return {
    base,
    pessimistic: Math.max(0, Math.min(pessimistic, base)),
    optimistic: Math.max(base, optimistic),
    annualReturn: Number(baseReturn.toFixed(4)),
    annualVolatility: Number(annualVolatility.toFixed(4)),
    confidence,
  }
}
