"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

type Item = {
  title: string
  sentiment: "positive" | "negative" | "neutral"
  coins?: string[]
}

function mapHint(s: Item["sentiment"]) {
  if (s === "positive") return "Consider staggered DCA or holding through strength."
  if (s === "negative") return "Reduce size or set tighter stops; wait for stabilization."
  return "Hold steady; reassess after clearer momentum."
}

export default function NewsRecoveryHints() {
  const [items, setItems] = useState<Item[]>([])
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/news?coin=") // all
        const data = await res.json()
        const top = (data.data || []).slice(0, 5)
        setItems(top)
      } catch {}
    })()
  }, [])

  if (!items.length) {
    return <p className="text-gray-400 text-sm">No recent items available.</p>
  }

  return (
    <div className="space-y-2">
      {items.map((n: Item, i: number) => (
        <div key={i} className="text-sm text-gray-300">
          <span className="mr-2">{mapHint(n.sentiment)}</span>
          <Badge variant="outline" className="bg-gray-700 border-gray-600">
            {n.sentiment}
          </Badge>
        </div>
      ))}
    </div>
  )
}
