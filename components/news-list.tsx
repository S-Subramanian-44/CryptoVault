"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type ApiItem = {
  title: string
  description?: string
  link?: string
  pubDate?: string
  source?: string
  sentiment?: "positive" | "neutral" | "negative"
  imageUrl?: string
  coins?: string[]
}

type ApiResponseShape =
  | { data?: ApiItem[]; success?: boolean; [k: string]: unknown }
  | { items?: ApiItem[]; [k: string]: unknown }

type ViewItem = {
  title: string
  url: string
  source?: string
  publishedAt?: string
  summary?: string
  sentiment?: "positive" | "neutral" | "negative"
  coins?: string[]
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Failed to fetch: ${r.status}`)
    return r.json()
  })

function SentimentBadge({ sentiment }: { sentiment?: ViewItem["sentiment"] }) {
  if (!sentiment) return null
  const styles =
    sentiment === "positive"
      ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
      : sentiment === "negative"
        ? "bg-red-600/10 text-red-700 dark:text-red-400"
        : "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300"
  const label = sentiment[0].toUpperCase() + sentiment.slice(1)
  return <Badge className={cn("rounded-md", styles)}>{label}</Badge>
}

function NewsCard({ item }: { item: ViewItem }) {
  const date = item.publishedAt ? new Date(item.publishedAt) : null
  const formatted = date ? date.toLocaleString() : ""

  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Open article: ${item.title}`}>
      <Card className="transition hover:bg-muted/40">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-pretty text-base leading-6">{item.title}</CardTitle>
            <SentimentBadge sentiment={item.sentiment} />
          </div>
          {(item.source || formatted) && (
            <CardDescription className="flex flex-wrap items-center gap-2">
              {item.source && <span className="text-xs">{item.source}</span>}
              {item.source && formatted && <span className="text-xs text-muted-foreground">•</span>}
              {formatted && (
                <time dateTime={date ? date.toISOString() : ""} className="text-xs">
                  {formatted}
                </time>
              )}
            </CardDescription>
          )}
        </CardHeader>
        {item.summary && (
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{item.summary}</p>
          </CardContent>
        )}
      </Card>
    </a>
  )
}

function NewsListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-14 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function normalize(resp: ApiResponseShape | undefined): ViewItem[] {
  if (!resp) return []
  const list: ApiItem[] = Array.isArray((resp as any).data)
    ? ((resp as any).data as ApiItem[])
    : Array.isArray((resp as any).items)
      ? ((resp as any).items as ApiItem[])
      : []
  return list.map((it) => ({
    title: it.title,
    url: (it.link as string) || (it as any).url || "#",
    source: it.source,
    publishedAt: (it.pubDate as string) || (it as any).publishedAt,
    summary: (it.description as string) || (it as any).summary,
    sentiment: it.sentiment,
    coins: it.coins,
  }))
}

export default function NewsList() {
  const { data, error, isLoading } = useSWR<ApiResponseShape>("/api/crypto-news", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  if (isLoading) return <NewsListSkeleton />
  if (error) {
    return (
      <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
        Failed to load news. Please try again.
      </div>
    )
  }

  const items = normalize(data)

  if (!items.length) {
    return (
      <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
        No news found. Check back later.
      </div>
    )
  }

  return (
    <section aria-label="Latest crypto news" className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((item, idx) => (
        <NewsCard key={`${item.title}-${idx}`} item={item} />
      ))}
    </section>
  )
}
