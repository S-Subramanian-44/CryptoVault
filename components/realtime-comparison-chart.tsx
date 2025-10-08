"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { cryptoStreamer, type RealTimePrice } from "@/lib/realtime-streaming"
import { Activity, Pause, Play, Download, Wifi, WifiOff } from "lucide-react"

interface RealTimeComparisonChartProps {
  coinIds: string[]
  maxDataPoints?: number
}

const CHART_COLORS = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#10B981", "#F97316"]

interface ChartDataPoint {
  timestamp: number
  time: string
  fullTime: string
  [key: string]: any // For dynamic coin prices
}

export function RealTimeComparisonChart({ coinIds, maxDataPoints = 100 }: RealTimeComparisonChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [coinData, setCoinData] = useState<Map<string, RealTimePrice>>(new Map())
  const [isRecording, setIsRecording] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [startTime] = useState(Date.now())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (coinIds.length === 0) return

    const unsubscribers: (() => void)[] = []

    // Subscribe to each coin
    coinIds.forEach((coinId) => {
      const unsubscribe = cryptoStreamer.subscribe(coinId, (data) => {
        setCoinData((prev) => new Map(prev.set(coinId, data)))
        setIsConnected(cryptoStreamer.getConnectionStatus())
      })
      unsubscribers.push(unsubscribe)
    })

    // Start recording data points
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        addDataPoint()
      }, 5000) // Add data point every 5 seconds
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub())
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [coinIds, isRecording])

  const addDataPoint = () => {
    if (coinData.size === 0) return

    const now = Date.now()
    const timeString = new Date(now).toLocaleTimeString()
    const fullTimeString = new Date(now).toLocaleString()

    const dataPoint: ChartDataPoint = {
      timestamp: now,
      time: timeString,
      fullTime: fullTimeString,
    }

    // Add price data for each coin
    coinIds.forEach((coinId) => {
      const data = coinData.get(coinId)
      if (data) {
        dataPoint[`${data.symbol}_price`] = data.price
        dataPoint[`${data.symbol}_change`] = data.change24h
      }
    })

    setChartData((prev) => {
      const newData = [...prev, dataPoint]
      // Keep only the last maxDataPoints
      return newData.slice(-maxDataPoints)
    })
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)

    if (!isRecording) {
      intervalRef.current = setInterval(() => {
        addDataPoint()
      }, 5000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  const clearData = () => {
    setChartData([])
  }

  const exportData = () => {
    const csvContent = [
      [
        "Timestamp",
        "Time",
        ...coinIds.map((id) => {
          const data = coinData.get(id)
          return data ? `${data.symbol.toUpperCase()}_Price` : id
        }),
      ].join(","),
      ...chartData.map((point) =>
        [
          point.timestamp,
          point.fullTime,
          ...coinIds.map((id) => {
            const data = coinData.get(id)
            return data ? point[`${data.symbol}_price`] || "" : ""
          }),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `crypto-comparison-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getElapsedTime = () => {
    const elapsed = Date.now() - startTime
    const minutes = Math.floor(elapsed / 60000)
    const seconds = Math.floor((elapsed % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (coinIds.length === 0) {
    return (
      <Card className="crypto-card">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Select cryptocurrencies to start real-time comparison</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="crypto-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <CardTitle className="text-green-400 flex items-center">
            <Activity className={`h-5 w-5 mr-2 ${isRecording ? "animate-pulse" : ""}`} />
            Real-Time Price Comparison
            <div className="flex items-center ml-4 space-x-2">
              {isConnected ? <Wifi className="h-4 w-4 text-green-400" /> : <WifiOff className="h-4 w-4 text-red-400" />}
              <span className="text-sm text-gray-400">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
          </CardTitle>

          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-400">
              Elapsed: {getElapsedTime()} | Points: {chartData.length}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleRecording}
              className={`${isRecording ? "bg-red-500/20 border-red-500/20 text-red-400" : "bg-green-500/20 border-green-500/20 text-green-400"}`}
            >
              {isRecording ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isRecording ? "Pause" : "Resume"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearData}
              className="bg-gray-800 border-gray-600 text-gray-400"
            >
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              disabled={chartData.length === 0}
              className="bg-blue-500/20 border-blue-500/20 text-blue-400"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Current Prices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Array.from(coinData.values()).map((coin, index) => (
            <div
              key={coin.id}
              className="p-3 bg-gray-800/50 rounded-lg border border-green-500/20 flex items-center space-x-3"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index] }}></div>
              <div className="flex-1">
                <h4 className="font-semibold text-white text-sm">{coin.name}</h4>
                <p className="text-xs text-gray-400">{coin.lastUpdate}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-400">${coin.price.toLocaleString()}</p>
                <p className={`text-xs ${coin.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {coin.change24h >= 0 ? "+" : ""}
                  {coin.change24h.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="h-96">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
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
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Legend />
                {Array.from(coinData.values()).map((coin, index) => (
                  <Line
                    key={coin.id}
                    type="monotone"
                    dataKey={`${coin.symbol}_price`}
                    stroke={CHART_COLORS[index]}
                    strokeWidth={2}
                    dot={false}
                    name={coin.symbol.toUpperCase()}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Activity className="h-12 w-12 text-green-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Collecting real-time data...</p>
                <p className="text-gray-500 text-sm">Data points will appear as prices update</p>
              </div>
            </div>
          )}
        </div>

        {/* Recording Status */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-400 animate-pulse" : "bg-gray-400"}`}></div>
              <span>{isRecording ? "Recording" : "Paused"}</span>
            </div>
            <span>Update interval: 5 seconds</span>
            <span>Max points: {maxDataPoints}</span>
          </div>
          <div>Last update: {chartData.length > 0 ? chartData[chartData.length - 1]?.time : "Never"}</div>
        </div>
      </CardContent>
    </Card>
  )
}
