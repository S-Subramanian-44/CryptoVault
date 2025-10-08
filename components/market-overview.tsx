"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react"

interface MarketOverviewProps {
  globalData: any
}

export function MarketOverview({ globalData }: MarketOverviewProps) {
  const totalMarketCap = globalData?.data?.total_market_cap?.usd || 0
  const marketCapChange = globalData?.data?.market_cap_change_percentage_24h_usd || 0
  const totalVolume = globalData?.data?.total_volume?.usd || 0

  return (
    <>
      <Card className="crypto-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Total Market Cap</CardTitle>
          <DollarSign className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-400">${(totalMarketCap / 1e12).toFixed(2)}T</div>
          <p className={`text-xs flex items-center ${marketCapChange >= 0 ? "text-green-400" : "text-red-400"}`}>
            {marketCapChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {Math.abs(marketCapChange).toFixed(2)}% from yesterday
          </p>
        </CardContent>
      </Card>

      <Card className="crypto-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">24h Volume</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-400">${(totalVolume / 1e9).toFixed(0)}B</div>
          <p className="text-xs text-gray-400">Trading volume</p>
        </CardContent>
      </Card>
    </>
  )
}
