"use client"

import RiskDashboard from "@/components/risk-dashboard"

export default function RiskPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Risk & Optimization
          </h1>
          <p className="text-gray-400">Analyze portfolio risk (VaR, drawdown) and get optimization suggestions.</p>
        </div>
        <RiskDashboard />
      </div>
    </div>
  )
}
