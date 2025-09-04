'use client'

import { Container, Heading, VStack, Text } from '@chakra-ui/react'
import Layout from '@/components/common/Layout'

export default function QuizResultPage() {
  return (
    <Layout showHeader={true}>
      <Container maxW="container.md" py={10}>
        <VStack gap={6} align="start">
          <Heading>クイズ結果・解説</Heading>
          <Text>解答の正誤確認とAIによる詳細解説を表示します。</Text>
          {/* 結果表示コンポーネントをここに実装予定 */}
        </VStack>
      </Container>
    </Layout>
  )
}