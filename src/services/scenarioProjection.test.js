import { describe, expect, it } from 'vitest'
import { calculateScenarioProjection } from './scenarioProjection'

const DAY_SEC = 24 * 60 * 60

function dailyCloseSeries(pointCount, { startTs = 1_700_000_000, dailyFactor = 1.001 } = {}) {
  let close = 100
  const series = []
  for (let i = 0; i < pointCount; i += 1) {
    series.push({ timestamp: startTs + i * DAY_SEC, close })
    close *= dailyFactor
  }
  return series
}

describe('calculateScenarioProjection', () => {
  it('throws when principal is not a positive finite number', () => {
    expect(() =>
      calculateScenarioProjection({
        principal: 0,
        series: dailyCloseSeries(10),
        horizonYears: 5,
      }),
    ).toThrow(/Principal must be a positive number/)
    expect(() =>
      calculateScenarioProjection({
        principal: -100,
        series: dailyCloseSeries(10),
        horizonYears: 5,
      }),
    ).toThrow(/Principal must be a positive number/)
    expect(() =>
      calculateScenarioProjection({
        principal: Number.NaN,
        series: dailyCloseSeries(10),
        horizonYears: 5,
      }),
    ).toThrow(/Principal must be a positive number/)
  })

  it('throws when horizon years is not a positive finite number', () => {
    expect(() =>
      calculateScenarioProjection({
        principal: 10_000,
        series: dailyCloseSeries(10),
        horizonYears: 0,
      }),
    ).toThrow(/Horizon years must be a positive number/)
    expect(() =>
      calculateScenarioProjection({
        principal: 10_000,
        series: dailyCloseSeries(10),
        horizonYears: -1,
      }),
    ).toThrow(/Horizon years must be a positive number/)
  })

  it('returns principal-only fallback when series has fewer than 3 points', () => {
    const result = calculateScenarioProjection({
      principal: 12_345.67,
      series: dailyCloseSeries(2),
      horizonYears: 3,
    })
    expect(result).toEqual({
      base: 12_345.67,
      pessimistic: 12_345.67,
      optimistic: 12_345.67,
      annualReturn: 0,
      annualVolatility: 0,
      confidence: 'low',
    })
  })

  it('treats non-array series like an empty series (fallback)', () => {
    const result = calculateScenarioProjection({
      principal: 5000,
      series: null,
      horizonYears: 2,
    })
    expect(result.base).toBe(5000)
    expect(result.confidence).toBe('low')
    expect(result.annualReturn).toBe(0)
  })

  it('returns fallback when not enough valid return observations', () => {
    const junkSeries = [
      { timestamp: 1, close: 0 },
      { timestamp: 1 + DAY_SEC, close: 100 },
      { timestamp: 1 + 2 * DAY_SEC, close: 200 },
    ]
    const result = calculateScenarioProjection({
      principal: 1000,
      series: junkSeries,
      horizonYears: 1,
    })
    expect(result.base).toBe(1000)
    expect(result.annualVolatility).toBe(0)
    expect(result.confidence).toBe('low')
  })

  it('coerces numeric string principal and horizon', () => {
    const series = dailyCloseSeries(5)
    const result = calculateScenarioProjection({
      principal: '10000',
      series,
      horizonYears: '2',
    })
    expect(Number.isFinite(result.base)).toBe(true)
    expect(result.pessimistic).toBeLessThanOrEqual(result.base)
    expect(result.optimistic).toBeGreaterThanOrEqual(result.base)
  })

  it('orders scenarios pessimistic ≤ base ≤ optimistic for a stable upward drift', () => {
    const series = dailyCloseSeries(60, { dailyFactor: 1.0005 })
    const result = calculateScenarioProjection({
      principal: 50_000,
      series,
      horizonYears: 5,
    })
    expect(result.pessimistic).toBeLessThanOrEqual(result.base)
    expect(result.optimistic).toBeGreaterThanOrEqual(result.base)
    expect(result.confidence).toBe('medium')
    expect(result.annualVolatility).toBeGreaterThanOrEqual(0.04)
    expect(result.annualVolatility).toBeLessThanOrEqual(0.55)
  })

  it('keeps confidence low when there are fewer than 50 return samples', () => {
    const series = dailyCloseSeries(50)
    const result = calculateScenarioProjection({
      principal: 10_000,
      series,
      horizonYears: 1,
    })
    expect(result.confidence).toBe('low')
  })

  it('scales reported volatility with volatilityMultiplier (within clamp)', () => {
    const series = dailyCloseSeries(80, { dailyFactor: 1.002 })
    const baseRun = calculateScenarioProjection({
      principal: 20_000,
      series,
      horizonYears: 3,
      volatilityMultiplier: 1,
    })
    const boosted = calculateScenarioProjection({
      principal: 20_000,
      series,
      horizonYears: 3,
      volatilityMultiplier: 2,
    })
    expect(boosted.annualVolatility).toBeGreaterThanOrEqual(baseRun.annualVolatility)
    expect(boosted.annualVolatility).toBeLessThanOrEqual(0.55)
  })

  it('rounds scenario amounts to two decimal places', () => {
    const series = dailyCloseSeries(55, { dailyFactor: 1.001 })
    const result = calculateScenarioProjection({
      principal: 3333.333,
      series,
      horizonYears: 2,
    })
    for (const key of ['base', 'pessimistic', 'optimistic']) {
      const fraction = String(result[key]).split('.')[1]
      expect(fraction === undefined || fraction.length <= 2).toBe(true)
    }
  })
})
