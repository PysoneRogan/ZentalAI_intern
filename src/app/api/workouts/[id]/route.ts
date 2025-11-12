import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  UpdateWorkoutSchema, 
  IdParamSchema 
} from '@/lib/validations'
import { 
  validateRequestBody, 
  validateParams, 
  createErrorResponse, 
  handlePrismaError,
  serializeDates 
} from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

/**
 * GET /api/workouts/[id] - Get a specific workout
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate route parameters
    const validation = validateParams(params, IdParamSchema)
    if (!validation.success) {
      return validation.error
    }
    
    const { id } = validation.data
    
    // Find the workout
    const workout = await prisma.workout.findUnique({
      where: { 
        id,
        userId: 1 // For now, using demo user. In real app, get from auth
      },
      include: {
        workoutType: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    if (!workout) {
      return createErrorResponse(
        'Not Found',
        `Workout with ID ${id} not found`,
        404
      )
    }
    
    // Serialize dates for JSON response
    const serializedWorkout = serializeDates(workout)
    
    return Response.json(serializedWorkout, { status: 200 })
    
  } catch (error) {
    console.error('Error fetching workout:', error)
    return handlePrismaError(error)
  }
}

/**
 * PATCH /api/workouts/[id] - Update a specific workout
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate route parameters
    const paramValidation = validateParams(params, IdParamSchema)
    if (!paramValidation.success) {
      return paramValidation.error
    }
    
    const { id } = paramValidation.data
    
    // Validate request body
    const bodyValidation = await validateRequestBody(request, UpdateWorkoutSchema)
    if (!bodyValidation.success) {
      return bodyValidation.error
    }
    
    const updateData = bodyValidation.data
    
    // Convert performedAt to Date if it's a string
    if (updateData.performedAt && typeof updateData.performedAt === 'string') {
      updateData.performedAt = new Date(updateData.performedAt)
    }
    
    // Check if workout exists and belongs to user
    const existingWorkout = await prisma.workout.findUnique({
      where: { 
        id,
        userId: 1 // For now, using demo user. In real app, get from auth
      }
    })
    
    if (!existingWorkout) {
      return createErrorResponse(
        'Not Found',
        `Workout with ID ${id} not found`,
        404
      )
    }
    
    // If updating workoutTypeId, verify it exists
    if (updateData.workoutTypeId) {
      const workoutType = await prisma.workoutType.findUnique({
        where: { id: updateData.workoutTypeId }
      })
      
      if (!workoutType) {
        return createErrorResponse(
          'Bad Request',
          `Workout type with ID ${updateData.workoutTypeId} does not exist`,
          400
        )
      }
    }
    
    // Update the workout
    const updatedWorkout = await prisma.workout.update({
      where: { id },
      data: updateData,
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
    const serializedWorkout = serializeDates(updatedWorkout)
    
    return Response.json(serializedWorkout, { status: 200 })
    
  } catch (error) {
    console.error('Error updating workout:', error)
    return handlePrismaError(error)
  }
}

/**
 * DELETE /api/workouts/[id] - Delete a specific workout
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate route parameters
    const validation = validateParams(params, IdParamSchema)
    if (!validation.success) {
      return validation.error
    }
    
    const { id } = validation.data
    
    // Check if workout exists and belongs to user
    const existingWorkout = await prisma.workout.findUnique({
      where: { 
        id,
        userId: 1 // For now, using demo user. In real app, get from auth
      }
    })
    
    if (!existingWorkout) {
      return createErrorResponse(
        'Not Found',
        `Workout with ID ${id} not found`,
        404
      )
    }
    
    // Delete the workout
    await prisma.workout.delete({
      where: { id }
    })
    
    // Return 204 No Content for successful deletion
    return new Response(null, { status: 204 })
    
  } catch (error) {
    console.error('Error deleting workout:', error)
    return handlePrismaError(error)
  }
}
