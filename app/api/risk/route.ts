import { type NextRequest, NextResponse } from "next/server"
import {
  buildNormalizedPortfolioSeries,
  computeCVaR,
  computeMaxDrawdown,
  computeSharpe,
  computeVaR,
  computeVolatility,
  toReturns,
  type DailyPoint,
} from "@/lib/risk"

type PositionIn = { coinId: string; amount: number }
type RiskReq = { positions: PositionIn[]; days?: number; vs_currency?: string }

async function fetchHistory(coinId: string, days: number, vs = "usd"): Promise<DailyPoint[]> {
  const to = Math.floor(Date.now() / 1000)
  const from = to - days * 86400
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/historical-data?id=${encodeURIComponent(coinId)}&from=${from}&to=${to}&vs_currency=${vs}`,
    { cache: "no-store" },
  )
  if (!res.ok) throw new Error(`history ${coinId} ${res.status}`)
  const data = await res.json()
  const prices = (data?.prices || []) as [number, number][]
  return prices.map(([ts, price]) => ({ t: Math.floor(ts), price }))
}

async function fetchCurrentPrices(ids: string[]): Promise<Record<string, number>> {
  const res = await fetch(`/api/simple-price?ids=${encodeURIComponent(ids.join(","))}&vs_currencies=usd`, {
    cache: "no-store",
  })
  const json = await res.json()
  const out: Record<string, number> = {}
  for (const id of ids) out[id] = json?.[id]?.usd || 0
  return out
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RiskReq
    const days = body.days || 90
    const vs = body.vs_currency || "usd"
    const positions = (body.positions || []).filter((p) => p.amount > 0)

    if (!positions.length) {
      return NextResponse.json({ error: "No positions provided" }, { status: 400 })
    }

    const ids = Array.from(new Set(positions.map((p) => p.coinId)))
    const [pricesMap, historiesEntries] = await Promise.all([
      fetchCurrentPrices(ids),
      Promise.all(ids.map(async (id) => [id, await fetchHistory(id, days, vs)] as [string, DailyPoint[]])),
    ])
    const histories: Record<string, DailyPoint[]> = Object.fromEntries(historiesEntries)

    // value weights by current value
    const values = positions.map((p) => ({ id: p.coinId, value: p.amount * (pricesMap[p.coinId] || 0) }))
    const totalVal = values.reduce((s, v) => s + v.value, 0) || 1
    const weights: Record<string, number> = {}
    for (const v of values) weights[v.id] = v.value / totalVal

    const portfolioSeries = buildNormalizedPortfolioSeries(histories, weights)
    const returns = toReturns(portfolioSeries)

    const var95 = computeVaR(returns, 0.95)
    const cvar95 = computeCVaR(returns, 0.95)
    const vol = computeVolatility(returns)
    const sharpe = computeSharpe(returns, 0)
    const mdd = computeMaxDrawdown(portfolioSeries)

    return NextResponse.json({
      success: true,
      metrics: {
        var95: Math.round(var95 * 10000) / 100, // %
        cvar95: Math.round(cvar95 * 10000) / 100,
        volatility: Math.round(vol * 10000) / 100,
        sharpe: Math.round(sharpe * 100) / 100,
        maxDrawdown: Math.round(mdd * 10000) / 100,
        returnsCount: returns.length,
      },
      series: portfolioSeries.slice(-90),
      weights,
      days,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "risk failed" }, { status: 500 })
  }
}
