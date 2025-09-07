'use client'

import { Box } from '@chakra-ui/react'
import Header from '../Header'

type LayoutProps = {
  children: React.ReactNode
  showHeader?: boolean
}

export default function Layout({ children, showHeader = true }: LayoutProps) {
  return (
    <Box minH="100vh" bg="gray.50">
      {showHeader && <Header />}
      <Box as="main" pt={0}>
        {children}
      </Box>
    </Box>
  )
}
