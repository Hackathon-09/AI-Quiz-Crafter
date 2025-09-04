// src/app/review/[category]/page.tsx
'use client'

import { Container, Heading, VStack, Text } from '@chakra-ui/react'
import { use } from 'react'

type Props = {
  params: Promise<{
    category: string
  }>
}

export default function ReviewCategoryPage({ params }: Props) {
  const { category } = use(params)

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
