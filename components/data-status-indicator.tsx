"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cryptoStreamer } from "@/lib/realtime-streaming"
import { getApiStatus, resetApiStatus } from "@/lib/enhanced-coingecko-api"
import { Wifi, WifiOff, Database, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"

export function DataStatusIndicator() {
  const [isConnected, setIsConnected] = useState(false)
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const [apiStatus, setApiStatus] = useState({ healthy: true, failureCount: 0, usingMockData: false })
  const [lastUpdate, setLastUpdate] = useState<string>("")

  useEffect(() => {
    const updateStatus = () => {
      setIsConnected(cryptoStreamer.getConnectionStatus())
      setIsUsingMockData(cryptoStreamer.isUsingMockData())
      setApiStatus(getApiStatus())
      setLastUpdate(new Date().toLocaleTimeString())
    }

    updateStatus()
    const interval = setInterval(updateStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleForceRealData = async () => {
    resetApiStatus()
    await cryptoStreamer.forceRealData()
    setApiStatus(getApiStatus())
  }

  const handleForceMockData = () => {
    cryptoStreamer.forceMockData()
    setIsUsingMockData(true)
  }

  return (
    <Card className="crypto-card border-blue-500/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? <Wifi className="h-4 w-4 text-green-400" /> : <WifiOff className="h-4 w-4 text-red-400" />}
              <span className="text-sm font-medium text-white">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-blue-400" />
              <Badge
                variant="outline"
                className={`${
                  isUsingMockData || apiStatus.usingMockData
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/20"
                    : "bg-green-500/20 text-green-400 border-green-500/20"
                }`}
              >
                {isUsingMockData || apiStatus.usingMockData ? "Mock Data" : "Live Data"}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              {apiStatus.healthy ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-400" />
              )}
              <span className="text-sm text-gray-400">
                API: {apiStatus.healthy ? "Healthy" : `${apiStatus.failureCount} failures`}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Last update: {lastUpdate}</span>

            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceRealData}
                className="text-xs bg-green-500/20 border-green-500/20 text-green-400"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Real Data
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleForceMockData}
                className="text-xs bg-yellow-500/20 border-yellow-500/20 text-yellow-400"
              >
                <Database className="h-3 w-3 mr-1" />
                Mock Data
              </Button>
            </div>
          </div>
        </div>

        {(isUsingMockData || apiStatus.usingMockData) && (
          <div className="mt-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">
                Using enhanced mock data due to API limitations. All features remain fully functional with realistic
                simulated data.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
