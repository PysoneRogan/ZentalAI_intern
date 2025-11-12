import { redirect } from 'next/navigation'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import UserNav from '@/components/UserNav'
import AddWorkoutClient from '@/components/AddWorkoutClient'

export const dynamic = "force-dynamic";

export default async function AddWorkoutPage() {
  let session = null
  try {
    session = await getSession()
  } catch (error) {
    console.log('Session check failed:', error)
  }
  
  if (!session?.user) {
    redirect('/api/auth/login?returnTo=/add-workout')
  }

  // Fetch workout types for the form
  const workoutTypes = await prisma.workoutType.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <AddWorkoutClient workoutTypes={workoutTypes} />
      
      {/* Keep UserNav in server component for session access */}
      <div className="absolute top-4 right-8 z-10">
        <UserNav />
      </div>
    </div>
  )
}