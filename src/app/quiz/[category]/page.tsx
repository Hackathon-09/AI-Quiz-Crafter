// src/app/quiz/[category]/page.tsx
'use client'

import { Container, Heading, VStack, Text } from '@chakra-ui/react'

type Props = {
  params: {
    category: string
  }
}

export default function QuizCategoryPage({ params }: Props) {
  const { category } = params

  return (
    <Container>
      <VStack gap={4} align="start">
        <Heading>クイズページ</Heading>
        <Text>カテゴリ: {decodeURIComponent(category)}</Text>
        {/* 今後、このカテゴリのクイズ一覧などをここに実装します */}
      </VStack>
    </Container>
  )
}
