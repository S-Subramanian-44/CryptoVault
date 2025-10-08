export interface CurrencyRecommendation {
  symbol: string
  name: string
  currentPrice: number
  targetPrice: number
  expectedReturn: number
  recommendedAmount: number
  confidence: number
  reasoning: string
}

export interface RecoveryPlan {
  currencyRecommendations: CurrencyRecommendation[]
  totalInvestmentNeeded: number
  timeToRecovery: string
  confidence: number
  riskLevel: "Low" | "Medium" | "High"
  recommendedStrategy: {
    name: string
    description: string
    riskLevel: "Low" | "Medium" | "High"
    successRate: number
  }
  actionPlan: string[]
  riskWarnings: string[]
}

/**
 * Lightweight demo planner.
 * In production you would call real ML models / analytics services here.
 */
export const enhancedRecoveryPlanner = {
  async generateRecoveryPlan({
    currentLoss,
    availableFunds,
    losingPositions,
    timeframe,
  }: {
    currentLoss: number
    totalInvested: number
    currentValue: number
    losingPositions: any[]
    riskTolerance: string
    timeframe: string
    availableFunds: number
    marketData: any
  }): Promise<RecoveryPlan> {
    // Pick up to three coins to recommend – simplest version: top three losers
    const top = losingPositions.sort((a, b) => a.unrealizedPnLPercentage - b.unrealizedPnLPercentage).slice(0, 3)

    const perCoinBudget = availableFunds / (top.length || 1)

    const recommendations: CurrencyRecommendation[] = top.map((p) => {
      const targetMult = 1.2 // +20 % target
      return {
        symbol: p.symbol,
        name: p.name,
        currentPrice: p.currentPrice,
        targetPrice: p.currentPrice * targetMult,
        expectedReturn: (targetMult - 1) * 100,
        recommendedAmount: Number(perCoinBudget.toFixed(2)),
        confidence: 70 + Math.random() * 15, // mock confidence 70-85 %
        reasoning: `Historically ${p.name} rebounds strongly after large drawdowns.`,
      }
    })

    return {
      currencyRecommendations: recommendations,
      totalInvestmentNeeded: availableFunds,
      timeToRecovery: timeframe === "Long" ? "6-12 months" : "3-6 months",
      confidence: 75,
      riskLevel: currentLoss > 50 ? "High" : currentLoss > 30 ? "Medium" : "Low",
      recommendedStrategy: {
        name: "AI-Optimized Rebalancing",
        description:
          "Deploy additional capital into assets with high rebound probability based on volatility-adjusted momentum.",
        riskLevel: currentLoss > 50 ? "High" : "Medium",
        successRate: 75,
      },
      actionPlan: [
        "Allocate extra funds to recommended assets in equal parts.",
        "Set stop-loss 15 % below current prices.",
        "Review portfolio weekly and rebalance if any asset exceeds +25 % gain.",
      ],
      riskWarnings: [
        "Crypto markets are volatile – only invest what you can afford to lose.",
        "Past performance is not indicative of future results.",
      ],
    }
  },
}
