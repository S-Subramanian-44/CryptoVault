"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { CoinData } from "@/lib/coingecko-api"
import { TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"

interface CoinCardProps {
  coin: CoinData
}

export function CoinCard({ coin }: CoinCardProps) {
  const priceChange = coin.price_change_percentage_24h
  const isPositive = priceChange >= 0

  return (
    <Link href={`/explorer/${coin.id}`}>
      <Card className="crypto-card hover:crypto-glow transition-all duration-300 cursor-pointer futuristic-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-8 h-8" />
              <div>
                <h3 className="font-semibold text-white">{coin.name}</h3>
                <p className="text-sm text-gray-400 uppercase">{coin.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-400">${coin.current_price.toLocaleString()}</p>
              <div className={`flex items-center text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
                {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(priceChange).toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div>
              <p>Market Cap</p>
              <p className="text-white">${(coin.market_cap / 1e9).toFixed(2)}B</p>
            </div>
            <div>
              <p>Volume 24h</p>
              <p className="text-white">${(coin.total_volume / 1e6).toFixed(2)}M</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
