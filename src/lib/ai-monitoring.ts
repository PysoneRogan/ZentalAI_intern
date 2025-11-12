import { prisma } from './prisma'

export interface AIUsageMetrics {
  userId: number
  requestType: 'plan_generation' | 'plan_modification' | 'exercise_suggestion'
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  model: string
  success: boolean
  errorMessage?: string
  requestDuration: number
}

export async function logAIUsage(metrics: AIUsageMetrics): Promise<void> {
  try {
    await prisma.aIUsageLog.create({
      data: {
        userId: metrics.userId,
        requestType: metrics.requestType,
        promptTokens: metrics.promptTokens,
        completionTokens: metrics.completionTokens,
        totalTokens: metrics.totalTokens,
        cost: metrics.cost,
        model: metrics.model,
        success: metrics.success,
        errorMessage: metrics.errorMessage,
        requestDuration: metrics.requestDuration,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('Failed to log AI usage:', error)
  }
}

export async function getUserAIUsage(userId: number, days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const usage = await prisma.aIUsageLog.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  })

  const totalCost = usage.reduce(
    (sum, log) => sum + parseFloat(log.cost.toString()),
    0
  )
  const totalTokens = usage.reduce((sum, log) => sum + log.totalTokens, 0)
  const successRate =
    usage.length > 0
      ? (usage.filter((log) => log.success).length / usage.length) * 100
      : 0

  return {
    usage,
    totalCost,
    totalTokens,
    successRate,
    requestCount: usage.length,
  }
}

export async function checkUserQuota(
  userId: number
): Promise<{ canProceed: boolean; reason?: string }> {
  const dailyUsage = await getUserAIUsage(userId, 1)
  const monthlyUsage = await getUserAIUsage(userId, 30)

  // Define quota limits
  const DAILY_REQUEST_LIMIT = 10
  const MONTHLY_COST_LIMIT = 5.0 // $5 per month
  const DAILY_TOKEN_LIMIT = 50000

  if (dailyUsage.requestCount >= DAILY_REQUEST_LIMIT) {
    return { canProceed: false, reason: 'Daily request limit exceeded' }
  }

  if (monthlyUsage.totalCost >= MONTHLY_COST_LIMIT) {
    return { canProceed: false, reason: 'Monthly cost limit exceeded' }
  }

  if (dailyUsage.totalTokens >= DAILY_TOKEN_LIMIT) {
    return { canProceed: false, reason: 'Daily token limit exceeded' }
  }

  return { canProceed: true }
}

export async function getAIAnalytics(days: number = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const logs = await prisma.aIUsageLog.findMany({
    where: {
      timestamp: {
        gte: startDate,
      },
    },
  })

  const analytics = {
    totalRequests: logs.length,
    successfulRequests: logs.filter((log) => log.success).length,
    failedRequests: logs.filter((log) => !log.success).length,
    totalCost: logs.reduce(
      (sum, log) => sum + parseFloat(log.cost.toString()),
      0
    ),
    totalTokens: logs.reduce((sum, log) => sum + log.totalTokens, 0),
    averageRequestDuration:
      logs.length > 0
        ? logs.reduce((sum, log) => sum + log.requestDuration, 0) /
          logs.length
        : 0,
    requestsByType: logs.reduce(
      (acc, log) => {
        acc[log.requestType] = (acc[log.requestType] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    ),
    modelUsage: logs.reduce(
      (acc, log) => {
        acc[log.model] = (acc[log.model] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    ),
  }

  return analytics
}
