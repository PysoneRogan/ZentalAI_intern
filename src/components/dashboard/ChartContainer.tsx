'use client'

import { useEffect, useState } from 'react'
import { WorkoutChart, WorkoutChartLoading } from './WorkoutChart'
import { WorkoutTrend } from '@/lib/dashboard'

interface ChartContainerProps {
  userId: number
  initialData: WorkoutTrend[]
}

export function ChartContainer({ userId, initialData }: ChartContainerProps) {
  const [data, setData] = useState(initialData)
  const [timeRange, setTimeRange] = useState('30')
  const [isLoading, setIsLoading] = useState(false)

  const updateTimeRange = async (range: string) => {
    if (range === timeRange) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/dashboard/trends?userId=${userId}&days=${range}`)
      if (response.ok) {
        const newData = await response.json()
        setData(newData)
        setTimeRange(range)
      }
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="space-y-4">
      {/* Time range selector */}
      <div className="flex justify-end">
        <div className="flex border border-gray-300 rounded-md overflow-hidden">
          {[
            { value: '7', label: '7 days' },
            { value: '30', label: '30 days' },
            { value: '90', label: '90 days' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateTimeRange(option.value)}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium border-r border-gray-300 last:border-r-0 ${
                timeRange === option.value
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {isLoading ? (
        <WorkoutChartLoading />
      ) : (
        <WorkoutChart 
          data={data}
          title={`Workout Trends (Last ${timeRange} days)`}
        />
      )}
    </div>
  )
}