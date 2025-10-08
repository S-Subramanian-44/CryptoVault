"use client"

import { AIChatAssistant } from "@/components/ai-chat-assistant"
import { AITradingSignals } from "@/components/ai-trading-signals"
import { FloatingAIChat } from "@/components/floating-ai-chat"
import Link from "next/link"

export default function AIDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent mb-2">
            AI Trading Dashboard
          </h1>
          <p className="text-gray-400">Advanced AI-powered cryptocurrency analysis and trading insights</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Chat Assistant */}
          <div className="xl:col-span-1">
            <AIChatAssistant />
          </div>

          {/* Right Column - Signals and News link */}
          <div className="xl:col-span-2 space-y-6">
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-6">
              <h3 className="text-blue-400 font-semibold mb-2">News & Sentiment Moved</h3>
              <p className="text-gray-300 text-sm mb-3">
                The crypto news and sentiment analysis now live on a dedicated page for deeper insights.
              </p>
              <Link href="/news" className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm">
                Go to News
              </Link>
            </div>
            <AITradingSignals />
          </div>
        </div>
      </div>

      {/* Floating AI Chat */}
      <FloatingAIChat />
    </div>
  )
}
