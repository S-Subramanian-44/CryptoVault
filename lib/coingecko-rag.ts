const BASE_URL = "https://api.coingecko.com/api/v3"
const API_KEY = process.env.API_KEY

export interface CoinGeckoRAGData {
  topCoins: Array<{
    id: string
    symbol: string
    name: string
    current_price: number
    market_cap: number
    price_change_24h: number
    volume_24h: number
  }>
  globalData: {
    total_market_cap: number
    market_cap_change_24h: number
    total_volume: number
    btc_dominance: number
  }
}

export async function fetchCoinGeckoData(userQuery?: string): Promise<string> {
  try {
    // Fetch top coins data
    const coinsResponse = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&x_cg_demo_api_key=${API_KEY}`,
      { next: { revalidate: 60 } },
    )

    // Fetch global market data
    const globalResponse = await fetch(`${BASE_URL}/global?x_cg_demo_api_key=${API_KEY}`, { next: { revalidate: 60 } })

    if (!coinsResponse.ok || !globalResponse.ok) {
      throw new Error("Failed to fetch CoinGecko data")
    }

    const coins = await coinsResponse.json()
    const global = await globalResponse.json()

    // Format data for RAG context
    const topCoinsData = coins.slice(0, 10).map((coin: any) => ({
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: `$${coin.current_price.toLocaleString()}`,
      marketCap: `$${(coin.market_cap / 1e9).toFixed(2)}B`,
      change24h: `${coin.price_change_percentage_24h.toFixed(2)}%`,
      volume24h: `$${(coin.total_volume / 1e9).toFixed(2)}B`,
    }))

    const globalData = global.data
    const contextString = `
LIVE CRYPTOCURRENCY MARKET DATA (Real-time from CoinGecko API):

Global Market Overview:
- Total Market Cap: $${(globalData.total_market_cap.usd / 1e12).toFixed(2)} Trillion
- 24h Market Cap Change: ${globalData.market_cap_change_percentage_24h_usd.toFixed(2)}%
- Total 24h Volume: $${(globalData.total_volume.usd / 1e9).toFixed(2)} Billion
- Bitcoin Dominance: ${globalData.market_cap_percentage.btc.toFixed(2)}%
- Ethereum Dominance: ${globalData.market_cap_percentage.eth.toFixed(2)}%

Top 10 Cryptocurrencies by Market Cap:
${topCoinsData
  .map(
    (coin: any, idx: number) =>
      `${idx + 1}. ${coin.name} (${coin.symbol})
   Price: ${coin.price} | Market Cap: ${coin.marketCap}
   24h Change: ${coin.change24h} | 24h Volume: ${coin.volume24h}`,
  )
  .join("\n\n")}

Use this live data to provide accurate, data-driven insights about the cryptocurrency market.
`
    return contextString
  } catch (error) {
    console.error("Error fetching CoinGecko data for RAG:", error)
    return "Live market data temporarily unavailable. Providing general cryptocurrency insights."
  }
}
