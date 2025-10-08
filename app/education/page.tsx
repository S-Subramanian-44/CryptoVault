"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, BookOpen, TrendingUp, Shield, Brain, AlertTriangle, Lightbulb } from "lucide-react"

export default function Education() {
  const [openSections, setOpenSections] = useState<string[]>(["basics"])

  const toggleSection = (section: string) => {
    setOpenSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const educationSections = [
    {
      id: "basics",
      title: "Cryptocurrency Basics",
      icon: BookOpen,
      color: "text-blue-400",
      content: [
        {
          title: "What is Bitcoin?",
          content:
            "Bitcoin is the first and most well-known cryptocurrency, created by an anonymous person or group known as Satoshi Nakamoto. It operates on a decentralized network called blockchain, allowing peer-to-peer transactions without intermediaries like banks.",
        },
        {
          title: "What is Ethereum?",
          content:
            "Ethereum is a blockchain platform that enables smart contracts and decentralized applications (DApps). Its native cryptocurrency is Ether (ETH). Ethereum introduced programmable money and is the foundation for many DeFi protocols and NFTs.",
        },
        {
          title: "How Does Blockchain Work?",
          content:
            "Blockchain is a distributed ledger technology that maintains a continuously growing list of records (blocks) linked and secured using cryptography. Each block contains a hash of the previous block, timestamp, and transaction data.",
        },
      ],
    },
    {
      id: "technical",
      title: "Technical Analysis",
      icon: TrendingUp,
      color: "text-green-400",
      content: [
        {
          title: "What is RSI?",
          content:
            "Relative Strength Index (RSI) is a momentum oscillator that measures the speed and change of price movements. RSI values range from 0 to 100. Values above 70 typically indicate overbought conditions, while values below 30 suggest oversold conditions.",
        },
        {
          title: "Understanding MACD",
          content:
            "Moving Average Convergence Divergence (MACD) is a trend-following momentum indicator. It shows the relationship between two moving averages of a security's price. MACD triggers technical signals when it crosses above (bullish) or below (bearish) its signal line.",
        },
        {
          title: "Bollinger Bands Explained",
          content:
            "Bollinger Bands consist of a middle band (simple moving average) and two outer bands (standard deviations). They help identify overbought and oversold conditions. When price touches the upper band, it may be overbought; when it touches the lower band, it may be oversold.",
        },
      ],
    },
    {
      id: "portfolio",
      title: "Portfolio Management",
      icon: Shield,
      color: "text-purple-400",
      content: [
        {
          title: "What is Diversification?",
          content:
            "Diversification involves spreading investments across various assets to reduce risk. In crypto, this means investing in different types of cryptocurrencies (Bitcoin, altcoins, DeFi tokens) rather than putting all money into one asset.",
        },
        {
          title: "Risk Management Strategies",
          content:
            "Key strategies include: 1) Never invest more than you can afford to lose, 2) Use stop-loss orders, 3) Take profits gradually, 4) Rebalance your portfolio regularly, 5) Keep some funds in stablecoins for opportunities.",
        },
        {
          title: "Dollar Cost Averaging (DCA)",
          content:
            "DCA is an investment strategy where you invest a fixed amount regularly regardless of price. This reduces the impact of volatility and removes the need to time the market. It's particularly effective in volatile markets like crypto.",
        },
      ],
    },
    {
      id: "psychology",
      title: "Investment Psychology",
      icon: Brain,
      color: "text-yellow-400",
      content: [
        {
          title: "Understanding FOMO",
          content:
            "Fear of Missing Out (FOMO) drives investors to make impulsive decisions based on others' success stories. FOMO often leads to buying at peaks. Combat FOMO by sticking to your investment plan and doing thorough research before investing.",
        },
        {
          title: "Avoiding Panic Selling",
          content:
            "Panic selling occurs when fear drives investors to sell at losses during market downturns. This often results in selling at the worst possible time. Develop a long-term perspective and understand that volatility is normal in crypto markets.",
        },
        {
          title: "Emotional Discipline",
          content:
            "Successful investing requires emotional control. Set clear entry and exit strategies before investing. Use tools like stop-losses and take-profits to remove emotion from decisions. Remember: the market will always be there tomorrow.",
        },
      ],
    },
  ]

  const didYouKnowFacts = [
    "Bitcoin's total supply is capped at 21 million coins, making it deflationary by design.",
    "The first Bitcoin transaction was for two pizzas, costing 10,000 BTC (worth millions today).",
    "Ethereum processes more transactions daily than Bitcoin, Litecoin, and Bitcoin Cash combined.",
    "The crypto market never sleeps - it operates 24/7, 365 days a year.",
    "More than 50% of Bitcoin hasn't moved in over a year, suggesting long-term holding behavior.",
  ]

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Crypto Education Hub
          </h1>
          <p className="text-gray-400">Learn the fundamentals of cryptocurrency investing</p>
        </div>

        {/* Did You Know Section */}
        <Card className="crypto-card border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Did You Know?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {didYouKnowFacts.map((fact, index) => (
                <div key={index} className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <p className="text-sm text-gray-300">{fact}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Education Sections */}
        <div className="space-y-4">
          {educationSections.map((section) => {
            const Icon = section.icon
            const isOpen = openSections.includes(section.id)

            return (
              <Card key={section.id} className="crypto-card">
                <Collapsible open={isOpen} onOpenChange={() => toggleSection(section.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-800/50 transition-colors">
                      <CardTitle className={`flex items-center justify-between ${section.color}`}>
                        <div className="flex items-center">
                          <Icon className="h-6 w-6 mr-3" />
                          {section.title}
                        </div>
                        <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-6">
                        {section.content.map((item, index) => (
                          <div key={index} className="border-l-2 border-green-500/20 pl-4">
                            <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                            <p className="text-gray-300 leading-relaxed">{item.content}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })}
        </div>

        {/* Risk Warning */}
        <Card className="crypto-card border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Important Risk Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong>Cryptocurrency investments are highly risky and volatile.</strong> Prices can fluctuate
                dramatically in short periods, and you could lose all of your investment.
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Only invest money you can afford to lose completely</li>
                <li>• Past performance does not guarantee future results</li>
                <li>• Cryptocurrency markets are largely unregulated</li>
                <li>• Technical analysis is not foolproof and should not be your only decision factor</li>
                <li>• Always do your own research (DYOR) before making investment decisions</li>
                <li>• Consider consulting with a financial advisor</li>
              </ul>
              <p className="text-red-400 font-semibold">
                This platform is for educational purposes only and does not constitute financial advice.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
