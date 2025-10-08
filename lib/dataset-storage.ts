/**
 * Ultra-simple in-memory dataset store so the UI does not break.
 * Replace with Supabase/Neon etc. if you need persistence.
 */

type PortfolioSnapshot = {
  symbol: string
  price: number
  quantity: number
  value: number
  pnl: number
  pnlPercentage: number
  timestamp: number
}

type StoredRecoveryPlan = {
  planId: string
  portfolioLoss: number
  recommendedCurrencies: string[]
  expectedRecoveryTime: string
  confidence: number
  timestamp: number
}

class DatasetStorage {
  private snapshots: PortfolioSnapshot[] = []
  private recoveryPlans: StoredRecoveryPlan[] = []

  addPortfolioSnapshot(snapshot: PortfolioSnapshot) {
    this.snapshots.push(snapshot)
  }

  addRecoveryPlan(plan: StoredRecoveryPlan) {
    this.recoveryPlans.push(plan)
  }

  /** Simple aggregations for demo purposes */
  getStats() {
    return {
      snapshots: this.snapshots.length,
      recoveryPlans: this.recoveryPlans.length,
    }
  }
}

export const datasetStorage = new DatasetStorage()
