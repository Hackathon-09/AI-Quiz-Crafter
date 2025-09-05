'use client'

import '@/lib/amplify' 
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import AuthProvider from '@/components/auth/AuthProvider'
import AuthenticatedApp from '@/components/auth/AuthenticatedApp'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <AuthProvider>
        <AuthenticatedApp>
          {children}
        </AuthenticatedApp>
      </AuthProvider>
    </ChakraProvider>
  )
}

