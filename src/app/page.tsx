// src/app/page.tsx
'use client'

import { Box, Container, Heading, Text, Button, VStack } from '@chakra-ui/react'
import { useState } from 'react'

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <Container maxW="container.lg" py={10}>
      <VStack gap={8}>
        <Heading>AI Quiz Crafter</Heading>
        <Text>AIによる問題生成学習システム</Text>
        <Box>
          <Text>カウント: {count}</Text>
          <Button onClick={() => setCount(count + 1)} colorScheme="blue">
            テストボタン
          </Button>
        </Box>
      </VStack>
    </Container>
  )
}
