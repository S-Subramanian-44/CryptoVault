import { type NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.CG_API_KEY ?? "CG-ThfFzJogGF5EYmke1ALvPg8v"
const BASE_URL = "https://api.coingecko.com/api/v3"

/**
 * GET /api/simple-price?ids=bitcoin,ethereum
 *
 * This proxies the CoinGecko “simple/price” endpoint so the browser
 * never talks to CoinGecko directly (avoids CORS).
 */
export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids") ?? ""
  if (!ids) {
    return NextResponse.json({ error: "`ids` query param is required" }, { status: 400 })
  }

  try {
    const url = `${BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&x_cg_demo_api_key=${API_KEY}`
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) throw new Error(`CoinGecko responded ${res.status}`)

    const data = await res.json()
    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
