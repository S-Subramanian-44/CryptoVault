"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RealTimeMarketOverview } from "@/components/realtime-market-overview"
import { RealTimePriceDisplay } from "@/components/realtime-price-display"
import { CryptoSlicers } from "@/components/crypto-slicers"
import { ExchangesList } from "@/components/exchanges-list"
import { MarketCapChart } from "@/components/market-cap-chart"
import { VolumeAnalysis } from "@/components/volume-analysis"
import { cryptoStreamer, type StreamingData } from "@/lib/realtime-streaming"
import { filterCoins, DEFAULT_FILTER, type MarketFilter } from "@/lib/comparison-api"
import { fetchExchanges } from "@/lib/enhanced-coingecko-api"
import { Activity, Eye, GitCompare, Wifi } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { DataStatusIndicator } from "@/components/data-status-indicator"

export default function EnhancedDashboard() {
  const [streamingData, setStreamingData] = useState<StreamingData | null>(null)
  const [exchanges, setExchanges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("market_cap_desc")
  const [filter, setFilter] = useState<MarketFilter>(DEFAULT_FILTER)
  const [isConnected, setIsConnected] = useState(false)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    // Subscribe to global streaming data
    const unsubscribe = cryptoStreamer.subscribeToGlobal((data) => {
      setStreamingData(data)
      setIsConnected(cryptoStreamer.getConnectionStatus())
      setLoading(false)
    })

    // Load exchanges data
    const loadExchanges = async () => {
      try {
        const exchangesData = await fetchExchanges()
        setExchanges(exchangesData)
      } catch (error) {
        console.error("Error loading exchanges:", error)
      }
    }

    loadExchanges()

    return unsubscribe
  }, [])

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("crypto-favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  const toggleFavorite = (coinId: string) => {
    const newFavorites = favorites.includes(coinId) ? favorites.filter((id) => id !== coinId) : [...favorites, coinId]
    setFavorites(newFavorites)
    localStorage.setItem("crypto-favorites", JSON.stringify(newFavorites))
  }

  const handleFilterReset = () => {
    setFilter(DEFAULT_FILTER)
  }

  const getFilteredAndSortedCoins = () => {
    if (!streamingData) return []

    const coinsArray = Array.from(streamingData.prices.values()).map((price) => ({
      id: price.id,
      symbol: price.symbol,
      name: price.name,
      image: "",
      current_price: price.price,
      market_cap: price.marketCap,
      market_cap_rank: 0,
      price_change_percentage_24h: price.change24h,
      price_change_percentage_7d: 0,
      total_volume: price.volume24h,
      high_24h: 0,
      low_24h: 0,
      ath: 0,
      ath_change_percentage: 0,
      atl: 0,
      atl_change_percentage: 0,
    }))

    const filteredCoins = filterCoins(coinsArray, filter)

    // Apply sorting
    filteredCoins.sort((a, b) => {
      switch (sortBy) {
        case "market_cap_desc":
          return b.market_cap - a.market_cap
        case "market_cap_asc":
          return a.market_cap - b.market_cap
        case "price_desc":
          return b.current_price - a.current_price
        case "price_asc":
          return a.current_price - b.current_price
        case "change_desc":
          return b.price_change_percentage_24h - a.price_change_percentage_24h
        case "change_asc":
          return a.price_change_percentage_24h - b.price_change_percentage_24h
        case "volume_desc":
          return b.total_volume - a.total_volume
        default:
          return 0
      }
    })

    return filteredCoins
  }

  const getElapsedTime = () => {
    const elapsed = Date.now() - startTime
    const minutes = Math.floor(elapsed / 60000)
    const seconds = Math.floor((elapsed % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Activity className="h-16 w-16 text-green-400 animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 h-16 w-16 border-4 border-green-400/20 rounded-full animate-pulse mx-auto"></div>
          </div>
          <p className="text-green-400 text-lg">Connecting to live data streams...</p>
          <p className="text-gray-400 text-sm mt-2">Initializing real-time market data</p>
        </div>
      </div>
    )
  }

  const filteredCoins = getFilteredAndSortedCoins()
  const totalMarketCap = streamingData?.globalData?.data?.total_market_cap?.usd || 0
  const marketCapChange = streamingData?.globalData?.data?.market_cap_change_percentage_24h_usd || 0

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 pt-20 pb-12">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
              CryptoVault Pro
            </h1>
            <p className="text-xl text-gray-300 mb-8">Real-time cryptocurrency analytics with live streaming data</p>

            {/* Quick Actions */}
            <div className="flex justify-center items-center space-x-4 mb-8">
              <Link href="/compare">
                <Button className="crypto-button">
                  <GitCompare className="h-4 w-4 mr-2" />
                  Live Comparison
                </Button>
              </Link>
              <Link href="/explorer">
                <Button variant="outline" className="bg-gray-800 border-green-500/20 text-green-400">
                  <Eye className="h-4 w-4 mr-2" />
                  Explore Market
                </Button>
              </Link>
            </div>

            {/* Live Stats Bar */}
            <div className="flex justify-center items-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <Wifi className={`w-4 h-4 ${isConnected ? "text-green-400" : "text-red-400"}`} />
                <span className={isConnected ? "text-green-400" : "text-red-400"}>
                  {isConnected ? "Live Stream" : "Reconnecting..."}
                </span>
              </div>
              <div className="text-gray-400">
                Market Cap: <span className="text-white font-semibold">${(totalMarketCap / 1e12).toFixed(2)}T</span>
              </div>
              <div className={`${marketCapChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                24h: {marketCapChange >= 0 ? "+" : ""}
                {marketCapChange.toFixed(2)}%
              </div>
              <div className="text-gray-400">
                Session: <span className="text-green-400 font-semibold">{getElapsedTime()}</span>
              </div>
              <div className="text-gray-400">
                Tracking: <span className="text-green-400 font-semibold">{streamingData?.prices.size || 0}</span> coins
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 space-y-8">
        {/* Real-time Market Overview */}
        <RealTimeMarketOverview />

        {/* Data Status Indicator */}
        <DataStatusIndicator />

        {/* Filters */}
        <CryptoSlicers filter={filter} onFilterChange={setFilter} onReset={handleFilterReset} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 border border-green-500/20">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="markets"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            >
              Live Markets
            </TabsTrigger>
            <TabsTrigger
              value="exchanges"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            >
              Exchanges
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="realtime"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            >
              Real-time
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MarketCapChart coins={filteredCoins.slice(0, 10)} />
              </div>
              <div>
                <VolumeAnalysis coins={filteredCoins.slice(0, 5)} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="markets" className="space-y-6">
            {/* Sorting Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-green-400">Live Cryptocurrency Markets</h2>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/20">
                  <Activity className="h-3 w-3 mr-1 animate-pulse" />
                  {filteredCoins.length} coins
                </Badge>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] bg-gray-800 border-green-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-green-500/20">
                  <SelectItem value="market_cap_desc">Market Cap ↓</SelectItem>
                  <SelectItem value="market_cap_asc">Market Cap ↑</SelectItem>
                  <SelectItem value="price_desc">Price ↓</SelectItem>
                  <SelectItem value="price_asc">Price ↑</SelectItem>
                  <SelectItem value="change_desc">24h Change ↓</SelectItem>
                  <SelectItem value="change_asc">24h Change ↑</SelectItem>
                  <SelectItem value="volume_desc">Volume ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCoins.slice(0, 20).map((coin) => (
                <RealTimePriceDisplay
                  key={coin.id}
                  coinId={coin.id}
                  showTimestamp={true}
                  showChange={true}
                  showVolume={true}
                />
              ))}
            </div>

            {filteredCoins.length === 0 && (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No cryptocurrencies match your current filters</p>
                <Button onClick={handleFilterReset} className="mt-4 crypto-button">
                  Reset Filters
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="exchanges">
            <ExchangesList exchanges={exchanges} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MarketCapChart coins={filteredCoins.slice(0, 10)} />
              <VolumeAnalysis coins={filteredCoins.slice(0, 5)} />
            </div>
          </TabsContent>

          <TabsContent value="realtime">
            <div className="text-center py-12">
              <Activity className="h-16 w-16 text-green-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-semibold text-white mb-2">Real-time Comparison Tool</h3>
              <p className="text-gray-400 mb-4">
                Access advanced real-time comparison with streaming data and timestamps
              </p>
              <Link href="/compare">
                <Button className="crypto-button">
                  <GitCompare className="h-4 w-4 mr-2" />
                  Open Real-time Comparison
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
