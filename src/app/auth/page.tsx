'use client'

import { Container, VStack } from '@chakra-ui/react'
import AuthForm from '@/components/auth/AuthForm'

export default function AuthPage() {
  return (
    <Container maxW="container.sm" py={10}>
      <VStack gap={8}>
        <AuthForm />
      </VStack>
    </Container>
  )
}