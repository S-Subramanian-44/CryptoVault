"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, GitCompare, Target, Brain, Sparkles, Newspaper, Zap } from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/explorer", label: "Explorer", icon: Search },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/ai-dashboard", label: "AI Intelligence", icon: Brain },
  { href: "/recovery-strategizer", label: "Loss Recovery", icon: Target },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-green-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-green-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              CryptoVault
            </span>
            <span className="text-sm text-purple-400 font-semibold">AI Pro</span>
          </Link>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                const isLossRecovery = item.href === "/recovery-strategizer"
                const isAI = item.href === "/ai-dashboard"
                const isNews = item.href === "/news"

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-all duration-200 ${
                      isActive
                        ? isLossRecovery
                          ? "bg-red-500/20 text-red-400 crypto-glow border border-red-500/20"
                          : isAI
                            ? "bg-purple-500/20 text-purple-400 crypto-glow border border-purple-500/20"
                            : isNews
                              ? "bg-blue-500/20 text-blue-400 crypto-glow border border-blue-500/20"
                              : "bg-green-500/20 text-green-400 crypto-glow"
                        : isLossRecovery
                          ? "text-red-300 hover:bg-red-500/10 hover:text-red-400"
                          : isAI
                            ? "text-purple-300 hover:bg-purple-500/10 hover:text-purple-400"
                            : isNews
                              ? "text-blue-300 hover:bg-blue-500/10 hover:text-blue-400"
                              : "text-gray-300 hover:bg-green-500/10 hover:text-green-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {isLossRecovery && <Brain className="h-3 w-3 text-red-400 animate-pulse" />}
                    {isAI && <Sparkles className="h-3 w-3 text-purple-400 animate-pulse" />}
                    {isNews && <Newspaper className="h-3 w-3 text-blue-400 animate-pulse" />}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-400 animate-pulse" />
              <span className="text-xs text-purple-400">AI Ready</span>
            </div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </nav>
  )
}
