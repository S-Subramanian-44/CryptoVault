"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ComparisonCharts } from "@/components/comparison-charts"
import { DataStatusIndicator } from "@/components/data-status-indicator"
import { Search, Plus, X, TrendingUp, TrendingDown, BarChart3, DollarSign, Percent, Volume2 } from "lucide-react"

interface CoinData {
  id: string
  name: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  image?: string
}

export default function ComparePage() {
  const [selectedCoins, setSelectedCoins] = useState<CoinData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<CoinData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [timeframe, setTimeframe] = useState("30d")
  const [dataStatus, setDataStatus] = useState<"live" | "cached" | "fallback">("live")

  // Mock data for fallback
  const mockCoins: CoinData[] = [
    {
      id: "bitcoin",
      name: "Bitcoin",
      symbol: "btc",
      current_price: 43250.0,
      price_change_percentage_24h: 2.45,
      market_cap: 847000000000,
      total_volume: 28500000000,
    },
    {
      id: "ethereum",
      name: "Ethereum",
      symbol: "eth",
      current_price: 2650.0,
      price_change_percentage_24h: -1.23,
      market_cap: 318000000000,
      total_volume: 15200000000,
    },
    {
      id: "cardano",
      name: "Cardano",
      symbol: "ada",
      current_price: 0.485,
      price_change_percentage_24h: 3.67,
      market_cap: 17200000000,
      total_volume: 890000000,
    },
    {
      id: "solana",
      name: "Solana",
      symbol: "sol",
      current_price: 98.5,
      price_change_percentage_24h: -2.15,
      market_cap: 43800000000,
      total_volume: 2100000000,
    },
    {
      id: "polkadot",
      name: "Polkadot",
      symbol: "dot",
      current_price: 7.25,
      price_change_percentage_24h: 1.89,
      market_cap: 9200000000,
      total_volume: 420000000,
    },
  ]

  const searchCoins = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    try {
      // Try to fetch from CoinGecko API
      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`)

      if (response.ok) {
        const data = await response.json()

        // Get detailed info for the search results
        if (data.coins && data.coins.length > 0) {
          const coinIds = data.coins
            .slice(0, 10)
            .map((coin: any) => coin.id)
            .join(",")
          const detailResponse = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}`,
          )

          if (detailResponse.ok) {
            const detailData = await detailResponse.json()
            setSearchResults(detailData)
            setDataStatus("live")
          } else {
            throw new Error("Failed to fetch coin details")
          }
        } else {
          setSearchResults([])
        }
      } else {
        throw new Error("Search API unavailable")
      }
    } catch (error) {
      console.error("Search error:", error)

      // Use mock data as fallback
      const filteredMockCoins = mockCoins.filter(
        (coin) =>
          coin.name.toLowerCase().includes(query.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(query.toLowerCase()),
      )
      setSearchResults(filteredMockCoins)
      setDataStatus("fallback")
    } finally {
      setIsSearching(false)
    }
  }

  const addCoin = (coin: CoinData) => {
    if (selectedCoins.length >= 5) {
      alert("Maximum 5 coins can be compared at once")
      return
    }

    if (!selectedCoins.find((c) => c.id === coin.id)) {
      setSelectedCoins([...selectedCoins, coin])
    }
    setSearchQuery("")
    setSearchResults([])
  }

  const removeCoin = (coinId: string) => {
    setSelectedCoins(selectedCoins.filter((coin) => coin.id !== coinId))
  }

  const loadPopularCoins = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1",
      )

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
        setDataStatus("live")
      } else {
        throw new Error("API unavailable")
      }
    } catch (error) {
      console.error("Error loading popular coins:", error)
      setSearchResults(mockCoins)
      setDataStatus("fallback")
    }
  }

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery) {
        searchCoins(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

  useEffect(() => {
    // Load popular coins on initial load
    loadPopularCoins()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-green-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Cryptocurrency Comparison
          </h1>
          <p className="text-gray-400 text-lg">
            Compare multiple cryptocurrencies side by side with detailed charts and analytics
          </p>
        </div>

        {/* Data Status */}
        <DataStatusIndicator status={dataStatus} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search and Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Cryptocurrencies
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Search and add up to 5 cryptocurrencies to compare
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search coins (e.g., Bitcoin, Ethereum)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600"
                  />
                </div>

                {/* Search Results */}
                {(searchResults.length > 0 || isSearching) && (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {isSearching ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400 mx-auto"></div>
                      </div>
                    ) : (
                      searchResults.map((coin) => (
                        <div
                          key={coin.id}
                          className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer"
                          onClick={() => addCoin(coin)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold">{coin.symbol.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{coin.name}</p>
                              <p className="text-gray-400 text-sm">{coin.symbol.toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">${coin.current_price.toFixed(2)}</p>
                            <div className="flex items-center gap-1">
                              {coin.price_change_percentage_24h > 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-400" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-400" />
                              )}
                              <span
                                className={`text-xs ${coin.price_change_percentage_24h > 0 ? "text-green-400" : "text-red-400"}`}
                              >
                                {coin.price_change_percentage_24h.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {!searchQuery && searchResults.length === 0 && (
                  <div className="text-center py-4 text-gray-400">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Search for cryptocurrencies to compare</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Coins */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Selected for Comparison
                  <Badge variant="outline" className="ml-2">
                    {selectedCoins.length}/5
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCoins.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No coins selected</p>
                    <p className="text-xs">Search and add coins to start comparing</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCoins.map((coin) => (
                      <div key={coin.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">{coin.symbol.substring(0, 2).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{coin.name}</p>
                            <p className="text-gray-400 text-sm">${coin.current_price.toFixed(2)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCoin(coin.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeframe Selection */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 text-sm">Timeframe</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                    <SelectItem value="90d">90 Days</SelectItem>
                    <SelectItem value="1y">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Results */}
          <div className="lg:col-span-2">
            {selectedCoins.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-12">
                  <div className="text-center text-gray-400">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Start Comparing</h3>
                    <p className="mb-4">Select cryptocurrencies from the search panel to begin comparison</p>
                    <div className="flex justify-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Price Analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        <span>Performance Metrics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        <span>Volume Comparison</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ComparisonCharts coins={selectedCoins} timeframe={timeframe} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
