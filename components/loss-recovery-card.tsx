"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, Brain, TrendingDown, AlertTriangle, Zap } from "lucide-react"
import Link from "next/link"

export function LossRecoveryCard() {
  return (
    <Card className="crypto-card border-red-500/20 bg-gradient-to-br from-red-900/10 to-orange-900/10">
      <CardHeader>
        <CardTitle className="text-red-400 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Loss Recovery Strategizer
          <Badge variant="outline" className="ml-2 bg-red-500/20 text-red-400 border-red-500/20">
            <Brain className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300 text-sm">
          Advanced AI-powered loss recovery system with machine learning forecasting models and personalized recovery
          strategies.
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <span className="text-gray-400">Portfolio Loss Analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-purple-400" />
            <span className="text-gray-400">5 AI Forecasting Models</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-green-400" />
            <span className="text-gray-400">Recovery Strategies</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-gray-400">Real-time Optimization</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-red-500/20">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">Professional Loss Recovery</span>
          </div>
          <Link href="/recovery-strategizer">
            <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white">
              <Target className="h-4 w-4 mr-2" />
              Start Recovery
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
