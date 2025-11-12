import { z } from 'zod'

// Zod schema for workout plan validation - LENIENT VERSION
export const WorkoutPlanSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  duration_weeks: z.number().int().min(1).max(12),
  workouts_per_week: z.number().int().min(1).max(7),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']),
  weeks: z.array(
    z.object({
      week_number: z.number().int().min(1),
      focus: z.string().optional(),
      workouts: z.array(
        z.object({
          day: z.enum([
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
          ]),
          workout_type: z.string().optional(),
          duration_minutes: z.number().int().min(10).max(180).optional(),
          estimated_calories: z.number().int().optional(),
          description: z.string().optional(),
          exercises: z.array(
            z.object({
              name: z.string().min(1),
              category: z.string().optional(),
              sets: z.number().int().min(1).max(20).optional(),
              reps: z.string().optional(),
              rest_seconds: z.number().int().optional(),
              notes: z.string().optional(),
              form_cues: z.array(z.string()).optional(),
            })
          ).min(1).max(10), // Allow up to 10 exercises but expect 4-6
        })
      ).min(1),
    })
  ).min(1).max(2), // Expect 2 weeks max
})

export type WorkoutPlan = z.infer<typeof WorkoutPlanSchema>

// User profile schema for personalization
export const UserProfileSchema = z.object({
  fitness_level: z.enum(['beginner', 'intermediate', 'advanced']),
  primary_goal: z.enum([
    'weight_loss',
    'muscle_building',
    'strength',
    'endurance',
    'general_fitness',
  ]),
  available_days: z.number().int().min(1).max(7),
  session_duration: z.number().int().min(15).max(120),
  equipment: z.array(z.string()),
  limitations: z.array(z.string()).optional(),
  experience_years: z.number().int().min(0).max(50).optional(),
  preferred_workout_types: z.array(z.string()).optional(),
})

export type UserProfile = z.infer<typeof UserProfileSchema>

// System prompt for fitness coaching - SIMPLIFIED FOR SPEED
export const FITNESS_COACH_SYSTEM_PROMPT = `You are FitCoach AI, an expert fitness trainer. Generate workout plans quickly and efficiently.

Key Rules:
- Prioritize safety and proper form
- Create progressive, sustainable programs
- Use clear, common exercise names
- Keep responses concise

CRITICAL OUTPUT REQUIREMENTS:
- Return ONLY valid JSON (no markdown, no code blocks, no backticks, no explanations)
- Response must start with { and end with }
- Use exact key names as shown in the schema
- Always include ALL required fields in the EXACT order shown
- Use consistent property ordering throughout
- All day names MUST be lowercase: "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
- All difficulty levels MUST be lowercase: "beginner", "intermediate", "advanced"
- String values must use double quotes
- Numbers must be integers (no decimals) for sets, reps range, duration_minutes, estimated_calories
- Arrays must be properly formatted with square brackets
- No trailing commas
- Follow the exact schema structure provided`

// Function to create personalized prompts
export function createWorkoutPlanPrompt(userProfile: UserProfile): string {
  const equipmentList =
    userProfile.equipment.length > 0
      ? userProfile.equipment.join(', ')
      : 'bodyweight only'

  const limitations =
    userProfile.limitations && userProfile.limitations.length > 0
      ? `Limitations to consider: ${userProfile.limitations.join(', ')}`
      : 'No reported limitations'

  return `Create a ${userProfile.primary_goal} focused workout plan for this user:

USER PROFILE:
- Fitness Level: ${userProfile.fitness_level}
- Primary Goal: ${userProfile.primary_goal}
- Available Days: ${userProfile.available_days} days per week
- Session Duration: ${userProfile.session_duration} minutes per workout
- Available Equipment: ${equipmentList}
- ${limitations}
- Experience: ${userProfile.experience_years || 0} years

REQUIREMENTS:
1. Create a 2-week starter plan (simplified for speed)
2. Use exactly ${userProfile.available_days} workout days per week
3. Each workout must be ${userProfile.session_duration} minutes or less
4. Only use available equipment: ${equipmentList}
5. Include 4-6 exercises per workout (keep it concise)
6. Provide 1-2 clear, brief form cues per exercise
7. Account for ${userProfile.fitness_level} fitness level
8. Keep all descriptions brief and actionable

WORKOUT STRUCTURE:
- Week 1: Foundation building
- Week 2: Intensity increase

EXERCISE SELECTION:
- Choose compound movements when possible
- Include both strength and conditioning elements
- Ensure balanced muscle group training
- Provide modifications for ${userProfile.fitness_level} level

MANDATORY JSON STRUCTURE (follow EXACTLY in this ORDER):
{
  "title": "string (plan name)",
  "description": "string (brief overview)",
  "duration_weeks": 2,
  "workouts_per_week": ${userProfile.available_days},
  "difficulty_level": "${userProfile.fitness_level}",
  "weeks": [
    {
      "week_number": 1,
      "focus": "string (week theme)",
      "workouts": [
        {
          "day": "lowercase day name (monday, tuesday, etc)",
          "workout_type": "string (e.g., Full Body, Upper Body)",
          "duration_minutes": integer,
          "estimated_calories": integer,
          "description": "string (brief workout description)",
          "exercises": [
            {
              "name": "string (exercise name)",
              "category": "string (muscle group)",
              "sets": integer,
              "reps": "string (e.g., 10-12 or 30 seconds)",
              "rest_seconds": integer,
              "notes": "string (optional modifications)",
              "form_cues": ["string", "string"]
            }
          ]
        }
      ]
    },
    {
      "week_number": 2,
      "focus": "string (week theme)",
      "workouts": [same structure as week 1]
    }
  ]
}

CONSISTENCY RULES (CRITICAL):
1. Property order MUST match the structure above exactly
2. Every workout MUST have: day, workout_type, duration_minutes, estimated_calories, description, exercises
3. Every exercise MUST have: name, category, sets, reps, rest_seconds, notes, form_cues
4. form_cues MUST always be an array with 1-2 strings
5. Day names MUST be lowercase (monday, not Monday)
6. Use the same day naming throughout (if you start with "monday", continue with "monday")
7. Workout distribution: spread across the week evenly
8. Keep JSON structure flat (no nested "workout_plan" wrapper)

OUTPUT FORMAT:
- Start response with {
- End response with }
- NO markdown formatting
- NO code block syntax (\`\`\`json)
- NO explanatory text before or after JSON
- NO extra whitespace or line breaks outside JSON structure
- Return ONLY the pure JSON object`

}

// Validation function with user-friendly error messages
export function validateWorkoutPlan(
  data: unknown
):
  | { success: true; data: WorkoutPlan }
  | { success: false; errors: string[] } {
  try {
    const validatedData = WorkoutPlanSchema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors?.map((err) => {
        const path = err.path.join('.')
        return `${path}: ${err.message}`
      }) || ['Unknown validation error']
      return { success: false, errors }
    }
    return { success: false, errors: ['Invalid workout plan format'] }
  }
}
