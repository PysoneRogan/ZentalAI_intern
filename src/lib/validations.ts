import { z } from 'zod'

// Workout creation schema
export const CreateWorkoutSchema = z.object({
  workoutTypeId: z.number().int().positive('Workout type ID must be a positive integer'),
  durationMin: z.number().int().min(1, 'Duration must be at least 1 minute').max(600, 'Duration cannot exceed 10 hours'),
  calories: z.number().int().min(0, 'Calories cannot be negative').max(5000, 'Calories seems unrealistic').optional(),
  performedAt: z.string().datetime('Invalid date format').or(z.date()),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional()
})

// Workout update schema (all fields optional except what we want to require)
export const UpdateWorkoutSchema = z.object({
  workoutTypeId: z.number().int().positive().optional(),
  durationMin: z.number().int().min(1).max(600).optional(),
  calories: z.number().int().min(0).max(5000).optional().nullable(),
  performedAt: z.string().datetime().or(z.date()).optional(),
  notes: z.string().max(1000).optional().nullable()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
)

// Query parameters for listing workouts
export const WorkoutQuerySchema = z.object({
  // Pagination
  page: z.string().optional().default('1').transform((val) => parseInt(val)).pipe(z.number().int().min(1)),
  limit: z.string().optional().default('10').transform((val) => parseInt(val)).pipe(z.number().int().min(1).max(100)),
  
  // Filtering
  workoutTypeId: z.string().transform((val) => parseInt(val)).pipe(z.number().int().positive()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  
  // Sorting
  sortBy: z.enum(['performedAt', 'durationMin', 'calories', 'createdAt']).default('performedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// ID parameter validation
export const IdParamSchema = z.object({
  id: z.string().transform((val) => parseInt(val)).pipe(z.number().int().positive('ID must be a positive integer'))
})

// User ID validation (for later use in authentication)
export const UserIdSchema = z.number().int().positive('User ID must be a positive integer')

// Response schemas (for documentation and type safety)
export const WorkoutResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  workoutTypeId: z.number(),
  durationMin: z.number(),
  calories: z.number().nullable(),
  performedAt: z.date(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  workoutType: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    color: z.string()
  }).optional()
})

export const PaginatedWorkoutsResponseSchema = z.object({
  workouts: z.array(WorkoutResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  })
})

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  details: z.any().optional()
})

// Type exports for use in API routes
export type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>
export type UpdateWorkoutInput = z.infer<typeof UpdateWorkoutSchema>
export type WorkoutQueryParams = z.infer<typeof WorkoutQuerySchema>
export type WorkoutResponse = z.infer<typeof WorkoutResponseSchema>
export type PaginatedWorkoutsResponse = z.infer<typeof PaginatedWorkoutsResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>