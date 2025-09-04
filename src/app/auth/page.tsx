'use client'

import { Container, Heading, VStack } from '@chakra-ui/react'
import Layout from '@/components/common/Layout'

export default function AuthPage() {
  return (
    <Layout showHeader={false}>
      <Container maxW="container.sm" py={10}>
        <VStack gap={8}>
          <Heading>AI Quiz Crafter</Heading>
          {/* 認証フォームコンポーネントをここに実装予定 */}
        </VStack>
      </Container>
    </Layout>
  )
}