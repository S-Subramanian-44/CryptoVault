"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { fetchEnhancedTopCoins, type EnhancedCoinData } from "@/lib/enhanced-coingecko-api"
import { Search, X, BarChart3, TrendingUp } from "lucide-react"

interface CoinComparisonSelectorProps {
  selectedCoins: string[]
  onSelectionChange: (coinIds: string[]) => void
  maxSelection?: number
}

export function CoinComparisonSelector({
  selectedCoins,
  onSelectionChange,
  maxSelection = 5,
}: CoinComparisonSelectorProps) {
  const [coins, setCoins] = useState<EnhancedCoinData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCoins, setFilteredCoins] = useState<EnhancedCoinData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCoins = async () => {
      try {
        const data = await fetchEnhancedTopCoins(100)
        setCoins(data)
        setFilteredCoins(data)
      } catch (error) {
        console.error("Error loading coins:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCoins()
  }, [])

  useEffect(() => {
    const filtered = coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCoins(filtered)
  }, [searchTerm, coins])

  const toggleCoin = (coinId: string) => {
    if (selectedCoins.includes(coinId)) {
      onSelectionChange(selectedCoins.filter((id) => id !== coinId))
    } else if (selectedCoins.length < maxSelection) {
      onSelectionChange([...selectedCoins, coinId])
    }
  }

  const clearSelection = () => {
    onSelectionChange([])
  }

  const getSelectedCoinData = () => {
    return coins.filter((coin) => selectedCoins.includes(coin.id))
  }

  return (
    <Card className="crypto-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-400 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Compare Cryptocurrencies
            <Badge variant="outline" className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/20">
              {selectedCoins.length}/{maxSelection}
            </Badge>
          </CardTitle>
          {selectedCoins.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearSelection} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Selected Coins Display */}
        {selectedCoins.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Selected for Comparison:</h4>
            <div className="flex flex-wrap gap-2">
              {getSelectedCoinData().map((coin) => (
                <Badge
                  key={coin.id}
                  variant="outline"
                  className="bg-green-500/20 text-green-400 border-green-500/20 flex items-center space-x-2 px-3 py-1"
                >
                  <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-4 h-4" />
                  <span>{coin.symbol.toUpperCase()}</span>
                  <button onClick={() => toggleCoin(coin.id)} className="ml-1 hover:bg-red-500/20 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search cryptocurrencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-green-500/20 text-white placeholder-gray-400"
          />
        </div>

        {/* Coin List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading cryptocurrencies...</p>
            </div>
          ) : (
            filteredCoins.slice(0, 50).map((coin) => {
              const isSelected = selectedCoins.includes(coin.id)
              const isDisabled = !isSelected && selectedCoins.length >= maxSelection

              return (
                <div
                  key={coin.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-green-500/20 border-green-500/40"
                      : isDisabled
                        ? "bg-gray-800/30 border-gray-700/50 opacity-50"
                        : "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 cursor-pointer"
                  }`}
                  onClick={() => !isDisabled && toggleCoin(coin.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      className="border-green-500/20 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-8 h-8" />
                    <div>
                      <h4 className="font-medium text-white">{coin.name}</h4>
                      <p className="text-sm text-gray-400 uppercase">{coin.symbol}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-green-400">${coin.current_price.toLocaleString()}</p>
                    <div
                      className={`flex items-center text-sm ${coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      <TrendingUp
                        className={`h-3 w-3 mr-1 ${coin.price_change_percentage_24h < 0 ? "rotate-180" : ""}`}
                      />
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
