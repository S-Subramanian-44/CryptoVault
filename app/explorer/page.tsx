"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { fetchTopCoins, type CoinData } from "@/lib/coingecko-api"
import { CoinCard } from "@/components/coin-card"
import { Search } from "lucide-react"

export default function Explorer() {
  const [coins, setCoins] = useState<CoinData[]>([])
  const [filteredCoins, setFilteredCoins] = useState<CoinData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCoins = async () => {
      try {
        const data = await fetchTopCoins(100)
        setCoins(data)
        setFilteredCoins(data)
      } catch (error) {
        console.error("Error loading coins:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCoins()
  }, [])

  useEffect(() => {
    const filtered = coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCoins(filtered)
  }, [searchTerm, coins])

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
            Coin Explorer
          </h1>
          <p className="text-gray-400">Discover and analyze cryptocurrencies</p>
        </div>

        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-green-400">Search Cryptocurrencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-green-500/20 text-white placeholder-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading cryptocurrencies...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCoins.map((coin) => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        )}

        {!loading && filteredCoins.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No cryptocurrencies found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
