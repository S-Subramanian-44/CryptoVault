"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Filter, X, TrendingUp, TrendingDown, Minus, Clock, DollarSign, BarChart3 } from "lucide-react"
import { TIME_RANGES, CRYPTO_CATEGORIES, type MarketFilter, DEFAULT_FILTER } from "@/lib/comparison-api"

interface CryptoSlicersProps {
  filter: MarketFilter
  onFilterChange: (filter: MarketFilter) => void
  onReset: () => void
  className?: string
}

export function CryptoSlicers({ filter, onFilterChange, onReset, className }: CryptoSlicersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (updates: Partial<MarketFilter>) => {
    onFilterChange({ ...filter, ...updates })
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
    return `$${value.toFixed(0)}`
  }

  const toggleCategory = (category: string) => {
    const newCategories = filter.categories.includes(category)
      ? filter.categories.filter((c) => c !== category)
      : [...filter.categories, category]
    updateFilter({ categories: newCategories })
  }

  const hasActiveFilters = () => {
    return (
      filter.priceRange[0] !== DEFAULT_FILTER.priceRange[0] ||
      filter.priceRange[1] !== DEFAULT_FILTER.priceRange[1] ||
      filter.marketCapRange[0] !== DEFAULT_FILTER.marketCapRange[0] ||
      filter.marketCapRange[1] !== DEFAULT_FILTER.marketCapRange[1] ||
      filter.volumeRange[0] !== DEFAULT_FILTER.volumeRange[0] ||
      filter.volumeRange[1] !== DEFAULT_FILTER.volumeRange[1] ||
      filter.categories.length > 0 ||
      filter.performance !== DEFAULT_FILTER.performance ||
      filter.timeRange !== DEFAULT_FILTER.timeRange
    )
  }

  return (
    <Card className={`crypto-card ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-400 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Market Filters
            {hasActiveFilters() && (
              <Badge variant="outline" className="ml-2 bg-green-500/20 text-green-400 border-green-500/20">
                Active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters() && (
              <Button variant="ghost" size="sm" onClick={onReset} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-green-400 hover:text-green-300"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter.timeRange === "24h" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter({ timeRange: "24h" })}
            className={filter.timeRange === "24h" ? "crypto-button" : "bg-gray-800 border-green-500/20"}
          >
            <Clock className="h-3 w-3 mr-1" />
            24h
          </Button>

          <Button
            variant={filter.performance === "gainers" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter({ performance: filter.performance === "gainers" ? "all" : "gainers" })}
            className={filter.performance === "gainers" ? "crypto-button" : "bg-gray-800 border-green-500/20"}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Gainers
          </Button>

          <Button
            variant={filter.performance === "losers" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter({ performance: filter.performance === "losers" ? "all" : "losers" })}
            className={filter.performance === "losers" ? "crypto-button" : "bg-gray-800 border-green-500/20"}
          >
            <TrendingDown className="h-3 w-3 mr-1" />
            Losers
          </Button>

          <Button
            variant={filter.performance === "stable" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter({ performance: filter.performance === "stable" ? "all" : "stable" })}
            className={filter.performance === "stable" ? "crypto-button" : "bg-gray-800 border-green-500/20"}
          >
            <Minus className="h-3 w-3 mr-1" />
            Stable
          </Button>
        </div>

        {isExpanded && (
          <>
            <Separator className="bg-green-500/20" />

            {/* Time Range Selector */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Time Range
              </Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {TIME_RANGES.map((range) => (
                  <Button
                    key={range.value}
                    variant={filter.timeRange === range.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter({ timeRange: range.value })}
                    className={
                      filter.timeRange === range.value ? "crypto-button" : "bg-gray-800 border-green-500/20 text-xs"
                    }
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Price Range: {formatCurrency(filter.priceRange[0])} - {formatCurrency(filter.priceRange[1])}
              </Label>
              <Slider
                value={filter.priceRange}
                onValueChange={(value) => updateFilter({ priceRange: value as [number, number] })}
                max={100000}
                min={0}
                step={100}
                className="w-full"
              />
            </div>

            {/* Market Cap Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Market Cap: {formatCurrency(filter.marketCapRange[0])} - {formatCurrency(filter.marketCapRange[1])}
              </Label>
              <Slider
                value={filter.marketCapRange}
                onValueChange={(value) => updateFilter({ marketCapRange: value as [number, number] })}
                max={1000000000000}
                min={0}
                step={1000000000}
                className="w-full"
              />
            </div>

            {/* Volume Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                24h Volume: {formatCurrency(filter.volumeRange[0])} - {formatCurrency(filter.volumeRange[1])}
              </Label>
              <Slider
                value={filter.volumeRange}
                onValueChange={(value) => updateFilter({ volumeRange: value as [number, number] })}
                max={100000000000}
                min={0}
                step={100000000}
                className="w-full"
              />
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">Categories</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CRYPTO_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={filter.categories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                      className="border-green-500/20 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    <Label htmlFor={category} className="text-xs text-gray-300 cursor-pointer">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">Performance (24h)</Label>
              <Select value={filter.performance} onValueChange={(value: any) => updateFilter({ performance: value })}>
                <SelectTrigger className="bg-gray-800 border-green-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-green-500/20">
                  <SelectItem value="all">All Coins</SelectItem>
                  <SelectItem value="gainers">Gainers Only</SelectItem>
                  <SelectItem value="losers">Losers Only</SelectItem>
                  <SelectItem value="stable">Stable (±2%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
