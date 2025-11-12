import { getDashboardStats, getGoalProgress } from '@/lib/dashboard'
import { StatCard } from './StatCard'
import { Dumbbell, Clock, Flame, Target } from 'lucide-react'

interface DashboardStatsProps {
  userId: number
}

export async function DashboardStats({ userId }: DashboardStatsProps) {
  // Fetch data in parallel
  const [stats, goals] = await Promise.all([
    getDashboardStats(userId),
    getGoalProgress(userId)
  ])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Today"
        value={stats.today.workouts}
        subtitle={`${stats.today.minutes} minutes`}
        icon={<Dumbbell className="h-8 w-8" />}
      />
      
      <StatCard
        title="This Week"
        value={stats.week.workouts}
        subtitle={`${stats.week.minutes} minutes`}
        icon={<Clock className="h-8 w-8" />}
        trend={{
          value: Math.round(((stats.week.workouts / goals.weeklyGoal) - 1) * 100),
          isPositive: stats.week.workouts >= goals.weeklyGoal
        }}
      />
      
      <StatCard
        title="This Month"
        value={stats.month.workouts}
        subtitle={`${stats.month.calories.toLocaleString()} calories`}
        icon={<Flame className="h-8 w-8" />}
        trend={{
          value: Math.round(((stats.month.workouts / goals.monthlyGoal) - 1) * 100),
          isPositive: stats.month.workouts >= goals.monthlyGoal
        }}
      />
      
      <StatCard
        title="Current Streak"
        value={goals.streakDays}
        subtitle={goals.streakDays === 1 ? 'day' : 'days'}
        icon={<Target className="h-8 w-8" />}
      />
    </div>
  )
}

// Loading state component
export function DashboardStatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div 
          key={i}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  )
}