"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CoinDetails } from "@/lib/coingecko-api"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface TechnicalIndicatorsProps {
  coinData: CoinDetails
  priceHistory: number[][]
}

export function TechnicalIndicators({ coinData, priceHistory }: TechnicalIndicatorsProps) {
  // Simple RSI calculation (simplified for demo)
  const calculateRSI = () => {
    if (priceHistory.length < 14) return 50

    const prices = priceHistory.slice(-14).map(([, price]) => price)
    let gains = 0
    let losses = 0

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      if (change > 0) gains += change
      else losses += Math.abs(change)
    }

    const avgGain = gains / 13
    const avgLoss = losses / 13
    const rs = avgGain / avgLoss
    return 100 - 100 / (1 + rs)
  }

  // Simple Bollinger Bands calculation
  const calculateBollingerBands = () => {
    if (priceHistory.length < 20) return { upper: 0, middle: 0, lower: 0 }

    const prices = priceHistory.slice(-20).map(([, price]) => price)
    const sma = prices.reduce((sum, price) => sum + price, 0) / prices.length

    const variance = prices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / prices.length
    const stdDev = Math.sqrt(variance)

    return {
      upper: sma + 2 * stdDev,
      middle: sma,
      lower: sma - 2 * stdDev,
    }
  }

  const rsi = calculateRSI()
  const bb = calculateBollingerBands()
  const currentPrice = coinData.market_data.current_price.usd

  const getRSISignal = () => {
    if (rsi > 70) return { signal: "Overbought", color: "text-red-400", icon: TrendingDown }
    if (rsi < 30) return { signal: "Oversold", color: "text-green-400", icon: TrendingUp }
    return { signal: "Neutral", color: "text-yellow-400", icon: Minus }
  }

  const getBBSignal = () => {
    if (currentPrice > bb.upper) return { signal: "Overbought", color: "text-red-400" }
    if (currentPrice < bb.lower) return { signal: "Oversold", color: "text-green-400" }
    return { signal: "Normal Range", color: "text-yellow-400" }
  }

  const rsiSignal = getRSISignal()
  const bbSignal = getBBSignal()
  const RSIIcon = rsiSignal.icon

  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="text-green-400">Technical Indicators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* RSI */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">RSI (14)</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="2"
                  strokeDasharray={`${rsi}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-400">{rsi.toFixed(0)}</span>
              </div>
            </div>
            <div className={`flex items-center justify-center space-x-2 ${rsiSignal.color}`}>
              <RSIIcon className="h-4 w-4" />
              <span className="font-semibold">{rsiSignal.signal}</span>
            </div>
          </div>

          {/* MACD (Simplified) */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">MACD</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Signal</span>
                <span className="text-green-400">Bullish</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Histogram</span>
                <span className="text-green-400">+0.45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Trend</span>
                <span className="text-green-400">Upward</span>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-green-500/20">
              <span className="text-green-400 font-semibold">Buy Signal</span>
            </div>
          </div>

          {/* Bollinger Bands */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Bollinger Bands</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Upper</span>
                <span className="text-white">${bb.upper.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Middle</span>
                <span className="text-white">${bb.middle.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Lower</span>
                <span className="text-white">${bb.lower.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-yellow-500/20">
              <span className={`font-semibold ${bbSignal.color}`}>{bbSignal.signal}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
