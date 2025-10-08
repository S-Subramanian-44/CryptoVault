"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchCoinDetails, fetchCoinHistory, type CoinDetails } from "@/lib/coingecko-api"
import { PriceChart } from "@/components/price-chart"
import { TechnicalIndicators } from "@/components/technical-indicators"
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react"

export default function CoinDetail() {
  const params = useParams()
  const coinId = params.coinId as string
  const [coinData, setCoinData] = useState<CoinDetails | null>(null)
  const [priceHistory, setPriceHistory] = useState<number[][]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCoinData = async () => {
      try {
        const [details, history] = await Promise.all([fetchCoinDetails(coinId), fetchCoinHistory(coinId, 30)])

        setCoinData(details)
        setPriceHistory(history)
      } catch (error) {
        console.error("Error loading coin data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (coinId) {
      loadCoinData()
    }
  }, [coinId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-green-400">Loading coin data...</p>
        </div>
      </div>
    )
  }

  if (!coinData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">Failed to load coin data</p>
        </div>
      </div>
    )
  }

  const currentPrice = coinData.market_data.current_price.usd
  const priceChange24h = coinData.market_data.price_change_percentage_24h
  const priceChange7d = coinData.market_data.price_change_percentage_7d
  const priceChange30d = coinData.market_data.price_change_percentage_30d

  const getRiskLevel = () => {
    const volatility = Math.abs(priceChange24h)
    if (volatility > 10) return { level: "High", color: "text-red-400", bg: "bg-red-500/20" }
    if (volatility > 5) return { level: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/20" }
    return { level: "Low", color: "text-green-400", bg: "bg-green-500/20" }
  }

  const risk = getRiskLevel()

  const getSuggestedAction = () => {
    if (priceChange24h > 5) return { action: "CONSIDER SELL", color: "text-red-400" }
    if (priceChange24h < -5) return { action: "CONSIDER BUY", color: "text-green-400" }
    return { action: "HOLD", color: "text-yellow-400" }
  }

  const suggestion = getSuggestedAction()

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <img
            src={coinData.image?.large || coinData.image?.small || "/placeholder.svg?height=64&width=64"}
            alt={coinData.name}
            className="w-16 h-16 rounded-full"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=64&width=64"
            }}
          />
          <div>
            <h1 className="text-4xl font-bold text-white">{coinData.name}</h1>
            <p className="text-xl text-gray-400 uppercase">{coinData.symbol}</p>
          </div>
        </div>

        {/* Price Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-sm text-gray-300">Current Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">${currentPrice.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-sm text-gray-300">24h Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold flex items-center ${priceChange24h >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {priceChange24h >= 0 ? (
                  <TrendingUp className="h-6 w-6 mr-2" />
                ) : (
                  <TrendingDown className="h-6 w-6 mr-2" />
                )}
                {Math.abs(priceChange24h).toFixed(2)}%
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-sm text-gray-300">Risk Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${risk.color}`}>{risk.level}</div>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-sm text-gray-300">Suggested Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl font-bold ${suggestion.color}`}>{suggestion.action}</div>
            </CardContent>
          </Card>
        </div>

        {/* Price Chart */}
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-green-400">Price Chart (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceChart data={priceHistory} coinName={coinData.name} />
          </CardContent>
        </Card>

        {/* Technical Indicators */}
        <TechnicalIndicators coinData={coinData} priceHistory={priceHistory} />

        {/* Market Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-green-400">Market Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Market Cap</span>
                <span className="text-white font-semibold">
                  ${(coinData.market_data.market_cap.usd / 1e9).toFixed(2)}B
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">24h Volume</span>
                <span className="text-white font-semibold">
                  ${(coinData.market_data.total_volume.usd / 1e6).toFixed(2)}M
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">All-Time High</span>
                <span className="text-white font-semibold">${coinData.market_data.ath.usd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">All-Time Low</span>
                <span className="text-white font-semibold">${coinData.market_data.atl.usd.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-green-400">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">24h Change</span>
                <span className={`font-semibold ${priceChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {priceChange24h.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">7d Change</span>
                <span className={`font-semibold ${priceChange7d >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {priceChange7d.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">30d Change</span>
                <span className={`font-semibold ${priceChange30d >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {priceChange30d.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">From ATH</span>
                <span className="text-red-400 font-semibold">
                  {coinData.market_data.ath_change_percentage.usd.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
