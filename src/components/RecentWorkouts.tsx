'use client'

import { useState, useEffect, useCallback } from 'react'
// import { useInView } from 'react-intersection-observer'
import { Calendar, Clock, Zap, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { formatDate, formatDuration, cn } from '@/lib/utils'
import { deleteWorkoutAction } from '@/app/actions/workout'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { showToast } from '@/components/ui/Toast'

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
    color: string
  }
}

interface RecentWorkoutsProps {
  initialWorkouts: Workout[]
  hasMore: boolean
  userId: number
}

export default function RecentWorkouts({ 
  initialWorkouts, 
  hasMore: initialHasMore,
  userId 
}: RecentWorkoutsProps) {
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)

  // Intersection observer for infinite scroll
  const ref = null
  const inView = false

  // Load more workouts
  const loadMoreWorkouts = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/workouts?page=${page + 1}&limit=10`)
      
      if (response.ok) {
        const data = await response.json()
        setWorkouts(prev => [...prev, ...data.workouts])
        setHasMore(data.pagination.hasNext)
        setPage(prev => prev + 1)
      }
    } catch (error) {
      console.error('Failed to load more workouts:', error)
      showToast.error('Failed to load more workouts')
    } finally {
      setIsLoading(false)
    }
  }, [page, hasMore, isLoading])

  // Trigger load more when in view
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMoreWorkouts()
    }
  }, [inView, hasMore, isLoading, loadMoreWorkouts])

  // Handle workout deletion with optimistic UI
  const handleDeleteWorkout = async (workoutId: number) => {
    if (!confirm('Are you sure you want to delete this workout?')) {
      return
    }

    // Optimistic update
    const originalWorkouts = workouts
    setWorkouts(prev => prev.filter(w => w.id !== workoutId))
    
    try {
      const result = await deleteWorkoutAction(workoutId)
      
      if (result.success) {
        showToast.success(result.message || 'Workout deleted successfully')
      } else {
        // Revert optimistic update
        setWorkouts(originalWorkouts)
        showToast.error(result.message || 'Failed to delete workout')
      }
    } catch (error) {
      // Revert optimistic update
      setWorkouts(originalWorkouts)
      showToast.error('Failed to delete workout')
    }
  }

  const getWorkoutTypeColor = (workoutType: Workout['workoutType']) => {
    switch (workoutType.name.toLowerCase()) {
      case 'cardio':
      case 'running':
      case 'cycling':
        return 'success'
      case 'strength':
        return 'info'
      case 'yoga':
        return 'warning'
      default:
        return 'default'
    }
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts yet</h3>
        <p className="text-gray-600 mb-4">Start your fitness journey by logging your first workout!</p>
        <Button variant="primary">
          <a href="/add-workout" className="no-underline text-white">
            Add Your First Workout
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout, index) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          onDelete={() => handleDeleteWorkout(workout.id)}
          isOptimistic={false}
        />
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            Loading more workouts...
          </div>
        </div>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && !isLoading && (
        <div ref={ref} className="h-4" />
      )}

      {/* End of list indicator */}
      {!hasMore && workouts.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>You have reached the end of your workout history!</p>
        </div>
      )}
    </div>
  )
}

interface WorkoutCardProps {
  workout: Workout
  onDelete: () => void
  isOptimistic?: boolean
}

function WorkoutCard({ workout, onDelete, isOptimistic = false }: WorkoutCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className={cn(
      "group relative bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200",
      isOptimistic && "opacity-60 animate-pulse"
    )}>
      <div className="flex items-start justify-between">
        {/* Workout Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Badge 
              color="blue"
            >
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

        {/* Actions Menu */}
        {!isOptimistic && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {showMenu && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="py-1">
                    <a
                      href={`/workouts/${workout.id}/edit`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </a>
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        onDelete()
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Hook for managing optimistic workout updates
export function useOptimisticWorkouts(initialWorkouts: Workout[]) {
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts)

  const addOptimisticWorkout = (workoutData: Partial<Workout>) => {
    const optimisticWorkout: Workout = {
      id: Date.now(), // Temporary ID
      workoutTypeId: workoutData.workoutTypeId!,
      durationMin: workoutData.durationMin!,
      calories: workoutData.calories || null,
      performedAt: workoutData.performedAt!,
      notes: workoutData.notes || null,
      createdAt: new Date().toISOString(),
      workoutType: workoutData.workoutType!
    }

    setWorkouts(prev => [optimisticWorkout, ...prev])
    return optimisticWorkout.id
  }

  const removeOptimisticWorkout = (tempId: number) => {
    setWorkouts(prev => prev.filter(w => w.id !== tempId))
  }

  const updateWithRealWorkout = (tempId: number, realWorkout: Workout) => {
    setWorkouts(prev => 
      prev.map(w => w.id === tempId ? realWorkout : w)
    )
  }

  return {
    workouts,
    addOptimisticWorkout,
    removeOptimisticWorkout,
    updateWithRealWorkout
  }
}