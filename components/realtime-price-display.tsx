"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cryptoStreamer, type RealTimePrice } from "@/lib/realtime-streaming"
import { TrendingUp, TrendingDown, Clock, Wifi, WifiOff, Activity } from "lucide-react"

interface RealTimePriceDisplayProps {
  coinId: string
  showTimestamp?: boolean
  showChange?: boolean
  showVolume?: boolean
  className?: string
}

export function RealTimePriceDisplay({
  coinId,
  showTimestamp = true,
  showChange = true,
  showVolume = false,
  className = "",
}: RealTimePriceDisplayProps) {
  const [priceData, setPriceData] = useState<RealTimePrice | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [priceAnimation, setPriceAnimation] = useState<"up" | "down" | null>(null)

  useEffect(() => {
    // Subscribe to real-time updates for this coin
    const unsubscribe = cryptoStreamer.subscribe(coinId, (data) => {
      const previousPrice = priceData?.price
      setPriceData(data)

      // Trigger price animation
      if (previousPrice && data.price !== previousPrice) {
        setPriceAnimation(data.price > previousPrice ? "up" : "down")
        setTimeout(() => setPriceAnimation(null), 1000)
      }
    })

    // Check connection status
    setIsConnected(cryptoStreamer.getConnectionStatus())

    return unsubscribe
  }, [coinId, priceData?.price])

  if (!priceData) {
    return (
      <Card className={`crypto-card ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Activity className="h-4 w-4 text-green-400 animate-spin mr-2" />
            <span className="text-gray-400 text-sm">Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPositive = priceData.change24h >= 0

  return (
    <Card
      className={`crypto-card ${className} ${priceAnimation === "up" ? "animate-pulse bg-green-500/10" : priceAnimation === "down" ? "animate-pulse bg-red-500/10" : ""}`}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Header with connection status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-white text-sm">{priceData.name}</h3>
              <Badge variant="outline" className="text-xs bg-gray-800 border-gray-600">
                {priceData.symbol.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              {isConnected ? <Wifi className="h-3 w-3 text-green-400" /> : <WifiOff className="h-3 w-3 text-red-400" />}
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div
              className={`text-lg font-bold transition-colors duration-300 ${
                priceAnimation === "up"
                  ? "text-green-400"
                  : priceAnimation === "down"
                    ? "text-red-400"
                    : "text-green-400"
              }`}
            >
              $
              {priceData.price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: priceData.price < 1 ? 6 : 2,
              })}
            </div>

            {showChange && (
              <div className={`flex items-center text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
                {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(priceData.change24h).toFixed(2)}%
              </div>
            )}
          </div>

          {/* Volume */}
          {showVolume && (
            <div className="text-xs text-gray-400">Volume: ${(priceData.volume24h / 1e6).toFixed(2)}M</div>
          )}

          {/* Timestamp */}
          {showTimestamp && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Last update: {priceData.lastUpdate}</span>
              </div>
              <span>Live</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
