"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import type { EnhancedCoinData } from "@/lib/enhanced-coingecko-api"

interface VolumeAnalysisProps {
  coins: EnhancedCoinData[]
}

export function VolumeAnalysis({ coins }: VolumeAnalysisProps) {
  const topVolumeCoins = coins.sort((a, b) => b.total_volume - a.total_volume).slice(0, 10)

  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="text-green-400 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          24h Volume Leaders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topVolumeCoins.map((coin, index) => (
            <div
              key={coin.id}
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-green-500/20"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-green-400 font-bold text-sm">#{index + 1}</span>
                </div>
                <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-8 h-8" />
                <div>
                  <h4 className="font-semibold text-white">{coin.name}</h4>
                  <p className="text-sm text-gray-400">{coin.symbol.toUpperCase()}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-green-400">${(coin.total_volume / 1e9).toFixed(2)}B</p>
                <div className="flex items-center">
                  {coin.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
                  )}
                  <span
                    className={`text-sm ${coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
