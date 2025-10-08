"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cryptoStreamer, type StreamingData } from "@/lib/realtime-streaming"
import { DollarSign, TrendingUp, TrendingDown, Globe, Activity, Clock, Wifi, WifiOff } from "lucide-react"
import { RealTimePriceDisplay } from "@/components/realtime-price-display"

export function RealTimeMarketOverview() {
  const [streamingData, setStreamingData] = useState<StreamingData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("")

  useEffect(() => {
    const unsubscribe = cryptoStreamer.subscribeToGlobal((data) => {
      setStreamingData(data)
      setIsConnected(cryptoStreamer.getConnectionStatus())
      setLastUpdateTime(new Date().toLocaleTimeString())
    })

    return unsubscribe
  }, [])

  if (!streamingData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="crypto-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-400 animate-spin" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalMarketCap = streamingData.globalData?.data?.total_market_cap?.usd || 0
  const marketCapChange = streamingData.globalData?.data?.market_cap_change_percentage_24h_usd || 0
  const totalVolume = streamingData.globalData?.data?.total_volume?.usd || 0
  const activeCryptos = streamingData.globalData?.data?.active_cryptocurrencies || 0
  const fearGreedValue = streamingData.fearGreed?.value || 50
  const fearGreedClassification = streamingData.fearGreed?.value_classification || "Neutral"

  const getFearGreedColor = () => {
    if (fearGreedValue <= 25) return "text-red-400"
    if (fearGreedValue <= 45) return "text-orange-400"
    if (fearGreedValue <= 55) return "text-yellow-400"
    if (fearGreedValue <= 75) return "text-green-400"
    return "text-emerald-400"
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="crypto-card border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isConnected ? <Wifi className="h-5 w-5 text-green-400" /> : <WifiOff className="h-5 w-5 text-red-400" />}
              <div>
                <h3 className="font-semibold text-white">
                  {isConnected ? "Live Data Stream Active" : "Connection Lost"}
                </h3>
                <p className="text-sm text-gray-400">
                  {isConnected ? "Real-time updates enabled" : "Attempting to reconnect..."}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Last update: {lastUpdateTime}</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
                ></div>
                <span className="text-xs text-gray-500">{streamingData.prices.size} coins tracked</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Market Cap */}
        <Card className="crypto-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Market Cap</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">${(totalMarketCap / 1e12).toFixed(2)}T</div>
            <p className={`text-xs flex items-center ${marketCapChange >= 0 ? "text-green-400" : "text-red-400"}`}>
              {marketCapChange >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(marketCapChange).toFixed(2)}% from yesterday
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">Live</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        {/* 24h Volume */}
        <Card className="crypto-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">24h Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">${(totalVolume / 1e9).toFixed(0)}B</div>
            <p className="text-xs text-gray-400">Trading volume</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">Live</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        {/* Fear & Greed Index */}
        <Card className="crypto-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Fear & Greed</CardTitle>
            <Activity className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getFearGreedColor()}`}>{fearGreedValue}</div>
            <p className={`text-xs ${getFearGreedColor()}`}>{fearGreedClassification}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">Live</span>
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${getFearGreedColor().replace("text-", "bg-")}`}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Active Cryptocurrencies */}
        <Card className="crypto-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Cryptos</CardTitle>
            <Globe className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{activeCryptos.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Tracked globally</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">Live</span>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Price Tickers */}
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center">
            <Activity className="h-5 w-5 mr-2 animate-pulse" />
            Live Price Tickers
            <Badge variant="outline" className="ml-2 bg-green-500/20 text-green-400 border-green-500/20">
              {streamingData.prices.size} coins
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from(streamingData.prices.values())
              .slice(0, 8)
              .map((coin) => (
                <RealTimePriceDisplay
                  key={coin.id}
                  coinId={coin.id}
                  showTimestamp={true}
                  showChange={true}
                  className="border-green-500/20"
                />
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
