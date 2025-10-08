"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface FearGreedMeterProps {
  fearGreedData: any
}

export function FearGreedMeter({ fearGreedData }: FearGreedMeterProps) {
  const value = fearGreedData?.value || 50
  const classification = fearGreedData?.value_classification || "Neutral"

  const getColor = () => {
    if (value <= 25) return "text-red-400"
    if (value <= 45) return "text-orange-400"
    if (value <= 55) return "text-yellow-400"
    if (value <= 75) return "text-green-400"
    return "text-emerald-400"
  }

  const getGradient = () => {
    const percentage = (value / 100) * 180 // Convert to degrees for half circle
    return `conic-gradient(from 180deg, #ef4444 0deg, #f97316 45deg, #eab308 90deg, #22c55e 135deg, #10b981 180deg)`
  }

  return (
    <Card className="crypto-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">Fear & Greed</CardTitle>
        <AlertTriangle className="h-4 w-4 text-yellow-400" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-10 mb-2">
            <div
              className="w-20 h-20 rounded-full"
              style={{
                background: getGradient(),
                clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0% 100%)",
              }}
            ></div>
            <div
              className="absolute top-0 left-1/2 w-1 h-10 bg-white rounded-full origin-bottom transform -translate-x-1/2"
              style={{
                transform: `translateX(-50%) rotate(${(value / 100) * 180 - 90}deg)`,
              }}
            ></div>
          </div>
          <div className={`text-xl font-bold ${getColor()}`}>{value}</div>
          <p className={`text-xs ${getColor()}`}>{classification}</p>
        </div>
      </CardContent>
    </Card>
  )
}
