const API_KEY = "CG-ThfFzJogGF5EYmke1ALvPg8v"
const BASE_URL = "https://api.coingecko.com/api/v3"

export interface CoinData {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  price_change_percentage_24h: number
  price_change_percentage_7d: number
  total_volume: number
  high_24h: number
  low_24h: number
  ath: number
  ath_change_percentage: number
  atl: number
  atl_change_percentage: number
}

export interface CoinDetails extends CoinData {
  description: {
    en: string
  }
  market_data: {
    current_price: { usd: number }
    price_change_percentage_24h: number
    price_change_percentage_7d: number
    price_change_percentage_30d: number
    market_cap: { usd: number }
    total_volume: { usd: number }
    high_24h: { usd: number }
    low_24h: { usd: number }
    ath: { usd: number }
    ath_change_percentage: { usd: number }
    atl: { usd: number }
    atl_change_percentage: { usd: number }
  }
}

export async function fetchTopCoins(limit = 100): Promise<CoinData[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&x_cg_demo_api_key=${API_KEY}`,
    )
    if (!response.ok) throw new Error("Failed to fetch coins")
    return await response.json()
  } catch (error) {
    console.error("Error fetching top coins:", error)
    return []
  }
}

export async function fetchCoinDetails(coinId: string): Promise<CoinDetails | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false&x_cg_demo_api_key=${API_KEY}`,
    )
    if (!response.ok) throw new Error("Failed to fetch coin details")
    return await response.json()
  } catch (error) {
    console.error("Error fetching coin details:", error)
    return null
  }
}

export async function fetchCoinHistory(coinId: string, days = 7): Promise<number[][]> {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&x_cg_demo_api_key=${API_KEY}`,
    )
    if (!response.ok) throw new Error("Failed to fetch coin history")
    const data = await response.json()
    return data.prices || []
  } catch (error) {
    console.error("Error fetching coin history:", error)
    return []
  }
}

export async function fetchGlobalData() {
  try {
    const response = await fetch(`${BASE_URL}/global?x_cg_demo_api_key=${API_KEY}`)
    if (!response.ok) throw new Error("Failed to fetch global data")
    return await response.json()
  } catch (error) {
    console.error("Error fetching global data:", error)
    return null
  }
}

export async function fetchTrendingCoins() {
  try {
    const response = await fetch(`${BASE_URL}/search/trending?x_cg_demo_api_key=${API_KEY}`)
    if (!response.ok) throw new Error("Failed to fetch trending coins")
    return await response.json()
  } catch (error) {
    console.error("Error fetching trending coins:", error)
    return null
  }
}
