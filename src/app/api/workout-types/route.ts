import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError, serializeDates } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

/**
 * GET /api/workout-types - List all workout types
 */
export async function GET(request: NextRequest) {
  try {
    const workoutTypes = await prisma.workoutType.findMany({
      orderBy: { name: 'asc' }
    })
    
    const serializedWorkoutTypes = serializeDates(workoutTypes)
    
    return Response.json(serializedWorkoutTypes, { status: 200 })
    
  } catch (error) {
    console.error('Error fetching workout types:', error)
    return handlePrismaError(error)
  }
}