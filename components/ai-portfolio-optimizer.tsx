"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Target, Zap, CheckCircle } from "lucide-react"
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, Tooltip, Pie } from "recharts"

interface PortfolioOptimization {
  currentAllocation: { coin: string; percentage: number; value: number }[]
  recommendedAllocation: { coin: string; percentage: number; targetValue: number; action: "BUY" | "SELL" | "HOLD" }[]
  riskScore: number
  expectedReturn: number
  sharpeRatio: number
  diversificationScore: number
  improvements: string[]
  aiRecommendations: string[]
}

export function AIPortfolioOptimizer() {
  const [optimization, setOptimization] = useState<PortfolioOptimization | null>(null)
  const [loading, setLoading] = useState(false)

  const mockOptimization: PortfolioOptimization = {
    currentAllocation: [
      { coin: "Bitcoin", percentage: 45, value: 22500 },
      { coin: "Ethereum", percentage: 30, value: 15000 },
      { coin: "Cardano", percentage: 15, value: 7500 },
      { coin: "Solana", percentage: 10, value: 5000 },
    ],
    recommendedAllocation: [
      { coin: "Bitcoin", percentage: 35, targetValue: 17500, action: "SELL" },
      { coin: "Ethereum", percentage: 25, targetValue: 12500, action: "SELL" },
      { coin: "Cardano", percentage: 10, targetValue: 5000, action: "SELL" },
      { coin: "Solana", percentage: 15, targetValue: 7500, action: "BUY" },
      { coin: "Chainlink", percentage: 8, targetValue: 4000, action: "BUY" },
      { coin: "Polygon", percentage: 7, targetValue: 3500, action: "BUY" },
    ],
    riskScore: 72,
    expectedReturn: 18.5,
    sharpeRatio: 1.34,
    diversificationScore: 68,
    improvements: [
      "Reduce concentration in large caps",
      "Add exposure to DeFi sector",
      "Include layer-2 solutions",
      "Balance risk-return profile",
    ],
    aiRecommendations: [
      "Your portfolio is over-concentrated in Bitcoin and Ethereum (75%). Consider reducing to 60% for better diversification.",
      "Add exposure to growing sectors like DeFi and Layer-2 solutions which have strong fundamentals.",
      "Solana shows strong technical momentum - consider increasing allocation from 10% to 15%.",
      "Include Chainlink for oracle exposure and Polygon for Layer-2 scaling solutions.",
      "This rebalancing could improve your Sharpe ratio from 1.12 to 1.34 while reducing overall risk.",
    ],
  }

  const runOptimization = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setOptimization(mockOptimization)
    setLoading(false)
  }

  const COLORS = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]

  const getRiskColor = (score: number) => {
    if (score < 40) return "text-green-400"
    if (score < 70) return "text-yellow-400"
    return "text-red-400"
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "BUY":
        return "text-green-400 bg-green-500/20 border-green-500/20"
      case "SELL":
        return "text-red-400 bg-red-500/20 border-red-500/20"
      default:
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/20"
    }
  }

  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="text-green-400 flex items-center">
          <Brain className="h-5 w-5 mr-2" />
          AI Portfolio Optimizer
          <Badge variant="outline" className="ml-2 bg-purple-500/20 text-purple-400 border-purple-500/20">
            <Zap className="h-3 w-3 mr-1" />
            Advanced ML
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!optimization ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Optimize Your Portfolio</h3>
            <p className="text-gray-400 mb-6">
              Use advanced AI algorithms to analyze and optimize your cryptocurrency portfolio allocation
            </p>
            <Button onClick={runOptimization} disabled={loading} className="crypto-button">
              {loading ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                  Analyzing Portfolio...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Run AI Optimization
                </>
              )}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="allocation">Allocation</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400">{optimization.expectedReturn}%</div>
                  <div className="text-sm text-gray-400">Expected Return</div>
                </div>
                <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400">{optimization.sharpeRatio}</div>
                  <div className="text-sm text-gray-400">Sharpe Ratio</div>
                </div>
                <div
                  className={`text-center p-3 rounded-lg border ${
                    optimization.riskScore < 40
                      ? "bg-green-500/10 border-green-500/20"
                      : optimization.riskScore < 70
                        ? "bg-yellow-500/10 border-yellow-500/20"
                        : "bg-red-500/10 border-red-500/20"
                  }`}
                >
                  <div className={`text-2xl font-bold ${getRiskColor(optimization.riskScore)}`}>
                    {optimization.riskScore}
                  </div>
                  <div className="text-sm text-gray-400">Risk Score</div>
                </div>
                <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400">{optimization.diversificationScore}</div>
                  <div className="text-sm text-gray-400">Diversification</div>
                </div>
              </div>

              {/* Improvements */}
              <Card className="crypto-card border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Key Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {optimization.improvements.map((improvement, idx) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg">
                        <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-400 text-sm font-bold">{idx + 1}</span>
                        </div>
                        <p className="text-green-400">{improvement}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="allocation" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Allocation */}
                <Card className="crypto-card">
                  <CardHeader>
                    <CardTitle className="text-blue-400">Current Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={optimization.currentAllocation}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="percentage"
                            nameKey="coin"
                          >
                            {optimization.currentAllocation.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {optimization.currentAllocation.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                            />
                            <span className="text-white">{item.coin}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">{item.percentage}%</div>
                            <div className="text-gray-400 text-sm">${item.value.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommended Allocation */}
                <Card className="crypto-card border-green-500/20">
                  <CardHeader>
                    <CardTitle className="text-green-400">Recommended Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {optimization.recommendedAllocation.map((item, idx) => (
                        <div key={idx} className="p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-white">{item.coin}</span>
                              <Badge variant="outline" className={getActionColor(item.action)}>
                                {item.action}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-semibold">{item.percentage}%</div>
                              <div className="text-gray-400 text-sm">${item.targetValue.toLocaleString()}</div>
                            </div>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <Card className="crypto-card border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {optimization.aiRecommendations.map((recommendation, idx) => (
                      <div key={idx} className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <div className="flex items-start space-x-3">
                          <Brain className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300">{recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button className="crypto-button">
                  <Target className="h-4 w-4 mr-2" />
                  Apply Recommendations
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="crypto-card">
                  <CardHeader>
                    <CardTitle className="text-blue-400">Risk Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Portfolio Risk</span>
                          <span className={`font-semibold ${getRiskColor(optimization.riskScore)}`}>
                            {optimization.riskScore}/100
                          </span>
                        </div>
                        <Progress value={optimization.riskScore} className="h-3" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Diversification</span>
                          <span className="font-semibold text-green-400">{optimization.diversificationScore}/100</span>
                        </div>
                        <Progress value={optimization.diversificationScore} className="h-3" />
                      </div>

                      <div className="pt-4 border-t border-gray-700">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Volatility</span>
                            <span className="text-white">Medium</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Correlation</span>
                            <span className="text-white">0.72</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Max Drawdown</span>
                            <span className="text-red-400">-18.5%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="crypto-card">
                  <CardHeader>
                    <CardTitle className="text-green-400">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-500/10 rounded-lg">
                          <div className="text-lg font-bold text-green-400">+{optimization.expectedReturn}%</div>
                          <div className="text-xs text-gray-400">Annual Return</div>
                        </div>
                        <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                          <div className="text-lg font-bold text-blue-400">{optimization.sharpeRatio}</div>
                          <div className="text-xs text-gray-400">Sharpe Ratio</div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-700">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Alpha</span>
                            <span className="text-green-400">+2.3%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Beta</span>
                            <span className="text-white">1.15</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Information Ratio</span>
                            <span className="text-green-400">0.89</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
