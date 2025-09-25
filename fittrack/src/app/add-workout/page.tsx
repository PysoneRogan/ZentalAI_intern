'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import FormField from '@/components/FormField';
import Select from '@/components/Select';
import Card from '@/components/Card';
import Badge from '@/components/Badge';

interface WorkoutForm {
  type: string;
  duration: string;
  calories: string;
  date: string;
  notes: string;
}

interface FormErrors {
  type?: string;
  duration?: string;
  calories?: string;
  date?: string;
}

const workoutTypes = [
  { value: 'cardio', label: 'Cardio' },
  { value: 'strength', label: 'Strength Training' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'running', label: 'Running' }
];

export default function AddWorkoutPage() {
  const [formData, setFormData] = useState<WorkoutForm>({
    type: '',
    duration: '',
    calories: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    notes: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  // Generic input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.type) {
      newErrors.type = 'Workout type is required';
    }
    
    if (!formData.duration) {
      newErrors.duration = 'Duration is required';
    } else if (isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be a positive number';
    }
    
    if (!formData.calories) {
      newErrors.calories = 'Calories burned is required';
    } else if (isNaN(Number(formData.calories)) || Number(formData.calories) < 0) {
      newErrors.calories = 'Calories must be a positive number';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Create workout object
      const newWorkout = {
        type: formData.type,
        duration: Number(formData.duration),
        calories: Number(formData.calories),
        date: formData.date,
        notes: formData.notes,
        id: Date.now().toString() // Simple ID generation
      };
      
      // Get existing workouts from localStorage
      const existingWorkouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
      
      // Add new workout to the beginning of the array
      const updatedWorkouts = [newWorkout, ...existingWorkouts];
      
      // Save back to localStorage
      localStorage.setItem('recentWorkouts', JSON.stringify(updatedWorkouts));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Workout saved:', newWorkout);
      
      // Redirect back to dashboard
      router.push('/');
      
    } catch (error) {
      console.error('Error saving workout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'cardio': return 'emerald';
      case 'strength': return 'blue';
      case 'yoga': return 'rose';
      default: return 'slate';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Workout</h1>
          <p className="mt-2 text-gray-600">Track your fitness progress by logging your workout details.</p>
        </div>

        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold">Workout Details</h2>
          </Card.Header>
          
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Workout Type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  options={workoutTypes}
                  placeholder="Select workout type"
                  error={errors.type}
                />
                
                <FormField
                  label="Date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  error={errors.date}
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
              {formData.type && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
                  <div className="flex items-center gap-2">
                    <Badge color={getWorkoutTypeColor(formData.type) as any}>
                      {workoutTypes.find(t => t.value === formData.type)?.label}
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
      </div>
    </div>
  );
}