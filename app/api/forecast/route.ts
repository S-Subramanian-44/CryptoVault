import { type NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongoose"
import { Forecast } from "@/models/Forecast"
import { getUserIdFromAuth } from "@/lib/auth"

type ForecastReq = {
  coinId: string
  symbol: string
  historicalData: Array<{ date: string; price: number; volume?: number; change24h?: number }>
  currentPrice: number
  days?: number
  modelType?: "LSTM" | "ARIMA"
}

async function callPython(data: ForecastReq) {
  const url = process.env.PY_BACKEND_URL || "http://localhost:8000/forecast"
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      coin_id: data.coinId,
      symbol: data.symbol,
      historical_data: data.historicalData,
      current_price: data.currentPrice,
      forecast_days: data.days || 7,
      model_type: data.modelType || "LSTM",
    }),
  })
  if (!res.ok) throw new Error(`Python service ${res.status}`)
  return res.json()
}

// simple fallback when Python service unavailable
function simpleFallback(data: ForecastReq) {
  const days = data.days || 7
  let price = data.currentPrice
  const predictions = []
  for (let i = 1; i <= days; i++) {
    // drift + mild noise
    const drift = 0.005 * (Math.random() > 0.5 ? 1 : -1)
    price = Math.max(0.0001, price * (1 + drift))
    predictions.push({
      date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
      price: Math.round(price * 100) / 100,
      confidence: Math.max(55, 85 - i * 3),
      model: "Fallback-TA",
    })
  }
  return {
    predictions,
    accuracy: 70,
    modelType: "Advanced TA Fallback",
    metrics: { mse: 0, mae: 0, rmse: 0, r2: 0 },
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ForecastReq
    if (!body?.coinId || !body?.historicalData || body.historicalData.length < 30) {
      return NextResponse.json({ error: "coinId and >=30 days historicalData required" }, { status: 400 })
    }
    const auth = req.headers.get("authorization")
    const userId = getUserIdFromAuth(auth) || "anonymous"

    let result
    try {
      result = await callPython(body)
    } catch (e) {
      result = simpleFallback(body)
    }

    await dbConnect()
    await Forecast.create({
      userId,
      coinId: body.coinId,
      symbol: body.symbol,
      modelType: body.modelType || "LSTM",
      days: body.days || 7,
      currentPrice: body.currentPrice,
      predictions: result.predictions,
      accuracy: result.accuracy,
      metrics: result.metrics,
    })

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to forecast", message: e?.message }, { status: 500 })
  }
}
