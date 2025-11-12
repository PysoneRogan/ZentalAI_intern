import { getSession } from '@auth0/nextjs-auth0'
import { redirect } from 'next/navigation'
import Button from '@/components/Button'
import Link from "next/link";

export default async function HomePage() {
  const session = await getSession()
  
  // If user is authenticated, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">FitTrack</h1>
          <p className="text-gray-600">Track your fitness journey and achieve your goals</p>
        </div>
        
        {/* Features */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              🏋️
            </div>
            <div>
              <p className="font-medium text-gray-900">Track Workouts</p>
              <p className="text-sm text-gray-600">Log exercises, sets, and progress</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              📊
            </div>
            <div>
              <p className="font-medium text-gray-900">View Statistics</p>
              <p className="text-sm text-gray-600">Monitor your fitness journey</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              🤖
            </div>
            <div>
              <p className="font-medium text-gray-900">AI Coaching</p>
              <p className="text-sm text-gray-600">Get personalized recommendations</p>
            </div>
          </div>
        </div>
        
        {/* Auth Buttons */}
        <div className="space-y-3">
          <Link href="/api/auth/login" className="w-full">
            <Button variant="primary" size="lg" className="w-full">
              Sign In with Auth0
            </Button>
          </Link>
          
          <p className="text-xs text-gray-500">
            Secure authentication powered by Auth0
          </p>
        </div>
      </div>
    </div>
  )
}