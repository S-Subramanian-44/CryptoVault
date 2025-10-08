export type DailyPoint = { t: number; price: number }
export type RiskMetrics = {
  var95: number
  cvar95: number
  volatility: number
  sharpe: number
  maxDrawdown: number
  returnsCount: number
}

export function toReturns(series: DailyPoint[]): number[] {
  const r: number[] = []
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1].price
    const cur = series[i].price
    if (prev > 0) r.push((cur - prev) / prev)
  }
  return r
}

export function percentile(values: number[], p: number): number {
  if (!values.length) return 0
  const arr = [...values].sort((a, b) => a - b)
  const idx = Math.max(0, Math.min(arr.length - 1, Math.floor(p * (arr.length - 1))))
  return arr[idx]
}

export function computeVaR(returns: number[], alpha = 0.95): number {
  // VaR at 95%: quantile of loss distribution (negative tail)
  const loss = returns.map((x) => -x)
  const q = percentile(loss, alpha)
  return Math.max(0, q)
}

export function computeCVaR(returns: number[], alpha = 0.95): number {
  const loss = returns.map((x) => -x).sort((a, b) => a - b)
  const q = computeVaR(returns, alpha)
  const tail = loss.filter((l) => l >= q)
  if (!tail.length) return q
  return tail.reduce((s, v) => s + v, 0) / tail.length
}

export function computeVolatility(returns: number[], periodsPerYear = 365): number {
  if (returns.length < 2) return 0
  const mean = returns.reduce((s, v) => s + v, 0) / returns.length
  const variance = returns.reduce((s, v) => s + (v - mean) ** 2, 0) / (returns.length - 1)
  const dailyStd = Math.sqrt(variance)
  return dailyStd * Math.sqrt(periodsPerYear)
}

export function computeSharpe(returns: number[], rf = 0, periodsPerYear = 365): number {
  if (!returns.length) return 0
  const mean = returns.reduce((s, v) => s + v, 0) / returns.length
  const vol = computeVolatility(returns, periodsPerYear)
  if (vol === 0) return 0
  const excess = mean - rf / periodsPerYear
  return (excess * periodsPerYear) / vol
}

export function computeMaxDrawdown(series: DailyPoint[]): number {
  let peak = Number.NEGATIVE_INFINITY
  let maxDD = 0
  for (const pt of series) {
    peak = Math.max(peak, pt.price)
    const dd = peak > 0 ? (pt.price - peak) / peak : 0
    maxDD = Math.min(maxDD, dd)
  }
  return -maxDD // return positive drawdown %
}

export function buildNormalizedPortfolioSeries(
  histories: Record<string, DailyPoint[]>,
  weights: Record<string, number>,
): DailyPoint[] {
  // intersection by timestamp
  const tsSet = new Set<number>()
  Object.values(histories).forEach((arr) => arr.forEach((p) => tsSet.add(p.t)))
  const timestamps = Array.from(tsSet).sort((a, b) => a - b)

  return timestamps.map((t) => {
    let pv = 0
    for (const [coin, series] of Object.entries(histories)) {
      const w = weights[coin] || 0
      const pt = series.find((p) => p.t === t)
      if (pt) pv += w * pt.price
    }
    return { t, price: pv }
  })
}
