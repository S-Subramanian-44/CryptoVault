import { type NextRequest, NextResponse } from "next/server"

const BASE_URL = "https://api.coingecko.com/api/v3"
const API_KEY = "CG-ThfFzJogGF5EYmke1ALvPg8v"
const PY_BACKEND_URL = process.env.PY_BACKEND_URL

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const vs_currency = searchParams.get("vs_currency") || "usd"

  if (!id || !from || !to) {
    return NextResponse.json({ error: "Missing required parameters: id, from, to" }, { status: 400 })
  }

  if (PY_BACKEND_URL) {
    try {
      const fromNum = Number.parseInt(from, 10)
      const toNum = Number.parseInt(to, 10)
      const days = Math.max(1, Math.ceil((toNum - fromNum) / (60 * 60 * 24))) // seconds → days

      const pyUrl = `${PY_BACKEND_URL.replace(/\/$/, "")}/historical?coin_id=${encodeURIComponent(id)}&days=${days}`
      const pyRes = await fetch(pyUrl, { headers: { Accept: "application/json" } })
      if (!pyRes.ok) throw new Error(`Python /historical error: ${pyRes.status}`)
      const pyData = await pyRes.json()

      if (pyData?.success && Array.isArray(pyData.data)) {
        // Map Python output [{date, price, volume, change24h}] to CoinGecko-like arrays
        const prices: [number, number][] = []
        const total_volumes: [number, number][] = []
        const market_caps: [number, number][] = []

        for (const row of pyData.data) {
          const tsMs = new Date(row.date).getTime() // date is YYYY-MM-DD
          const price = Number(row.price) || 0
          const volume = Number(row.volume) || Math.max(1e6, price * 1e6 * Math.random())

          prices.push([tsMs, price])
          total_volumes.push([tsMs, volume])
          // We don't have market cap here; synthesize a stable proxy
          market_caps.push([tsMs, price * (1e9 + Math.random() * 5e8)])
        }

        return NextResponse.json({ prices, market_caps, total_volumes, source: "python" })
      }
    } catch (err) {
      console.error("[historical-data] Python backend failed, falling back:", err)
      // fall through to CoinGecko path below
    }
  }

  try {
    // Fetch historical data from CoinGecko API
    const response = await fetch(
      `${BASE_URL}/coins/${id}/market_chart/range?vs_currency=${vs_currency}&from=${from}&to=${to}&x_cg_demo_api_key=${API_KEY}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      },
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    // Return the data in the expected format
    return NextResponse.json({
      prices: data.prices || [],
      market_caps: data.market_caps || [],
      total_volumes: data.total_volumes || [],
    })
  } catch (error) {
    console.error("Error fetching historical data:", error)

    // Return fallback data if API fails
    const fallbackData = generateFallbackHistoricalData(id, from, to)

    return NextResponse.json({
      prices: fallbackData.prices,
      market_caps: fallbackData.market_caps,
      total_volumes: fallbackData.total_volumes,
      fallback: true,
    })
  }
}

function generateFallbackHistoricalData(coinId: string, fromTimestamp: string, toTimestamp: string) {
  const from = Number.parseInt(fromTimestamp) * 1000
  const to = Number.parseInt(toTimestamp) * 1000
  const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24))

  // Base prices for different cryptocurrencies
  const basePrices: { [key: string]: number } = {
    bitcoin: 45000,
    ethereum: 3000,
    cardano: 0.5,
    solana: 100,
    polygon: 0.8,
    chainlink: 15,
    polkadot: 7,
    "avalanche-2": 35,
    binancecoin: 300,
    cosmos: 10,
  }

  const basePrice = basePrices[coinId] || 100
  const prices = []
  const market_caps = []
  const total_volumes = []

  let currentPrice = basePrice
  const volatility = getVolatilityForCoin(coinId)

  for (let i = 0; i <= days; i++) {
    const timestamp = from + i * 24 * 60 * 60 * 1000

    // Generate realistic price movement
    const trendFactor = Math.sin(i / 30) * 0.02 // Monthly trend cycle
    const randomFactor = (Math.random() - 0.5) * volatility
    const marketFactor = Math.sin(i / 7) * 0.01 // Weekly market cycle

    const priceChange = trendFactor + randomFactor + marketFactor
    currentPrice *= 1 + priceChange

    // Ensure price doesn't go negative
    currentPrice = Math.max(0.001, currentPrice)

    prices.push([timestamp, currentPrice])
    market_caps.push([timestamp, currentPrice * Math.random() * 1000000000])
    total_volumes.push([timestamp, Math.random() * 1000000000 + 100000000])
  }

  return { prices, market_caps, total_volumes }
}

function getVolatilityForCoin(coinId: string): number {
  const volatilities: { [key: string]: number } = {
    bitcoin: 0.04,
    ethereum: 0.05,
    cardano: 0.08,
    solana: 0.12,
    polygon: 0.1,
    chainlink: 0.09,
    polkadot: 0.08,
    "avalanche-2": 0.11,
    binancecoin: 0.06,
    cosmos: 0.09,
  }

  return volatilities[coinId] || 0.08
}
