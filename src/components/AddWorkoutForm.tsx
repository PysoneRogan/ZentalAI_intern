'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/components/providers/UserProvider'
import Button from '@/components/Button'
import FormField from '@/components/FormField'
import Select from '@/components/Select'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Link from "next/link";

interface WorkoutForm {
  workoutTypeId: string
  duration: string
  calories: string
  performedAt: string
  notes: string
}

interface WorkoutType {
  id: number
  name: string
  description: string
  color: string
}

interface FormErrors {
  workoutTypeId?: string
  duration?: string
  calories?: string
  performedAt?: string
}

export default function AddWorkoutForm() {
  const { user } = useUser()
  const router = useRouter()
  
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>([])
  const [formData, setFormData] = useState<WorkoutForm>({
    workoutTypeId: '',
    duration: '',
    calories: '',
    performedAt: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  // Load workout types on component mount
  useEffect(() => {
    async function fetchWorkoutTypes() {
      try {
        const response = await fetch('/api/workout-types')
        if (response.ok) {
          const types = await response.json()
          setWorkoutTypes(types)
        }
      } catch (error) {
        console.error('Failed to fetch workout types:', error)
      }
    }
    
    fetchWorkoutTypes()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.workoutTypeId) {
      newErrors.workoutTypeId = 'Workout type is required'
    }
    
    if (!formData.duration) {
      newErrors.duration = 'Duration is required'
    } else if (isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be a positive number'
    }
    
    if (!formData.calories) {
      newErrors.calories = 'Calories burned is required'
    } else if (isNaN(Number(formData.calories)) || Number(formData.calories) < 0) {
      newErrors.calories = 'Calories must be a positive number'
    }
    
    if (!formData.performedAt) {
      newErrors.performedAt = 'Date is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workoutTypeId: Number(formData.workoutTypeId),
          durationMin: Number(formData.duration),
          calories: Number(formData.calories),
          performedAt: new Date(formData.performedAt).toISOString(),
          notes: formData.notes || undefined
        })
      })
      
      if (response.ok) {
        router.push('/dashboard')
      } else {
        const errorData = await response.json()
        console.error('Failed to create workout:', errorData)
        
        if (response.status === 401) {
          // Redirect to login if session expired
          window.location.href = '/api/auth/login?returnTo=/add-workout'
        } else {
          // Show validation errors
          if (errorData.details) {
            const fieldErrors: FormErrors = {}
            errorData.details.forEach((error: unknown) => {
              if (error.path) {
                fieldErrors[error.path[0] as keyof FormErrors] = error.message
              }
            })
            setErrors(fieldErrors)
          }
        }
      }
    } catch (error) {
      console.error('Error creating workout:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedWorkoutType = workoutTypes.find(type => type.id === Number(formData.workoutTypeId))

  const getWorkoutTypeColor = (type: WorkoutType) => {
    switch (type.name.toLowerCase()) {
      case 'cardio': return 'emerald'
      case 'strength': return 'blue'
      case 'yoga': return 'rose'
      default: return 'slate'
    }
  }

  if (!user) {
    return (
      <Card>
        <Card.Content className="text-center py-8">
          <p className="text-gray-500">Please sign in to add workouts.</p>
          <Button variant="primary" className="mt-4">
            <Link href="/api/auth/login">Sign In</Link>
          </Button>
        </Card.Content>
      </Card>
    )
  }

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">Workout Details</h2>
      </Card.Header>
      
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Workout Type"
              name="workoutTypeId"
              value={formData.workoutTypeId}
              onChange={handleInputChange}
              options={workoutTypes.map(type => ({
                value: type.id.toString(),
                label: type.name
              }))}
              placeholder="Select workout type"
              error={errors.workoutTypeId}
            />
            
            <FormField
              label="Date"
              type="date"
              name="performedAt"
              value={formData.performedAt}
              onChange={handleInputChange}
              error={errors.performedAt}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Duration (minutes)"
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="e.g., 45"
              error={errors.duration}
              min="1"
            />
            
            <FormField
              label="Calories Burned"
              type="number"
              name="calories"
              value={formData.calories}
              onChange={handleInputChange}
              placeholder="e.g., 300"
              error={errors.calories}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes about your workout..."
            />
          </div>

          {/* Preview */}
          {selectedWorkoutType && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
              <div className="flex items-center gap-2">
                <Badge color={getWorkoutTypeColor(selectedWorkoutType) as unknown}>
                  {selectedWorkoutType.name}
                </Badge>
                {formData.duration && (
                  <span className="text-sm text-gray-600">{formData.duration} min</span>
                )}
                {formData.calories && (
                  <span className="text-sm text-gray-600">{formData.calories} cal</span>
                )}
              </div>
            </div>
          )}
        </form>
      </Card.Content>
      
      <Card.Footer className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          isLoading={isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? 'Saving...' : 'Save Workout'}
        </Button>
      </Card.Footer>
    </Card>
  )
}