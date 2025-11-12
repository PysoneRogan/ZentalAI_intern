'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const successMessages = {
  'workout-created': 'Workout logged successfully! Keep up the great work! 💪',
  'workout-updated': 'Workout updated successfully! 📝',
  'workout-deleted': 'Workout deleted successfully! 🗑️'
}

export default function SuccessBanner() {
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const successType = searchParams.get('success')
    if (successType && successMessages[successType as keyof typeof successMessages]) {
      setMessage(successMessages[successType as keyof typeof successMessages])
      setIsVisible(true)

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!isVisible || !message) return null

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 max-w-md w-full transform transition-all duration-300",
      isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
    )}>
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800">
              {message}
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 p-1 rounded-full hover:bg-green-100 transition-colors"
          >
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      </div>
    </div>
  )
}