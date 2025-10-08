"use client"

import { useState, useEffect } from "react"
import { CoinComparisonSelector } from "@/components/coin-comparison-selector"
import { ComparisonCharts } from "@/components/comparison-charts"
import { RealTimeComparisonChart } from "@/components/realtime-comparison-chart"
import { CryptoSlicers } from "@/components/crypto-slicers"
import { RealTimePriceDisplay } from "@/components/realtime-price-display"
import { DEFAULT_FILTER, type MarketFilter } from "@/lib/comparison-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, GitCompare, Clock, BarChart3, TrendingUp, History, Zap } from "lucide-react"
import { fetchTopCoins } from "@/lib/enhanced-coingecko-api"

export default function ComparePage() {
  const [selectedCoins, setSelectedCoins] = useState<string[]>([])
  const [filter, setFilter] = useState<MarketFilter>(DEFAULT_FILTER)
  const [activeTab, setActiveTab] = useState<"live" | "historical">("historical")
  const [topGainers, setTopGainers] = useState<string[]>([])
  const [trendingCoins, setTrendingCoins] = useState<string[]>([])

  useEffect(() => {
    loadMarketData()
  }, [])

  const loadMarketData = async () => {
    try {
      const coins = await fetchTopCoins(100)

      // Get top gainers (highest 24h percentage change)
      const gainers = coins
        .filter((coin) => coin.price_change_percentage_24h > 0)
        .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        .slice(0, 5)
        .map((coin) => coin.id)

      // Get trending coins (high volume + positive change)
      const trending = coins
        .filter((coin) => coin.total_volume > 100000000) // High volume
        .sort((a, b) => b.price_change_percentage_24h * b.total_volume - a.price_change_percentage_24h * a.total_volume)
        .slice(0, 5)
        .map((coin) => coin.id)

      setTopGainers(gainers)
      setTrendingCoins(trending)
    } catch (error) {
      console.error("Error loading market data:", error)
      // Fallback to static data
      setTopGainers(["solana", "avalanche-2", "polygon", "chainlink", "uniswap"])
      setTrendingCoins(["ethereum", "cardano", "polkadot", "chainlink", "aave"])
    }
  }

  const handleFilterReset = () => {
    setFilter(DEFAULT_FILTER)
  }

  const handleQuickSelect = (coins: string[]) => {
    setSelectedCoins(coins)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Cryptocurrency Comparison Hub
          </h1>
          <p className="text-gray-400">
            Compare cryptocurrencies with historical analysis and real-time streaming data
          </p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/20">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              Live Data
            </Badge>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/20">
              <History className="h-3 w-3 mr-1" />
              Historical Analysis
            </Badge>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/20">
              <GitCompare className="h-3 w-3 mr-1" />
              Multi-coin Analysis
            </Badge>
          </div>
        </div>

        {/* Quick Selection Buttons */}
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Quick Comparisons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              <Button
                variant="outline"
                onClick={() => handleQuickSelect(["bitcoin", "ethereum"])}
                className="bg-gray-800 border-green-500/20 text-green-400 hover:bg-green-500/10"
              >
                BTC vs ETH
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickSelect(["bitcoin", "ethereum", "cardano", "solana"])}
                className="bg-gray-800 border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
              >
                Top 4 Coins
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickSelect(["ethereum", "cardano", "solana", "polkadot", "chainlink"])}
                className="bg-gray-800 border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
              >
                Smart Contracts
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickSelect(["bitcoin", "litecoin", "bitcoin-cash", "dogecoin"])}
                className="bg-gray-800 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
              >
                Bitcoin Family
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickSelect(topGainers)}
                className="bg-gray-800 border-pink-500/20 text-pink-400 hover:bg-pink-500/10"
              >
                🔥 Top Gainers
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickSelect(trendingCoins)}
                className="bg-gray-800 border-orange-500/20 text-orange-400 hover:bg-orange-500/10"
              >
                📈 Trending Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <CryptoSlicers filter={filter} onFilterChange={setFilter} onReset={handleFilterReset} />

        {/* Coin Selection */}
        <CoinComparisonSelector selectedCoins={selectedCoins} onSelectionChange={setSelectedCoins} maxSelection={5} />

        {/* Main Comparison Interface */}
        {selectedCoins.length > 0 ? (
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <CardTitle className="text-green-400 flex items-center">
                    <GitCompare className="h-5 w-5 mr-2" />
                    Comparison Analysis
                    <Badge variant="outline" className="ml-2 bg-green-500/20 text-green-400 border-green-500/20">
                      {selectedCoins.length} coins selected
                    </Badge>
                  </CardTitle>

                  <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-800/50 border border-green-500/20">
                    <TabsTrigger
                      value="historical"
                      className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 flex items-center"
                    >
                      <History className="h-4 w-4 mr-2" />
                      Historical Data
                    </TabsTrigger>
                    <TabsTrigger
                      value="live"
                      className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 flex items-center"
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Live Streaming
                    </TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
            </Card>

            {/* Historical Data Tab */}
            <TabsContent value="historical" className="space-y-6">
              <Card className="crypto-card border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Historical Analysis & Trends
                  </CardTitle>
                  <p className="text-gray-400 text-sm">
                    Analyze historical price movements, market cap changes, and trading volumes over different time
                    periods
                  </p>
                </CardHeader>
              </Card>

              <ComparisonCharts coinIds={selectedCoins} />
            </TabsContent>

            {/* Live Data Tab */}
            <TabsContent value="live" className="space-y-6">
              <Card className="crypto-card border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center">
                    <Activity className="h-5 w-5 mr-2 animate-pulse" />
                    Real-Time Streaming Analysis
                  </CardTitle>
                  <p className="text-gray-400 text-sm">
                    Monitor live price movements with real-time updates, timestamps, and streaming data collection
                  </p>
                </CardHeader>
              </Card>

              {/* Live Price Monitoring */}
              <Card className="crypto-card">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Current Market Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RealTimePriceDisplay coinIds={selectedCoins} />
                </CardContent>
              </Card>

              {/* Live Chart */}
              <Card className="crypto-card">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Live Price Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RealTimeComparisonChart coinIds={selectedCoins} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="crypto-card">
            <CardContent className="text-center py-12">
              <GitCompare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Select Cryptocurrencies to Compare</h3>
              <p className="text-gray-400 mb-6">
                Choose up to 5 cryptocurrencies to analyze their performance, trends, and market behavior
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/20">
                  Historical Analysis
                </Badge>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/20">
                  Real-time Streaming
                </Badge>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/20">
                  Advanced Filtering
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
