import { redirect } from 'next/navigation'
import { getSession } from '@auth0/nextjs-auth0'
import { getOrCreateUser } from '@/lib/user'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PlanDetailPage({ params }: PageProps) {
  const session = await getSession()

  if (!session?.user) {
    redirect('/api/auth/login?returnTo=/plans')
  }

  const appUser = await getOrCreateUser(session.user)
  const { id } = await params

  // Fetch the plan with all details
  const plan = await prisma.plan.findFirst({
    where: {
      id: parseInt(id),
      userId: appUser.id,
    },
    include: {
      planDays: {
        orderBy: { dayOfWeek: 'asc' },
      },
    },
  })

  if (!plan) {
    redirect('/ai-coach')
  }

  // Group plan days by week
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link
            href="/ai-coach"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to AI Coach
          </Link>
        </div>

        {/* Plan Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {plan.title}
              </h1>
              {plan.description && (
                <p className="text-lg text-gray-600 mb-4">{plan.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {plan.planDays.length} workouts
                </span>
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Created {new Date(plan.createdAt).toLocaleDateString()}
                </span>
                {plan.aiGenerated && (
                  <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                    AI Generated
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Workouts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Workout Schedule</h2>

          {plan.planDays.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-500">No workouts scheduled for this plan.</p>
            </div>
          ) : (
            plan.planDays.map((day) => {
              const exerciseData = day.aiExerciseData as unknown

              return (
                <div
                  key={day.id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {dayNames[day.dayOfWeek]}
                        {exerciseData?.week && (
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            Week {exerciseData.week}
                          </span>
                        )}
                      </h3>
                      {day.description && (
                        <p className="text-gray-600 mt-1">{day.description}</p>
                      )}
                      {exerciseData?.workoutType && (
                        <p className="text-sm text-gray-500 mt-1">
                          {exerciseData.workoutType}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {day.targetDuration && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">{day.targetDuration}</span> min
                        </p>
                      )}
                      {day.targetCalories && (
                        <p className="text-sm text-gray-500">
                          ~{day.targetCalories} cal
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Exercises */}
                  {exerciseData?.exercises && exerciseData.exercises.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="font-semibold text-gray-800">Exercises:</h4>
                      <div className="space-y-4">
                        {exerciseData.exercises.map((exercise: unknown, idx: number) => (
                          <div
                            key={idx}
                            className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900">
                                  {idx + 1}. {exercise.name}
                                </h5>
                                {exercise.category && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {exercise.category}
                                  </p>
                                )}
                              </div>
                              <div className="text-right text-sm text-gray-600">
                                {exercise.sets && exercise.reps && (
                                  <p>
                                    {exercise.sets} sets × {exercise.reps} reps
                                  </p>
                                )}
                                {exercise.rest_seconds && (
                                  <p className="text-xs text-gray-500">
                                    Rest: {exercise.rest_seconds}s
                                  </p>
                                )}
                              </div>
                            </div>

                            {exercise.form_cues && exercise.form_cues.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-semibold text-gray-700 mb-1">
                                  Form Tips:
                                </p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {exercise.form_cues.map((cue: string, cueIdx: number) => (
                                    <li key={cueIdx} className="flex items-start">
                                      <span className="mr-2">•</span>
                                      <span>{cue}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {exercise.notes && (
                              <p className="text-xs text-gray-600 mt-2 italic">
                                {exercise.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

