"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { EnhancedCoinData } from "@/lib/enhanced-coingecko-api"

interface MarketCapChartProps {
  coins: EnhancedCoinData[]
}

export function MarketCapChart({ coins }: MarketCapChartProps) {
  const chartData = coins.map((coin, index) => ({
    name: coin.name,
    value: coin.market_cap,
    color: `hsl(${120 + index * 30}, 70%, 50%)`,
  }))

  const COLORS = [
    "#22C55E",
    "#10B981",
    "#059669",
    "#047857",
    "#065F46",
    "#34D399",
    "#6EE7B7",
    "#9CA3AF",
    "#6B7280",
    "#4B5563",
  ]

  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="text-green-400">Market Cap Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`$${(value / 1e9).toFixed(2)}B`, "Market Cap"]}
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #22C55E",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
