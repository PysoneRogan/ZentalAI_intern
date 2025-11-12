'use client'

import { useState } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { WorkoutTrend } from '@/lib/dashboard'
import { format, parseISO } from 'date-fns'

interface WorkoutChartProps {
  data: WorkoutTrend[]
  title?: string
}

type ChartType = 'line' | 'bar'
type MetricType = 'workouts' | 'minutes' | 'calories'

export function WorkoutChart({ data, title = 'Workout Trends' }: WorkoutChartProps) {
  const [chartType, setChartType] = useState<ChartType>('line')
  const [metric, setMetric] = useState<MetricType>('workouts')

  // Format data for chart display
  const chartData = data.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'MMM dd'),
    formattedDate: format(parseISO(item.date), 'EEEE, MMMM do')
  }))

  const getMetricLabel = (metric: MetricType) => {
    switch (metric) {
      case 'workouts': return 'Workouts'
      case 'minutes': return 'Minutes'
      case 'calories': return 'Calories'
    }s
  }

  const getMetricColor = (metric: MetricType) => {
    switch (metric) {
      case 'workouts': return '#3B82F6' // Blue
      case 'minutes': return '#10B981'  // Green  
      case 'calories': return '#F59E0B' // Orange
    }
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: unknown) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.formattedDate}</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Workouts:</span>
              <span className="text-sm font-medium">{data.workouts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Minutes:</span>
              <span className="text-sm font-medium">{data.minutes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Calories:</span>
              <span className="text-sm font-medium">{data.calories}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">Track your progress over time</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Metric selector */}
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as MetricType)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="workouts">Workouts</option>
              <option value="minutes">Minutes</option>
              <option value="calories">Calories</option>
            </select>
            
            {/* Chart type selector */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 text-sm font-medium ${
                  chartType === 'line'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 text-sm font-medium border-l ${
                  chartType === 'bar'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
              >
                Bar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey={metric}
                  stroke={getMetricColor(metric)}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey={metric}
                  fill={getMetricColor(metric)}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Chart summary */}
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total {getMetricLabel('workouts')}</p>
            <p className="text-lg font-semibold text-gray-900">
              {chartData.reduce((sum, item) => sum + item.workouts, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total {getMetricLabel('minutes')}</p>
            <p className="text-lg font-semibold text-gray-900">
              {chartData.reduce((sum, item) => sum + item.minutes, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total {getMetricLabel('calories')}</p>
            <p className="text-lg font-semibold text-gray-900">
              {chartData.reduce((sum, item) => sum + item.calories, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading state for the chart
export function WorkoutChartLoading() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="h-80 bg-gray-100 rounded animate-pulse flex items-center justify-center">
          <div className="text-gray-400">Loading chart...</div>
        </div>
      </div>
    </div>
  )
}