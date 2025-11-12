'use client'

import { useEffect } from 'react'
import { toast, Toaster, ToastBar } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      containerStyle={{
        top: 80,
      }}
      toastOptions={{
        duration: 5000,
        style: {
          background: 'white',
          color: '#1f2937',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '12px',
          fontSize: '14px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {getToastIcon(t.type)}
              </div>
              <div className="flex-1 min-w-0">
                {message}
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  )
}

function getToastIcon(type: string) {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case 'error':
      return <XCircle className="w-5 h-5 text-red-500" />
    case 'loading':
      return (
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      )
    default:
      return <AlertCircle className="w-5 h-5 text-blue-500" />
  }
}

// Toast utility functions
export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => toast.promise(promise, messages)
}