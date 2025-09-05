'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from 'aws-amplify/auth'
import { Box, Spinner, Center } from '@chakra-ui/react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      await getCurrentUser()
      setIsAuthenticated(true)
    } catch (error) {
      setIsAuthenticated(false)
      if (requireAuth) {
        router.push('/auth')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null // リダイレクト中は何も表示しない
  }

  if (!requireAuth && isAuthenticated) {
    // 認証済みユーザーがログインページにアクセスした場合はダッシュボードにリダイレクト
    router.push('/dashboard')
    return null
  }

  return <>{children}</>
}