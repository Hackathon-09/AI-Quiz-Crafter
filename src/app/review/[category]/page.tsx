// src/app/review/[category]/page.tsx
'use client'

import { Container, Heading, VStack, Text } from '@chakra-ui/react'

type Props = {
  params: {
    category: string
  }
}

export default function ReviewCategoryPage({ params }: Props) {
  const { category } = params

  return (
    <Container>
      <VStack gap={4} align="start">
        <Heading>復習ページ</Heading>
        <Text>カテゴリ: {decodeURIComponent(category)}</Text>
        {/* 今後、このカテゴリの復習機能などをここに実装します */}
      </VStack>
    </Container>
  )
}
