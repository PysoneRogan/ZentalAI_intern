import { NextRequest, NextResponse } from 'next/server'
import { getWorkoutTrend } from '@/lib/dashboard'
import { getSession } from '@auth0/nextjs-auth0'
import { getOrCreateUser } from '@/lib/user'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await getOrCreateUser(session.user)
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const userId = user.id

    // Validate days parameter
    if (days < 1 || days > 365) {
      return NextResponse.json({ error: 'Invalid days parameter' }, { status: 400 })
    }

    // Fetch trend data
    const trends = await getWorkoutTrend(userId, days)

    return NextResponse.json(trends)
  } catch (error) {
    console.error('Dashboard trends API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}