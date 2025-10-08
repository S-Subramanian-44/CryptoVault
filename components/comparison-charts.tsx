"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { fetchCoinComparison, TIME_RANGES, type CoinComparison } from "@/lib/comparison-api"
import { BarChart3, TrendingUp, History, Download } from "lucide-react"

interface ComparisonChartsProps {
  coinIds: string[]
}

const CHART_COLORS = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#10B981", "#F97316"]

export function ComparisonCharts({ coinIds }: ComparisonChartsProps) {
  const [comparisonData, setComparisonData] = useState<CoinComparison[]>([])
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d")
  const [loading, setLoading] = useState(false)
  const [chartType, setChartType] = useState<"price" | "marketcap" | "volume" | "normalized">("price")

  useEffect(() => {
    if (coinIds.length === 0) return

    const loadComparisonData = async () => {
      setLoading(true)
      try {
        const timeRange = TIME_RANGES.find((t) => t.value === selectedTimeRange)
        const data = await fetchCoinComparison(coinIds, timeRange?.days || 30)
        setComparisonData(data)
      } catch (error) {
        console.error("Error loading comparison data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadComparisonData()
  }, [coinIds, selectedTimeRange])

  const prepareChartData = () => {
    if (comparisonData.length === 0) return []

    // Find the common time points
    const allTimestamps = new Set<number>()
    comparisonData.forEach((coin) => {
      coin.prices.forEach(([timestamp]) => {
        allTimestamps.add(timestamp)
      })
    })

    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b)

    return sortedTimestamps.map((timestamp) => {
      const dataPoint: any = {
        timestamp,
        date: new Date(timestamp).toLocaleDateString(),
        time: new Date(timestamp).toLocaleString(),
      }

      comparisonData.forEach((coin, index) => {
        const pricePoint = coin.prices.find(([t]) => Math.abs(t - timestamp) < 3600000) // Within 1 hour
        const marketCapPoint = coin.market_caps.find(([t]) => Math.abs(t - timestamp) < 3600000)
        const volumePoint = coin.total_volumes.find(([t]) => Math.abs(t - timestamp) < 3600000)

        if (pricePoint) {
          dataPoint[`${coin.symbol}_price`] = pricePoint[1]
        }
        if (marketCapPoint) {
          dataPoint[`${coin.symbol}_marketcap`] = marketCapPoint[1]
        }
        if (volumePoint) {
          dataPoint[`${coin.symbol}_volume`] = volumePoint[1]
        }

        // Normalized data (percentage change from start)
        if (pricePoint && coin.prices.length > 0) {
          const startPrice = coin.prices[0][1]
          const percentChange = ((pricePoint[1] - startPrice) / startPrice) * 100
          dataPoint[`${coin.symbol}_normalized`] = percentChange
        }
      })

      return dataPoint
    })
  }

  const chartData = prepareChartData()

  const formatYAxis = (value: number) => {
    switch (chartType) {
      case "price":
        return `$${value.toLocaleString()}`
      case "marketcap":
        return `$${(value / 1e9).toFixed(1)}B`
      case "volume":
        return `$${(value / 1e6).toFixed(1)}M`
      case "normalized":
        return `${value.toFixed(1)}%`
      default:
        return value.toString()
    }
  }

  const getYAxisDomain = () => {
    if (chartType === "normalized") {
      return ["dataMin - 5", "dataMax + 5"]
    }
    return ["auto", "auto"]
  }

  // Add this function inside the ComparisonCharts component
  const exportData = () => {
    const csvContent = [
      ["Date", "Time", ...comparisonData.map((coin) => `${coin.symbol.toUpperCase()}_Price`)].join(","),
      ...chartData.map((point) =>
        [point.date, point.time, ...comparisonData.map((coin) => point[`${coin.symbol}_price`] || "")].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `crypto-comparison-${selectedTimeRange}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (coinIds.length === 0) {
    return (
      <Card className="crypto-card">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Select cryptocurrencies to compare</p>
            <p className="text-gray-500 text-sm">Choose 2 or more coins to see detailed comparison charts</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comparison Summary */}
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Comparison Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisonData.map((coin, index) => (
              <div
                key={coin.id}
                className="p-4 bg-gray-800/50 rounded-lg border border-green-500/20 flex items-center space-x-3"
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index] }}></div>
                <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-8 h-8" />
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{coin.name}</h4>
                  <p className="text-sm text-gray-400">${coin.current_price.toLocaleString()}</p>
                </div>
                <div
                  className={`text-sm font-semibold ${coin.price_change_percentage >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {coin.price_change_percentage >= 0 ? "+" : ""}
                  {coin.price_change_percentage.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Card className="crypto-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle className="text-green-400 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Historical Comparison
            </CardTitle>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Time Range Selector */}
              <div className="flex space-x-1">
                {TIME_RANGES.map((range) => (
                  <Button
                    key={range.value}
                    variant={selectedTimeRange === range.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeRange(range.value)}
                    className={
                      selectedTimeRange === range.value
                        ? "crypto-button text-xs"
                        : "bg-gray-800 border-green-500/20 text-xs"
                    }
                  >
                    {range.label}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportData}
                  disabled={chartData.length === 0}
                  className="bg-blue-500/20 border-blue-500/20 text-blue-400"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Data Summary */}
          {comparisonData.length > 0 && (
            <div className="mb-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-blue-400" />
                  <span className="text-blue-400 font-semibold">Historical Data Period: {selectedTimeRange}</span>
                </div>
                <div className="text-sm text-gray-400">
                  Data points: {chartData.length} | Updated: {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <History className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
                <p className="text-blue-400">Loading historical data...</p>
                <p className="text-gray-400 text-sm mt-2">
                  Fetching {selectedTimeRange} data for {coinIds.length} cryptocurrencies
                </p>
              </div>
            </div>
          ) : (
            <Tabs value={chartType} onValueChange={(value: any) => setChartType(value)} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-green-500/20">
                <TabsTrigger
                  value="price"
                  className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                >
                  Price
                </TabsTrigger>
                <TabsTrigger
                  value="normalized"
                  className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                >
                  % Change
                </TabsTrigger>
                <TabsTrigger
                  value="marketcap"
                  className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                >
                  Market Cap
                </TabsTrigger>
                <TabsTrigger
                  value="volume"
                  className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                >
                  Volume
                </TabsTrigger>
              </TabsList>

              <TabsContent value="price" className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickFormatter={formatYAxis} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #22C55E",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any, name: string) => [
                        `$${Number(value).toLocaleString()}`,
                        name.replace("_price", "").toUpperCase(),
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    {comparisonData.map((coin, index) => (
                      <Line
                        key={coin.id}
                        type="monotone"
                        dataKey={`${coin.symbol}_price`}
                        stroke={CHART_COLORS[index]}
                        strokeWidth={2}
                        dot={false}
                        name={coin.symbol.toUpperCase()}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="normalized" className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatYAxis}
                      domain={getYAxisDomain()}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #22C55E",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any, name: string) => [
                        `${Number(value).toFixed(2)}%`,
                        name.replace("_normalized", "").toUpperCase(),
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    {comparisonData.map((coin, index) => (
                      <Line
                        key={coin.id}
                        type="monotone"
                        dataKey={`${coin.symbol}_normalized`}
                        stroke={CHART_COLORS[index]}
                        strokeWidth={2}
                        dot={false}
                        name={coin.symbol.toUpperCase()}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="marketcap" className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickFormatter={formatYAxis} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #22C55E",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any, name: string) => [
                        `$${(Number(value) / 1e9).toFixed(2)}B`,
                        name.replace("_marketcap", "").toUpperCase(),
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    {comparisonData.map((coin, index) => (
                      <Line
                        key={coin.id}
                        type="monotone"
                        dataKey={`${coin.symbol}_marketcap`}
                        stroke={CHART_COLORS[index]}
                        strokeWidth={2}
                        dot={false}
                        name={coin.symbol.toUpperCase()}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="volume" className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickFormatter={formatYAxis} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #22C55E",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any, name: string) => [
                        `$${(Number(value) / 1e6).toFixed(2)}M`,
                        name.replace("_volume", "").toUpperCase(),
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    {comparisonData.map((coin, index) => (
                      <Line
                        key={coin.id}
                        type="monotone"
                        dataKey={`${coin.symbol}_volume`}
                        stroke={CHART_COLORS[index]}
                        strokeWidth={2}
                        dot={false}
                        name={coin.symbol.toUpperCase()}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-green-400">Side-by-Side Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-500/20">
                  <th className="text-left py-3 px-4 text-gray-300">Metric</th>
                  {comparisonData.map((coin, index) => (
                    <th key={coin.id} className="text-center py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index] }}></div>
                        <span className="text-white">{coin.symbol.toUpperCase()}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700/50">
                  <td className="py-3 px-4 text-gray-300">Current Price</td>
                  {comparisonData.map((coin) => (
                    <td key={coin.id} className="py-3 px-4 text-center text-green-400 font-semibold">
                      ${coin.current_price.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-3 px-4 text-gray-300">24h Change</td>
                  {comparisonData.map((coin) => (
                    <td
                      key={coin.id}
                      className={`py-3 px-4 text-center font-semibold ${coin.price_change_percentage >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {coin.price_change_percentage >= 0 ? "+" : ""}
                      {coin.price_change_percentage.toFixed(2)}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-3 px-4 text-gray-300">Market Cap</td>
                  {comparisonData.map((coin) => (
                    <td key={coin.id} className="py-3 px-4 text-center text-white">
                      ${(coin.market_cap / 1e9).toFixed(2)}B
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-300">24h Volume</td>
                  {comparisonData.map((coin) => (
                    <td key={coin.id} className="py-3 px-4 text-center text-white">
                      ${(coin.total_volume / 1e6).toFixed(2)}M
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
