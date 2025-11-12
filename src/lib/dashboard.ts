import { prisma } from '@/lib/prisma'
import { cache } from 'react'

export interface DashboardStats {
  today: {
    workouts: number
    minutes: number
    calories: number
  }
  week: {
    workouts: number
    minutes: number
    calories: number
  }
  month: {
    workouts: number
    minutes: number
    calories: number
  }
}

export interface WorkoutTrend {
  date: string
  workouts: number
  minutes: number
  calories: number
}

export interface RecentWorkout {
  id: number
  workoutType: {
    name: string
    description: string
  }
  durationMin: number
  calories: number | null
  performedAt: Date
  notes: string | null
}

/**
 * Get dashboard statistics for a user
 * Uses React cache() to dedupe requests within a single render cycle
 */
export const getDashboardStats = cache(async (userId: number): Promise<DashboardStats> => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // Get start of current week (Sunday)
  const weekStart = new Date(todayStart)
  weekStart.setDate(todayStart.getDate() - todayStart.getDay())
  
  // Get start of current month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Execute all queries in parallel for better performance
  const [todayStats, weekStats, monthStats] = await Promise.all([
    // Today's stats
    prisma.workout.aggregate({
      where: {
        userId,
        performedAt: {
          gte: todayStart,
          lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      _count: true,
      _sum: {
        durationMin: true,
        calories: true
      }
    }),
    
    // This week's stats  
    prisma.workout.aggregate({
      where: {
        userId,
        performedAt: {
          gte: weekStart,
          lt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      },
      _count: true,
      _sum: {
        durationMin: true,
        calories: true
      }
    }),
    
    // This month's stats
    prisma.workout.aggregate({
      where: {
        userId,
        performedAt: {
          gte: monthStart,
          lt: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1)
        }
      },
      _count: true,
      _sum: {
        durationMin: true,
        calories: true
      }
    })
  ])

  return {
    today: {
      workouts: todayStats._count,
      minutes: todayStats._sum.durationMin || 0,
      calories: todayStats._sum.calories || 0
    },
    week: {
      workouts: weekStats._count,
      minutes: weekStats._sum.durationMin || 0,
      calories: weekStats._sum.calories || 0
    },
    month: {
      workouts: monthStats._count,
      minutes: monthStats._sum.durationMin || 0,
      calories: monthStats._sum.calories || 0
    }
  }
})

/**
 * Get workout trend data for charts
 */
export const getWorkoutTrend = cache(async (userId: number, days: number = 30): Promise<WorkoutTrend[]> => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  // Use raw SQL for complex date grouping - more efficient than Prisma for this use case
  const trends = await prisma.$queryRaw<Array<{
    date: string
    workouts: bigint
    minutes: bigint | null
    calories: bigint | null
  }>>`
    SELECT 
      DATE(performed_at) as date,
      COUNT(*) as workouts,
      SUM(duration_min) as minutes,
      SUM(calories) as calories
    FROM workouts 
    WHERE user_id = ${userId}
      AND performed_at >= ${startDate}
      AND performed_at <= ${endDate}
    GROUP BY DATE(performed_at)
    ORDER BY date ASC
  `

  // Fill in missing dates with zero values
  const trendMap = new Map()
  trends.forEach(trend => {
    trendMap.set(trend.date, {
      date: trend.date,
      workouts: Number(trend.workouts),
      minutes: Number(trend.minutes) || 0,
      calories: Number(trend.calories) || 0
    })
  })

  // Generate array with all dates in range
  const result: WorkoutTrend[] = []
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    result.push(trendMap.get(dateStr) || {
      date: dateStr,
      workouts: 0,
      minutes: 0,
      calories: 0
    })
  }

  return result
})

/**
 * Get recent workouts for activity feed
 */
export const getRecentWorkouts = cache(async (userId: number, limit: number = 10): Promise<RecentWorkout[]> => {
  const workouts = await prisma.workout.findMany({
    where: { userId },
    include: {
      workoutType: {
        select: {
          name: true,
          description: true
        }
      }
    },
    orderBy: { performedAt: 'desc' },
    take: limit
  })

  return workouts
})

/**
 * Get user's workout goal progress
 */
export interface GoalProgress {
  weeklyGoal: number  // Target workouts per week
  currentWeek: number // Workouts this week
  monthlyGoal: number // Target workouts per month  
  currentMonth: number // Workouts this month
  streakDays: number   // Current daily streak
}

export const getGoalProgress = cache(async (userId: number): Promise<GoalProgress> => {
  // For now, use static goals - in a real app these would be user-configurable
  const weeklyGoal = 4
  const monthlyGoal = 16

  const stats = await getDashboardStats(userId)
  
  // Calculate streak - consecutive days with at least one workout
  const streakDays = await calculateWorkoutStreak(userId)

  return {
    weeklyGoal,
    currentWeek: stats.week.workouts,
    monthlyGoal,
    currentMonth: stats.month.workouts,
    streakDays
  }
})

/**
 * Calculate current workout streak (consecutive days with workouts)
 */
async function calculateWorkoutStreak(userId: number): Promise<number> {
  // Get daily workout counts for the last 90 days
  const last90Days = new Date()
  last90Days.setDate(last90Days.getDate() - 90)

  const dailyCounts = await prisma.$queryRaw<Array<{
    date: string
    count: bigint
  }>>`
    SELECT 
      DATE(performed_at) as date,
      COUNT(*) as count
    FROM workouts 
    WHERE user_id = ${userId}
      AND performed_at >= ${last90Days}
    GROUP BY DATE(performed_at)
    ORDER BY date DESC
  `

  // Convert to map for easy lookup
  const countMap = new Map()
  dailyCounts.forEach(row => {
    countMap.set(row.date, Number(row.count))
  })

  // Calculate streak from today backwards
  let streak = 0
  const today = new Date()
  
  for (let i = 0; i < 90; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]
    
    if (countMap.get(dateStr) > 0) {
      streak++
    } else {
      // Streak broken
      break
    }
  }

  return streak
}