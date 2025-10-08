import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { FloatingAIChat } from "@/components/floating-ai-chat"
import { Navigation } from "@/components/navigation"
import { Inter } from "next/font/google"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CryptoVault - Advanced Crypto Analytics",
  description: "Professional cryptocurrency trading and analytics platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-green-100 min-h-screen`}>
        <Navigation />
        <main className="pt-16">{children}</main>
        <FloatingAIChat />
      </body>
    </html>
  )
}
