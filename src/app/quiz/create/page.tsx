// src/app/quiz/create/page.tsx
'use client'

import { Container, Heading, VStack, Text } from '@chakra-ui/react'

export default function QuizCreatePage() {
  return (
    <Container>
      <VStack gap={4} align="start">
        <Heading>クイズ作成ページ</Heading>
        <Text>ここで新しいクイズを作成します。</Text>
        {/* 今後、クイズ作成フォームなどをここに実装します */}
      </VStack>
    </Container>
  )
}
