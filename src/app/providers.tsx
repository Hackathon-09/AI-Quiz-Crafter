// src/app/providers.tsx
// src/app/providers.tsx
'use client'

import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { Layout } from '../components/Layout'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <Layout>{children}</Layout>
    </ChakraProvider>
  )
}

