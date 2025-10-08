"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { portfolioTracker } from "@/lib/portfolio-tracker"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMemo, useState } from "react"

const fetcher = (url: string, body?: any) =>
  fetch(
    url,
    body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : undefined,
  ).then((r) => r.json())

export default function RiskDashboard() {
  const [riskTolerance, setRiskTolerance] = useState<"low" | "medium" | "high">("medium")
  const positions = portfolioTracker.getPositions().map((p) => ({ coinId: p.coinId, amount: p.amount }))
  const { data: risk } = useSWR(positions.length ? ["/api/risk", { positions, days: 90 }] : null, ([url, body]) =>
    fetcher(url, body),
  )

  const coins = useMemo(() => {
    const set = new Set(positions.map((p) => p.coinId))
    return Array.from(set)
  }, [positions])

  const { data: opt } = useSWR(
    coins.length ? ["/api/optimize", { coinIds: coins, days: 90, riskTolerance }] : null,
    ([url, body]) => fetcher(url, body),
  )

  const series = (risk?.series || []).map((d: any) => ({ date: new Date(d.t).toLocaleDateString(), value: d.price }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-green-400">VaR / CVaR (95%)</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <div className="text-2xl font-semibold">
              {risk ? `${risk.metrics.var95}%` : "--"} <span className="text-sm text-gray-400">VaR</span>
            </div>
            <div className="text-xl">
              {risk ? `${risk.metrics.cvar95}%` : "--"} <span className="text-sm text-gray-400">CVaR</span>
            </div>
          </CardContent>
        </Card>
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-blue-400">Volatility / Sharpe</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <div className="text-2xl font-semibold">{risk ? `${risk.metrics.volatility}%` : "--"}</div>
            <div className="text-xl">Sharpe: {risk ? risk.metrics.sharpe : "--"}</div>
          </CardContent>
        </Card>
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-red-400">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <div className="text-2xl font-semibold">{risk ? `${risk.metrics.maxDrawdown}%` : "--"}</div>
            <div className="text-sm text-gray-400">Observations: {risk?.metrics?.returnsCount || "--"}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-green-400">Portfolio Value (Normalized)</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(34,197,94,0.2)" }} />
              <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-blue-400">Optimization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Risk tolerance:</span>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((rt) => (
                <Button
                  key={rt}
                  size="sm"
                  variant={riskTolerance === rt ? "default" : "outline"}
                  className={riskTolerance === rt ? "crypto-button" : "bg-gray-800 border-gray-700 text-gray-300"}
                  onClick={() => setRiskTolerance(rt)}
                >
                  {rt}
                </Button>
              ))}
            </div>
            {opt?.riskTolerance && (
              <Badge variant="outline" className="bg-gray-800 border-gray-700 ml-2">
                {opt.riskTolerance}
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-300">
            {opt?.explanation || "Run optimization based on historical Sharpe and volatility."}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {opt?.weights &&
              Object.entries(opt.weights).map(([id, w]: any) => (
                <div
                  key={id}
                  className="flex items-center justify-between p-3 rounded-md bg-gray-800/60 border border-gray-700"
                >
                  <span className="text-gray-200">{id}</span>
                  <span className="text-green-400 font-semibold">{(w * 100).toFixed(1)}%</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
