import { redirect } from 'next/navigation'
import { getSession } from '@auth0/nextjs-auth0'
import { getOrCreateUser } from '@/lib/user'
import { prisma } from '@/lib/prisma'
import UserNav from '@/components/UserNav'
import WorkoutsListClient from '@/components/WorkoutsListClient'

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

export default async function WorkoutsPage() {
  // Check authentication
  const session = await getSession()
  if (!session?.user) {
    redirect('/api/auth/login')
  }

  const appUser = await getOrCreateUser(session.user)

  // Fetch workout types for filtering
  const workoutTypes = await prisma.workoutType.findMany({
    orderBy: { name: 'asc' }
  })

  // Fetch initial workouts (first page)
  const initialWorkouts = await prisma.workout.findMany({
    where: { userId: appUser.id },
    include: {
      workoutType: {
        select: {
          id: true,
          name: true,
          description: true
        }
      }
    },
    orderBy: { performedAt: 'desc' },
    take: 10
  })

  // Get total count for pagination
  const totalWorkouts = await prisma.workout.count({
    where: { userId: appUser.id }
  })

  // Serialize dates for JSON
  const serializedWorkouts = initialWorkouts.map(workout => ({
    ...workout,
    performedAt: workout.performedAt.toISOString(),
    createdAt: workout.createdAt.toISOString()
  }))

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a 
                href="/dashboard" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </a>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Workouts</h1>
                <p className="text-sm text-gray-600">{totalWorkouts} total workouts</p>
              </div>
            </div>
            <UserNav />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WorkoutsListClient 
          initialWorkouts={serializedWorkouts}
          workoutTypes={workoutTypes}
          totalCount={totalWorkouts}
          userId={appUser.id}
        />
      </div>
    </div>
  )
}