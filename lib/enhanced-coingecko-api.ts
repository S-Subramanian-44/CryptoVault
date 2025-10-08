const API_KEY = "CG-ThfFzJogGF5EYmke1ALvPg8v"
const BASE_URL = "https://api.coingecko.com/api/v3"

// Cache management
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>()

// Enhanced fallback mock data
const ENHANCED_MOCK_DATA = {
  topCoins: [
    {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      current_price: 43250 + (Math.random() - 0.5) * 2000,
      market_cap: 847000000000 + (Math.random() - 0.5) * 50000000000,
      market_cap_rank: 1,
      price_change_percentage_24h: (Math.random() - 0.5) * 8,
      price_change_percentage_7d: (Math.random() - 0.5) * 15,
      total_volume: 25000000000 + (Math.random() - 0.5) * 5000000000,
      high_24h: 44100 + (Math.random() - 0.5) * 1000,
      low_24h: 42800 + (Math.random() - 0.5) * 1000,
      ath: 69045,
      ath_change_percentage: -37.4 + (Math.random() - 0.5) * 5,
      atl: 67.81,
      atl_change_percentage: 63650.2 + (Math.random() - 0.5) * 1000,
      circulating_supply: 19500000,
      total_supply: 21000000,
      max_supply: 21000000,
      sparkline_in_7d: { price: Array.from({ length: 168 }, () => 43000 + Math.random() * 2000) },
    },
    {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      current_price: 2650 + (Math.random() - 0.5) * 300,
      market_cap: 318000000000 + (Math.random() - 0.5) * 30000000000,
      market_cap_rank: 2,
      price_change_percentage_24h: (Math.random() - 0.5) * 10,
      price_change_percentage_7d: (Math.random() - 0.5) * 12,
      total_volume: 15000000000 + (Math.random() - 0.5) * 3000000000,
      high_24h: 2720 + (Math.random() - 0.5) * 100,
      low_24h: 2580 + (Math.random() - 0.5) * 100,
      ath: 4878.26,
      ath_change_percentage: -45.7 + (Math.random() - 0.5) * 5,
      atl: 0.432979,
      atl_change_percentage: 612150.8 + (Math.random() - 0.5) * 10000,
      circulating_supply: 120000000,
      total_supply: 120000000,
      sparkline_in_7d: { price: Array.from({ length: 168 }, () => 2600 + Math.random() * 200) },
    },
    {
      id: "cardano",
      symbol: "ada",
      name: "Cardano",
      image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
      current_price: 0.45 + (Math.random() - 0.5) * 0.1,
      market_cap: 15000000000 + (Math.random() - 0.5) * 2000000000,
      market_cap_rank: 8,
      price_change_percentage_24h: (Math.random() - 0.5) * 12,
      price_change_percentage_7d: (Math.random() - 0.5) * 18,
      total_volume: 500000000 + (Math.random() - 0.5) * 100000000,
      high_24h: 0.48 + (Math.random() - 0.5) * 0.05,
      low_24h: 0.42 + (Math.random() - 0.5) * 0.05,
      ath: 3.09,
      ath_change_percentage: -85.4 + (Math.random() - 0.5) * 5,
      atl: 0.017354,
      atl_change_percentage: 2500.8 + (Math.random() - 0.5) * 200,
      circulating_supply: 35000000000,
      total_supply: 45000000000,
      max_supply: 45000000000,
      sparkline_in_7d: { price: Array.from({ length: 168 }, () => 0.4 + Math.random() * 0.15) },
    },
    {
      id: "solana",
      symbol: "sol",
      name: "Solana",
      image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
      current_price: 95 + (Math.random() - 0.5) * 20,
      market_cap: 42000000000 + (Math.random() - 0.5) * 5000000000,
      market_cap_rank: 5,
      price_change_percentage_24h: (Math.random() - 0.5) * 15,
      price_change_percentage_7d: (Math.random() - 0.5) * 20,
      total_volume: 2000000000 + (Math.random() - 0.5) * 500000000,
      high_24h: 98 + (Math.random() - 0.5) * 10,
      low_24h: 92 + (Math.random() - 0.5) * 10,
      ath: 259.96,
      ath_change_percentage: -63.4 + (Math.random() - 0.5) * 5,
      atl: 0.500801,
      atl_change_percentage: 18900.2 + (Math.random() - 0.5) * 1000,
      circulating_supply: 440000000,
      total_supply: 580000000,
      sparkline_in_7d: { price: Array.from({ length: 168 }, () => 90 + Math.random() * 25) },
    },
    {
      id: "chainlink",
      symbol: "link",
      name: "Chainlink",
      image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
      current_price: 14.5 + (Math.random() - 0.5) * 2,
      market_cap: 8500000000 + (Math.random() - 0.5) * 1000000000,
      market_cap_rank: 12,
      price_change_percentage_24h: (Math.random() - 0.5) * 8,
      price_change_percentage_7d: (Math.random() - 0.5) * 12,
      total_volume: 800000000 + (Math.random() - 0.5) * 200000000,
      high_24h: 15.2 + (Math.random() - 0.5) * 1,
      low_24h: 13.8 + (Math.random() - 0.5) * 1,
      ath: 52.88,
      ath_change_percentage: -72.6 + (Math.random() - 0.5) * 5,
      atl: 0.148183,
      atl_change_percentage: 9700.4 + (Math.random() - 0.5) * 500,
      circulating_supply: 580000000,
      total_supply: 1000000000,
      max_supply: 1000000000,
      sparkline_in_7d: { price: Array.from({ length: 168 }, () => 14 + Math.random() * 3) },
    },
  ],
  globalData: {
    data: {
      total_market_cap: { usd: 1650000000000 + (Math.random() - 0.5) * 100000000000 },
      market_cap_change_percentage_24h_usd: (Math.random() - 0.5) * 6,
      active_cryptocurrencies: 13500 + Math.floor(Math.random() * 100),
      market_cap_percentage: {
        btc: 51.3 + (Math.random() - 0.5) * 2,
        eth: 19.2 + (Math.random() - 0.5) * 1,
      },
      total_volume: { usd: 85000000000 + (Math.random() - 0.5) * 15000000000 },
    },
  },
  exchanges: [
    {
      id: "binance",
      name: "Binance",
      trade_volume_24h_btc: 125000 + Math.random() * 25000,
      trust_score: 10,
    },
    {
      id: "coinbase-exchange",
      name: "Coinbase Pro",
      trade_volume_24h_btc: 85000 + Math.random() * 15000,
      trust_score: 10,
    },
    {
      id: "kraken",
      name: "Kraken",
      trade_volume_24h_btc: 45000 + Math.random() * 10000,
      trust_score: 9,
    },
    {
      id: "bybit",
      name: "Bybit",
      trade_volume_24h_btc: 65000 + Math.random() * 15000,
      trust_score: 8,
    },
  ],
}

// API failure tracking
let apiFailureCount = 0
const maxApiFailures = 3
let isUsingMockData = false

function getCachedData(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

async function makeApiRequest(url: string, timeout = 10000, retries = 1): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
    })
    clearTimeout(timeoutId)
    return response
  } catch (error: any) {
    clearTimeout(timeoutId)

    /* ---- NEW: retry once on AbortError / timeout ---- */
    if (retries > 0 && (error?.name === "AbortError" || /signal is aborted/i.test(error?.message))) {
      console.warn(`⏳ Request timed out after ${timeout} ms, retrying once with ${timeout * 2} ms timeout…`)
      return makeApiRequest(url, timeout * 2, retries - 1)
    }

    throw error
  }
}

function handleApiError(error: any, fallbackData: any) {
  apiFailureCount++
  console.error(`API Error (${apiFailureCount}/${maxApiFailures}):`, error.message || error)

  if (apiFailureCount >= maxApiFailures && !isUsingMockData) {
    console.log("🔄 Switching to enhanced mock data due to API failures")
    isUsingMockData = true
  }

  return fallbackData
}

export interface EnhancedCoinData {
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
  circulating_supply?: number
  total_supply?: number
  max_supply?: number
  fully_diluted_valuation?: number
  sparkline_in_7d?: { price: number[] }
}

export async function fetchEnhancedTopCoins(limit = 100): Promise<EnhancedCoinData[]> {
  const cacheKey = `top-coins-${limit}`
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  if (isUsingMockData) {
    console.log("📊 Using enhanced mock data for top coins")
    const mockData = ENHANCED_MOCK_DATA.topCoins.slice(0, limit).map((coin) => ({
      ...coin,
      // Add some randomness to make it feel more real
      current_price: coin.current_price + (Math.random() - 0.5) * coin.current_price * 0.02,
      price_change_percentage_24h: coin.price_change_percentage_24h + (Math.random() - 0.5) * 2,
    }))
    setCachedData(cacheKey, mockData)
    return mockData as EnhancedCoinData[]
  }

  try {
    console.log("🌐 Fetching top coins from API...")
    const response = await makeApiRequest(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${Math.min(
        limit,
        250,
      )}&page=1&sparkline=true&price_change_percentage=1h,24h,7d&x_cg_demo_api_key=${API_KEY}`,
      15000, //  ← NEW: start with 15 s
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Successfully fetched top coins from API")
    apiFailureCount = 0 // Reset failure count on success
    setCachedData(cacheKey, data)
    return data
  } catch (error) {
    return handleApiError(error, ENHANCED_MOCK_DATA.topCoins.slice(0, limit)) as EnhancedCoinData[]
  }
}

export const fetchTopCoins = fetchEnhancedTopCoins

export async function fetchGlobalMarketData() {
  const cacheKey = "global-data"
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  if (isUsingMockData) {
    console.log("📊 Using enhanced mock data for global market")
    const mockData = {
      ...ENHANCED_MOCK_DATA.globalData,
      data: {
        ...ENHANCED_MOCK_DATA.globalData.data,
        // Add some randomness
        market_cap_change_percentage_24h_usd:
          ENHANCED_MOCK_DATA.globalData.data.market_cap_change_percentage_24h_usd + (Math.random() - 0.5) * 1,
      },
    }
    setCachedData(cacheKey, mockData)
    return mockData
  }

  try {
    console.log("🌐 Fetching global market data from API...")
    const response = await makeApiRequest(`${BASE_URL}/global?x_cg_demo_api_key=${API_KEY}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Successfully fetched global market data from API")
    apiFailureCount = 0
    setCachedData(cacheKey, data)
    return data
  } catch (error) {
    return handleApiError(error, ENHANCED_MOCK_DATA.globalData)
  }
}

export async function fetchFearGreedIndex() {
  const cacheKey = "fear-greed"
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  try {
    console.log("🌐 Fetching Fear & Greed Index...")
    const response = await makeApiRequest("https://api.alternative.me/fng/", 5000)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Successfully fetched Fear & Greed Index")
    const result = data.data[0]
    setCachedData(cacheKey, result)
    return result
  } catch (error) {
    console.log("⚠️ Fear & Greed API unavailable, using mock data")
    const mockData = {
      value: 45 + Math.floor(Math.random() * 20),
      value_classification: ["Fear", "Neutral", "Greed"][Math.floor(Math.random() * 3)],
    }
    setCachedData(cacheKey, mockData)
    return mockData
  }
}

export async function fetchExchanges() {
  const cacheKey = "exchanges"
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  if (isUsingMockData) {
    console.log("📊 Using enhanced mock data for exchanges")
    const mockData = ENHANCED_MOCK_DATA.exchanges.map((exchange) => ({
      ...exchange,
      trade_volume_24h_btc: exchange.trade_volume_24h_btc + (Math.random() - 0.5) * exchange.trade_volume_24h_btc * 0.1,
    }))
    setCachedData(cacheKey, mockData)
    return mockData
  }

  try {
    console.log("🌐 Fetching exchanges from API...")
    const response = await makeApiRequest(`${BASE_URL}/exchanges?per_page=10&x_cg_demo_api_key=${API_KEY}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Successfully fetched exchanges from API")
    apiFailureCount = 0
    setCachedData(cacheKey, data)
    return data
  } catch (error) {
    return handleApiError(error, ENHANCED_MOCK_DATA.exchanges)
  }
}

// WebSocket connection for real-time prices (with fallback)
export class PriceWebSocket {
  private ws: WebSocket | null = null
  private callbacks: Map<string, (price: number) => void> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private isConnected = false

  connect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("⚠️ Max WebSocket reconnection attempts reached, using mock updates")
      this.startMockUpdates()
      return
    }

    try {
      console.log("🔌 Connecting to Binance WebSocket...")
      this.ws = new WebSocket("wss://stream.binance.com:9443/ws/!ticker@arr")

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected successfully")
        this.isConnected = true
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (Array.isArray(data)) {
            data.forEach((ticker: any) => {
              const symbol = ticker.s.toLowerCase().replace("usdt", "")
              const price = Number.parseFloat(ticker.c)
              const callback = this.callbacks.get(symbol)
              if (callback && !isNaN(price)) {
                callback(price)
              }
            })
          }
        } catch (error) {
          console.error("Error processing WebSocket data:", error)
        }
      }

      this.ws.onerror = (error) => {
        console.error("🔌 WebSocket error:", error)
      }

      this.ws.onclose = () => {
        console.log("🔌 WebSocket disconnected")
        this.isConnected = false
        this.reconnectAttempts++

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(`🔄 Reconnecting WebSocket... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
          setTimeout(() => this.connect(), 5000 * this.reconnectAttempts)
        } else {
          console.log("⚠️ WebSocket max reconnection attempts reached, using mock updates")
          this.startMockUpdates()
        }
      }
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error)
      this.startMockUpdates()
    }
  }

  private startMockUpdates() {
    // Simulate price updates when WebSocket fails
    setInterval(() => {
      this.callbacks.forEach((callback, symbol) => {
        // Generate realistic price movements
        const basePrice = this.getBasePriceForSymbol(symbol)
        const volatility = 0.01 // 1% volatility
        const change = (Math.random() - 0.5) * volatility
        const newPrice = basePrice * (1 + change)
        callback(newPrice)
      })
    }, 5000)
  }

  private getBasePriceForSymbol(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      btc: 43250,
      eth: 2650,
      ada: 0.45,
      sol: 95,
      link: 14.5,
      dot: 6.8,
      avax: 35,
      matic: 0.85,
      bnb: 310,
      atom: 9.2,
    }
    return basePrices[symbol] || 100
  }

  subscribe(symbol: string, callback: (price: number) => void) {
    this.callbacks.set(symbol, callback)
  }

  unsubscribe(symbol: string) {
    this.callbacks.delete(symbol)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }
}

// Utility functions
export function isApiHealthy(): boolean {
  return !isUsingMockData && apiFailureCount < maxApiFailures
}

export function getApiStatus(): { healthy: boolean; failureCount: number; usingMockData: boolean } {
  return {
    healthy: isApiHealthy(),
    failureCount: apiFailureCount,
    usingMockData: isUsingMockData,
  }
}

export function resetApiStatus() {
  apiFailureCount = 0
  isUsingMockData = false
  console.log("🔄 API status reset, will attempt real API calls")
}
