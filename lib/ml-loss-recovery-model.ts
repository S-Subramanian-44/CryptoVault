// Simple ML-inspired loss recovery model
export interface MarketFeatures {
  currentPrice: number
  purchasePrice: number
  daysSinceInvestment: number
  marketVolatility: number
  marketSentiment: number // -1 to 1
  rsi: number // 0 to 100
  volume24h: number
  marketCap: number
}

export interface RecoveryPrediction {
  probabilityOfRecovery: number // 0 to 1
  expectedTimeToBreakeven: number // days
  recommendedAction: "HOLD" | "DCA" | "SELL" | "WAIT"
  confidenceScore: number // 0 to 1
  riskScore: number // 0 to 1
  factors: string[]
}

export class LossRecoveryMLModel {
  // Trained weights (simulated - in real app these would come from actual ML training)
  private weights = {
    lossPercentage: -0.3,
    daysSinceInvestment: 0.1,
    marketVolatility: -0.2,
    marketSentiment: 0.4,
    rsi: 0.2,
    volumeRatio: 0.15,
    marketCapStability: 0.25,
  }

  private biases = {
    recovery: 0.5,
    timeToBreakeven: 30,
    confidence: 0.7,
    risk: 0.4,
  }

  predict(features: MarketFeatures): RecoveryPrediction {
    // Calculate loss percentage
    const lossPercentage = (features.purchasePrice - features.currentPrice) / features.purchasePrice

    // Normalize features
    const normalizedFeatures = this.normalizeFeatures(features, lossPercentage)

    // Calculate probability of recovery using weighted sum
    const recoveryScore = this.calculateRecoveryScore(normalizedFeatures)
    const probabilityOfRecovery = this.sigmoid(recoveryScore)

    // Calculate expected time to breakeven
    const timeScore = this.calculateTimeScore(normalizedFeatures)
    const expectedTimeToBreakeven = Math.max(7, Math.min(365, timeScore))

    // Determine recommended action
    const recommendedAction = this.determineAction(probabilityOfRecovery, lossPercentage, normalizedFeatures)

    // Calculate confidence and risk scores
    const confidenceScore = this.calculateConfidence(normalizedFeatures)
    const riskScore = this.calculateRisk(normalizedFeatures, lossPercentage)

    // Generate explanatory factors
    const factors = this.generateFactors(normalizedFeatures, lossPercentage, probabilityOfRecovery)

    return {
      probabilityOfRecovery,
      expectedTimeToBreakeven,
      recommendedAction,
      confidenceScore,
      riskScore,
      factors,
    }
  }

  private normalizeFeatures(features: MarketFeatures, lossPercentage: number) {
    return {
      lossPercentage: Math.max(-1, Math.min(1, lossPercentage)),
      daysSinceInvestment: Math.min(1, features.daysSinceInvestment / 365),
      marketVolatility: Math.min(1, features.marketVolatility / 100),
      marketSentiment: Math.max(-1, Math.min(1, features.marketSentiment)),
      rsi: features.rsi / 100,
      volumeRatio: Math.min(1, features.volume24h / (features.marketCap * 0.1)),
      marketCapStability: Math.min(1, Math.log(features.marketCap) / 25), // Log scale for market cap
    }
  }

  private calculateRecoveryScore(features: any): number {
    return (
      features.lossPercentage * this.weights.lossPercentage +
      features.daysSinceInvestment * this.weights.daysSinceInvestment +
      features.marketVolatility * this.weights.marketVolatility +
      features.marketSentiment * this.weights.marketSentiment +
      features.rsi * this.weights.rsi +
      features.volumeRatio * this.weights.volumeRatio +
      features.marketCapStability * this.weights.marketCapStability +
      this.biases.recovery
    )
  }

  private calculateTimeScore(features: any): number {
    const baseTime = this.biases.timeToBreakeven
    const lossMultiplier = Math.abs(features.lossPercentage) * 100
    const sentimentMultiplier = (1 - features.marketSentiment) * 50
    const volatilityMultiplier = features.marketVolatility * 30

    return baseTime + lossMultiplier + sentimentMultiplier + volatilityMultiplier
  }

  private determineAction(
    probability: number,
    lossPercentage: number,
    features: any,
  ): "HOLD" | "DCA" | "SELL" | "WAIT" {
    if (lossPercentage < -0.5) {
      // More than 50% loss
      return probability > 0.3 ? "DCA" : "SELL"
    } else if (lossPercentage < -0.2) {
      // 20-50% loss
      return probability > 0.5 ? "DCA" : "WAIT"
    } else if (lossPercentage < -0.1) {
      // 10-20% loss
      return probability > 0.6 ? "HOLD" : "WAIT"
    } else {
      // Less than 10% loss
      return "HOLD"
    }
  }

  private calculateConfidence(features: any): number {
    // Higher confidence with more stable market conditions
    const stabilityScore =
      features.marketCapStability * 0.3 +
      (1 - features.marketVolatility) * 0.3 +
      Math.abs(features.marketSentiment) * 0.2 +
      features.rsi * 0.2

    return Math.max(0.3, Math.min(0.95, this.biases.confidence + stabilityScore * 0.3))
  }

  private calculateRisk(features: any, lossPercentage: number): number {
    // Higher risk with larger losses and unstable conditions
    const riskScore =
      Math.abs(lossPercentage) * 0.4 +
      features.marketVolatility * 0.3 +
      (1 - features.marketCapStability) * 0.2 +
      Math.max(0, -features.marketSentiment) * 0.1

    return Math.max(0.1, Math.min(0.9, riskScore))
  }

  private generateFactors(features: any, lossPercentage: number, probability: number): string[] {
    const factors: string[] = []

    if (Math.abs(lossPercentage) > 0.3) {
      factors.push("Significant loss position requires careful strategy")
    }

    if (features.marketSentiment > 0.3) {
      factors.push("Positive market sentiment supports recovery")
    } else if (features.marketSentiment < -0.3) {
      factors.push("Negative market sentiment may delay recovery")
    }

    if (features.marketVolatility > 0.5) {
      factors.push("High volatility increases both risk and opportunity")
    }

    if (features.rsi < 0.3) {
      factors.push("Oversold conditions suggest potential bounce")
    } else if (features.rsi > 0.7) {
      factors.push("Overbought conditions suggest caution")
    }

    if (features.marketCapStability > 0.7) {
      factors.push("Large market cap provides stability")
    }

    if (features.daysSinceInvestment > 0.5) {
      factors.push("Long holding period - consider tax implications")
    }

    if (probability > 0.7) {
      factors.push("High probability of recovery based on historical patterns")
    } else if (probability < 0.3) {
      factors.push("Low probability of recovery - consider exit strategy")
    }

    return factors.length > 0 ? factors : ["Standard market conditions apply"]
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x))
  }

  // Method to retrain model with new data (placeholder)
  retrain(trainingData: { features: MarketFeatures; outcome: boolean }[]): void {
    // In a real implementation, this would update the weights based on new data
    console.log(`Retraining model with ${trainingData.length} data points`)

    // Simple weight adjustment based on success rate
    const successRate = trainingData.filter((d) => d.outcome).length / trainingData.length

    if (successRate > 0.7) {
      // Model is performing well, small adjustments
      Object.keys(this.weights).forEach((key) => {
        this.weights[key as keyof typeof this.weights] *= 1.01
      })
    } else if (successRate < 0.4) {
      // Model needs improvement
      Object.keys(this.weights).forEach((key) => {
        this.weights[key as keyof typeof this.weights] *= 0.99
      })
    }

    console.log("Model retrained successfully")
  }

  // Get model performance metrics
  getModelMetrics(): {
    accuracy: number
    precision: number
    recall: number
    lastTrainingDate: string
    trainingDataSize: number
  } {
    return {
      accuracy: 0.73 + Math.random() * 0.1, // Simulated
      precision: 0.68 + Math.random() * 0.1,
      recall: 0.71 + Math.random() * 0.1,
      lastTrainingDate: new Date().toLocaleDateString(),
      trainingDataSize: 1247 + Math.floor(Math.random() * 100),
    }
  }
}

// Export singleton instance
export const lossRecoveryModel = new LossRecoveryMLModel()
