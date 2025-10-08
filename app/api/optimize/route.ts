import { type NextRequest, NextResponse } from "next/server"
import { type DailyPoint, toReturns } from "@/lib/risk"

type OptimizeReq = { coinIds: string[]; days?: number; riskTolerance?: "low" | "medium" | "high" }

async function fetchHistory(coinId: string, days: number): Promise<DailyPoint[]> {
  const to = Math.floor(Date.now() / 1000)
  const from = to - days * 86400
  const res = await fetch(
    `/api/historical-data?id=${encodeURIComponent(coinId)}&from=${from}&to=${to}&vs_currency=usd`,
    {
      cache: "no-store",
    },
  )
  const data = await res.json()
  const prices = (data?.prices || []) as [number, number][]
  return prices.map(([ts, price]) => ({ t: Math.floor(ts), price }))
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OptimizeReq
    const days = body.days || 90
    const ids = Array.from(new Set(body.coinIds || [])).slice(0, 10)
    const riskTolerance = body.riskTolerance || "medium"
    if (!ids.length) return NextResponse.json({ error: "coinIds required" }, { status: 400 })

    const histories = await Promise.all(ids.map(async (id) => [id, await fetchHistory(id, days)] as const))
    const scores: { id: string; sharpe: number; vol: number }[] = []

    for (const [id, series] of histories) {
      const r = toReturns(series)
      const mean = r.reduce((s, v) => s + v, 0) / Math.max(1, r.length)
      const vol =
        r.length > 1 ? Math.sqrt(r.reduce((s, v) => s + (v - mean) ** 2, 0) / (r.length - 1)) * Math.sqrt(365) : 0.0001
      const sharpe = vol ? (mean * 365) / vol : 0
      scores.push({ id, sharpe, vol })
    }

    // heuristic: choose top by sharpe, then weight by (sharpe / volAdj)
    const top = scores.sort((a, b) => b.sharpe - a.sharpe).slice(0, Math.min(5, scores.length))
    const volBias = riskTolerance === "low" ? 1.5 : riskTolerance === "high" ? 0.7 : 1.0
    const raw = top.map((s) => ({ id: s.id, w: Math.max(0, s.sharpe) / Math.max(1e-6, s.vol ** volBias) }))
    const sum = raw.reduce((s, x) => s + x.w, 0) || 1
    const weights: Record<string, number> = {}
    raw.forEach((x) => (weights[x.id] = x.w / sum))

    const explanation =
      riskTolerance === "low"
        ? "Favoring lower volatility assets while keeping Sharpe high."
        : riskTolerance === "high"
          ? "Aggressively tilting toward high Sharpe assets, tolerating volatility."
          : "Balanced allocation based on Sharpe with moderate volatility penalty."

    return NextResponse.json({ success: true, weights, picks: top, riskTolerance, explanation })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "optimize failed" }, { status: 500 })
  }
}
