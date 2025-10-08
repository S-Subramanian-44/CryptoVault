import { fetchCoinGeckoData } from "@/lib/coingecko-rag"

export async function POST(req: Request) {
  try {
    const { messages, message, coinData, portfolioData } = await req.json()

    // Get the user's message
    const userMessage = message || (messages && messages[messages.length - 1]?.content) || ""

    console.log("[v0] AI Chat - User message:", userMessage)

    // Detect query type
    const isGreeting = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)[\s!?.]*$/i.test(
      userMessage.trim(),
    )
    const isTimeQuery = /(what time|current time|what's the time|time now|what date|current date|today's date)/i.test(
      userMessage,
    )
    const isCryptoQuery =
      /(bitcoin|btc|ethereum|eth|crypto|cryptocurrency|coin|token|market|price|trading|blockchain|defi|nft)/i.test(
        userMessage,
      )

    // Handle greetings formally
    if (isGreeting) {
      return Response.json({
        response:
          "Good day. I am your cryptocurrency market analyst. How may I assist you with your investment analysis today?",
        sentiment: "neutral",
        confidence: 100,
      })
    }

    // Handle time/date queries
    if (isTimeQuery) {
      const now = new Date()
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      })
      const dateString = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      return Response.json({
        response: `The current date and time is: ${dateString}, ${timeString}`,
        sentiment: "neutral",
        confidence: 100,
      })
    }

    // Prepare context based on query type
    let systemPrompt = "You are an expert cryptocurrency analyst and trading advisor."
    let ragContext = ""

    if (isCryptoQuery) {
      // Fetch live CoinGecko data for crypto queries
      ragContext = await fetchCoinGeckoData(userMessage)
      systemPrompt += `\n\n${ragContext}\n\nUse the above live market data to provide accurate, data-driven insights.`
    } else {
      // For non-crypto queries, use general knowledge
      systemPrompt +=
        "\n\nFor non-cryptocurrency questions, provide helpful general information based on your knowledge."
    }

    // Add portfolio/coin data if provided
    if (coinData && coinData.length > 0) {
      const topCoins = coinData.slice(0, 10).map((coin: any) => ({
        name: coin.name,
        symbol: coin.symbol,
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h,
      }))
      systemPrompt += `\n\nAdditional context - User's viewed coins:\n${JSON.stringify(topCoins, null, 2)}`
    }

    if (portfolioData) {
      systemPrompt += `\n\nUser's portfolio:\n${JSON.stringify(portfolioData, null, 2)}`
    }

    systemPrompt += `\n\nProvide clear, actionable insights. Include sentiment (bullish/bearish/neutral) when relevant. Be concise but informative.`

    // Call GitHub Models API
    const githubToken = process.env.GITHUB_MODEL_TOKEN

    if (!githubToken) {
      console.error("[v0] GITHUB_MODEL_TOKEN not configured")
      return Response.json({
        response:
          "I apologize, but the AI service is not properly configured. Please ensure GITHUB_MODEL_TOKEN is set in your environment variables.",
        sentiment: "neutral",
        confidence: 0,
      })
    }

    console.log("[v0] Calling GitHub Models API...")

    const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${githubToken}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] GitHub Models API error:", response.status, errorText)
      throw new Error(`GitHub Models API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] GitHub Models API response received")

    const aiResponse = data.choices?.[0]?.message?.content

    // Validate response
    if (!aiResponse || aiResponse.trim().length === 0) {
      console.error("[v0] Empty response from GitHub Models API")
      return Response.json({
        response:
          "I apologize, but I'm having difficulty generating a response at the moment. Could you please rephrase your question?",
        sentiment: "neutral",
        confidence: 50,
      })
    }

    // Extract sentiment from response
    let sentiment: "bullish" | "bearish" | "neutral" = "neutral"
    const contentLower = aiResponse.toLowerCase()
    if (
      contentLower.includes("bullish") ||
      contentLower.includes("positive") ||
      contentLower.includes("uptrend") ||
      contentLower.includes("buy")
    ) {
      sentiment = "bullish"
    } else if (
      contentLower.includes("bearish") ||
      contentLower.includes("negative") ||
      contentLower.includes("downtrend") ||
      contentLower.includes("sell")
    ) {
      sentiment = "bearish"
    }

    // Calculate confidence based on response quality and data availability
    const confidence = isCryptoQuery && ragContext ? 85 : 75

    return Response.json({
      response: aiResponse,
      sentiment,
      confidence,
    })
  } catch (error) {
    console.error("[v0] AI chat error:", error)

    // Always return a valid response, never empty
    return Response.json({
      response:
        "I apologize for the inconvenience. I'm currently experiencing technical difficulties. Please try again in a moment, or rephrase your question.",
      sentiment: "neutral",
      confidence: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
