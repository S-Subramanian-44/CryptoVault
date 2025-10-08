"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User, Send, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Brain, Target, BarChart3 } from "lucide-react"
import { useChatHistory } from "@/lib/use-chat-history"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  analysis?: {
    sentiment: "bullish" | "bearish" | "neutral"
    confidence: number
    recommendations: string[]
  }
}

interface AIChatAssistantProps {
  coinData?: any
  portfolioData?: any
}

export function AIChatAssistant({ coinData, portfolioData }: AIChatAssistantProps) {
  const { messages, setMessages, appendMessage, clearHistory } = useChatHistory()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const quickPrompts = [
    { text: "Analyze Bitcoin's current trend", icon: TrendingUp, category: "analysis" },
    { text: "What are today's top gainers?", icon: Target, category: "market" },
    { text: "Show me market risks right now", icon: AlertTriangle, category: "risk" },
    { text: "Best trading opportunities today", icon: Lightbulb, category: "strategy" },
    { text: "Explain current DeFi trends", icon: Sparkles, category: "education" },
    { text: "Market sentiment analysis", icon: BarChart3, category: "sentiment" },
  ]

  useEffect(() => {
    setMounted(true)
    if (!messages || messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Good day. I am your AI crypto analyst powered by GitHub Models and live CoinGecko data. How may I assist you today?",
        },
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
    setTimeout(() => {
      handleSubmit()
    }, 0)
  }

  const extractSentiment = (content: string): "bullish" | "bearish" | "neutral" => {
    const contentLower = content.toLowerCase()
    if (contentLower.includes("bullish") || contentLower.includes("positive") || contentLower.includes("uptrend")) {
      return "bullish"
    } else if (
      contentLower.includes("bearish") ||
      contentLower.includes("negative") ||
      contentLower.includes("downtrend")
    ) {
      return "bearish"
    }
    return "neutral"
  }

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return
    appendMessage({ role: "user", content: input })
    const asked = input
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Sending message to AI API:", input)

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: asked,
          coinData,
          portfolioData,
        }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      console.log("[v0] AI response received:", data)

      const text = (data?.response ?? "").toString().trim()
      const sentiment = data?.sentiment || extractSentiment(text)
      const confidence = Number.isFinite(data?.confidence) ? data.confidence : 75

      const recommendations: string[] = []
      if (text) {
        for (const line of text.split("\n")) {
          const trimmedLine = line.trim()
          if (
            trimmedLine.startsWith("•") ||
            trimmedLine.startsWith("-") ||
            trimmedLine.startsWith("*") ||
            /^\d+\./.test(trimmedLine)
          ) {
            const cleanRec = trimmedLine.replace(/^[•\-*\d.]\s*/, "").trim()
            if (cleanRec && cleanRec.length < 120) recommendations.push(cleanRec)
            if (recommendations.length >= 3) break
          }
        }
      }

      if (!text) {
        appendMessage({
          role: "assistant",
          content:
            "Hello. I'm unable to generate a detailed answer right now. Please try rephrasing your question or try again shortly.",
        })
      } else {
        appendMessage({
          role: "assistant",
          content: text,
          analysis: {
            sentiment,
            confidence,
            recommendations:
              recommendations.length > 0
                ? recommendations
                : ["Monitor market conditions", "Review your risk tolerance", "Stay updated on news"],
          },
        })
      }
    } catch (err) {
      console.error("[v0] Error in AI chat:", err)
      setError("Failed to get AI response. Please check your configuration and try again.")

      appendMessage({
        role: "assistant",
        content:
          "I apologize for the inconvenience. I'm experiencing technical difficulties at the moment. Please try again shortly.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <Card className="crypto-card h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Brain className="h-5 w-5 mr-2" />
            AI Crypto Analyst
            <Badge variant="outline" className="ml-2 bg-purple-500/20 text-purple-400 border-purple-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              GitHub LLM
            </Badge>
            <Button variant="outline" size="sm" onClick={() => clearHistory()} className="border-green-500/30">
            Refresh
          </Button>
          </CardTitle>
          
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, index) => {
            const Icon = prompt.icon
            return (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt(prompt.text)}
                className="text-xs bg-gray-800/50 border-gray-600 hover:border-green-500/50"
                disabled={isLoading}
              >
                <Icon className="h-3 w-3 mr-1" />
                {prompt.text}
              </Button>
            )
          })}
        </div>

        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user" ? "bg-green-500/20 text-green-100" : "bg-gray-800/50 text-gray-100"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === "assistant" ? (
                      <Bot className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <User className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm whitespace-pre-line">{message.content}</div>

                      {message.analysis && message.content.length > 50 && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <Badge
                            variant="outline"
                            className={`${
                              message.analysis.sentiment === "bullish"
                                ? "bg-green-500/20 text-green-400 border-green-500/20"
                                : message.analysis.sentiment === "bearish"
                                  ? "bg-red-500/20 text-red-400 border-red-500/20"
                                  : "bg-yellow-500/20 text-yellow-400 border-yellow-500/20"
                            }`}
                          >
                            {message.analysis.sentiment.toUpperCase()}
                          </Badge>
                          <span className="ml-2 text-xs text-gray-400">{message.analysis.confidence}% confidence</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/50 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-green-400 animate-pulse" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-400">Analyzing with live data...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-red-300">{error}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="flex space-x-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about current market conditions, trading opportunities, or specific coins..."
            className="bg-gray-800 border-green-500/20 text-white placeholder-gray-400"
            disabled={isLoading}
          />
          <Button type="submit" disabled={!input.trim() || isLoading} className="crypto-button">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
