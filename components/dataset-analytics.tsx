"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { datasetStorage } from "@/lib/dataset-storage"

export function DatasetAnalytics() {
  const stats = datasetStorage.getStats()

  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="text-green-400">Dataset Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-400">Portfolio Snapshots</p>
            <p className="text-2xl font-bold text-blue-400">{stats.snapshots}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Recovery Plans Stored</p>
            <p className="text-2xl font-bold text-purple-400">{stats.recoveryPlans}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
