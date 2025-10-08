"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { EnhancedCoinData } from "@/lib/enhanced-coingecko-api"
import { TrendingUp, TrendingDown, Star, Eye, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface EnhancedCoinCardProps {
  coin: EnhancedCoinData
  isFavorite: boolean
  onToggleFavorite: () => void
}

export function EnhancedCoinCard({ coin, isFavorite, onToggleFavorite }: EnhancedCoinCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const priceChange = coin.price_change_percentage_24h
  const isPositive = priceChange >= 0

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    return num.toLocaleString()
  }

  return (
    <Card
      className="crypto-card hover:crypto-glow transition-all duration-300 cursor-pointer futuristic-border relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-10 h-10 rounded-full" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">{coin.name}</h3>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-400 uppercase">{coin.symbol}</p>
                <span className="text-xs text-gray-500">#{coin.market_cap_rank}</span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              onToggleFavorite()
            }}
            className="p-1 h-auto hover:bg-yellow-500/20"
          >
            <Star className={`h-4 w-4 ${isFavorite ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`} />
          </Button>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-green-400">${coin.current_price.toLocaleString()}</p>
            <div className={`flex items-center text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(priceChange).toFixed(2)}%
            </div>
          </div>

          {/* Sparkline */}
          {coin.sparkline_in_7d && (
            <div className="mt-2 h-8">
              <svg width="100%" height="100%" className="overflow-visible">
                <polyline
                  fill="none"
                  stroke={isPositive ? "#22C55E" : "#EF4444"}
                  strokeWidth="1.5"
                  points={coin.sparkline_in_7d.price
                    .map(
                      (price, index) =>
                        `${(index / (coin.sparkline_in_7d!.price.length - 1)) * 100},${100 - ((price - Math.min(...coin.sparkline_in_7d!.price)) / (Math.max(...coin.sparkline_in_7d!.price) - Math.min(...coin.sparkline_in_7d!.price))) * 100}`,
                    )
                    .join(" ")}
                />
              </svg>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-400">Market Cap</p>
            <p className="text-white font-medium">${formatLargeNumber(coin.market_cap)}</p>
          </div>
          <div>
            <p className="text-gray-400">Volume 24h</p>
            <p className="text-white font-medium">${formatLargeNumber(coin.total_volume)}</p>
          </div>
        </div>

        {/* Hover Actions */}
        {isHovered && (
          <div className="absolute inset-0 bg-gray-900/95 flex items-center justify-center space-x-2 transition-all duration-200">
            <Link href={`/explorer/${coin.id}`}>
              <Button size="sm" className="crypto-button text-xs">
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </Link>
            <Button size="sm" variant="outline" className="text-xs bg-gray-800 border-green-500/20">
              <BarChart3 className="h-3 w-3 mr-1" />
              Chart
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
