'use client'

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

interface DataPoint {
  date: string
  value: number
  cumulative: number
}

interface PnLChartProps {
  data: DataPoint[]
  period: string
  totalPnl: number
}

export default function PnLChart({ data, period, totalPnl }: PnLChartProps) {
  // Generate mock chart data for demo
  const chartData = useMemo(() => {
    if (data.length === 0) {
      // Generate sample data
      const points: DataPoint[] = []
      let cumulative = 0
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dailyChange = (Math.random() - 0.4) * 200 // Bias toward losses (realistic)
        cumulative += dailyChange
        
        points.push({
          date: date.toISOString().split('T')[0],
          value: dailyChange,
          cumulative
        })
      }
      return points
    }
    return data
  }, [data])

  const maxValue = Math.max(...chartData.map(d => Math.max(d.value, d.cumulative)))
  const minValue = Math.min(...chartData.map(d => Math.min(d.value, d.cumulative)))
  const range = maxValue - minValue || 1

  const getYPosition = (value: number) => {
    return 80 - ((value - minValue) / range) * 60 // 60% of chart height, 20% padding
  }

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const isPositive = totalPnl >= 0

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>P&L Chart</span>
          </h3>
          <p className="text-gray-600">Performance over {period}</p>
        </div>
        <div className={`flex items-center space-x-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          <span className="font-bold text-lg">{formatValue(totalPnl)}</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative h-64 bg-gray-50 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.1"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Zero line */}
          <line 
            x1="10" 
            y1={getYPosition(0)} 
            x2="90" 
            y2={getYPosition(0)} 
            stroke="#6b7280" 
            strokeWidth="0.2"
            strokeDasharray="1,1"
          />

          {/* Cumulative P&L Line */}
          <polyline
            fill="none"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth="0.5"
            points={chartData.map((point, index) => {
              const x = 10 + (index / (chartData.length - 1)) * 80
              const y = getYPosition(point.cumulative)
              return `${x},${y}`
            }).join(' ')}
          />

          {/* Daily P&L Bars */}
          {chartData.map((point, index) => {
            const x = 10 + (index / (chartData.length - 1)) * 80
            const zeroY = getYPosition(0)
            const valueY = getYPosition(point.value)
            const isPositiveBar = point.value >= 0
            
            return (
              <rect
                key={index}
                x={x - 0.3}
                y={isPositiveBar ? valueY : zeroY}
                width="0.6"
                height={Math.abs(valueY - zeroY)}
                fill={isPositiveBar ? "#10b981" : "#ef4444"}
                opacity="0.6"
              />
            )
          })}

          {/* Data points on the line */}
          {chartData.map((point, index) => {
            if (index % 5 !== 0) return null // Show every 5th point to avoid clutter
            
            const x = 10 + (index / (chartData.length - 1)) * 80
            const y = getYPosition(point.cumulative)
            
            return (
              <circle
                key={`point-${index}`}
                cx={x}
                cy={y}
                r="0.4"
                fill={isPositive ? "#10b981" : "#ef4444"}
                stroke="#ffffff"
                strokeWidth="0.2"
              />
            )
          })}
        </svg>

        {/* Value labels */}
        <div className="absolute top-2 left-2 text-xs text-gray-500">
          {formatValue(maxValue)}
        </div>
        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
          {formatValue(minValue)}
        </div>
      </div>

      {/* Legend and Stats */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>Cumulative P&L</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-2 bg-gray-400 opacity-60"></div>
            <span>Daily Changes</span>
          </div>
        </div>
        
        <div className="text-gray-600">
          {chartData.length} data points • Last {period}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-600">Best Day</p>
          <p className="font-medium text-green-600">
            {formatValue(Math.max(...chartData.map(d => d.value)))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Worst Day</p>
          <p className="font-medium text-red-600">
            {formatValue(Math.min(...chartData.map(d => d.value)))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Volatility</p>
          <p className="font-medium text-gray-700">
            {((Math.max(...chartData.map(d => d.value)) - Math.min(...chartData.map(d => d.value))) / 2).toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  )
}