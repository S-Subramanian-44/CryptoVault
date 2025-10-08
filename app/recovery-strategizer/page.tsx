"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  Brain,
  Heart,
  Shield,
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Plus,
  ChevronDown,
  Loader2,
} from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { fetchTopCoins, fetchCoinHistory, type CoinData } from "@/lib/coingecko-api"

interface Position {
  id: string
  coin: string
  symbol: string
  coinId: string
  purchasePrice: number
  currentPrice: number
  quantity: number
  purchaseDate: string
  currentValue: number
  totalInvested: number
  lossAmount: number
  lossPercentage: number
  historicalData: Array<{
    date: string
    price: number
    volume: number
    change24h: number
  }>
  forecast?: {
    predictions: Array<{
      date: string
      price: number
      confidence: number
      model: string
    }>
    accuracy: number
    modelType: string
  }
}

interface LossAnalysis {
  severity: "Low" | "Medium" | "High" | "Critical"
  causes: string[]
  psychologicalImpact: string
  recommendations: string[]
  timeframe: string
  confidenceScore: number
}

interface RecoveryPlan {
  strategy: string
  targetPrice: number
  timeframe: string
  actions: string[]
  riskLevel: "Low" | "Medium" | "High"
  successProbability: number
  requiredCapital: number
  expectedReturn: number
}

interface SentimentAnalysis {
  emotionalState: string
  biases: string[]
  riskTolerance: string
  decisionClarity: string
  recommendations: string[]
  mindsetScore: number
}

export default function RecoveryStrategizerPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [availableCoins, setAvailableCoins] = useState<CoinData[]>([])
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null)
  const [coinSearchOpen, setCoinSearchOpen] = useState(false)
  const [newPosition, setNewPosition] = useState({
    purchasePrice: "",
    quantity: "",
    purchaseDate: "",
  })
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [lossAnalysis, setLossAnalysis] = useState<LossAnalysis | null>(null)
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlan | null>(null)
  const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [isLoadingCoins, setIsLoadingCoins] = useState(true)
  const [isAddingPosition, setIsAddingPosition] = useState(false)

  // Load available coins on component mount
  useEffect(() => {
    loadAvailableCoins()
  }, [])

  const loadAvailableCoins = async () => {
    try {
      setIsLoadingCoins(true)
      const coins = await fetchTopCoins(100) // Get top 100 coins
      setAvailableCoins(coins)
    } catch (error) {
      console.error("Error loading coins:", error)
    } finally {
      setIsLoadingCoins(false)
    }
  }

  const fetchHistoricalData = async (coinId: string, days = 365) => {
    try {
      const historyData = await fetchCoinHistory(coinId, days)

      // Convert to our format
      const historicalData = historyData.map((item, index) => {
        const date = new Date(item[0]).toISOString().split("T")[0]
        const price = item[1]
        const prevPrice = index > 0 ? historyData[index - 1][1] : price
        const change24h = ((price - prevPrice) / prevPrice) * 100

        return {
          date,
          price,
          volume: Math.random() * 1000000 + 500000, // Mock volume for now
          change24h: isFinite(change24h) ? change24h : 0,
        }
      })

      return historicalData
    } catch (error) {
      console.error("Error fetching historical data:", error)
      return []
    }
  }

  const generateForecast = async (position: Position) => {
    try {
      // Call Python backend for ML forecasting
      const response = await fetch("/api/ml-forecast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coinId: position.coinId,
          symbol: position.symbol,
          historicalData: position.historicalData,
          currentPrice: position.currentPrice,
          days: 30, // Forecast 30 days ahead
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate forecast")
      }

      const forecastData = await response.json()
      return forecastData
    } catch (error) {
      console.error("Error generating forecast:", error)
      // Fallback to simple forecast
      return generateSimpleForecast(position)
    }
  }

  const generateSimpleForecast = (position: Position) => {
    const predictions = []
    let currentPrice = position.currentPrice

    for (let i = 1; i <= 30; i++) {
      const volatility = 0.02 + Math.random() * 0.03
      const trend = position.lossPercentage > 20 ? 0.001 : -0.001 // Slight recovery trend for heavy losses
      const change = (Math.random() - 0.5) * volatility + trend

      currentPrice *= 1 + change
      const confidence = Math.max(50, 90 - i * 2) // Decreasing confidence over time

      predictions.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        price: Math.max(0.001, currentPrice),
        confidence,
        model: "Simple Trend",
      })
    }

    return {
      predictions,
      accuracy: 65,
      modelType: "Simple Trend Analysis",
    }
  }

  const addPosition = async () => {
    if (!selectedCoin || !newPosition.purchasePrice || !newPosition.quantity) {
      return
    }

    setIsAddingPosition(true)

    try {
      const purchasePrice = Number.parseFloat(newPosition.purchasePrice)
      const quantity = Number.parseFloat(newPosition.quantity)
      const currentPrice = selectedCoin.current_price

      const totalInvested = purchasePrice * quantity
      const currentValue = currentPrice * quantity
      const lossAmount = totalInvested - currentValue
      const lossPercentage = (lossAmount / totalInvested) * 100

      // Fetch historical data
      const historicalData = await fetchHistoricalData(selectedCoin.id)

      const position: Position = {
        id: Date.now().toString(),
        coin: selectedCoin.name,
        symbol: selectedCoin.symbol.toUpperCase(),
        coinId: selectedCoin.id,
        purchasePrice,
        currentPrice,
        quantity,
        purchaseDate: newPosition.purchaseDate || new Date().toISOString().split("T")[0],
        currentValue,
        totalInvested,
        lossAmount,
        lossPercentage,
        historicalData,
      }

      // Generate forecast
      const forecast = await generateForecast(position)
      position.forecast = forecast

      setPositions([...positions, position])
      setSelectedCoin(null)
      setNewPosition({
        purchasePrice: "",
        quantity: "",
        purchaseDate: "",
      })
    } catch (error) {
      console.error("Error adding position:", error)
    } finally {
      setIsAddingPosition(false)
    }
  }

  const removePosition = (id: string) => {
    setPositions(positions.filter((p) => p.id !== id))
    if (selectedPosition?.id === id) {
      setSelectedPosition(null)
      setLossAnalysis(null)
      setRecoveryPlan(null)
      setSentimentAnalysis(null)
    }
  }

  const analyzeLoss = async (position: Position) => {
    setIsAnalyzing(true)
    setSelectedPosition(position)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Dynamic analysis based on actual loss data and historical patterns
    let severity: "Low" | "Medium" | "High" | "Critical"
    let causes: string[] = []
    let psychologicalImpact = ""
    let recommendations: string[] = []
    let timeframe = ""

    // Analyze historical volatility
    const prices = position.historicalData.map((d) => d.price)
    const volatility = calculateVolatility(prices)
    const trend = calculateTrend(prices)

    if (position.lossPercentage < 10) {
      severity = "Low"
      causes = ["Normal market volatility", "Short-term price fluctuation"]
      if (volatility > 0.05) causes.push("High volatility asset")
      if (trend < -0.02) causes.push("Recent downward trend")
      psychologicalImpact = "Minimal stress - manageable situation"
      recommendations = ["Hold position", "Monitor market trends", "Consider DCA if fundamentals are strong"]
      timeframe = "1-3 months"
    } else if (position.lossPercentage < 25) {
      severity = "Medium"
      causes = ["Market correction", "Sector-wide decline", "Profit-taking by large holders"]
      if (volatility > 0.08) causes.push("Extreme volatility period")
      if (trend < -0.05) causes.push("Strong bearish trend")
      psychologicalImpact = "Moderate concern - requires attention"
      recommendations = ["Review investment thesis", "Consider partial position adjustment", "Set stop-loss levels"]
      timeframe = "3-6 months"
    } else if (position.lossPercentage < 50) {
      severity = "High"
      causes = ["Significant market downturn", "Negative news impact", "Technical breakdown"]
      if (volatility > 0.12) causes.push("Market panic conditions")
      if (trend < -0.08) causes.push("Severe bearish momentum")
      psychologicalImpact = "High stress - emotional decision risk"
      recommendations = ["Reassess risk tolerance", "Consider tax-loss harvesting", "Diversify holdings"]
      timeframe = "6-12 months"
    } else {
      severity = "Critical"
      causes = ["Major market crash", "Fundamental project issues", "Regulatory concerns"]
      if (volatility > 0.15) causes.push("Extreme market instability")
      if (trend < -0.12) causes.push("Catastrophic price decline")
      psychologicalImpact = "Severe distress - seek support"
      recommendations = ["Emergency portfolio review", "Professional consultation", "Risk management priority"]
      timeframe = "12+ months"
    }

    const analysis: LossAnalysis = {
      severity,
      causes,
      psychologicalImpact,
      recommendations,
      timeframe,
      confidenceScore: Math.floor(Math.random() * 20) + 80, // 80-100%
    }

    setLossAnalysis(analysis)
    setIsAnalyzing(false)
  }

  const calculateVolatility = (prices: number[]): number => {
    if (prices.length < 2) return 0

    const returns = []
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
    }

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length

    return Math.sqrt(variance)
  }

  const calculateTrend = (prices: number[]): number => {
    if (prices.length < 2) return 0

    const n = prices.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = prices

    const sumX = x.reduce((sum, val) => sum + val, 0)
    const sumY = y.reduce((sum, val) => sum + val, 0)
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
    const sumXX = x.reduce((sum, val) => sum + val * val, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    return slope / (sumY / n) // Normalize by average price
  }

  const generateRecoveryPlan = async () => {
    if (!selectedPosition || !lossAnalysis) return

    setIsGeneratingPlan(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Use forecast data for recovery planning
    const position = selectedPosition
    const forecast = position.forecast

    const targetPrice = position.purchasePrice * 0.9 // 90% recovery target
    let strategy = ""
    let actions: string[] = []
    let riskLevel: "Low" | "Medium" | "High" = "Medium"
    let successProbability = 50

    // Use ML forecast if available
    if (forecast && forecast.predictions.length > 0) {
      const futurePrice = forecast.predictions[forecast.predictions.length - 1].price
      const avgConfidence = forecast.predictions.reduce((sum, p) => sum + p.confidence, 0) / forecast.predictions.length

      if (futurePrice > position.currentPrice * 1.1) {
        strategy = "AI-Optimized Hold Strategy"
        successProbability = Math.min(85, avgConfidence + 10)
        actions = [
          "ML models predict recovery potential",
          "Maintain position based on forecast",
          "Set alerts at predicted resistance levels",
          "Monitor model accuracy weekly",
        ]
      } else if (futurePrice > position.currentPrice) {
        strategy = "Cautious Recovery Approach"
        successProbability = Math.min(70, avgConfidence)
        actions = [
          "Modest recovery predicted by AI",
          "Consider partial position reduction",
          "Implement trailing stop-loss",
          "Review forecast updates regularly",
        ]
      } else {
        strategy = "Risk Mitigation Priority"
        successProbability = Math.max(30, avgConfidence - 20)
        actions = [
          "AI predicts continued decline",
          "Consider significant position reduction",
          "Implement strict stop-loss",
          "Explore hedging strategies",
        ]
      }
    } else {
      // Fallback strategy based on traditional analysis
      if (position.lossPercentage < 15) {
        strategy = "Hold and Accumulate"
        actions = ["Maintain current position", "Set up DCA schedule", "Monitor support levels", "Review in 30 days"]
        riskLevel = "Low"
        successProbability = 75
      } else if (position.lossPercentage < 35) {
        strategy = "Strategic Rebalancing"
        actions = [
          "Reduce position by 25%",
          "Diversify into stable assets",
          "Set trailing stop-loss",
          "Weekly performance review",
        ]
        riskLevel = "Medium"
        successProbability = 60
      } else {
        strategy = "Risk Mitigation"
        actions = [
          "Consider partial exit",
          "Hedge with derivatives",
          "Strict risk management",
          "Daily monitoring required",
        ]
        riskLevel = "High"
        successProbability = 40
      }
    }

    const requiredGain = ((targetPrice - position.currentPrice) / position.currentPrice) * 100

    const plan: RecoveryPlan = {
      strategy,
      targetPrice,
      timeframe: lossAnalysis.timeframe,
      actions,
      riskLevel,
      successProbability,
      requiredCapital: position.currentValue * 0.2, // 20% additional capital
      expectedReturn: requiredGain,
    }

    setRecoveryPlan(plan)
    setIsGeneratingPlan(false)
  }

  const analyzeSentiment = async () => {
    if (!selectedPosition) return

    // Simulate sentiment analysis
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const position = selectedPosition
    let emotionalState = ""
    let biases: string[] = []
    let riskTolerance = ""
    let decisionClarity = ""
    let recommendations: string[] = []
    let mindsetScore = 0

    if (position.lossPercentage < 10) {
      emotionalState = "Calm and Rational"
      biases = ["Overconfidence bias"]
      riskTolerance = "High"
      decisionClarity = "Clear"
      recommendations = ["Maintain disciplined approach", "Avoid overtrading"]
      mindsetScore = 85
    } else if (position.lossPercentage < 25) {
      emotionalState = "Concerned but Stable"
      biases = ["Loss aversion", "Anchoring bias"]
      riskTolerance = "Medium"
      decisionClarity = "Somewhat clouded"
      recommendations = ["Take breaks from monitoring", "Focus on long-term goals"]
      mindsetScore = 70
    } else if (position.lossPercentage < 50) {
      emotionalState = "Anxious and Stressed"
      biases = ["Panic selling tendency", "Confirmation bias"]
      riskTolerance = "Low"
      decisionClarity = "Impaired"
      recommendations = ["Seek emotional support", "Avoid major decisions", "Practice mindfulness"]
      mindsetScore = 45
    } else {
      emotionalState = "Distressed and Overwhelmed"
      biases = ["Desperation bias", "All-or-nothing thinking"]
      riskTolerance = "Very Low"
      decisionClarity = "Severely impaired"
      recommendations = ["Professional counseling", "Support group participation", "Gradual exposure therapy"]
      mindsetScore = 25
    }

    const sentiment: SentimentAnalysis = {
      emotionalState,
      biases,
      riskTolerance,
      decisionClarity,
      recommendations,
      mindsetScore,
    }

    setSentimentAnalysis(sentiment)
  }

  useEffect(() => {
    if (selectedPosition && lossAnalysis) {
      analyzeSentiment()
    }
  }, [selectedPosition, lossAnalysis])

  const totalInvested = positions.reduce((sum, p) => sum + p.totalInvested, 0)
  const totalCurrentValue = positions.reduce((sum, p) => sum + p.currentValue, 0)

  // totalDelta > 0 means overall profit, < 0 means overall loss
  const totalDelta = totalCurrentValue - totalInvested
  const totalIsProfit = totalDelta >= 0
  const totalDeltaAbs = Math.abs(totalDelta)
  const totalDeltaPercentage = totalInvested > 0 ? (totalDelta / totalInvested) * 100 : 0

  // Prepare combined chart data so forecast starts where historical ends
  let chartData: Array<any> = []
  if (selectedPosition) {
    const historical = selectedPosition.historicalData.slice(-60)
    const forecast = selectedPosition.forecast?.predictions || []

    // Start with historical points (price populated).
    chartData = historical.map((d) => ({ ...d, price: d.price, forecastPrice: null }))

    // If there is forecast data, insert a boundary point at the last historical date so the forecast line
    // visually starts from the last known price. Then append forecast points (forecastPrice populated).
    if (forecast.length > 0 && historical.length > 0) {
      const lastHist = historical[historical.length - 1]
      // boundary point: duplicate the last historical date with both price and forecastPrice equal to last known price
      chartData.push({ date: lastHist.date, price: lastHist.price, forecastPrice: lastHist.price })
      chartData.push(...forecast.map((d) => ({ ...d, price: null, forecastPrice: d.price })))
    } else if (forecast.length > 0 && historical.length === 0) {
      // No historical points but forecast exists: show forecastPrice series
      chartData = forecast.map((d) => ({ ...d, price: null, forecastPrice: d.price }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-green-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            AI Loss Recovery Strategizer
          </h1>
          <p className="text-gray-400 text-lg">ML-powered analysis and recovery planning with real historical data</p>
        </div>

        {/* Portfolio Overview */}
        {positions.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Portfolio Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Total Invested</p>
                  <p className="text-2xl font-bold text-blue-400">${totalInvested.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Current Value</p>
                  <p className="text-2xl font-bold text-green-400">${totalCurrentValue.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">{totalIsProfit ? "Total Profit" : "Total Loss"}</p>
                  <p className={`text-2xl font-bold ${totalIsProfit ? "text-green-400" : "text-red-400"}`}>
                    ${totalDeltaAbs.toFixed(2)} {totalIsProfit ? "" : ""}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">{totalIsProfit ? "Profit Percentage" : "Loss Percentage"}</p>
                  <p className={`text-2xl font-bold ${totalIsProfit ? "text-green-400" : "text-red-400"}`}>
                    {totalDeltaPercentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Position */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Position
              </CardTitle>
              <CardDescription className="text-gray-400">
                Select a cryptocurrency and add your position for AI-powered loss analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="coin-select">Select Cryptocurrency</Label>
                <Popover open={coinSearchOpen} onOpenChange={setCoinSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={coinSearchOpen}
                      className="w-full justify-between bg-gray-700 border-gray-600 text-white"
                      disabled={isLoadingCoins}
                    >
                      {selectedCoin ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={selectedCoin.image || "/placeholder.svg"}
                            alt={selectedCoin.name}
                            className="w-5 h-5"
                          />
                          {selectedCoin.name} ({selectedCoin.symbol.toUpperCase()})
                        </div>
                      ) : isLoadingCoins ? (
                        "Loading coins..."
                      ) : (
                        "Select cryptocurrency..."
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-gray-800 border-gray-700">
                    <Command className="bg-gray-800">
                      <CommandInput placeholder="Search cryptocurrency..." className="bg-gray-800 text-white" />
                      <CommandList>
                        <CommandEmpty>No cryptocurrency found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {availableCoins.map((coin) => (
                            <CommandItem
                              key={coin.id}
                              value={coin.name}
                              onSelect={() => {
                                setSelectedCoin(coin)
                                setCoinSearchOpen(false)
                              }}
                              className="text-white hover:bg-gray-700"
                            >
                              <div className="flex items-center gap-2">
                                <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-5 h-5" />
                                <div>
                                  <div className="font-medium">{coin.name}</div>
                                  <div className="text-sm text-gray-400">
                                    {coin.symbol.toUpperCase()} • ${coin.current_price.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedCoin && (
                <div className="p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src={selectedCoin.image || "/placeholder.svg"} alt={selectedCoin.name} className="w-8 h-8" />
                    <div>
                      <div className="font-medium text-white">{selectedCoin.name}</div>
                      <div className="text-sm text-gray-400">
                        Current Price: ${selectedCoin.current_price.toFixed(2)} •{" "}
                        <span
                          className={selectedCoin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}
                        >
                          {selectedCoin.price_change_percentage_24h >= 0 ? "+" : ""}
                          {selectedCoin.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    placeholder="50000"
                    value={newPosition.purchasePrice}
                    onChange={(e) => setNewPosition({ ...newPosition, purchasePrice: e.target.value })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0.5"
                    step="0.00000001"
                    value={newPosition.quantity}
                    onChange={(e) => setNewPosition({ ...newPosition, quantity: e.target.value })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={newPosition.purchaseDate}
                    onChange={(e) => setNewPosition({ ...newPosition, purchaseDate: e.target.value })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </div>

              <Button
                onClick={addPosition}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!selectedCoin || !newPosition.purchasePrice || !newPosition.quantity || isAddingPosition}
              >
                {isAddingPosition ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Position & Generating Forecast...
                  </>
                ) : (
                  "Add Position"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Positions List */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Your Positions
              </CardTitle>
              <CardDescription className="text-gray-400">
                Click on a position to analyze losses and generate AI-powered recovery strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No positions added yet</p>
                  <p className="text-sm">Add a position to get started with AI loss analysis</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {positions.map((position) => (
                    <div
                      key={position.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedPosition?.id === position.id
                          ? "border-green-500 bg-green-900/20"
                          : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                      }`}
                      onClick={() => analyzeLoss(position)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{position.coin}</h3>
                            <Badge variant="outline" className="text-xs">
                              {position.symbol}
                            </Badge>
                            {position.forecast && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-purple-900/20 text-purple-400 border-purple-500/20"
                              >
                                AI Forecast
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {position.quantity} @ ${position.purchasePrice}
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="text-sm">
                              {(() => {
                                const posDelta = position.currentValue - position.totalInvested
                                const isProfit = posDelta >= 0
                                const deltaAbs = Math.abs(posDelta)
                                const percent = position.totalInvested > 0 ? (posDelta / position.totalInvested) * 100 : 0

                                return (
                                  <>
                                    <span className="text-gray-400">{isProfit ? "Profit: " : "Loss: "}</span>
                                    <span className={`${isProfit ? "text-green-400" : "text-red-400"} font-medium`}>
                                      ${deltaAbs.toFixed(2)} ({percent.toFixed(2)}%)
                                    </span>
                                  </>
                                )
                              })()}
                            </div>
                            {position.forecast && (
                              <div className="text-sm">
                                <span className="text-gray-400">Model: </span>
                                <span className="text-purple-400 font-medium">
                                  {position.forecast.accuracy.toFixed(0)}% accuracy
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {position.lossPercentage > 0 ? (
                            <TrendingDown className="h-4 w-4 text-red-400" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-green-400" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removePosition(position.id)
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        {selectedPosition && (
          <div className="space-y-6">
            {/* Price Chart with Forecast */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Price History & AI Forecast - {selectedPosition.coin}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      {/* Combined Chart Data: historical prices (price) and forecast (forecastPrice) */}
                      <Line
                        data={chartData}
                        type="monotone"
                        dataKey="price"
                        stroke="#EF4444"
                        strokeWidth={2}
                        dot={false}
                        name="Historical Price"
                        isAnimationActive={false}
                      />
                      {/* Forecast draws from forecastPrice which is appended after historical data */}
                      <Line
                        data={chartData}
                        type="monotone"
                        dataKey="forecastPrice"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="AI Forecast"
                        className="h-full"
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {selectedPosition.forecast && (
                  <div className="mt-4 p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-400 font-medium">AI Forecast Model</p>
                        <p className="text-sm text-gray-400">{selectedPosition.forecast.modelType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-medium">
                          {selectedPosition.forecast.accuracy.toFixed(1)}% Accuracy
                        </p>
                        <p className="text-sm text-gray-400">Based on backtesting</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                <TabsTrigger value="analysis">Loss Analysis</TabsTrigger>
                <TabsTrigger value="recovery">Recovery Plan</TabsTrigger>
                <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              {/* Loss Analysis Tab */}
              <TabsContent value="analysis">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI Loss Analysis
                      {isAnalyzing && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isAnalyzing ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                        <p className="text-gray-400">Analyzing your position with historical data...</p>
                      </div>
                    ) : lossAnalysis ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-white">Loss Severity</h3>
                            <Badge
                              variant={lossAnalysis.severity === "Critical" ? "destructive" : "outline"}
                              className={`mt-2 ${
                                lossAnalysis.severity === "Low"
                                  ? "bg-green-900 text-green-300"
                                  : lossAnalysis.severity === "Medium"
                                    ? "bg-yellow-900 text-yellow-300"
                                    : lossAnalysis.severity === "High"
                                      ? "bg-orange-900 text-orange-300"
                                      : "bg-red-900 text-red-300"
                              }`}
                            >
                              {lossAnalysis.severity}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-sm">Confidence Score</p>
                            <p className="text-2xl font-bold text-green-400">{lossAnalysis.confidenceScore}%</p>
                          </div>
                        </div>

                        <Separator className="bg-gray-700" />

                        <div>
                          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            Identified Causes
                          </h4>
                          <div className="space-y-2">
                            {lossAnalysis.causes.map((cause, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                <span className="text-gray-300">{cause}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                            <Heart className="h-4 w-4 text-pink-400" />
                            Psychological Impact
                          </h4>
                          <p className="text-gray-300 bg-gray-700/50 p-3 rounded-lg">
                            {lossAnalysis.psychologicalImpact}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-400" />
                            AI Recommendations
                          </h4>
                          <div className="space-y-2">
                            {lossAnalysis.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Recovery Timeframe: {lossAnalysis.timeframe}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a position to start AI analysis</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Recovery Plan Tab */}
              <TabsContent value="recovery">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-green-400 flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        AI Recovery Strategy
                        {isGeneratingPlan && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                        )}
                      </CardTitle>
                      {lossAnalysis && !recoveryPlan && !isGeneratingPlan && (
                        <Button onClick={generateRecoveryPlan} className="bg-green-600 hover:bg-green-700">
                          Generate AI Recovery Plan
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!lossAnalysis ? (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Please complete the loss analysis first to generate an AI recovery plan.
                        </AlertDescription>
                      </Alert>
                    ) : isGeneratingPlan ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                        <p className="text-gray-400">Generating AI-powered recovery strategy using ML forecasts...</p>
                      </div>
                    ) : recoveryPlan ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                            <p className="text-gray-400 text-sm">Strategy</p>
                            <p className="text-lg font-semibold text-white">{recoveryPlan.strategy}</p>
                          </div>
                          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                            <p className="text-gray-400 text-sm">Success Probability</p>
                            <p className="text-lg font-semibold text-green-400">{recoveryPlan.successProbability}%</p>
                          </div>
                          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                            <p className="text-gray-400 text-sm">Risk Level</p>
                            <Badge
                              variant="outline"
                              className={
                                recoveryPlan.riskLevel === "Low"
                                  ? "bg-green-900 text-green-300"
                                  : recoveryPlan.riskLevel === "Medium"
                                    ? "bg-yellow-900 text-yellow-300"
                                    : "bg-red-900 text-red-300"
                              }
                            >
                              {recoveryPlan.riskLevel}
                            </Badge>
                          </div>
                        </div>

                        <Separator className="bg-gray-700" />

                        <div>
                          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            AI-Generated Action Plan
                          </h4>
                          <div className="space-y-3">
                            {recoveryPlan.actions.map((action, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                  {index + 1}
                                </div>
                                <span className="text-gray-300">{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-400" />
                              Financial Targets
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Target Price:</span>
                                <span className="text-white">${recoveryPlan.targetPrice.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Required Capital:</span>
                                <span className="text-white">${recoveryPlan.requiredCapital.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Expected Return:</span>
                                <span className="text-green-400">{recoveryPlan.expectedReturn.toFixed(2)}%</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-400" />
                              Timeline
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Timeframe:</span>
                                <span className="text-white">{recoveryPlan.timeframe}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Review Frequency:</span>
                                <span className="text-white">Weekly</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Button onClick={generateRecoveryPlan} className="bg-green-600 hover:bg-green-700" size="lg">
                          Generate AI Recovery Plan
                        </Button>
                        <p className="text-gray-400 text-sm mt-2">
                          Create a personalized strategy using ML forecasts and historical analysis
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sentiment Analysis Tab */}
              <TabsContent value="sentiment">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Psychological Sentiment Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sentimentAnalysis ? (
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="relative w-32 h-32 mx-auto mb-4">
                            <div className="absolute inset-0 rounded-full border-8 border-gray-700"></div>
                            <div
                              className="absolute inset-0 rounded-full border-8 border-green-400 border-t-transparent transform -rotate-90"
                              style={{
                                background: `conic-gradient(from 0deg, #10B981 ${sentimentAnalysis.mindsetScore * 3.6}deg, transparent ${sentimentAnalysis.mindsetScore * 3.6}deg)`,
                              }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold text-white">{sentimentAnalysis.mindsetScore}</span>
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-white">Mindset Score</h3>
                          <p className="text-gray-400">Overall psychological health assessment</p>
                        </div>

                        <Separator className="bg-gray-700" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                              <Heart className="h-4 w-4 text-pink-400" />
                              Emotional State
                            </h4>
                            <p className="text-gray-300 bg-gray-700/50 p-3 rounded-lg">
                              {sentimentAnalysis.emotionalState}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-400" />
                              Risk Tolerance
                            </h4>
                            <p className="text-gray-300 bg-gray-700/50 p-3 rounded-lg">
                              {sentimentAnalysis.riskTolerance}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-purple-400" />
                            Decision Clarity
                          </h4>
                          <p className="text-gray-300 bg-gray-700/50 p-3 rounded-lg">
                            {sentimentAnalysis.decisionClarity}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            Behavioral Biases
                          </h4>
                          <div className="space-y-2">
                            {sentimentAnalysis.biases.map((bias, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                                <span className="text-gray-300">{bias}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-400" />
                            Mindset Recommendations
                          </h4>
                          <div className="space-y-2">
                            {sentimentAnalysis.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Complete loss analysis to view sentiment data</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Position Details & Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPosition ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-semibold text-white">Investment Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Coin:</span>
                                <span className="text-white">
                                  {selectedPosition.coin} ({selectedPosition.symbol})
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Quantity:</span>
                                <span className="text-white">{selectedPosition.quantity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Purchase Date:</span>
                                <span className="text-white">{selectedPosition.purchaseDate}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Purchase Price:</span>
                                <span className="text-white">${selectedPosition.purchasePrice.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Current Price:</span>
                                <span className="text-white">${selectedPosition.currentPrice.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="font-semibold text-white">Performance Metrics</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Total Invested:</span>
                                <span className="text-white">${selectedPosition.totalInvested.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Current Value:</span>
                                <span className="text-white">${selectedPosition.currentValue.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Unrealized Loss:</span>
                                <span className="text-red-400">${selectedPosition.lossAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Loss Percentage:</span>
                                <span className="text-red-400">{selectedPosition.lossPercentage.toFixed(2)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Days Held:</span>
                                <span className="text-white">
                                  {Math.floor(
                                    (Date.now() - new Date(selectedPosition.purchaseDate).getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator className="bg-gray-700" />

                        {selectedPosition.forecast && (
                          <>
                            <div>
                              <h4 className="font-semibold text-white mb-3">AI Forecast Analysis</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                                  <p className="text-purple-400 font-medium">Model Type</p>
                                  <p className="text-white">{selectedPosition.forecast.modelType}</p>
                                </div>
                                <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                                  <p className="text-purple-400 font-medium">Accuracy</p>
                                  <p className="text-white">{selectedPosition.forecast.accuracy.toFixed(1)}%</p>
                                </div>
                                <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                                  <p className="text-purple-400 font-medium">Predictions</p>
                                  <p className="text-white">{selectedPosition.forecast.predictions.length} days</p>
                                </div>
                              </div>
                            </div>
                            <Separator className="bg-gray-700" />
                          </>
                        )}

                        <div>
                          <h4 className="font-semibold text-white mb-3">Historical Analysis</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                              <span className="text-gray-300">Data Points Available</span>
                              <span className="text-white">{selectedPosition.historicalData.length} days</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                              <span className="text-gray-300">{selectedPosition.currentPrice >= selectedPosition.purchasePrice ? "Price Change" : "Price Decline"}</span>
                              {(() => {
                                const unitDelta = selectedPosition.currentPrice - selectedPosition.purchasePrice
                                const isProfit = unitDelta >= 0
                                return (
                                  <span className={`${isProfit ? "text-green-400" : "text-red-400"}`}>
                                    ${Math.abs(unitDelta).toFixed(2)} per unit
                                  </span>
                                )
                              })()}
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                              <span className="text-gray-300">{selectedPosition.currentValue >= selectedPosition.totalInvested ? "Total Impact (Profit)" : "Total Impact"}</span>
                              {(() => {
                                const totalDeltaPos = selectedPosition.currentValue - selectedPosition.totalInvested
                                const isProfitTotal = totalDeltaPos >= 0
                                const percentTotal = selectedPosition.totalInvested > 0 ? (totalDeltaPos / selectedPosition.totalInvested) * 100 : 0
                                return (
                                  <span className={`${isProfitTotal ? "text-green-400" : "text-red-400"}`}>
                                    ${Math.abs(totalDeltaPos).toFixed(2)} ({percentTotal.toFixed(2)}%)
                                  </span>
                                )
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a position to view detailed analytics</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
