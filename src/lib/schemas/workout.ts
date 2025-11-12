import { z } from 'zod'

// Base workout schema for client-side validation
export const workoutFormSchema = z.object({
  workoutTypeId: z.string()
    .min(1, 'Please select a workout type')
    .transform((val) => parseInt(val))
    .pipe(z.number().int().positive('Invalid workout type')),
    
  durationMin: z.string()
    .min(1, 'Duration is required')
    .transform((val) => parseInt(val))
    .pipe(z.number()
      .int('Duration must be a whole number')
      .min(1, 'Duration must be at least 1 minute')
      .max(600, 'Duration cannot exceed 10 hours')),
      
  calories: z.string()
    .optional()
    .transform((val) => val === '' || val === undefined ? undefined : parseInt(val))
    .pipe(z.number()
      .int('Calories must be a whole number')
      .min(0, 'Calories cannot be negative')
      .max(5000, 'Calories value seems unrealistic')
      .optional()),
      
  performedAt: z.string()
    .min(1, 'Date is required')
    .refine((date) => {
      const parsedDate = new Date(date)
      const now = new Date()
      return parsedDate <= now
    }, 'Cannot log future workouts'),
    
  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional()
}).refine((data) => {
  // Business rule: Cardio workouts should have calories
  if (data.workoutTypeId === 1 && !data.calories) {
    return false
  }
  return true
}, {
  message: 'Cardio workouts should include calories burned',
  path: ['calories']
})

// Server-side schema for database operations
export const serverWorkoutSchema = z.object({
  workoutTypeId: z.number().int().positive(),
  durationMin: z.number().int().min(1).max(600),
  calories: z.number().int().min(0).max(5000).optional(),
  performedAt: z.date(),
  notes: z.string().max(1000).optional(),
  userId: z.number().int().positive()
})

// Type exports
export type WorkoutFormData = z.infer<typeof workoutFormSchema>
export type ServerWorkoutData = z.infer<typeof serverWorkoutSchema>

// Transform form data for server processing
export function transformWorkoutData(formData: WorkoutFormData, userId: number): ServerWorkoutData {
  return {
    workoutTypeId: formData.workoutTypeId,
    durationMin: formData.durationMin,
    calories: formData.calories,
    performedAt: new Date(formData.performedAt),
    notes: formData.notes,
    userId
  }
}