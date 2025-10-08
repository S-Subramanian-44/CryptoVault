"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react"

type NewsItem = {
  title: string
  description: string
  link: string
  pubDate: string
  source: string
  sentiment: "positive" | "negative" | "neutral"
  coins?: string[]
}

type SentimentFilter = "all" | "positive" | "neutral" | "negative"

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all")

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/news", { cache: "no-store" })
      const data = await res.json()
      setNews(data.data || [])
    } catch (e) {
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const sources = useMemo(() => {
    const s = new Set<string>()
    news.forEach((n) => n.source && s.add(n.source))
    return ["all", ...Array.from(s).sort()]
  }, [news])

  const filteredNews = useMemo(() => {
    let items = news
    if (sentimentFilter !== "all") items = items.filter((n) => n.sentiment === sentimentFilter)
    if (sourceFilter !== "all") items = items.filter((n) => n.source === sourceFilter)
    return items
  }, [news, sentimentFilter, sourceFilter])

  const categorizedNews = useMemo(() => {
    return {
      positive: news.filter((n) => n.sentiment === "positive"),
      neutral: news.filter((n) => n.sentiment === "neutral"),
      negative: news.filter((n) => n.sentiment === "negative"),
    }
  }, [news])

  const recoveryHint = (s: NewsItem["sentiment"]) => {
    if (s === "positive") return "Consider DCA or adding to strength if fundamentals align."
    if (s === "negative") return "Tighten stops, reduce exposure, or DCA only at strong supports."
    return "Maintain plan; wait for stronger signals before acting."
  }

  const getSentimentIcon = (sentiment: NewsItem["sentiment"]) => {
    if (sentiment === "positive") return <TrendingUp className="h-4 w-4" />
    if (sentiment === "negative") return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getSentimentColor = (sentiment: NewsItem["sentiment"]) => {
    if (sentiment === "positive") return "text-green-500 border-green-500"
    if (sentiment === "negative") return "text-red-500 border-red-500"
    return "text-gray-400 border-gray-400"
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Crypto News & Sentiment
          </h1>
          <p className="text-gray-400">Live crypto headlines categorized by market sentiment</p>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="py-6 space-y-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant={sentimentFilter === "all" ? "default" : "outline"}
                onClick={() => setSentimentFilter("all")}
                className={
                  sentimentFilter === "all"
                    ? "crypto-button"
                    : "bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                }
              >
                All News
                <Badge variant="secondary" className="ml-2">
                  {news.length}
                </Badge>
              </Button>

              <Button
                variant={sentimentFilter === "positive" ? "default" : "outline"}
                onClick={() => setSentimentFilter("positive")}
                className={
                  sentimentFilter === "positive"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-700 border-green-600 hover:bg-gray-600 text-green-400"
                }
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Positive
                <Badge variant="secondary" className="ml-2 bg-green-900 text-green-100">
                  {categorizedNews.positive.length}
                </Badge>
              </Button>

              <Button
                variant={sentimentFilter === "neutral" ? "default" : "outline"}
                onClick={() => setSentimentFilter("neutral")}
                className={
                  sentimentFilter === "neutral"
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-gray-700 border-gray-500 hover:bg-gray-600 text-gray-300"
                }
              >
                <Minus className="h-4 w-4 mr-2" />
                Neutral
                <Badge variant="secondary" className="ml-2 bg-gray-700 text-gray-200">
                  {categorizedNews.neutral.length}
                </Badge>
              </Button>

              <Button
                variant={sentimentFilter === "negative" ? "default" : "outline"}
                onClick={() => setSentimentFilter("negative")}
                className={
                  sentimentFilter === "negative"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-700 border-red-600 hover:bg-gray-600 text-red-400"
                }
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Negative
                <Badge variant="secondary" className="ml-2 bg-red-900 text-red-100">
                  {categorizedNews.negative.length}
                </Badge>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Source:</span>
                <select
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded px-2 py-1"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  {sources.map((s) => (
                    <option key={s} value={s}>
                      {s === "all" ? "All sources" : s}
                    </option>
                  ))}
                </select>
              </div>
              <Button variant="outline" className="bg-gray-700 border-gray-600 text-white" onClick={load}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading latest crypto news...</div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No {sentimentFilter !== "all" ? sentimentFilter + " " : ""}
            {sourceFilter !== "all" ? `${sourceFilter} ` : ""}
            news found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((n, i) => (
              <Card key={i} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-white text-pretty text-sm leading-snug flex-1">{n.title}</CardTitle>
                    <div className={`${getSentimentColor(n.sentiment)}`}>{getSentimentIcon(n.sentiment)}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-300 text-xs leading-relaxed">{n.description}</p>
                  {n.coins && n.coins.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {n.coins.map((c) => (
                        <Badge key={c} variant="outline" className="bg-gray-700 border-gray-600 text-xs">
                          {c.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="p-2 rounded-lg bg-gray-700/60 border border-gray-600">
                    <p className="text-gray-200 text-xs">💡 {recoveryHint(n.sentiment)}</p>
                  </div>
                  <a
                    href={n.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-green-400 hover:text-green-300 text-xs"
                  >
                    Read source <ArrowRight className="h-3 w-3 ml-1" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
