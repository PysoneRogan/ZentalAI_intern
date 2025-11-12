/* eslint-disable @typescript-eslint/no-explicit-any */
import { getRecentWorkouts } from '@/lib/dashboard'
import { formatDistanceToNow } from 'date-fns'
import { Clock, Calendar, Flame,Dumbbell } from'lucide-react'
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react'

interface RecentWorkoutsProps {
  userId: number
}

export async function RecentWorkouts({ userId }: RecentWorkoutsProps) {
  const workouts = await getRecentWorkouts(userId, 5)

  if (workouts.length === 0) {
    return <EmptyWorkoutsState />
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Workouts</h3>
        <p className="text-sm text-gray-500">Your latest fitness activities</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {workouts.map((workout: { id: Key | null | undefined; workoutType: { description: any; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined }; durationMin: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; calories: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; performedAt: string | number | Date; notes: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined }) => (
          <div key={workout.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div 
                  className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: workout.workoutType.description}}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {workout.workoutType.name}
                  </p>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{workout.durationMin} min</span>
                    </span>
                    {workout.calories && (
                      <span className="flex items-center space-x-1">
                        <Flame className="h-4 w-4" />
                        <span>{workout.calories} cal</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDistanceToNow(workout.performedAt, { addSuffix: true })}</span>
                    </span>
                  </div>
                  {workout.notes && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {workout.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <a 
          href="/workouts"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View all workouts →
        </a>
      </div>
    </div>
  )
}

function EmptyWorkoutsState() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Workouts</h3>
      </div>
      
      <div className="px-6 py-12 text-center">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Dumbbell className="h-12 w-12 text-gray-400" />
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">No workouts yet</h4>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Start your fitness journey by logging your first workout!
        </p>
        <a
          href="/add-workout"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Log Your First Workout
        </a>
      </div>
    </div>
  )
}