'use client'

import WorkoutForm from '@/components/WorkoutForm'
import Button from '@/components/Button'
import { ArrowLeft } from 'lucide-react'
import { WorkoutFormData } from '@/lib/schemas/workout'

interface WorkoutType {
  id: number
  name: string
  description: string
}

interface Workout {
  id: number
  workoutTypeId: number
  durationMin: number
  calories: number | null
  performedAt: string
  notes: string | null
  createdAt: string
  workoutType: {
    id: number
    name: string
    description: string
  }
}

interface EditWorkoutClientProps {
  workoutTypes: WorkoutType[]
  initialData: Partial<WorkoutFormData>
  workoutId: number
  workout: Workout
}

export default function EditWorkoutClient({ 
  workoutTypes, 
  initialData, 
  workoutId, 
  workout 
}: EditWorkoutClientProps) {
  const handleSuccess = () => {
    // Redirect to workouts list after successful update
    window.location.href = '/workouts?success=workout-updated'
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
                <h1 className="text-xl font-semibold text-gray-900">Edit Workout</h1>
                <p className="text-sm text-gray-600">
                  {workout.workoutType.name} • {new Date(workout.performedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WorkoutForm 
          workoutTypes={workoutTypes}
          initialData={initialData}
          workoutId={workoutId}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  )
}