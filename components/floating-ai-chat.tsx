"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatHistory } from "@/lib/use-chat-history"
import {
  Bot,
  User,
  Send,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Brain,
  Zap,
  Target,
  BarChart3,
  Minimize2,
  Maximize2,
  X,
  MessageCircle,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  analysis?: {
    sentiment: "bullish" | "bearish" | "neutral"
    confidence: number
    recommendations: string[]
  }
}

export function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const { messages, setMessages, appendMessage, clearHistory } = useChatHistory()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const quickPrompts = [
    { text: "Analyze Bitcoin's current trend", icon: TrendingUp, category: "analysis" },
    { text: "Optimize my portfolio allocation", icon: Target, category: "portfolio" },
    { text: "What are the market risks today?", icon: AlertTriangle, category: "risk" },
    { text: "Suggest trading strategies", icon: Lightbulb, category: "strategy" },
    { text: "Explain DeFi opportunities", icon: Sparkles, category: "education" },
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
            "Good day. I am your cryptocurrency market analyst powered by GitHub Models and live CoinGecko data. How may I help you today?",
          timestamp: new Date().toISOString(),
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

  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setUnreadCount(messages.filter((m) => m.role === "assistant").length - 1)
    } else {
      setUnreadCount(0)
    }
  }, [isOpen, messages])

  const generateAIResponse = async (userMessage: string) => {
    try {
      console.log("[v0] Sending message to AI:", userMessage)

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] AI response received:", data)

      // Validate response
      const text = (data?.response ?? "").toString().trim()
      if (!text) {
        throw new Error("Empty response from AI")
      }

      // Extract recommendations from response
      const recommendations: string[] = []
      const lines = text.split("\n")

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (
          trimmedLine.startsWith("•") ||
          trimmedLine.startsWith("-") ||
          trimmedLine.startsWith("*") ||
          /^\d+\./.test(trimmedLine)
        ) {
          const cleanRec = trimmedLine.replace(/^[•\-*\d.]\s*/, "").trim()
          if (cleanRec.length > 0 && cleanRec.length < 100) {
            recommendations.push(cleanRec)
          }
          if (recommendations.length >= 3) break
        }
      }

      appendMessage({
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: "assistant",
        content: text,
        timestamp: new Date().toISOString(),
        analysis: {
          sentiment: data?.sentiment || "neutral",
          confidence: Number.isFinite(data?.confidence) ? data.confidence : 75,
          recommendations:
            recommendations.length > 0
              ? recommendations
              : ["Monitor market conditions", "Review risk tolerance", "Stay informed"],
        },
      })
    } catch (error) {
      console.error("[v0] Error getting AI response:", error)
      appendMessage({
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: "assistant",
        content:
          "I apologize for the inconvenience. I'm currently experiencing technical difficulties. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      })
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    appendMessage({ role: "user", content: input, timestamp: new Date().toISOString() })
    const asked = input
    setInput("")
    setIsLoading(true)

    try {
      await generateAIResponse(asked)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setUnreadCount(0)
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const closeChat = () => {
    setIsOpen(false)
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  // Floating chat button when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleChat}
          className="relative h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-ping opacity-20"></div>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card
        className={`transition-all duration-300 ${
          isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
        } flex flex-col shadow-2xl border-2 border-purple-500/50 bg-gray-900`}
      >
        <CardHeader className="pb-3 flex-shrink-0 bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-b border-purple-500/30">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-purple-300 flex items-center text-sm">
              <Brain className="h-4 w-4 mr-2" />
              AI Crypto Analyst
              <Badge variant="outline" className="ml-2 bg-purple-500/30 text-purple-300 border-purple-500/30 text-xs">
                <Sparkles className="h-2 w-2 mr-1" />
                GitHub LLM
              </Badge>
            </CardTitle>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearHistory()}
                className="h-6 px-2 text-purple-200 hover:bg-purple-500/30"
              >
                Refresh
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleMinimize} className="h-6 w-6 p-0 hover:bg-purple-500/30">
                {isMinimized ? (
                  <Maximize2 className="h-3 w-3 text-purple-300" />
                ) : (
                  <Minimize2 className="h-3 w-3 text-purple-300" />
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={closeChat} className="h-6 w-6 p-0 hover:bg-red-500/30">
                <X className="h-3 w-3 text-red-300" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex-1 flex flex-col space-y-4 p-4 bg-gray-900">
            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1">
              {quickPrompts.slice(0, 3).map((prompt, index) => {
                const Icon = prompt.icon
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className="text-xs bg-gray-800 border-gray-600 hover:border-purple-500/50 hover:bg-gray-700 h-6 px-2"
                    disabled={isLoading}
                  >
                    <Icon className="h-2 w-2 mr-1" />
                    {prompt.text.split(" ").slice(0, 2).join(" ")}
                  </Button>
                )
              })}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 pr-2  max-h-[400px]" ref={scrollAreaRef}>
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-lg p-2 text-xs ${
                        message.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800 text-gray-100 border border-gray-700"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === "assistant" ? (
                          <Bot className="h-3 w-3 text-purple-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <User className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="whitespace-pre-line">{message.content}</div>

                          {message.analysis && (
                            <div className="mt-2 pt-2 border-t border-gray-600">
                              <div className="flex items-center justify-between mb-1">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    message.analysis.sentiment === "bullish"
                                      ? "bg-green-500/20 text-green-400 border-green-500/20"
                                      : message.analysis.sentiment === "bearish"
                                        ? "bg-red-500/20 text-red-400 border-red-500/20"
                                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/20"
                                  }`}
                                >
                                  {message.analysis.sentiment.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-gray-400">{message.analysis.confidence}%</span>
                              </div>

                              {message.analysis.recommendations && message.analysis.recommendations.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-400 font-medium">Key Points:</p>
                                  {message.analysis.recommendations.slice(0, 2).map((rec, idx) => (
                                    <div key={idx} className="flex items-center space-x-1">
                                      <Zap className="h-2 w-2 text-yellow-400" />
                                      <span className="text-xs text-gray-300">{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 max-w-[85%]">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-3 w-3 text-purple-400 animate-pulse" />
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">Analyzing with live data...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about crypto, time, or general questions..."
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="bg-gray-800 border-purple-500/30 text-white placeholder-gray-400 text-xs h-8 focus:border-purple-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="h-8 w-8 p-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
