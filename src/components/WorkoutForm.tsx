'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormState } from 'react-dom'
import { Save, Calendar, Clock, Zap, FileText, Loader2 } from 'lucide-react'
import { workoutFormSchema, type WorkoutFormData } from '@/lib/schemas/workout'
import { createWorkoutAction, updateWorkoutAction } from '@/app/actions/workout'
import FormField from '@/components/ui/FormField'
import Select from '@/components/Select'
import TextArea from '@/components/ui/TextArea'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Badge from '@/components/Badge'
import { showToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface WorkoutType {
  id: number
  name: string
  description: string
}

interface WorkoutFormProps {
  workoutTypes: WorkoutType[]
  initialData?: Partial<WorkoutFormData>
  workoutId?: number
  onSuccess?: () => void
}

export default function WorkoutForm({ 
  workoutTypes, 
  initialData, 
  workoutId,
  onSuccess 
}: WorkoutFormProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticSubmission, setOptimisticSubmission] = useState(false)

  // Form state management with React Hook Form  
  const form = useForm({
    resolver: zodResolver(workoutFormSchema) as unknown,
    defaultValues: {
      workoutTypeId: initialData?.workoutTypeId?.toString() || '',
      durationMin: initialData?.durationMin?.toString() || '',
      calories: initialData?.calories?.toString() || '',
      performedAt: initialData?.performedAt || new Date().toISOString().split('T')[0],
      notes: initialData?.notes || ''
    },
    mode: 'onBlur' // Validate on blur for better UX
  })

  // Server action state management
  const [state, formAction] = useFormState(
    workoutId ? 
      updateWorkoutAction.bind(null, workoutId) : 
      createWorkoutAction,
    null
  )

  // Watch form values for real-time preview
  const watchedValues = form.watch()
  const selectedWorkoutType = workoutTypes.find(
    type => type.id === parseInt(watchedValues.workoutTypeId)
  )

  // Handle server action response
  useEffect(() => {
    if (state?.success) {
      showToast.success(state.message || 'Workout saved successfully!')
      form.reset()
      setOptimisticSubmission(false)
      onSuccess?.()
    } else if (state?.message && !state.success) {
      showToast.error(state.message)
      setOptimisticSubmission(false)
    }

    // Set server validation errors
    if (state?.errors) {
      Object.entries(state.errors).forEach(([field, messages]) => {
        form.setError(field as keyof WorkoutFormData, {
          type: 'server',
          message: messages[0]
        })
      })
      setOptimisticSubmission(false)
    }
  }, [state, form, onSuccess])

  // Enhanced form submission with optimistic UI
  const onSubmit = form.handleSubmit((data) => {
    startTransition(() => {
      setOptimisticSubmission(true)
      
      // Create FormData for server action
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value.toString())
        }
      })
      
      // Show optimistic feedback
      const actionType = workoutId ? 'Updating' : 'Creating'
      showToast.loading(`${actionType} workout...`)
      
      formAction(formData)
    })
  })

  // Calculate estimated calories if not provided
  const getEstimatedCalories = () => {
    if (!selectedWorkoutType || !watchedValues.durationMin) return null
    
    const duration = parseInt(watchedValues.durationMin)
    const baseCaloriesPerMinute = {
      'Cardio': 8,
      'Running': 10,
      'Cycling': 7,
      'Strength': 5,
      'Yoga': 3,
      'Swimming': 9
    }
    
    const rate = baseCaloriesPerMinute[selectedWorkoutType.name as keyof typeof baseCaloriesPerMinute] || 6
    return Math.round(duration * rate)
  }

  const estimatedCalories = getEstimatedCalories()

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {workoutId ? 'Edit Workout' : 'Log New Workout'}
            </h2>
            <p className="text-sm text-gray-600">
              {workoutId ? 'Update your workout details' : 'Track your fitness progress'}
            </p>
          </div>
        </div>
      </Card.Header>
      
      <Card.Content>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Workout Type and Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Workout Type"
              {...form.register('workoutTypeId')}
              error={form.formState.errors.workoutTypeId?.message}
              required
              options={workoutTypes.map(type => ({
                value: type.id.toString(),
                label: type.name
              }))}
              placeholder="Select workout type"
            />
            
            <FormField
              label="Date"
              type="date"
              {...form.register('performedAt')}
              error={form.formState.errors.performedAt?.message}
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Duration and Calories Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Duration"
              type="number"
              {...form.register('durationMin')}
              error={form.formState.errors.durationMin?.message}
              placeholder="Minutes"
              min={1}
              max={600}
              required
              helperText="How long did you exercise?"
            />
            
            <div className="space-y-2">
              <FormField
                label="Calories Burned"
                type="number"
                {...form.register('calories')}
                error={form.formState.errors.calories?.message}
                placeholder="Optional"
                min={0}
                max={5000}
                helperText={
                  estimatedCalories ? 
                    `Estimated: ${estimatedCalories} calories` : 
                    'Leave empty for auto-calculation'
                }
              />
            </div>
          </div>

          {/* Notes */}
          <TextArea
            label="Notes"
            {...form.register('notes')}
            error={form.formState.errors.notes?.message}
            placeholder="How did the workout feel? Any achievements or observations..."
            rows={4}
            maxLength={1000}
            helperText={`${(watchedValues.notes?.length || 0)}/1000 characters`}
          />

          {/* Workout Preview */}
          {selectedWorkoutType && (watchedValues.durationMin || watchedValues.calories) && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <span>📋</span>
                Workout Preview
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Badge 
                  color="blue"
                >
                  {selectedWorkoutType.name}
                </Badge>
                {watchedValues.durationMin && (
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {watchedValues.durationMin} min
                  </span>
                )}
                {(watchedValues.calories || estimatedCalories) && (
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    {watchedValues.calories || estimatedCalories} cal
                    {!watchedValues.calories && estimatedCalories && (
                      <span className="text-xs text-gray-500">(estimated)</span>
                    )}
                  </span>
                )}
                {watchedValues.performedAt && (
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(watchedValues.performedAt).toLocaleDateString()}
                  </span>
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
          onClick={() => window.history.back()}
          className="flex-1"
          disabled={isPending || optimisticSubmission}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className={cn("flex-1 flex items-center gap-2", {
            "opacity-75": optimisticSubmission
          })}
          disabled={
            isPending || 
            optimisticSubmission || 
            !form.formState.isValid ||
            !form.formState.isDirty
          }
          onClick={onSubmit}
        >
          {(isPending || optimisticSubmission) ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {workoutId ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {workoutId ? 'Update Workout' : 'Save Workout'}
            </>
          )}
        </Button>
      </Card.Footer>
    </Card>
  )
}