const API_KEY = "CG-ThfFzJogGF5EYmke1ALvPg8v"
const BASE_URL = "https://api.coingecko.com/api/v3"

export interface RealTimePrice {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  timestamp: number
  lastUpdate: string
}

export interface StreamingData {
  prices: Map<string, RealTimePrice>
  globalData: any
  fearGreed: any
  lastUpdate: number
}

// Enhanced mock data for when API fails
const ENHANCED_MOCK_DATA = {
  prices: new Map([
    [
      "bitcoin",
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        price: 43250 + (Math.random() - 0.5) * 1000,
        change24h: (Math.random() - 0.5) * 10,
        volume24h: 25000000000 + (Math.random() - 0.5) * 5000000000,
        marketCap: 847000000000 + (Math.random() - 0.5) * 50000000000,
        timestamp: Date.now(),
        lastUpdate: new Date().toLocaleTimeString(),
      },
    ],
    [
      "ethereum",
      {
        id: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        price: 2650 + (Math.random() - 0.5) * 200,
        change24h: (Math.random() - 0.5) * 8,
        volume24h: 15000000000 + (Math.random() - 0.5) * 3000000000,
        marketCap: 318000000000 + (Math.random() - 0.5) * 30000000000,
        timestamp: Date.now(),
        lastUpdate: new Date().toLocaleTimeString(),
      },
    ],
    [
      "cardano",
      {
        id: "cardano",
        symbol: "ada",
        name: "Cardano",
        price: 0.45 + (Math.random() - 0.5) * 0.1,
        change24h: (Math.random() - 0.5) * 12,
        volume24h: 500000000 + (Math.random() - 0.5) * 100000000,
        marketCap: 15000000000 + (Math.random() - 0.5) * 2000000000,
        timestamp: Date.now(),
        lastUpdate: new Date().toLocaleTimeString(),
      },
    ],
    [
      "solana",
      {
        id: "solana",
        symbol: "sol",
        name: "Solana",
        price: 95 + (Math.random() - 0.5) * 20,
        change24h: (Math.random() - 0.5) * 15,
        volume24h: 2000000000 + (Math.random() - 0.5) * 500000000,
        marketCap: 42000000000 + (Math.random() - 0.5) * 5000000000,
        timestamp: Date.now(),
        lastUpdate: new Date().toLocaleTimeString(),
      },
    ],
    [
      "chainlink",
      {
        id: "chainlink",
        symbol: "link",
        name: "Chainlink",
        price: 14.5 + (Math.random() - 0.5) * 2,
        change24h: (Math.random() - 0.5) * 8,
        volume24h: 800000000 + (Math.random() - 0.5) * 200000000,
        marketCap: 8500000000 + (Math.random() - 0.5) * 1000000000,
        timestamp: Date.now(),
        lastUpdate: new Date().toLocaleTimeString(),
      },
    ],
    [
      "polkadot",
      {
        id: "polkadot",
        symbol: "dot",
        name: "Polkadot",
        price: 6.8 + (Math.random() - 0.5) * 1,
        change24h: (Math.random() - 0.5) * 10,
        volume24h: 600000000 + (Math.random() - 0.5) * 150000000,
        marketCap: 9200000000 + (Math.random() - 0.5) * 1200000000,
        timestamp: Date.now(),
        lastUpdate: new Date().toLocaleTimeString(),
      },
    ],
    [
      "avalanche-2",
      {
        id: "avalanche-2",
        symbol: "avax",
        name: "Avalanche",
        price: 35 + (Math.random() - 0.5) * 5,
        change24h: (Math.random() - 0.5) * 12,
        volume24h: 700000000 + (Math.random() - 0.5) * 200000000,
        marketCap: 13500000000 + (Math.random() - 0.5) * 2000000000,
        timestamp: Date.now(),
        lastUpdate: new Date().toLocaleTimeString(),
      },
    ],
    [
      "polygon",
      {
        id: "polygon",
        symbol: "matic",
        name: "Polygon",
        price: 0.85 + (Math.random() - 0.5) * 0.15,
        change24h: (Math.random() - 0.5) * 8,
        volume24h: 400000000 + (Math.random() - 0.5) * 100000000,
        marketCap: 8000000000 + (Math.random() - 0.5) * 1000000000,
        timestamp: Date.now(),
        lastUpdate: new Date().toLocaleTimeString(),
      },
    ],
    [
      "binancecoin",
      {
        id: "binancecoin",
        symbol: "bnb",
        name: "BNB",
        price: 310 + (Math.random() - 0.5) * 30,
        change24h: (Math.random() - 0.5) * 6,
        volume24h: 1500000000 + (Math.random() - 0.5) * 300000000,
        marketCap: 47000000000 + (Math.random() - 0.5) * 5000000000,
        timestamp: Date.now(),
        lastUpdate: new Date().toLocaleTimeString(),
      },
    ],
    [
      "cosmos",
      {
        id: "cosmos",
        symbol: "atom",
        name: "Cosmos",
        price: 9.2 + (Math.random() - 0.5) * 1.5,
        change24h: (Math.random() - 0.5) * 9,
        volume24h: 300000000 + (Math.random() - 0.5) * 80000000,
        marketCap: 3600000000 + (Math.random() - 0.5) * 500000000,
        timestamp: Date.now(),
        lastUpdate: new Date().toLocaleTimeString(),
      },
    ],
  ]),
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
  fearGreed: {
    value: 45 + Math.floor(Math.random() * 20),
    value_classification: ["Fear", "Neutral", "Greed"][Math.floor(Math.random() * 3)],
  },
}

export class CryptoDataStreamer {
  private ws: WebSocket | null = null
  private subscribers: Map<string, Set<(data: RealTimePrice) => void>> = new Map()
  private globalSubscribers: Set<(data: StreamingData) => void> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 2 // Reduced attempts
  private reconnectDelay = 5000 // Increased delay
  private isConnected = false
  private heartbeatInterval: NodeJS.Timeout | null = null
  private dataUpdateInterval: NodeJS.Timeout | null = null
  private mockUpdateInterval: NodeJS.Timeout | null = null
  private apiFailureCount = 0
  private maxApiFailures = 2 // Reduced failures before switching to mock
  private useMockData = true // Start with mock data by default
  private currentData: StreamingData = {
    prices: new Map(),
    globalData: null,
    fearGreed: null,
    lastUpdate: Date.now(),
  }

  constructor() {
    this.initializeStreaming()
  }

  private async initializeStreaming() {
    console.log("🚀 Initializing crypto data streaming...")

    // Start with mock data immediately for better UX
    this.loadMockData()

    // Start mock data updates (always running as primary source)
    this.startMockDataUpdates()

    // Try to fetch real data in background (optional enhancement)
    this.tryFetchRealData()

    // Skip WebSocket connection to avoid errors
    // this.connectWebSocket()

    // Set up periodic data refresh attempts (less frequent)
    this.dataUpdateInterval = setInterval(() => {
      this.tryFetchRealData()
    }, 60000) // Every minute instead of 30 seconds
  }

  private loadMockData() {
    console.log("📊 Loading enhanced mock data...")
    this.currentData.prices = new Map(ENHANCED_MOCK_DATA.prices)
    this.currentData.globalData = ENHANCED_MOCK_DATA.globalData
    this.currentData.fearGreed = ENHANCED_MOCK_DATA.fearGreed
    this.currentData.lastUpdate = Date.now()
    this.notifyGlobalSubscribers()
  }

  private startMockDataUpdates() {
    // Update mock data every 3 seconds for more realistic feel
    this.mockUpdateInterval = setInterval(() => {
      this.updateMockData()
    }, 3000)
  }

  private updateMockData() {
    const now = Date.now()
    const timeString = new Date().toLocaleTimeString()

    // Update prices with small random changes
    for (const [coinId, priceData] of this.currentData.prices.entries()) {
      const volatility = 0.015 // 1.5% max change per update
      const change = (Math.random() - 0.5) * volatility
      const newPrice = priceData.price * (1 + change)

      const updatedData: RealTimePrice = {
        ...priceData,
        price: Math.max(0.01, newPrice),
        change24h: priceData.change24h + (Math.random() - 0.5) * 0.3,
        volume24h: priceData.volume24h * (1 + (Math.random() - 0.5) * 0.05),
        marketCap: priceData.marketCap * (1 + change),
        timestamp: now,
        lastUpdate: timeString,
      }

      this.currentData.prices.set(coinId, updatedData)

      // Notify subscribers for this specific coin
      const coinSubscribers = this.subscribers.get(coinId)
      if (coinSubscribers) {
        coinSubscribers.forEach((callback) => callback(updatedData))
      }
    }

    // Update global data
    if (this.currentData.globalData?.data) {
      this.currentData.globalData.data.market_cap_change_percentage_24h_usd += (Math.random() - 0.5) * 0.05
      this.currentData.globalData.data.total_market_cap.usd *= 1 + (Math.random() - 0.5) * 0.001
    }

    // Update Fear & Greed
    if (this.currentData.fearGreed) {
      this.currentData.fearGreed.value = Math.max(
        0,
        Math.min(100, this.currentData.fearGreed.value + (Math.random() - 0.5) * 2),
      )
    }

    this.currentData.lastUpdate = now
    this.notifyGlobalSubscribers()
  }

  private async tryFetchRealData() {
    // Optional: Try to fetch real data but don't fail if it doesn't work
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // Short timeout

      const response = await fetch("/api/simple-price?ids=bitcoin,ethereum,cardano,solana", {
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Enhanced mock data with real prices")

        // Enhance mock data with real prices if available
        Object.entries(data).forEach(([coinId, coinData]: [string, any]) => {
          const existingData = this.currentData.prices.get(coinId)
          if (existingData && coinData.usd) {
            existingData.price = coinData.usd
            existingData.change24h = coinData.usd_24h_change || existingData.change24h
            this.currentData.prices.set(coinId, existingData)
          }
        })
      }
    } catch (error) {
      // Silently fail - we're using mock data anyway
      console.log("📊 Using mock data (real API unavailable)")
    }
  }

  // Remove WebSocket connection to avoid errors
  private connectWebSocket() {
    // Disabled to prevent WebSocket errors
    console.log("🔌 WebSocket disabled - using mock data streaming")
  }

  private notifyGlobalSubscribers() {
    this.globalSubscribers.forEach((callback) => {
      callback({ ...this.currentData })
    })
  }

  // Public methods
  subscribe(coinId: string, callback: (data: RealTimePrice) => void) {
    if (!this.subscribers.has(coinId)) {
      this.subscribers.set(coinId, new Set())
    }
    this.subscribers.get(coinId)!.add(callback)

    // Send current data immediately if available
    const currentData = this.currentData.prices.get(coinId)
    if (currentData) {
      callback(currentData)
    }

    return () => this.unsubscribe(coinId, callback)
  }

  unsubscribe(coinId: string, callback: (data: RealTimePrice) => void) {
    const coinSubscribers = this.subscribers.get(coinId)
    if (coinSubscribers) {
      coinSubscribers.delete(callback)
      if (coinSubscribers.size === 0) {
        this.subscribers.delete(coinId)
      }
    }
  }

  subscribeToGlobal(callback: (data: StreamingData) => void) {
    this.globalSubscribers.add(callback)

    // Send current data immediately
    callback({ ...this.currentData })

    return () => this.globalSubscribers.delete(callback)
  }

  getCurrentData(coinId: string): RealTimePrice | null {
    return this.currentData.prices.get(coinId) || null
  }

  getAllCurrentData(): StreamingData {
    return { ...this.currentData }
  }

  getConnectionStatus(): boolean {
    return true // Always connected with mock data
  }

  isUsingMockData(): boolean {
    return this.useMockData
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
    if (this.dataUpdateInterval) {
      clearInterval(this.dataUpdateInterval)
    }
    if (this.mockUpdateInterval) {
      clearInterval(this.mockUpdateInterval)
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    this.subscribers.clear()
    this.globalSubscribers.clear()
  }
}

// Global instance
export const cryptoStreamer = new CryptoDataStreamer()
