import { type NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongoose"
import { NewsSentiment } from "@/models/NewsSentiment"
import { GET as cryptoNewsGET } from "../crypto-news/route"

// naive coin extractor (symbol/name mentions)
function inferCoinsFromText(text: string): string[] {
  const mentions: string[] = []
  const lower = text.toLowerCase()
  const common = [
    "bitcoin",
    "btc",
    "ethereum",
    "eth",
    "solana",
    "sol",
    "cardano",
    "ada",
    "polkadot",
    "dot",
    "xrp",
    "ripple",
    "litecoin",
    "ltc",
    "dogecoin",
    "doge",
    "chainlink",
    "link",
  ]
  for (const c of common) if (lower.includes(c)) mentions.push(c)
  return Array.from(new Set(mentions))
}

export async function GET(req: NextRequest) {
  // reuse existing route to aggregate feeds
  const res = await cryptoNewsGET(req)
  const payload = await res.json()

  try {
    await dbConnect()
    const items = (payload?.data || []).map((n: any) => ({
      title: n.title,
      description: n.description,
      link: n.link,
      pubDate: n.pubDate,
      source: n.source,
      sentiment: n.sentiment,
      coins: inferCoinsFromText(`${n.title} ${n.description}`),
    }))

    // upsert by link
    const ops = items.map(
      (doc: any) =>
        ({
          updateOne: {
            filter: { link: doc.link },
            update: { $set: doc },
            upsert: true,
          },
        }) as const,
    )
    if (ops.length) await NewsSentiment.bulkWrite(ops, { ordered: false })

    // optional coin filter: /api/news?coin=btc
    const { searchParams } = new URL(req.url)
    const coin = searchParams.get("coin")?.toLowerCase()
    const filtered = coin ? items.filter((i: any) => i.coins.includes(coin)) : items

    return NextResponse.json({ success: true, data: filtered, count: filtered.length })
  } catch (e) {
    // on DB error, still return news
    return NextResponse.json({ success: true, data: payload?.data || [], source: "no-db" })
  }
}
