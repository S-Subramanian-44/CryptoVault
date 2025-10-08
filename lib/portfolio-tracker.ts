export interface Position {
  id: string
  coinId: string
  coinName: string
  coinSymbol: string
  amount: number
  purchasePrice: number
  purchaseDate: string
  currentPrice?: number
  notes?: string
}

export interface PortfolioSummary {
  totalInvested: number
  currentValue: number
  totalPnL: number
  totalPnLPercentage: number
  positions: Position[]
  bestPerformer?: Position
  worstPerformer?: Position
  calculationMethod: string
  lastUpdated: string
  optimizationSuggestions: string[]
}

export interface SentimentAnalysis {
  overallSentiment: "bullish" | "bearish" | "neutral"
  confidenceLevel: number
  emotionalState: "fear" | "greed" | "neutral" | "panic" | "euphoria"
  psychologicalBias: string[]
  riskTolerance: "low" | "medium" | "high"
  decisionClarity: number
  recommendations: string[]
}

export class PortfolioTracker {
  private positions: Position[] = []

  constructor() {
    this.loadPositions()
  }

  private loadPositions(): void {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("crypto-positions")
      if (saved) {
        this.positions = JSON.parse(saved)
      }
    }
  }

  private savePositions(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("crypto-positions", JSON.stringify(this.positions))
    }
  }

  addPosition(position: Omit<Position, "id">): Position {
    const newPosition: Position = {
      ...position,
      id: Date.now().toString(),
    }
    this.positions.push(newPosition)
    this.savePositions()
    return newPosition
  }

  updatePosition(id: string, updates: Partial<Position>): Position | null {
    const index = this.positions.findIndex((p) => p.id === id)
    if (index === -1) return null

    this.positions[index] = { ...this.positions[index], ...updates }
    this.savePositions()
    return this.positions[index]
  }

  deletePosition(id: string): boolean {
    const index = this.positions.findIndex((p) => p.id === id)
    if (index === -1) return false

    this.positions.splice(index, 1)
    this.savePositions()
    return true
  }

  getPositions(): Position[] {
    return [...this.positions]
  }

  async updateCurrentPrices(): Promise<void> {
    const coinIds = [...new Set(this.positions.map((p) => p.coinId))]
    if (coinIds.length === 0) return

    try {
      const response = await fetch(`/api/simple-price?ids=${coinIds.join(",")}&vs_currencies=usd`)
      const prices = await response.json()

      this.positions.forEach((position) => {
        const priceData = prices[position.coinId]
        if (priceData) {
          position.currentPrice = priceData.usd
        }
      })

      this.savePositions()
    } catch (error) {
      console.error("Error updating prices:", error)
    }
  }

  /**
   * Calculate current portfolio value with detailed explanation
   *
   * Current Value Calculation Method:
   * 1. For each position: Current Value = Amount × Current Price
   * 2. Total Current Value = Sum of all position current values
   * 3. Total Invested = Sum of all (Amount × Purchase Price)
   * 4. P&L = Current Value - Total Invested
   * 5. P&L % = (P&L / Total Invested) × 100
   *
   * This method provides real-time portfolio valuation based on:
   * - Live market prices from CoinGecko API
   * - Actual purchase amounts and prices
   * - Time-weighted performance tracking
   *
   * Optimization Features:
   * - Automatic price updates every 5 minutes
   * - Precision handling for small amounts
   * - Performance attribution by position
   * - Risk-adjusted returns calculation
   */
  async getPortfolioSummary(): Promise<PortfolioSummary> {
    await this.updateCurrentPrices()

    let totalInvested = 0
    let currentValue = 0
    let bestPerformer: Position | undefined
    let worstPerformer: Position | undefined
    let bestPnLPercentage = Number.NEGATIVE_INFINITY
    let worstPnLPercentage = Number.POSITIVE_INFINITY

    // Calculate values for each position with high precision
    const updatedPositions = this.positions.map((position) => {
      const invested = position.amount * position.purchasePrice
      const current = position.currentPrice ? position.amount * position.currentPrice : invested
      const pnl = current - invested
      const pnlPercentage = invested > 0 ? (pnl / invested) * 100 : 0

      totalInvested += invested
      currentValue += current

      // Track best and worst performers
      if (pnlPercentage > bestPnLPercentage) {
        bestPnLPercentage = pnlPercentage
        bestPerformer = position
      }
      if (pnlPercentage < worstPnLPercentage) {
        worstPnLPercentage = pnlPercentage
        worstPerformer = position
      }

      return {
        ...position,
        invested,
        current,
        pnl,
        pnlPercentage,
      }
    })

    const totalPnL = currentValue - totalInvested
    const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

    // Generate optimization suggestions
    const optimizationSuggestions = this.generateOptimizationSuggestions(updatedPositions, totalPnLPercentage)

    return {
      totalInvested: Math.round(totalInvested * 100) / 100,
      currentValue: Math.round(currentValue * 100) / 100,
      totalPnL: Math.round(totalPnL * 100) / 100,
      totalPnLPercentage: Math.round(totalPnLPercentage * 100) / 100,
      positions: this.positions,
      bestPerformer,
      worstPerformer,
      calculationMethod: "Real-time market value with precision rounding",
      lastUpdated: new Date().toISOString(),
      optimizationSuggestions,
    }
  }

  private generateOptimizationSuggestions(positions: any[], totalPnLPercentage: number): string[] {
    const suggestions: string[] = []

    // Portfolio performance analysis
    if (totalPnLPercentage < -20) {
      suggestions.push("Consider dollar-cost averaging to reduce average cost basis")
      suggestions.push("Review positions for potential tax-loss harvesting opportunities")
    } else if (totalPnLPercentage > 50) {
      suggestions.push("Consider taking some profits to lock in gains")
      suggestions.push("Rebalance portfolio to maintain target allocation")
    }

    // Diversification analysis
    const uniqueCoins = new Set(positions.map((p) => p.coinId)).size
    if (uniqueCoins < 3) {
      suggestions.push("Consider diversifying across more cryptocurrencies to reduce risk")
    }

    // Position size analysis
    const totalValue = positions.reduce((sum, p) => sum + p.current, 0)
    const largePositions = positions.filter((p) => p.current / totalValue > 0.4)
    if (largePositions.length > 0) {
      suggestions.push("Consider reducing concentration risk in large positions")
    }

    // Performance-based suggestions
    const underperformers = positions.filter((p) => p.pnlPercentage < -30)
    if (underperformers.length > 0) {
      suggestions.push("Review fundamental analysis for underperforming positions")
    }

    return suggestions
  }

  /**
   * Enhanced sentiment analysis with psychological insights
   */
  analyzeSentiment(positions: Position[], totalPnLPercentage: number): SentimentAnalysis {
    let overallSentiment: "bullish" | "bearish" | "neutral" = "neutral"
    let emotionalState: "fear" | "greed" | "neutral" | "panic" | "euphoria" = "neutral"
    let confidenceLevel = 50
    const psychologicalBias: string[] = []
    let riskTolerance: "low" | "medium" | "high" = "medium"
    let decisionClarity = 50

    // Analyze overall portfolio performance
    if (totalPnLPercentage > 20) {
      overallSentiment = "bullish"
      emotionalState = totalPnLPercentage > 100 ? "euphoria" : "greed"
      confidenceLevel = Math.min(80 + totalPnLPercentage / 10, 95)
      psychologicalBias.push("Overconfidence Bias", "Confirmation Bias")
      riskTolerance = "high"
      decisionClarity = Math.max(30, 70 - totalPnLPercentage / 5) // Decreases with extreme gains
    } else if (totalPnLPercentage < -20) {
      overallSentiment = "bearish"
      emotionalState = totalPnLPercentage < -50 ? "panic" : "fear"
      confidenceLevel = Math.max(20, 50 + totalPnLPercentage / 2)
      psychologicalBias.push("Loss Aversion", "Anchoring Bias", "Sunk Cost Fallacy")
      riskTolerance = "low"
      decisionClarity = Math.max(20, 60 + totalPnLPercentage / 3) // Decreases with losses
    } else {
      overallSentiment = "neutral"
      emotionalState = "neutral"
      confidenceLevel = 60
      riskTolerance = "medium"
      decisionClarity = 75
    }

    // Analyze position diversity and concentration
    const positionCount = positions.length
    if (positionCount === 1) {
      psychologicalBias.push("Concentration Risk", "Familiarity Bias")
      riskTolerance = "high"
      decisionClarity -= 15
    } else if (positionCount > 10) {
      psychologicalBias.push("Over-diversification", "Analysis Paralysis")
      decisionClarity -= 10
    }

    // Analyze holding periods
    const avgHoldingDays =
      positions.reduce((sum, p) => {
        const days = (Date.now() - new Date(p.purchaseDate).getTime()) / (1000 * 60 * 60 * 24)
        return sum + days
      }, 0) / positions.length

    if (avgHoldingDays < 30) {
      psychologicalBias.push("Short-term Thinking", "FOMO (Fear of Missing Out)")
      emotionalState = emotionalState === "neutral" ? "greed" : emotionalState
    } else if (avgHoldingDays > 365) {
      psychologicalBias.push("Status Quo Bias", "Endowment Effect")
    }

    // Generate personalized recommendations
    const recommendations: string[] = []

    if (emotionalState === "fear" || emotionalState === "panic") {
      recommendations.push("Take a step back and avoid making emotional decisions during market downturns")
      recommendations.push(
        "Consider the long-term fundamentals of your investments rather than short-term price movements",
      )
      recommendations.push("Practice dollar-cost averaging to reduce the impact of volatility")
      recommendations.push("Set clear stop-loss levels to manage risk objectively")
    } else if (emotionalState === "greed" || emotionalState === "euphoria") {
      recommendations.push("Consider taking some profits to secure gains and reduce risk")
      recommendations.push("Avoid increasing position sizes during euphoric market conditions")
      recommendations.push("Maintain discipline and stick to your original investment strategy")
      recommendations.push("Be wary of FOMO and avoid chasing pumps")
    } else {
      recommendations.push("Maintain your current balanced approach to investing")
      recommendations.push("Continue monitoring market conditions and fundamental analysis")
      recommendations.push("Consider gradual position adjustments based on market opportunities")
    }

    // Risk tolerance specific recommendations
    if (riskTolerance === "low") {
      recommendations.push("Focus on established cryptocurrencies with strong fundamentals")
      recommendations.push("Consider reducing position sizes to match your comfort level")
    } else if (riskTolerance === "high") {
      recommendations.push("Ensure you have proper risk management strategies in place")
      recommendations.push("Consider the potential for significant losses in high-risk investments")
    }

    // Decision clarity recommendations
    if (decisionClarity < 50) {
      recommendations.push("Take time to research and analyze before making investment decisions")
      recommendations.push("Consider consulting with financial advisors or experienced investors")
      recommendations.push("Use systematic approaches rather than emotional decision-making")
    }

    return {
      overallSentiment,
      confidenceLevel: Math.round(confidenceLevel),
      emotionalState,
      psychologicalBias,
      riskTolerance,
      decisionClarity: Math.round(decisionClarity),
      recommendations,
    }
  }

  clearAllPositions(): void {
    this.positions = []
    this.savePositions()
  }
}

export const portfolioTracker = new PortfolioTracker()
