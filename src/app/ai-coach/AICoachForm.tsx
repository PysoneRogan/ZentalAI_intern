'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
  fitness_level: string
  primary_goal: string
  available_days: number
  session_duration: number
  equipment: string[]
  limitations: string
  experience_years: number
}

export default function AICoachForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [generatedPlanId, setGeneratedPlanId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>({
    fitness_level: 'beginner',
    primary_goal: 'general_fitness',
    available_days: 3,
    session_duration: 45,
    equipment: ['bodyweight'],
    limitations: '',
    experience_years: 0,
  })

  const handleEquipmentChange = (equipment: string) => {
    setFormData((prev) => {
      const currentEquipment = prev.equipment
      if (currentEquipment.includes(equipment)) {
        return {
          ...prev,
          equipment: currentEquipment.filter((e) => e !== equipment),
        }
      } else {
        return {
          ...prev,
          equipment: [...currentEquipment, equipment],
        }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Prepare data for API
      const requestData = {
        fitness_level: formData.fitness_level,
        primary_goal: formData.primary_goal,
        available_days: Number(formData.available_days),
        session_duration: Number(formData.session_duration),
        equipment: formData.equipment,
        limitations: formData.limitations
          ? formData.limitations.split(',').map((l) => l.trim())
          : [],
        experience_years: Number(formData.experience_years),
      }

      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan')
      }

      // Success! Show success message and set plan ID
      setSuccess(true)
      setGeneratedPlanId(data.plan.id)

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' })

      // Refresh to show new plan in the list
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Create Your Personal Workout Plan
        </h2>
        <p className="text-gray-600">
          Answer a few questions and our AI will generate a customized workout
          plan tailored to your goals and preferences.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && generatedPlanId && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-600 mt-0.5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-green-800 font-semibold mb-2">
                Workout Plan Generated Successfully!
              </h3>
              <p className="text-green-700 text-sm mb-3">
                Your personalized 2-week workout plan is ready. Check it out below or click the button to view full details.
              </p>
              <a
                href={`/plans/${generatedPlanId}`}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View Your Workout Plan
              </a>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fitness Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fitness Level
          </label>
          <select
            value={formData.fitness_level}
            onChange={(e) =>
              setFormData({ ...formData, fitness_level: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="beginner">Beginner - New to fitness</option>
            <option value="intermediate">
              Intermediate - Regular exercise routine
            </option>
            <option value="advanced">Advanced - Experienced athlete</option>
          </select>
        </div>

        {/* Primary Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Goal
          </label>
          <select
            value={formData.primary_goal}
            onChange={(e) =>
              setFormData({ ...formData, primary_goal: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="general_fitness">
              General Fitness - Overall health
            </option>
            <option value="weight_loss">Weight Loss - Burn fat</option>
            <option value="muscle_building">
              Muscle Building - Gain mass
            </option>
            <option value="strength">Strength - Get stronger</option>
            <option value="endurance">Endurance - Build stamina</option>
          </select>
        </div>

        {/* Available Days & Session Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Days per Week
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={formData.available_days}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  available_days: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Duration (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="120"
              step="5"
              value={formData.session_duration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  session_duration: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Equipment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Equipment (select at least one)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { value: 'bodyweight', label: 'Bodyweight' },
              { value: 'dumbbells', label: 'Dumbbells' },
              { value: 'barbell', label: 'Barbell' },
              { value: 'resistance_bands', label: 'Resistance Bands' },
              { value: 'pull_up_bar', label: 'Pull-up Bar' },
              { value: 'gym_access', label: 'Full Gym Access' },
            ].map((eq) => (
              <label
                key={eq.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.equipment.includes(eq.value)}
                  onChange={() => handleEquipmentChange(eq.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{eq.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Experience Years */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Training Experience
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={formData.experience_years}
            onChange={(e) =>
              setFormData({
                ...formData,
                experience_years: Number(e.target.value),
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        {/* Limitations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Limitations or Injuries (optional)
          </label>
          <textarea
            value={formData.limitations}
            onChange={(e) =>
              setFormData({ ...formData, limitations: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="E.g., lower back pain, knee injury (comma separated)"
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple items with commas
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || formData.equipment.length === 0}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating Your Plan...
              </span>
            ) : (
              'Generate My Workout Plan'
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          This usually takes 30-60 seconds. Our AI will create a personalized
          2-week workout plan based on your preferences.
        </p>
      </form>
    </div>
  )
}

