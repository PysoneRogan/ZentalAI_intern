import { redirect, notFound } from 'next/navigation'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/user'
import UserNav from '@/components/UserNav'
import EditWorkoutClient from '@/components/EditWorkoutClient'

interface EditWorkoutPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  // Await params for Next.js 15
  const { id } = await params

  // Check authentication
  const session = await getSession()
  if (!session?.user) {
    redirect('/api/auth/login')
  }

  const appUser = await getOrCreateUser(session.user)
  const workoutId = parseInt(id)

  if (isNaN(workoutId)) {
    notFound()
  }

  // Fetch the workout to edit
  const workout = await prisma.workout.findFirst({
    where: {
      id: workoutId,
      userId: appUser.id // Ensure user owns this workout
    },
    include: {
      workoutType: true
    }
  })

  if (!workout) {
    notFound()
  }

  // Fetch workout types for the form
  const workoutTypes = await prisma.workoutType.findMany({
    orderBy: { name: 'asc' }
  })

  // Prepare initial form data
  const initialData = {
    workoutTypeId: workout.workoutTypeId,
    durationMin: workout.durationMin,
    calories: workout.calories || undefined,
    performedAt: workout.performedAt.toISOString().split('T')[0],
    notes: workout.notes || ''
  }

  // Serialize workout data for client
  const serializedWorkout = {
    ...workout,
    performedAt: workout.performedAt.toISOString(),
    createdAt: workout.createdAt.toISOString()
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <EditWorkoutClient 
        workoutTypes={workoutTypes}
        initialData={initialData}
        workoutId={workoutId}
        workout={serializedWorkout}
      />
      
      {/* Keep UserNav in server component for session access */}
      <div className="absolute top-4 right-8 z-10">
        <UserNav />
      </div>
    </div>
  )
}