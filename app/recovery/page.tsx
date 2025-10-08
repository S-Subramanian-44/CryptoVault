"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchTopCoins, type CoinData } from "@/lib/coingecko-api"
import { AlertTriangle, TrendingDown, TrendingUp, Shield, Target, LineChart, Activity, BarChart3 } from "lucide-react"
import NewsRecoveryHints from "@/components/news-recovery-hints"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts"

export default function Recovery() {
  const [coins, setCoins] = useState<CoinData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCoin, setSelectedCoin] = useState<string>("")
  const [forecastData, setForecastData] = useState<any>(null)
  const [forecastLoading, setForecastLoading] = useState(false)
  const [forecastDays, setForecastDays] = useState(7)

  useEffect(() => {
    const loadCoins = async () => {
      try {
        const data = await fetchTopCoins(20)
        setCoins(data)
        if (data.length > 0) {
          setSelectedCoin(data[0].id)
        }
      } catch (error) {
        console.error("Error loading coins:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCoins()
  }, [])

  useEffect(() => {
    if (selectedCoin) {
      loadForecast()
    }
  }, [selectedCoin])

  const loadForecast = async () => {
    if (!selectedCoin) return

    setForecastLoading(true)
    try {
      const coin = coins.find((c) => c.id === selectedCoin)
      if (!coin) return

      // Fetch historical data
      const historicalResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/${selectedCoin}/market_chart?vs_currency=usd&days=30`,
      )
      const historicalData = await historicalResponse.json()

      const formattedHistorical = historicalData.prices.map((item: any, index: number) => ({
        date: new Date(item[0]).toISOString().split("T")[0],
        price: item[1],
        volume: historicalData.total_volumes[index]?.[1] || 0,
        change24h: 0,
      }))

      // Call ML forecast API
      const forecastResponse = await fetch("/api/ml-forecast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coinId: selectedCoin,
          symbol: coin.symbol,
          historicalData: formattedHistorical,
          currentPrice: coin.current_price,
          days: forecastDays,
        }),
      })

      const forecast = await forecastResponse.json()

      const lastHistoricalPrice = formattedHistorical[formattedHistorical.length - 1].price
      const chartData = [
        ...formattedHistorical.slice(-14).map((item: any) => ({
          date: item.date,
          historical: item.price,
          forecast: null,
          upperBound: null,
          lowerBound: null,
          volatility: null,
        })),
        {
          date: forecast.predictions[0].date,
          historical: lastHistoricalPrice,
          forecast: forecast.predictions[0].price,
          upperBound: forecast.predictions[0].price * (1 + (100 - forecast.predictions[0].confidence) / 200),
          lowerBound: forecast.predictions[0].price * (1 - (100 - forecast.predictions[0].confidence) / 200),
          volatility: Math.abs(forecast.predictions[0].price - lastHistoricalPrice),
        },
        ...forecast.predictions.slice(1).map((pred: any) => ({
          date: pred.date,
          historical: null,
          forecast: pred.price,
          upperBound: pred.price * (1 + (100 - pred.confidence) / 200),
          lowerBound: pred.price * (1 - (100 - pred.confidence) / 200),
          volatility: Math.abs(pred.price - lastHistoricalPrice),
        })),
      ]

      setForecastData({
        ...forecast,
        chartData,
        currentPrice: coin.current_price,
      })
    } catch (error) {
      console.error("Error loading forecast:", error)
    } finally {
      setForecastLoading(false)
    }
  }

  const getRecoveryPlan = (coin: CoinData) => {
    const change = coin.price_change_percentage_24h

    if (change < -20) {
      return {
        level: "Critical Loss",
        color: "text-red-400",
        bg: "bg-red-500/20",
        plan: "Consider DCA strategy, wait for support levels",
        confidence: 30,
        action: "WAIT & DCA",
      }
    } else if (change < -10) {
      return {
        level: "High Loss",
        color: "text-orange-400",
        bg: "bg-orange-500/20",
        plan: "Monitor closely, consider partial exit",
        confidence: 50,
        action: "MONITOR",
      }
    } else if (change < -5) {
      return {
        level: "Moderate Loss",
        color: "text-yellow-400",
        bg: "bg-yellow-500/20",
        plan: "Hold position, normal market volatility",
        confidence: 70,
        action: "HOLD",
      }
    } else {
      return {
        level: "No Significant Loss",
        color: "text-green-400",
        bg: "bg-green-500/20",
        plan: "Continue with current strategy",
        confidence: 85,
        action: "CONTINUE",
      }
    }
  }

  const losers = coins.filter((coin) => coin.price_change_percentage_24h < -5)

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
            Loss Recovery Advisor
          </h1>
          <p className="text-gray-400">Strategic guidance for portfolio recovery with ML-powered forecasts</p>
        </div>

        <Card className="crypto-card border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              ML-Powered Recovery Forecast
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-400">Select Cryptocurrency</Label>
                <select
                  value={selectedCoin}
                  onChange={(e) => setSelectedCoin(e.target.value)}
                  className="w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                >
                  {coins.map((coin) => (
                    <option key={coin.id} value={coin.id}>
                      {coin.name} ({coin.symbol.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-gray-400">Forecast Days</Label>
                <Input
                  type="number"
                  min="3"
                  max="30"
                  value={forecastDays}
                  onChange={(e) => setForecastDays(Number(e.target.value))}
                  className="mt-1 bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={loadForecast} disabled={forecastLoading} className="w-full crypto-button">
                  {forecastLoading ? "Generating..." : "Generate Forecast"}
                </Button>
              </div>
            </div>

            {forecastData && (
              <div className="space-y-6 mt-6">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-green-400" />
                    Price Forecast with Confidence Bands
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={forecastData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                        labelStyle={{ color: "#F3F4F6" }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="upperBound"
                        stroke="none"
                        fill="#10B981"
                        fillOpacity={0.1}
                        name="Upper Confidence"
                      />
                      <Area
                        type="monotone"
                        dataKey="lowerBound"
                        stroke="none"
                        fill="#EF4444"
                        fillOpacity={0.1}
                        name="Lower Confidence"
                      />
                      <Line
                        type="monotone"
                        dataKey="historical"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={false}
                        name="Historical Price"
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#10B981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "#10B981", r: 3 }}
                        name="Forecast Price"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2 text-yellow-400" />
                    Volatility Analysis
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={forecastData.chartData.filter((d: any) => d.volatility !== null)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="volatility"
                        stroke="#F59E0B"
                        fill="#F59E0B"
                        fillOpacity={0.3}
                        name="Price Volatility"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-purple-400" />
                    Recovery Curve Projection
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsLineChart
                      data={forecastData.chartData
                        .filter((d: any) => d.forecast !== null)
                        .map((d: any) => ({
                          ...d,
                          recoveryPercent: ((d.forecast - forecastData.currentPrice) / forecastData.currentPrice) * 100,
                        }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} label={{ value: "% Change", angle: -90 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="recoveryPercent"
                        stroke="#A855F7"
                        strokeWidth={3}
                        dot={{ fill: "#A855F7", r: 4 }}
                        name="Recovery %"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>

                {/* Model Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Model Accuracy</p>
                    <p className="text-green-400 text-xl font-bold">{forecastData.accuracy.toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">MAE</p>
                    <p className="text-blue-400 text-xl font-bold">${forecastData.metrics.mae.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">RMSE</p>
                    <p className="text-purple-400 text-xl font-bold">${forecastData.metrics.rmse.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">R² Score</p>
                    <p className="text-yellow-400 text-xl font-bold">{forecastData.metrics.r2.toFixed(3)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recovery Principles */}
        <Card className="crypto-card border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Recovery Principles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-gray-800/50">
                <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white mb-2">Don't Panic Sell</h3>
                <p className="text-sm text-gray-400">Emotional decisions often lead to greater losses</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-800/50">
                <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white mb-2">Dollar Cost Average</h3>
                <p className="text-sm text-gray-400">Gradually increase positions during dips</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-800/50">
                <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="font-semibold text-white mb-2">Long-term View</h3>
                <p className="text-sm text-gray-400">Focus on fundamentals, not short-term noise</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Losers Analysis */}
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-red-400">Assets Requiring Attention</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
                <p className="text-gray-400 mt-2">Analyzing market conditions...</p>
              </div>
            ) : losers.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-green-400 text-lg font-semibold">Great news!</p>
                <p className="text-gray-400">No major losses detected in top cryptocurrencies</p>
              </div>
            ) : (
              <div className="space-y-4">
                {losers.map((coin) => {
                  const recovery = getRecoveryPlan(coin)
                  return (
                    <div key={coin.id} className={`p-4 rounded-lg border ${recovery.bg} border-gray-700`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-10 h-10" />
                          <div>
                            <h3 className="font-semibold text-white">{coin.name}</h3>
                            <p className="text-sm text-gray-400 uppercase">{coin.symbol}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">${coin.current_price.toLocaleString()}</p>
                          <p className="text-red-400 flex items-center">
                            <TrendingDown className="h-4 w-4 mr-1" />
                            {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Loss Level</p>
                          <p className={`font-semibold ${recovery.color}`}>{recovery.level}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Recovery Plan</p>
                          <p className="text-white text-sm">{recovery.plan}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Confidence</p>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-green-400 h-2 rounded-full"
                                style={{ width: `${recovery.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-green-400">{recovery.confidence}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Suggested Action</p>
                          <Button size="sm" className={`crypto-button text-xs ${recovery.color}`}>
                            {recovery.action}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recovery Strategies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-green-400">DCA Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">Dollar Cost Averaging helps reduce the impact of volatility:</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Invest fixed amounts regularly</li>
                  <li>• Buy more when prices are low</li>
                  <li>• Reduce average cost over time</li>
                  <li>• Remove emotion from investing</li>
                </ul>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <p className="text-green-400 font-semibold">Best for: Long-term investors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-blue-400">Support Level Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">Wait for technical support levels:</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Identify key support zones</li>
                  <li>• Wait for price stabilization</li>
                  <li>• Look for reversal signals</li>
                  <li>• Set stop-loss orders</li>
                </ul>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <p className="text-blue-400 font-semibold">Best for: Technical traders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actionable Solutions & News-Based Recovery Advice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-green-400">Actionable Recovery Decisions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-300">
              <ul className="space-y-2">
                <li>• Tighten stop-losses on assets with accelerating negative momentum</li>
                <li>• Use staggered DCA tranches (e.g., 3 levels) near historical support</li>
                <li>• Hedge with stronger-correlated majors during volatility spikes</li>
                <li>• Rebalance to reduce overexposed positions above 40% allocation</li>
              </ul>
              <div className="p-3 rounded-lg bg-gray-800/50">
                <p className="text-xs text-gray-400">
                  Note: Decisions should reflect your risk tolerance and investment horizon.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-blue-400">News-Driven Recovery Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-300">
              <p className="text-gray-300">
                We analyze latest headlines for sentiment and translate impact into recovery moves.
              </p>
              <div id="news-recovery" className="space-y-2">
                <NewsRecoveryHints />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
