'use client'

import { Container, Heading, VStack, Text, Button, Card } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function QuizCreatePage() {
  const router = useRouter()

  return (
    <Container maxW="container.md" py={8}>
      <Card.Root p={8} textAlign="center">
        <VStack gap={4}>
          <Heading size="lg">クイズ作成</Heading>
          <Text>通常のクイズ作成機能はダッシュボードから利用できます</Text>
          <Button onClick={() => router.push('/dashboard')}>
            ダッシュボードに戻る
          </Button>
        </VStack>
      </Card.Root>
    </Container>
  )
}