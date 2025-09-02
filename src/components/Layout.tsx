// src/components/Layout.tsx
'use client'

import { Box, Container } from '@chakra-ui/react'
import { ReactNode } from 'react'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <Box bg="white">
      <Container maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  )
}
