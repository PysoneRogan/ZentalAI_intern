import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { z } from 'zod'
import { callOpenAI, estimateCost } from '@/lib/openai'
import {
  FITNESS_COACH_SYSTEM_PROMPT,
  createWorkoutPlanPrompt,
  validateWorkoutPlan,
} from '@/lib/prompts/fitness-coach'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/user'
import { logAIUsage, checkUserQuota } from '@/lib/ai-monitoring'



// Request validation schema
const PlanRequestSchema = z.object({
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
  equipment: z.array(z.string()).min(1),
  limitations: z.array(z.string()).optional(),
  experience_years: z.number().int().min(0).max(50).optional(),
  preferred_workout_types: z.array(z.string()).optional(),
})

/**
 * POST /api/ai/plan - Generate AI workout plan
 */
export async function POST(request: NextRequest) {
  let appUser: Awaited<ReturnType<typeof getOrCreateUser>> | undefined
  let startTime: number | undefined

  try {
    // Authentication check
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get or create user
    appUser = await getOrCreateUser(session.user)

    // Check user quota before proceeding
    const quotaCheck = await checkUserQuota(appUser.id)
    if (!quotaCheck.canProceed) {
      return NextResponse.json({ error: quotaCheck.reason }, { status: 429 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = PlanRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const userProfile = validationResult.data

    // Log the request for monitoring
    console.log('AI Plan Generation Request:', {
      userId: appUser.id,
      profile: userProfile,
      timestamp: new Date().toISOString(),
    })

    // Create conversation messages
    const messages = [
      {
        role: 'system' as const,
        content: FITNESS_COACH_SYSTEM_PROMPT,
      },
      {
        role: 'user' as const,
        content: createWorkoutPlanPrompt(userProfile),
      },
    ]

    // Call OpenAI API with retry logic
    startTime = Date.now()
    const completion = await callOpenAI(messages, {
      temperature: 0.3, // Lower temperature for consistent fitness advice
      maxTokens: 10000, // Reduced to speed up generation
      retries: 2, // Reduced retries to avoid long waits
      timeout: 60000, // Increased to 60 seconds for generation
    })
    const requestDuration = Date.now() - startTime

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response content from OpenAI')
    }

    // Check if response was truncated
    const finishReason = completion.choices[0]?.finish_reason
    if (finishReason === 'length') {
      console.error('OpenAI response was truncated due to token limit')
      throw new Error('AI response was incomplete. Please try again with fewer requirements.')
    }

    // Parse and validate AI response
    let workoutPlan
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = aiResponse.trim()

      // Remove markdown code blocks
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```json\n?/, '')
        cleanedResponse = cleanedResponse.replace(/^```\n?/, '')
        cleanedResponse = cleanedResponse.replace(/\n?```$/, '')
        cleanedResponse = cleanedResponse.trim()
      }

      // Validate that response looks like valid JSON before parsing
      if (!cleanedResponse.startsWith('{') || !cleanedResponse.endsWith('}')) {
        console.error('Response does not appear to be valid JSON object')
        throw new Error('Invalid JSON format: missing braces')
      }

      let parsedResponse = JSON.parse(cleanedResponse)

      // Unwrap if AI wrapped the response in a "workout_plan" key
      if (parsedResponse.workout_plan && !parsedResponse.title) {
        console.log('Unwrapping workout_plan object')
        parsedResponse = parsedResponse.workout_plan
      }

      const validationResult = validateWorkoutPlan(parsedResponse)

      if (!validationResult.success) {
        console.error('AI Response Validation Failed:', validationResult.errors)
        console.error('Parsed response:', JSON.stringify(parsedResponse, null, 2))
        throw new Error('Invalid AI response format')
      }

      workoutPlan = validationResult.data
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('Raw AI response (first 500 chars):', aiResponse.substring(0, 500))

      // Log to AI usage for debugging
      await logAIUsage({
        userId: appUser.id,
        requestType: 'plan_generation',
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
        cost: estimateCost(
          completion.usage?.prompt_tokens || 0,
          completion.usage?.completion_tokens || 0
        ),
        model: completion.model,
        success: false,
        errorMessage: `Parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
        requestDuration: Date.now() - startTime,
      })

      return NextResponse.json(
        {
          error: 'AI generated invalid response format',
          details: parseError instanceof Error ? parseError.message : 'JSON parse error'
        },
        { status: 500 }
      )
    }

    // Get the first workout type (or default to 1)
    const firstWorkoutType = await prisma.workoutType.findFirst()
    const defaultWorkoutTypeId = firstWorkoutType?.id || 1

    // Save plan to database
    const savedPlan = await prisma.plan.create({
      data: {
        userId: appUser.id,
        title: workoutPlan.title,
        description: workoutPlan.description,
        weekStart: new Date(), // Start from current week
        isActive: true,
        aiGenerated: true,
        aiPromptData: userProfile,
        aiModelVersion: completion.model,
        aiGenerationCost: estimateCost(
          completion.usage?.prompt_tokens || 0,
          completion.usage?.completion_tokens || 0
        ),
        planDays: {
          create: workoutPlan.weeks.flatMap((week) =>
            week.workouts.map((workout) => {
              // Convert day name to day of week number
              const dayMap = {
                sunday: 0,
                monday: 1,
                tuesday: 2,
                wednesday: 3,
                thursday: 4,
                friday: 5,
                saturday: 6,
              }

              return {
                dayOfWeek: dayMap[workout.day as keyof typeof dayMap],
                workoutTypeId: defaultWorkoutTypeId,
                targetDuration: workout.duration_minutes,
                targetCalories: workout.estimated_calories,
                description: workout.description || workout.workout_type,
                aiExerciseData: {
                  week: week.week_number,
                  workoutType: workout.workout_type,
                  exercises: workout.exercises,
                },
                isCompleted: false,
              }
            })
          ),
        },
      },
      include: {
        planDays: true,
      },
    })

    // Log successful generation
    console.log('AI Plan Generated Successfully:', {
      userId: appUser.id,
      planId: savedPlan.id,
      duration: workoutPlan.duration_weeks,
      workoutsPerWeek: workoutPlan.workouts_per_week,
      tokenUsage: completion.usage,
    })

    // Log AI usage for monitoring
    await logAIUsage({
      userId: appUser.id,
      requestType: 'plan_generation',
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
      cost: estimateCost(
        completion.usage?.prompt_tokens || 0,
        completion.usage?.completion_tokens || 0
      ),
      model: completion.model,
      success: true,
      requestDuration,
    })

    // Return the generated plan
    return NextResponse.json(
      {
        success: true,
        plan: {
          id: savedPlan.id,
          title: workoutPlan.title,
          description: workoutPlan.description,
          duration_weeks: workoutPlan.duration_weeks,
          workouts_per_week: workoutPlan.workouts_per_week,
          difficulty_level: workoutPlan.difficulty_level,
          weeks: workoutPlan.weeks,
        },
        metadata: {
          generated_at: new Date().toISOString(),
          token_usage: completion.usage,
          model: completion.model,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('AI Plan Generation Error:', error)

    // Log failed AI usage
    if (appUser) {
      await logAIUsage({
        userId: appUser.id,
        requestType: 'plan_generation',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        requestDuration:
          typeof startTime !== 'undefined' ? Date.now() - startTime : 0,
      })
    }

    // Determine appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('quota exceeded')) {
        return NextResponse.json(
          {
            error:
              'AI service temporarily unavailable. Please try again later.',
          },
          { status: 503 }
        )
      }

      if (error.message.includes('invalid api key')) {
        return NextResponse.json(
          { error: 'AI service configuration error' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate workout plan. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/plan - Get user's active AI-generated plans
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const appUser = await getOrCreateUser(session.user)

    // Fetch user's plans with plan days
    const plans = await prisma.plan.findMany({
      where: {
        userId: appUser.id,
        isActive: true,
        aiGenerated: true,
      },
      include: {
        planDays: {
          orderBy: [{ dayOfWeek: 'asc' }],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(
      {
        success: true,
        plans: plans.map((plan) => ({
          id: plan.id,
          title: plan.title,
          description: plan.description,
          weekStart: plan.weekStart,
          isActive: plan.isActive,
          createdAt: plan.createdAt,
          aiGenerated: plan.aiGenerated,
          planDays: plan.planDays.map((day) => ({
            id: day.id,
            dayOfWeek: day.dayOfWeek,
            targetDuration: day.targetDuration,
            targetCalories: day.targetCalories,
            description: day.description,
            isCompleted: day.isCompleted,
            aiExerciseData: day.aiExerciseData,
          })),
        })),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching AI plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workout plans' },
      { status: 500 }
    )
  }
}
