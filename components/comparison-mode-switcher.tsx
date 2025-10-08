"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, History, BarChart3, Clock, TrendingUp, Zap } from "lucide-react"

interface ComparisonModeSwitcherProps {
  activeMode: "live" | "historical"
  onModeChange: (mode: "live" | "historical") => void
  selectedCoinsCount: number
}

export function ComparisonModeSwitcher({ activeMode, onModeChange, selectedCoinsCount }: ComparisonModeSwitcherProps) {
  return (
    <Card className="crypto-card border-green-500/20">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Historical Mode */}
          <div
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              activeMode === "historical"
                ? "border-blue-500 bg-blue-500/10"
                : "border-gray-700 bg-gray-800/30 hover:border-blue-500/50"
            }`}
            onClick={() => onModeChange("historical")}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-blue-400">Historical Analysis</h3>
              </div>
              {activeMode === "historical" && (
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/20">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Analyze price trends, market cap changes, and trading patterns over different time periods
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-3 w-3" />
                <span>Multiple timeframes (1D - 1Y)</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-3 w-3" />
                <span>Percentage change comparisons</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-3 w-3" />
                <span>Volume & market cap analysis</span>
              </div>
            </div>
          </div>

          {/* Live Mode */}
          <div
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              activeMode === "live"
                ? "border-green-500 bg-green-500/10"
                : "border-gray-700 bg-gray-800/30 hover:border-green-500/50"
            }`}
            onClick={() => onModeChange("live")}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-400 animate-pulse" />
                <h3 className="font-semibold text-green-400">Live Streaming</h3>
              </div>
              {activeMode === "live" && (
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/20">
                  <Zap className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Monitor real-time price movements with live updates, timestamps, and data recording
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span>Real-time updates every 5 seconds</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-3 w-3" />
                <span>Live streaming charts</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-3 w-3" />
                <span>Export with timestamps</span>
              </div>
            </div>
          </div>
        </div>

        {selectedCoinsCount > 0 && (
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-gray-400">
                <BarChart3 className="h-4 w-4" />
                <span>Ready to compare {selectedCoinsCount} cryptocurrencies</span>
              </div>
              <div className="text-green-400">
                {activeMode === "historical" ? "📊 Historical Mode" : "🔴 Live Mode"}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
