'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  getCurrentUser,
  fetchUserAttributes,
  type AuthUser,
  type FetchUserAttributesOutput,
} from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { Center, Spinner } from '@chakra-ui/react'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: (AuthUser & { attributes?: FetchUserAttributesOutput }) | null
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] =
    useState<(AuthUser & { attributes?: FetchUserAttributesOutput }) | null>(null)

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser()
      const attributes = await fetchUserAttributes()
      setUser({ ...currentUser, attributes })
      setIsAuthenticated(true)
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuthState()

    // Amplify Hubで認証イベントを監視
    const hubUnsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
        case 'signedIn':
        case 'tokenRefresh':
          checkAuthState()
          break
        case 'signedOut':
          setUser(null)
          setIsAuthenticated(false)
          setIsLoading(false)
          break
      }
    })

    return () => {
      hubUnsubscribe()
    }
  }, [])

  if (isLoading) {
    return (
      <Center h="100vh" bg="gray.50">
        <Spinner size="xl" colorPalette="blue" />
      </Center>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user }}>
      {children}
    </AuthContext.Provider>
  )
}