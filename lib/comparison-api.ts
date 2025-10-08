const API_KEY = "CG-ThfFzJogGF5EYmke1ALvPg8v"
const BASE_URL = "https://api.coingecko.com/api/v3"

// Cache for comparison data
const comparisonCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

export interface TimeRange {
  label: string
  value: string
  days: number
}

export const TIME_RANGES: TimeRange[] = [
  { label: "1D", value: "1d", days: 1 },
  { label: "7D", value: "7d", days: 7 },
  { label: "30D", value: "30d", days: 30 },
  { label: "90D", value: "90d", days: 90 },
  { label: "1Y", value: "1y", days: 365 },
  { label: "All", value: "max", days: 2000 },
]

export interface CoinComparison {
  id: string
  name: string
  symbol: string
  image: string
  prices: Array<[number, number]>
  market_caps: Array<[number, number]>
  total_volumes: Array<[number, number]>
  current_price: number
  price_change_percentage: number
  market_cap: number
  total_volume: number
}

function getCachedData(key: string) {
  const cached = comparisonCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: any) {
  comparisonCache.set(key, { data, timestamp: Date.now() })
}

export async function fetchCoinComparison(coinIds: string[], days: number): Promise<CoinComparison[]> {
  const cacheKey = `comparison-${coinIds.join(",")}-${days}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  try {
    const promises = coinIds.map(async (coinId) => {
      // Fetch historical data
      const historyResponse = await fetch(
        `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&x_cg_demo_api_key=${API_KEY}`,
      )

      // Fetch current data
      const currentResponse = await fetch(
        `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&x_cg_demo_api_key=${API_KEY}`,
      )

      if (!historyResponse.ok || !currentResponse.ok) {
        throw new Error(`Failed to fetch data for ${coinId}`)
      }

      const historyData = await historyResponse.json()
      const currentData = await currentResponse.json()

      return {
        id: coinId,
        name: currentData.name,
        symbol: currentData.symbol,
        image: currentData.image?.large || "",
        prices: historyData.prices || [],
        market_caps: historyData.market_caps || [],
        total_volumes: historyData.total_volumes || [],
        current_price: currentData.market_data?.current_price?.usd || 0,
        price_change_percentage: currentData.market_data?.price_change_percentage_24h || 0,
        market_cap: currentData.market_data?.market_cap?.usd || 0,
        total_volume: currentData.market_data?.total_volume?.usd || 0,
      }
    })

    const results = await Promise.all(promises)
    setCachedData(cacheKey, results)
    return results
  } catch (error) {
    console.error("Error fetching comparison data:", error)
    // Return mock data for demo
    return coinIds.map((coinId, index) => ({
      id: coinId,
      name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
      symbol: coinId.slice(0, 3).toUpperCase(),
      image: "",
      prices: Array.from({ length: Math.min(days * 24, 168) }, (_, i) => [
        Date.now() - (days * 24 - i) * 60 * 60 * 1000,
        40000 + Math.random() * 10000 + index * 5000,
      ]),
      market_caps: [],
      total_volumes: [],
      current_price: 40000 + index * 5000,
      price_change_percentage: (Math.random() - 0.5) * 20,
      market_cap: 800000000000 + index * 100000000000,
      total_volume: 25000000000 + index * 5000000000,
    }))
  }
}

export interface MarketFilter {
  priceRange: [number, number]
  marketCapRange: [number, number]
  volumeRange: [number, number]
  categories: string[]
  performance: "all" | "gainers" | "losers" | "stable"
  timeRange: string
}

export const DEFAULT_FILTER: MarketFilter = {
  priceRange: [0, 100000],
  marketCapRange: [0, 1000000000000],
  volumeRange: [0, 100000000000],
  categories: [],
  performance: "all",
  timeRange: "24h",
}

export const CRYPTO_CATEGORIES = [
  "Layer 1",
  "Layer 2",
  "DeFi",
  "NFT",
  "Gaming",
  "Metaverse",
  "AI",
  "Meme",
  "Stablecoin",
  "Exchange Token",
  "Privacy",
  "Oracle",
]

export function filterCoins(coins: any[], filter: MarketFilter) {
  return coins.filter((coin) => {
    // Price range filter
    if (coin.current_price < filter.priceRange[0] || coin.current_price > filter.priceRange[1]) {
      return false
    }

    // Market cap range filter
    if (coin.market_cap < filter.marketCapRange[0] || coin.market_cap > filter.marketCapRange[1]) {
      return false
    }

    // Volume range filter
    if (coin.total_volume < filter.volumeRange[0] || coin.total_volume > filter.volumeRange[1]) {
      return false
    }

    // Performance filter
    const change = coin.price_change_percentage_24h
    switch (filter.performance) {
      case "gainers":
        return change > 0
      case "losers":
        return change < 0
      case "stable":
        return Math.abs(change) < 2
      default:
        return true
    }
  })
}
