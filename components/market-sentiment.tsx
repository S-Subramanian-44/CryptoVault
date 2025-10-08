"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MarketSentimentProps {
  globalData: any
}

export function MarketSentiment({ globalData }: MarketSentimentProps) {
  const marketCapChange = globalData?.data?.market_cap_change_percentage_24h_usd || 0

  const getSentiment = () => {
    if (marketCapChange > 2)
      return { label: "Bullish", color: "text-green-400", icon: TrendingUp, bg: "bg-green-500/20" }
    if (marketCapChange < -2)
      return { label: "Bearish", color: "text-red-400", icon: TrendingDown, bg: "bg-red-500/20" }
    return { label: "Neutral", color: "text-yellow-400", icon: Minus, bg: "bg-yellow-500/20" }
  }

  const sentiment = getSentiment()
  const Icon = sentiment.icon

  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="text-green-400">Market Sentiment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center space-x-4">
          <div className={`p-4 rounded-full ${sentiment.bg}`}>
            <Icon className={`h-8 w-8 ${sentiment.color}`} />
          </div>
          <div className="text-center">
            <h3 className={`text-2xl font-bold ${sentiment.color}`}>{sentiment.label}</h3>
            <p className="text-gray-400">Overall market trend</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-400">24h Change</p>
            <p className={`font-bold ${marketCapChange >= 0 ? "text-green-400" : "text-red-400"}`}>
              {marketCapChange.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">BTC Dominance</p>
            <p className="font-bold text-green-400">
              {globalData?.data?.market_cap_percentage?.btc?.toFixed(1) || "N/A"}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">ETH Dominance</p>
            <p className="font-bold text-green-400">
              {globalData?.data?.market_cap_percentage?.eth?.toFixed(1) || "N/A"}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
