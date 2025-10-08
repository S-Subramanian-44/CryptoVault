"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, TrendingUp, Shield } from "lucide-react"

interface ExchangesListProps {
  exchanges: any[]
}

export function ExchangesList({ exchanges }: ExchangesListProps) {
  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="text-green-400 flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Top Cryptocurrency Exchanges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exchanges.map((exchange, index) => (
            <div
              key={exchange.id}
              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-green-500/20"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 rounded-full">
                  <span className="text-green-400 font-bold text-sm">#{index + 1}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">{exchange.name}</h3>
                  <p className="text-sm text-gray-400">24h Volume: {exchange.trade_volume_24h_btc?.toFixed(0)} BTC</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/20">
                  <Shield className="h-3 w-3 mr-1" />
                  Trust: {exchange.trust_score}/10
                </Badge>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
