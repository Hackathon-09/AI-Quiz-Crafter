 'use client'

  import { Container, VStack } from '@chakra-ui/react'
  import Layout from '@/components/common/Layout'
  import AuthForm from '@/components/auth/AuthForm'

  export default function AuthPage() {
    return (
      <Layout showHeader={false}>
        <Container maxW="container.sm" py={10}>
          <VStack gap={8}>
            <AuthForm />
          </VStack>
        </Container>
      </Layout>
    )
  }