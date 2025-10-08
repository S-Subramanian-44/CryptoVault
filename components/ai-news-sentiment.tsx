"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Newspaper,
  Brain,
  RefreshCw,
  ExternalLink,
  Calendar,
  BarChart3,
  AlertCircle,
} from "lucide-react"

interface NewsItem {
  title: string
  description: string
  link: string
  pubDate: string
  source: string
  sentiment?: "positive" | "negative" | "neutral"
}

interface SentimentAnalysis {
  overall: "bullish" | "bearish" | "neutral"
  confidence: number
  positiveCount: number
  negativeCount: number
  neutralCount: number
  keyTopics: string[]
  marketImpact: "high" | "medium" | "low"
}

export function AINewsSentiment() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchRealCryptoNews = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/crypto-news")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.data) {
        setNews(data.data)
        setLastUpdated(new Date())

        // Analyze sentiment
        const analysis = analyzeSentiment(data.data)
        setSentiment(analysis)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Error fetching news:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch news")

      // Use fallback data
      const fallbackNews = generateFallbackNews()
      setNews(fallbackNews)
      setSentiment(analyzeSentiment(fallbackNews))
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  const generateFallbackNews = (): NewsItem[] => {
    return [
      {
        title: "Bitcoin Maintains Strong Support Above $40,000",
        description:
          "Technical analysis suggests Bitcoin is consolidating above key support levels, with institutional interest remaining strong.",
        link: "#",
        pubDate: new Date().toISOString(),
        source: "Market Analysis",
        sentiment: "positive",
      },
      {
        title: "Ethereum Layer 2 Solutions See Increased Adoption",
        description:
          "Scaling solutions continue to gain traction as developers seek lower transaction costs and faster processing times.",
        link: "#",
        pubDate: new Date(Date.now() - 3600000).toISOString(),
        source: "DeFi Report",
        sentiment: "positive",
      },
      {
        title: "Regulatory Developments Create Market Uncertainty",
        description: "Recent regulatory announcements have created mixed reactions in the cryptocurrency market.",
        link: "#",
        pubDate: new Date(Date.now() - 7200000).toISOString(),
        source: "Regulatory News",
        sentiment: "neutral",
      },
      {
        title: "Altcoin Season Shows Signs of Momentum",
        description: "Alternative cryptocurrencies are showing increased trading volume and price appreciation.",
        link: "#",
        pubDate: new Date(Date.now() - 10800000).toISOString(),
        source: "Altcoin Analysis",
        sentiment: "positive",
      },
    ]
  }

  const analyzeSentiment = (newsItems: NewsItem[]): SentimentAnalysis => {
    const positiveCount = newsItems.filter((item) => item.sentiment === "positive").length
    const negativeCount = newsItems.filter((item) => item.sentiment === "negative").length
    const neutralCount = newsItems.filter((item) => item.sentiment === "neutral").length

    const total = newsItems.length
    const positiveRatio = positiveCount / total
    const negativeRatio = negativeCount / total

    let overall: "bullish" | "bearish" | "neutral"
    let confidence: number

    if (positiveRatio > 0.6) {
      overall = "bullish"
      confidence = Math.min(95, positiveRatio * 100 + 20)
    } else if (negativeRatio > 0.6) {
      overall = "bearish"
      confidence = Math.min(95, negativeRatio * 100 + 20)
    } else {
      overall = "neutral"
      confidence = 60 + Math.abs(positiveRatio - negativeRatio) * 40
    }

    // Extract key topics
    const keyTopics = extractKeyTopics(newsItems)

    // Determine market impact
    const marketImpact =
      positiveRatio > 0.7 || negativeRatio > 0.7
        ? "high"
        : positiveRatio > 0.5 || negativeRatio > 0.5
          ? "medium"
          : "low"

    return {
      overall,
      confidence: Math.round(confidence),
      positiveCount,
      negativeCount,
      neutralCount,
      keyTopics,
      marketImpact,
    }
  }

  const extractKeyTopics = (newsItems: NewsItem[]): string[] => {
    const topics = new Set<string>()

    newsItems.forEach((item) => {
      const text = (item.title + " " + item.description).toLowerCase()

      if (text.includes("bitcoin") || text.includes("btc")) topics.add("Bitcoin")
      if (text.includes("ethereum") || text.includes("eth")) topics.add("Ethereum")
      if (text.includes("defi")) topics.add("DeFi")
      if (text.includes("nft")) topics.add("NFTs")
      if (text.includes("regulation") || text.includes("regulatory")) topics.add("Regulation")
      if (text.includes("institutional")) topics.add("Institutional")
      if (text.includes("adoption")) topics.add("Adoption")
      if (text.includes("trading") || text.includes("volume")) topics.add("Trading")
    })

    return Array.from(topics).slice(0, 5)
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
      case "bullish":
        return "text-green-400"
      case "negative":
      case "bearish":
        return "text-red-400"
      default:
        return "text-yellow-400"
    }
  }

  const getSentimentBadgeColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
      case "bullish":
        return "bg-green-900 text-green-300 border-green-700"
      case "negative":
      case "bearish":
        return "bg-red-900 text-red-300 border-red-700"
      default:
        return "bg-yellow-900 text-yellow-300 border-yellow-700"
    }
  }

  useEffect(() => {
    fetchRealCryptoNews()

    // Set up auto-refresh every 10 minutes
    const interval = setInterval(fetchRealCryptoNews, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI News Sentiment Analysis
              </CardTitle>
              <CardDescription className="text-gray-400">
                Real-time cryptocurrency news analysis with AI-powered sentiment detection
              </CardDescription>
            </div>
            <Button
              onClick={fetchRealCryptoNews}
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-gray-600 hover:border-gray-500 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </CardHeader>
      </Card>

      {error && (
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error} - Using fallback data</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sentiment Overview */}
      {sentiment && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Market Sentiment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  <span className={getSentimentColor(sentiment.overall)}>{sentiment.overall.toUpperCase()}</span>
                </div>
                <p className="text-gray-400 text-sm">Overall Sentiment</p>
                <div className="mt-2">
                  <Progress value={sentiment.confidence} className="h-2" />
                  <p className="text-xs text-gray-400 mt-1">{sentiment.confidence}% confidence</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Positive</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-medium">{sentiment.positiveCount}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Negative</span>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-400" />
                    <span className="text-red-400 font-medium">{sentiment.negativeCount}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Neutral</span>
                  <span className="text-yellow-400 font-medium">{sentiment.neutralCount}</span>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3">Key Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {sentiment.keyTopics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-gray-600">
                      {topic}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      sentiment.marketImpact === "high"
                        ? "border-red-600 text-red-400"
                        : sentiment.marketImpact === "medium"
                          ? "border-yellow-600 text-yellow-400"
                          : "border-green-600 text-green-400"
                    }`}
                  >
                    {sentiment.marketImpact.toUpperCase()} IMPACT
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* News Articles */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Latest Crypto News
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading latest news...</p>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-700">
                <TabsTrigger value="all">All News</TabsTrigger>
                <TabsTrigger value="positive">Positive</TabsTrigger>
                <TabsTrigger value="negative">Negative</TabsTrigger>
                <TabsTrigger value="neutral">Neutral</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  {news.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getSentimentBadgeColor(item.sentiment || "neutral")}`}
                            >
                              {item.sentiment?.toUpperCase() || "NEUTRAL"}
                            </Badge>
                            <span className="text-xs text-gray-400">{item.source}</span>
                            <span className="text-xs text-gray-400">{new Date(item.pubDate).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-white font-medium mb-2 leading-tight">{item.title}</h3>
                          <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                        </div>
                        {item.link !== "#" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="flex-shrink-0 text-gray-400 hover:text-white"
                          >
                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="positive" className="mt-6">
                <div className="space-y-4">
                  {news
                    .filter((item) => item.sentiment === "positive")
                    .map((item, index) => (
                      <div key={index} className="p-4 bg-green-900/20 rounded-lg border border-green-700">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="h-4 w-4 text-green-400" />
                              <span className="text-xs text-gray-400">{item.source}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(item.pubDate).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="text-white font-medium mb-2 leading-tight">{item.title}</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                          </div>
                          {item.link !== "#" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="flex-shrink-0 text-gray-400 hover:text-white"
                            >
                              <a href={item.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="negative" className="mt-6">
                <div className="space-y-4">
                  {news
                    .filter((item) => item.sentiment === "negative")
                    .map((item, index) => (
                      <div key={index} className="p-4 bg-red-900/20 rounded-lg border border-red-700">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingDown className="h-4 w-4 text-red-400" />
                              <span className="text-xs text-gray-400">{item.source}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(item.pubDate).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="text-white font-medium mb-2 leading-tight">{item.title}</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                          </div>
                          {item.link !== "#" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="flex-shrink-0 text-gray-400 hover:text-white"
                            >
                              <a href={item.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="neutral" className="mt-6">
                <div className="space-y-4">
                  {news
                    .filter((item) => item.sentiment === "neutral")
                    .map((item, index) => (
                      <div key={index} className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-700">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-gray-400">{item.source}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(item.pubDate).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="text-white font-medium mb-2 leading-tight">{item.title}</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                          </div>
                          {item.link !== "#" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="flex-shrink-0 text-gray-400 hover:text-white"
                            >
                              <a href={item.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
