import { NextRequest } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/user'
import { 
  CreateWorkoutSchema, 
  WorkoutQuerySchema, 
  PaginatedWorkoutsResponse 
} from '@/lib/validations'
import { 
  validateRequestBody, 
  validateSearchParams, 
  createErrorResponse, 
  handlePrismaError, 
  calculatePagination,
  serializeDates 
} from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

/**
 * GET /api/workouts - List user's workouts with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getSession()
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'Authentication required', 401)
    }

    const appUser = await getOrCreateUser(session.user)
    
    const { searchParams } = new URL(request.url)
    
    // Validate query parameters
    const validation = validateSearchParams(searchParams, WorkoutQuerySchema)
    if (!validation.success) {
      return validation.error
    }
    
    const { page, limit, workoutTypeId, startDate, endDate, sortBy, sortOrder } = validation.data
    
    // Build where clause for filtering (scoped to authenticated user)
    const where: unknown = {
      userId: appUser.id // Row-level security: only user's workouts
    }
    
    // Add workout type filter
    if (workoutTypeId) {
      where.workoutTypeId = workoutTypeId
    }
    
    // Add date range filter
    if (startDate || endDate) {
      where.performedAt = {}
      if (startDate) {
        where.performedAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.performedAt.lte = new Date(endDate)
      }
    }
    
    // Calculate pagination offset
    const skip = (page - 1) * limit
    
    // Build order by clause
    const orderBy: unknown = {}
    orderBy[sortBy] = sortOrder
    
    // Execute queries in parallel for better performance
    const [workouts, total] = await Promise.all([
      prisma.workout.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          workoutType: {
            select: {
              id: true,
              name: true,
              description: true,
              color: true
            }
          }
        }
      }),
      prisma.workout.count({ where })
    ])
    
    // Calculate pagination metadata
    const pagination = calculatePagination(page, limit, total)
    
    // Serialize dates for JSON response
    const serializedWorkouts = serializeDates(workouts)
    
    const response: PaginatedWorkoutsResponse = {
      workouts: serializedWorkouts,
      pagination
    }
    
    return Response.json(response, { status: 200 })
    
  } catch (error) {
    console.error('Error fetching workouts:', error)
    return handlePrismaError(error)
  }
}

/**
 * POST /api/workouts - Create a new workout for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getSession()
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'Authentication required', 401)
    }

    const appUser = await getOrCreateUser(session.user)
    
    // Validate request body
    const validation = await validateRequestBody(request, CreateWorkoutSchema)
    if (!validation.success) {
      return validation.error
    }
    
    const { workoutTypeId, durationMin, calories, performedAt, notes } = validation.data
    
    // Convert performedAt to Date if it's a string
    const performedAtDate = typeof performedAt === 'string' 
      ? new Date(performedAt) 
      : performedAt
    
    // Verify workout type exists
    const workoutType = await prisma.workoutType.findUnique({
      where: { id: workoutTypeId }
    })
    
    if (!workoutType) {
      return createErrorResponse(
        'Bad Request',
        `Workout type with ID ${workoutTypeId} does not exist`,
        400
      )
    }
    
    // Create the workout for authenticated user
    const workout = await prisma.workout.create({
      data: {
        userId: appUser.id, // Use authenticated user's ID
        workoutTypeId,
        durationMin,
        calories,
        performedAt: performedAtDate,
        notes
      },
      include: {
        workoutType: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true
          }
        }
      }
    })
    
    // Serialize dates for JSON response
    const serializedWorkout = serializeDates(workout)
    
    return Response.json(serializedWorkout, { status: 201 })
    
  } catch (error) {
    console.error('Error creating workout:', error)
    return handlePrismaError(error)
  }
}