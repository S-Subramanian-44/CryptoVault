"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
} from "recharts"
import { Brain, Target, Download, X, Zap, BarChart3, Activity } from "lucide-react"

interface ForecastPopupChartProps {
  forecast: any
  onClose: () => void
  onExport: () => void
}

export function ForecastPopupChart({ forecast, onClose, onExport }: ForecastPopupChartProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Prepare chart data
  const historicalChartData = forecast.historicalData.map((item: any) => ({
    date: item.date,
    price: item.price,
    volume: item.volume,
    change: item.change24h,
  }))

  const predictionChartData = Object.entries(forecast.predictions).map(([timeframe, prediction]: [string, any]) => ({
    timeframe,
    price: prediction.price,
    confidence: prediction.confidence,
    change: prediction.change,
    current: forecast.currentPrice,
  }))

  const modelPerformanceData = forecast.modelPerformance.actualVsPredicted.slice(-30).map((item: any) => ({
    date: item.date,
    actual: item.actual,
    predicted: item.predicted,
    accuracy: item.accuracy,
    error: Math.abs(item.actual - item.predicted),
  }))

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-gray-900 border-green-500/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-green-400 flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              {forecast.symbol.toUpperCase()} AI Forecast Analysis
              <Badge variant="outline" className="ml-2 bg-purple-500/20 text-purple-400 border-purple-500/20">
                {forecast.modelPerformance.modelType}
              </Badge>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button onClick={onExport} variant="outline" size="sm" className="bg-gray-800 border-green-500/20">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm" className="hover:bg-red-500/20">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
              <TabsTrigger value="performance">Model Performance</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="crypto-card border-blue-500/20">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-400">Current Price</div>
                    <div className="text-xl font-bold text-white">${forecast.currentPrice.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Live Market Price</div>
                  </CardContent>
                </Card>
                <Card className="crypto-card border-green-500/20">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-400">Model Accuracy</div>
                    <div className="text-xl font-bold text-green-400">
                      {forecast.modelPerformance.overallAccuracy.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">Backtested Performance</div>
                  </CardContent>
                </Card>
                <Card className="crypto-card border-purple-500/20">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-400">Days Analyzed</div>
                    <div className="text-xl font-bold text-purple-400">{forecast.historicalData.length}</div>
                    <div className="text-xs text-gray-500">Historical Data Points</div>
                  </CardContent>
                </Card>
                <Card className="crypto-card border-orange-500/20">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-400">Prediction Error</div>
                    <div className="text-xl font-bold text-orange-400">
                      ${forecast.modelPerformance.meanAbsoluteError.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">Mean Absolute Error</div>
                  </CardContent>
                </Card>
              </div>

              {/* Historical Price Chart */}
              <Card className="crypto-card">
                <CardHeader>
                  <CardTitle className="text-white">Historical Price Movement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="date"
                          stroke="#9CA3AF"
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #22C55E",
                            borderRadius: "8px",
                          }}
                          formatter={(value: any, name: string) => [
                            `$${Number(value).toLocaleString()}`,
                            name === "price" ? "Price" : "Volume",
                          ]}
                        />
                        <Line type="monotone" dataKey="price" stroke="#22C55E" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-6">
              {/* Prediction Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(forecast.predictions).map(([timeframe, prediction]: [string, any]) => (
                  <Card key={timeframe} className="crypto-card border-blue-500/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-gray-400 mb-1">{timeframe}</div>
                      <div className="text-lg font-bold text-white mb-1">${prediction.price.toLocaleString()}</div>
                      <div className={`text-sm mb-2 ${prediction.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {prediction.change >= 0 ? "+" : ""}
                        {prediction.change.toFixed(2)}%
                      </div>
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/20 text-xs">
                        {prediction.confidence}% confidence
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Prediction Chart */}
              <Card className="crypto-card">
                <CardHeader>
                  <CardTitle className="text-white">Price Predictions by Timeframe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={predictionChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="timeframe" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #22C55E",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="price" fill="#3B82F6" />
                        <Line
                          type="monotone"
                          dataKey="current"
                          stroke="#EF4444"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              {/* Model Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="crypto-card border-green-500/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-gray-400">Overall Accuracy</div>
                    <div className="text-2xl font-bold text-green-400">
                      {forecast.modelPerformance.overallAccuracy.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                <Card className="crypto-card border-blue-500/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-gray-400">Mean Error</div>
                    <div className="text-2xl font-bold text-blue-400">
                      ${forecast.modelPerformance.meanAbsoluteError.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="crypto-card border-purple-500/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-gray-400">Training Range</div>
                    <div className="text-lg font-bold text-purple-400">
                      {forecast.modelPerformance.trainingDataRange}
                    </div>
                  </CardContent>
                </Card>
                <Card className="crypto-card border-orange-500/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-gray-400">Model Type</div>
                    <div className="text-lg font-bold text-orange-400">{forecast.modelPerformance.modelType}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Actual vs Predicted Chart */}
              <Card className="crypto-card">
                <CardHeader>
                  <CardTitle className="text-white">Model Performance: Actual vs Predicted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={modelPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="date"
                          stroke="#9CA3AF"
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #22C55E",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="actual"
                          stroke="#22C55E"
                          strokeWidth={2}
                          name="Actual Price"
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="predicted"
                          stroke="#F59E0B"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Predicted Price"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Accuracy Distribution */}
              <Card className="crypto-card">
                <CardHeader>
                  <CardTitle className="text-white">Prediction Accuracy Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={modelPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="actual" stroke="#9CA3AF" tick={{ fontSize: 10 }} name="Actual Price" />
                        <YAxis dataKey="predicted" stroke="#9CA3AF" tick={{ fontSize: 10 }} name="Predicted Price" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #22C55E",
                            borderRadius: "8px",
                          }}
                        />
                        <Scatter dataKey="accuracy" fill="#8B5CF6" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              {/* Analysis Factors */}
              <Card className="crypto-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Analysis Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {forecast.factors.map((factor: string, index: number) => (
                      <div key={index} className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-blue-400" />
                          <span className="text-blue-400 font-medium text-sm">{factor}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Features Used */}
              <Card className="crypto-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Model Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {forecast.modelPerformance.featuresUsed.map((feature: string, index: number) => (
                      <div key={index} className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 font-medium text-sm">{feature}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Investment Timeline */}
              <Card className="crypto-card">
                <CardHeader>
                  <CardTitle className="text-white">Investment Timeline Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-400">Investment Date:</span>
                      <span className="text-white font-semibold">{forecast.investmentDate}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-400">Days Since Investment:</span>
                      <span className="text-white font-semibold">{forecast.daysSinceInvestment} days</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-400">Historical Data Points:</span>
                      <span className="text-white font-semibold">{forecast.historicalData.length} data points</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-400">Model Training Period:</span>
                      <span className="text-white font-semibold">{forecast.modelPerformance.trainingDataRange}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
