'use client'

import WorkoutForm from '@/components/WorkoutForm'
import Button from '@/components/Button'
import { ArrowLeft } from 'lucide-react'

interface WorkoutType {
  id: number
  name: string
  description: string
}

interface AddWorkoutClientProps {
  workoutTypes: WorkoutType[]
}

export default function AddWorkoutClient({ workoutTypes }: AddWorkoutClientProps) {
  const handleSuccess = () => {
    // Redirect to dashboard after successful creation
    window.location.href = '/dashboard?success=workout-created'
  }

  const handleBack = () => {
    window.history.back()
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Add Workout</h1>
                <p className="text-sm text-gray-600">Log your fitness activity</p>
              </div>
            </div>
            {/* Placeholder for UserNav - will be positioned by server component */}
            <div id="user-nav-placeholder"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WorkoutForm 
          workoutTypes={workoutTypes}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  )
}