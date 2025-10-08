"use client"

import useSWR, { mutate } from "swr"

export type ChatAnalysis = {
  sentiment: "bullish" | "bearish" | "neutral"
  confidence: number
  recommendations: string[]
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  // For timestamp display in some UIs
  timestamp?: string
  // For other UIs that compute from number
  createdAt?: number
  analysis?: ChatAnalysis
}

const CHAT_KEY = "chat-history"

export function useChatHistory() {
  const { data } = useSWR<ChatMessage[]>(CHAT_KEY, {
    // In-memory only: persists across navigation, resets on full reload
    fallbackData: [],
    revalidateOnMount: false,
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  const messages = data || []

  const setMessages = (next: ChatMessage[]) => {
    mutate(CHAT_KEY, next, false)
  }

  const appendMessage = (msg: Omit<ChatMessage, "id" | "createdAt">) => {
    const item: ChatMessage = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      createdAt: Date.now(),
      ...msg,
    }
    setMessages([...(messages || []), item])
  }

  const replaceLastAssistant = (content: string) => {
    const next = [...messages]
    for (let i = next.length - 1; i >= 0; i--) {
      if (next[i].role === "assistant") {
        next[i] = { ...next[i], content }
        break
      }
    }
    setMessages(next)
  }

  const clearHistory = () => setMessages([])

  return {
    messages,
    setMessages,
    appendMessage,
    replaceLastAssistant,
    clearHistory,
    CHAT_KEY,
  }
}
