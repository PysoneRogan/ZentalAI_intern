'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { UserProvider as Auth0UserProvider, useUser as useAuth0User } from '@auth0/nextjs-auth0/client'

interface User {
  sub: string
  name: string
  email: string
  picture?: string
  email_verified?: boolean
}

interface UserContextType {
  user: User | undefined
  isLoading: boolean
  error: Error | undefined
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  return (
    <Auth0UserProvider>
      <UserContextWrapper>{children}</UserContextWrapper>
    </Auth0UserProvider>
  )
}

function UserContextWrapper({ children }: { children: ReactNode }) {
  const { user, isLoading, error } = useAuth0User()
  
  const contextValue: UserContextType = {
    user: user as User | undefined,
    isLoading,
    error: error as Error | undefined
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}