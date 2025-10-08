import type { PriceForecast } from "./forecasting-models"

export interface RecoveryStrategy {
  id: string
  name: string
  description: string
  riskLevel: "Low" | "Medium" | "High"
  expectedTimeframe: string
  successRate: number
  recommendedCoins: string[]
  strategy: string[]
  warnings: string[]
  dynamicAllocation: {
    [symbol: string]: {
      percentage: number
      reasoning: string
      targetPrice: number
      stopLoss: number
    }
  }
}

export interface PortfolioAnalysis {
  totalUnrealizedPnLPercentage: number
  losingPositions: number
  totalInvested: number
  currentValue: number
}

export interface MarketData {
  prices: Map<string, { price: number; change24h: number }>
  globalData: any
}

// Dynamic recovery strategies based on real analysis
export function generateDynamicRecoveryStrategies(
  portfolioAnalysis: PortfolioAnalysis,
  marketData: MarketData,
  forecasts: PriceForecast[],
): RecoveryStrategy[] {
  const strategies: RecoveryStrategy[] = []

  const lossPercentage = Math.abs(portfolioAnalysis.totalUnrealizedPnLPercentage)
  const losingPositions = portfolioAnalysis.losingPositions

  // Strategy 1: AI-Optimized Recovery (Dynamic)
  const aiStrategy: RecoveryStrategy = {
    id: "ai_optimized_dynamic",
    name: "AI-Optimized Dynamic Recovery",
    description: "Machine learning guided recovery based on real-time market analysis and historical performance",
    riskLevel: lossPercentage > 40 ? "High" : lossPercentage > 20 ? "Medium" : "Low",
    expectedTimeframe: calculateDynamicTimeframe(lossPercentage, forecasts),
    successRate: calculateSuccessRate(forecasts),
    recommendedCoins: forecasts.slice(0, 3).map((f) => f.symbol),
    strategy: generateDynamicStrategy(forecasts, portfolioAnalysis),
    warnings: generateDynamicWarnings(lossPercentage, forecasts),
    dynamicAllocation: generateDynamicAllocation(forecasts, portfolioAnalysis),
  }

  strategies.push(aiStrategy)

  // Strategy 2: Momentum-Based Recovery (Dynamic)
  const momentumStrategy: RecoveryStrategy = {
    id: "momentum_dynamic",
    name: "Dynamic Momentum Recovery",
    description: "Target cryptocurrencies with strongest predicted momentum based on AI analysis",
    riskLevel: "Medium",
    expectedTimeframe: "2-4 months",
    successRate: calculateMomentumSuccessRate(forecasts),
    recommendedCoins: getBestMomentumCoins(forecasts),
    strategy: generateMomentumStrategy(forecasts),
    warnings: ["Higher volatility expected", "Requires active monitoring", "Stop-losses recommended"],
    dynamicAllocation: generateMomentumAllocation(forecasts),
  }

  strategies.push(momentumStrategy)

  // Strategy 3: Conservative Recovery (Dynamic)
  const conservativeStrategy: RecoveryStrategy = {
    id: "conservative_dynamic",
    name: "Conservative AI-Guided Recovery",
    description: "Low-risk recovery focusing on most stable predictions with highest confidence",
    riskLevel: "Low",
    expectedTimeframe: calculateConservativeTimeframe(forecasts),
    successRate: calculateConservativeSuccessRate(forecasts),
    recommendedCoins: getMostStableCoins(forecasts),
    strategy: generateConservativeStrategy(forecasts),
    warnings: ["Slower recovery expected", "Lower potential returns", "Requires patience"],
    dynamicAllocation: generateConservativeAllocation(forecasts),
  }

  strategies.push(conservativeStrategy)

  return strategies
}

function calculateDynamicTimeframe(lossPercentage: number, forecasts: PriceForecast[]): string {
  const avgConfidence =
    forecasts.reduce((sum, f) => {
      const confidences = Object.values(f.predictions).map((p) => p.confidence)
      return sum + confidences.reduce((a, b) => a + b, 0) / confidences.length
    }, 0) / forecasts.length

  const baseMonths = Math.ceil(lossPercentage / 10)
  const confidenceAdjustment = (100 - avgConfidence) / 20
  const totalMonths = Math.ceil(baseMonths + confidenceAdjustment)

  return `${Math.max(1, totalMonths - 2)}-${totalMonths + 2} months`
}

function calculateSuccessRate(forecasts: PriceForecast[]): number {
  const avgAccuracy = forecasts.reduce((sum, f) => sum + f.modelPerformance.overallAccuracy, 0) / forecasts.length
  const avgConfidence =
    forecasts.reduce((sum, f) => {
      const confidences = Object.values(f.predictions).map((p) => p.confidence)
      return sum + confidences.reduce((a, b) => a + b, 0) / confidences.length
    }, 0) / forecasts.length

  return Math.round((avgAccuracy + avgConfidence) / 2)
}

function generateDynamicStrategy(forecasts: PriceForecast[], portfolioAnalysis: PortfolioAnalysis): string[] {
  const strategy: string[] = []

  strategy.push("Implement AI-guided position sizing based on prediction confidence")
  strategy.push(`Focus on ${forecasts.length} highest-confidence recovery opportunities`)

  const avgDaysHeld = forecasts.reduce((sum, f) => sum + f.daysSinceInvestment, 0) / forecasts.length
  if (avgDaysHeld > 180) {
    strategy.push("Long-term positions detected - consider partial profit-taking on rebounds")
  } else {
    strategy.push("Recent positions - maintain holdings through short-term volatility")
  }

  const highConfidenceForecasts = forecasts.filter((f) => Object.values(f.predictions).some((p) => p.confidence > 75))

  if (highConfidenceForecasts.length > 0) {
    strategy.push(`Prioritize ${highConfidenceForecasts.length} high-confidence predictions for additional investment`)
  }

  strategy.push("Set dynamic stop-losses based on model confidence levels")
  strategy.push("Rebalance portfolio weekly based on updated AI predictions")

  return strategy
}

function generateDynamicWarnings(lossPercentage: number, forecasts: PriceForecast[]): string[] {
  const warnings: string[] = []

  const lowConfidenceForecasts = forecasts.filter((f) => Object.values(f.predictions).some((p) => p.confidence < 60))

  if (lowConfidenceForecasts.length > 0) {
    warnings.push(`${lowConfidenceForecasts.length} positions have low prediction confidence`)
  }

  const highVolatilitySymbols = forecasts.filter((f) => {
    const priceChanges = f.historicalData.map((d) => d.change24h)
    const avgVolatility = priceChanges.reduce((sum, change) => sum + Math.abs(change), 0) / priceChanges.length
    return avgVolatility > 8
  })

  if (highVolatilitySymbols.length > 0) {
    warnings.push(`High volatility detected in ${highVolatilitySymbols.length} positions`)
  }

  if (lossPercentage > 50) {
    warnings.push("Severe losses require careful risk management")
  }

  warnings.push("AI predictions are not guaranteed - past performance doesn't ensure future results")

  return warnings
}

function generateDynamicAllocation(
  forecasts: PriceForecast[],
  portfolioAnalysis: PortfolioAnalysis,
): { [symbol: string]: any } {
  const allocation: { [symbol: string]: any } = {}

  forecasts.forEach((forecast) => {
    const avgConfidence =
      Object.values(forecast.predictions).reduce((sum: number, p: any) => sum + p.confidence, 0) /
      Object.keys(forecast.predictions).length
    const bestPrediction = Object.values(forecast.predictions).reduce((best: any, current: any) =>
      current.confidence > best.confidence ? current : best,
    )

    const riskAdjustedPercentage = Math.min(40, Math.max(10, avgConfidence / 2))

    allocation[forecast.symbol] = {
      percentage: riskAdjustedPercentage,
      reasoning: `${avgConfidence.toFixed(1)}% average confidence with ${forecast.modelPerformance.overallAccuracy.toFixed(1)}% historical accuracy`,
      targetPrice: bestPrediction.price,
      stopLoss: forecast.currentPrice * 0.85, // 15% stop loss
    }
  })

  return allocation
}

function getBestMomentumCoins(forecasts: PriceForecast[]): string[] {
  return forecasts
    .sort((a, b) => {
      const aChange =
        Object.values(a.predictions).reduce((sum: number, p: any) => sum + p.change, 0) /
        Object.keys(a.predictions).length
      const bChange =
        Object.values(b.predictions).reduce((sum: number, p: any) => sum + p.change, 0) /
        Object.keys(b.predictions).length
      return bChange - aChange
    })
    .slice(0, 3)
    .map((f) => f.symbol)
}

function getMostStableCoins(forecasts: PriceForecast[]): string[] {
  return forecasts
    .sort((a, b) => {
      const aConfidence =
        Object.values(a.predictions).reduce((sum: number, p: any) => sum + p.confidence, 0) /
        Object.keys(a.predictions).length
      const bConfidence =
        Object.values(b.predictions).reduce((sum: number, p: any) => sum + p.confidence, 0) /
        Object.keys(b.predictions).length
      return bConfidence - aConfidence
    })
    .slice(0, 3)
    .map((f) => f.symbol)
}

function calculateMomentumSuccessRate(forecasts: PriceForecast[]): number {
  const momentumScores = forecasts.map((f) => {
    const avgChange =
      Object.values(f.predictions).reduce((sum: number, p: any) => sum + Math.abs(p.change), 0) /
      Object.keys(f.predictions).length
    const avgConfidence =
      Object.values(f.predictions).reduce((sum: number, p: any) => sum + p.confidence, 0) /
      Object.keys(f.predictions).length
    return (avgChange + avgConfidence) / 2
  })

  return Math.round(momentumScores.reduce((sum, score) => sum + score, 0) / momentumScores.length)
}

function calculateConservativeSuccessRate(forecasts: PriceForecast[]): number {
  const conservativeScores = forecasts.map((f) => {
    const avgConfidence =
      Object.values(f.predictions).reduce((sum: number, p: any) => sum + p.confidence, 0) /
      Object.keys(f.predictions).length
    const accuracy = f.modelPerformance.overallAccuracy
    return (avgConfidence + accuracy) / 2
  })

  return Math.round(conservativeScores.reduce((sum, score) => sum + score, 0) / conservativeScores.length)
}

function calculateConservativeTimeframe(forecasts: PriceForecast[]): string {
  const avgConfidence =
    forecasts.reduce((sum, f) => {
      const confidences = Object.values(f.predictions).map((p) => p.confidence)
      return sum + confidences.reduce((a, b) => a + b, 0) / confidences.length
    }, 0) / forecasts.length

  const baseMonths = avgConfidence > 80 ? 4 : avgConfidence > 60 ? 6 : 8
  return `${baseMonths}-${baseMonths + 4} months`
}

function generateMomentumStrategy(forecasts: PriceForecast[]): string[] {
  return [
    "Target positions with highest predicted price momentum",
    "Use 25% position sizing with tight 10% stop-losses",
    "Take partial profits at 15%, 30%, and 50% gains",
    "Monitor daily for momentum shifts and model updates",
    "Rotate into stronger momentum opportunities weekly",
  ]
}

function generateConservativeStrategy(forecasts: PriceForecast[]): string[] {
  return [
    "Focus on highest-confidence predictions only",
    "Use dollar-cost averaging over 4-8 week periods",
    "Maintain 20% cash reserves for opportunities",
    "Set wide 20% stop-losses to avoid false signals",
    "Hold positions for full predicted timeframes",
  ]
}

function generateMomentumAllocation(forecasts: PriceForecast[]): { [symbol: string]: any } {
  const allocation: { [symbol: string]: any } = {}
  const sortedForecasts = forecasts.sort((a, b) => {
    const aChange =
      Object.values(a.predictions).reduce((sum: number, p: any) => sum + p.change, 0) /
      Object.keys(a.predictions).length
    const bChange =
      Object.values(b.predictions).reduce((sum: number, p: any) => sum + p.change, 0) /
      Object.keys(b.predictions).length
    return bChange - aChange
  })

  sortedForecasts.slice(0, 3).forEach((forecast, index) => {
    const percentages = [40, 35, 25]
    allocation[forecast.symbol] = {
      percentage: percentages[index],
      reasoning: "High momentum potential with active management",
      targetPrice: Object.values(forecast.predictions)[2].price, // 1 week target
      stopLoss: forecast.currentPrice * 0.9, // 10% stop loss
    }
  })

  return allocation
}

function generateConservativeAllocation(forecasts: PriceForecast[]): { [symbol: string]: any } {
  const allocation: { [symbol: string]: any } = {}
  const stableForecasts = forecasts.sort((a, b) => {
    const aConfidence =
      Object.values(a.predictions).reduce((sum: number, p: any) => sum + p.confidence, 0) /
      Object.keys(a.predictions).length
    const bConfidence =
      Object.values(b.predictions).reduce((sum: number, p: any) => sum + p.confidence, 0) /
      Object.keys(b.predictions).length
    return bConfidence - aConfidence
  })

  stableForecasts.slice(0, 3).forEach((forecast) => {
    const avgConfidence =
      Object.values(forecast.predictions).reduce((sum: number, p: any) => sum + p.confidence, 0) /
      Object.keys(forecast.predictions).length

    allocation[forecast.symbol] = {
      percentage: 33.33,
      reasoning: `High confidence (${avgConfidence.toFixed(1)}%) with conservative approach`,
      targetPrice: Object.values(forecast.predictions)[4].price, // 1 month target
      stopLoss: forecast.currentPrice * 0.8, // 20% stop loss
    }
  })

  return allocation
}
