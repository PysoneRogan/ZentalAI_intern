'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/user'
import { workoutFormSchema, transformWorkoutData } from '@/lib/schemas/workout'
import { z } from 'zod'

export type ActionResult = {
  success: boolean
  message?: string
  errors?: Record<string, string[]>
  data?: unknown
}

export async function createWorkoutAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Get authenticated user
    const session = await getSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'Authentication required'
      }
    }

    const appUser = await getOrCreateUser(session.user)

    // Extract form data
    const rawData = {
      workoutTypeId: formData.get('workoutTypeId')?.toString() || '',
      durationMin: formData.get('durationMin')?.toString() || '',
      calories: formData.get('calories')?.toString() || '',
      performedAt: formData.get('performedAt')?.toString() || '',
      notes: formData.get('notes')?.toString() || ''
    }

    // Validate form data
    const validationResult = workoutFormSchema.safeParse(rawData)
    
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Please correct the errors below',
        errors: validationResult.error.flatten().fieldErrors
      }
    }

    // Transform for database
    const workoutData = transformWorkoutData(validationResult.data, appUser.id)

    // Check if workout type exists
    const workoutType = await prisma.workoutType.findUnique({
      where: { id: workoutData.workoutTypeId }
    })

    if (!workoutType) {
      return {
        success: false,
        message: 'Invalid workout type selected'
      }
    }

    // Create workout in database
    const workout = await prisma.workout.create({
      data: workoutData,
      include: {
        workoutType: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    })

    // Revalidate cached pages
    revalidatePath('/dashboard')
    revalidatePath('/workouts')

    return {
      success: true,
      message: `${workoutType.name} workout logged successfully!`,
      data: workout
    }

  } catch (error) {
    console.error('Error creating workout:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validation failed',
        errors: error.flatten().fieldErrors
      }
    }

    return {
      success: false,
      message: 'Failed to create workout. Please try again.'
    }
  }
}

export async function updateWorkoutAction(
  workoutId: number,
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Get authenticated user
    const session = await getSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'Authentication required'
      }
    }

    const appUser = await getOrCreateUser(session.user)

    // Check ownership
    const existingWorkout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId: appUser.id
      }
    })

    if (!existingWorkout) {
      return {
        success: false,
        message: 'Workout not found or access denied'
      }
    }

    // Validate and transform data (same as create)
    const rawData = {
      workoutTypeId: formData.get('workoutTypeId')?.toString() || '',
      durationMin: formData.get('durationMin')?.toString() || '',
      calories: formData.get('calories')?.toString() || '',
      performedAt: formData.get('performedAt')?.toString() || '',
      notes: formData.get('notes')?.toString() || ''
    }

    const validationResult = workoutFormSchema.safeParse(rawData)
    
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Please correct the errors below',
        errors: validationResult.error.flatten().fieldErrors
      }
    }

    const workoutData = transformWorkoutData(validationResult.data, appUser.id)

    // Update workout
    const updatedWorkout = await prisma.workout.update({
      where: { id: workoutId },
      data: {
        workoutTypeId: workoutData.workoutTypeId,
        durationMin: workoutData.durationMin,
        calories: workoutData.calories,
        performedAt: workoutData.performedAt,
        notes: workoutData.notes
      },
      include: {
        workoutType: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    })

    // Revalidate cached pages
    revalidatePath('/dashboard')
    revalidatePath('/workouts')
    revalidatePath(`/workouts/${workoutId}`)

    return {
      success: true,
      message: 'Workout updated successfully!',
      data: updatedWorkout
    }

  } catch (error) {
    console.error('Error updating workout:', error)
    return {
      success: false,
      message: 'Failed to update workout. Please try again.'
    }
  }
}

export async function deleteWorkoutAction(workoutId: number): Promise<ActionResult> {
  try {
    // Get authenticated user
    const session = await getSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'Authentication required'
      }
    }

    const appUser = await getOrCreateUser(session.user)

    // Check ownership and delete
    const deletedWorkout = await prisma.workout.deleteMany({
      where: {
        id: workoutId,
        userId: appUser.id
      }
    })

    if (deletedWorkout.count === 0) {
      return {
        success: false,
        message: 'Workout not found or access denied'
      }
    }

    // Revalidate cached pages
    revalidatePath('/dashboard')
    revalidatePath('/workouts')

    return {
      success: true,
      message: 'Workout deleted successfully'
    }

  } catch (error) {
    console.error('Error deleting workout:', error)
    return {
      success: false,
      message: 'Failed to delete workout. Please try again.'
    }
  }
}