import { type NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongoose"
import { Strategy } from "@/models/Strategy"
import { getUserIdFromAuth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    const auth = req.headers.get("authorization")
    const userId = getUserIdFromAuth(auth) || "anonymous"
    const { searchParams } = new URL(req.url)
    const coinId = searchParams.get("coinId") || undefined

    const query: any = { userId }
    if (coinId) query.coinId = coinId

    const data = await Strategy.find(query).sort({ createdAt: -1 }).lean()
    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const auth = req.headers.get("authorization")
    const userId = getUserIdFromAuth(auth) || "anonymous"
    const body = await req.json()

    const created = await Strategy.create({ ...body, userId })
    return NextResponse.json({ success: true, data: created })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Error" }, { status: 500 })
  }
}
