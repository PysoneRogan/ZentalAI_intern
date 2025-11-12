'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Zap, Filter, Search, ChevronDown, Plus } from 'lucide-react'
import Button from '@/components/Button'
import Badge from '@/components/Badge'
import Card from '@/components/Card'
import Select from '@/components/Select'
import FormField from '@/components/ui/FormField'

interface WorkoutType {
  id: number
  name: string
  description: string

}

interface Workout {
  id: number
  workoutTypeId: number
  durationMin: number
  calories: number | null
  performedAt: string
  notes: string | null
  createdAt: string
  workoutType: {
    id: number
    name: string
    description: string
  }
}

interface WorkoutsListClientProps {
  initialWorkouts: Workout[]
  workoutTypes: WorkoutType[]
  totalCount: number
  userId: number
}

export default function WorkoutsListClient({ 
  initialWorkouts, 
  workoutTypes, 
  totalCount,
  userId 
}: WorkoutsListClientProps) {
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    workoutTypeId: '',
    startDate: '',
    endDate: '',
    sortBy: 'performedAt',
    sortOrder: 'desc'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch workouts with current filters
  const fetchWorkouts = async (page = 1, resetList = false) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      })

      if (filters.workoutTypeId) {
        params.append('workoutTypeId', filters.workoutTypeId)
      }
      if (filters.startDate) {
        params.append('startDate', new Date(filters.startDate).toISOString())
      }
      if (filters.endDate) {
        params.append('endDate', new Date(filters.endDate).toISOString())
      }

      const response = await fetch(`/api/workouts?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (resetList || page === 1) {
          setWorkouts(data.workouts)
        } else {
          setWorkouts(prev => [...prev, ...data.workouts])
        }
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Failed to fetch workouts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters
  const handleFilterChange = () => {
    fetchWorkouts(1, true)
  }

  // Load more workouts
  const loadMore = () => {
    if (!isLoading) {
      fetchWorkouts(currentPage + 1, false)
    }
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      workoutTypeId: '',
      startDate: '',
      endDate: '',
      sortBy: 'performedAt',
      sortOrder: 'desc'
    })
    setWorkouts(initialWorkouts)
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          
          {(filters.workoutTypeId || filters.startDate || filters.endDate) && (
            <Button variant="ghost" onClick={resetFilters} className="text-sm">
              Clear filters
            </Button>
          )}
        </div>

        <Button variant="primary" onClick={() => window.location.href = '/add-workout'}>
          <Plus className="w-4 h-4 mr-2" />
          Add Workout
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <Card.Content className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Workout Type"
                value={filters.workoutTypeId}
                onChange={(e) => setFilters(prev => ({ ...prev, workoutTypeId: e.target.value }))}
                options={[
                  { value: '', label: 'All types' },
                  ...workoutTypes.map(type => ({ value: type.id.toString(), label: type.name }))
                ]}
              />

              <FormField
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />

              <FormField
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />

              <Select
                label="Sort By"
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                options={[
                  { value: 'performedAt', label: 'Date' },
                  { value: 'durationMin', label: 'Duration' },
                  { value: 'calories', label: 'Calories' },
                  { value: 'createdAt', label: 'Created' }
                ]}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleFilterChange} disabled={isLoading}>
                {isLoading ? 'Applying...' : 'Apply Filters'}
              </Button>
              <Select
                value={filters.sortOrder}
                onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                options={[
                  { value: 'desc', label: 'Newest first' },
                  { value: 'asc', label: 'Oldest first' }
                ]}
                className="w-auto" label={''}              />
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Workouts List */}
      <div className="space-y-4">
        {workouts.length === 0 ? (
          <Card>
            <Card.Content className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts found</h3>
              <p className="text-gray-600 mb-4">
                {totalCount === 0 ? 'Start your fitness journey!' : 'Try adjusting your filters'}
              </p>
              <Button variant="primary" onClick={() => window.location.href = '/add-workout'}>
                Add Your First Workout
              </Button>
            </Card.Content>
          </Card>
        ) : (
          workouts.map((workout) => (
            <Card key={workout.id} className="hover:shadow-md transition-shadow">
              <Card.Content>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge color="blue">
                        {workout.workoutType.name}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(workout.performedAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {formatDuration(workout.durationMin)}
                      </div>
                      {workout.calories && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Zap className="w-4 h-4" />
                          {workout.calories} cal
                        </div>
                      )}
                    </div>
                    
                    {workout.notes && (
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {workout.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/workouts/${workout.id}/edit`}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {workouts.length > 0 && workouts.length < totalCount && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoading}
            className="min-w-32"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  )
}