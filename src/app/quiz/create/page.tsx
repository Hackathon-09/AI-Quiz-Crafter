'use client'

import { Container, Heading, VStack, Text, Button } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function QuizExecutionPage() {
  const router = useRouter()

  return (
    <Container maxW="container.md" py={10}>
      <VStack gap={6}>
        <Text fontSize="sm" color="gray.500">問題 1 / 10</Text>
        
        <Heading size="lg" textAlign="center">
          クイズ実行画面
        </Heading>
        
        <Text textAlign="center" fontSize="lg">
          生成されたクイズに集中して解答できます。
        </Text>
        
        {/* 問題表示エリア */}
        <VStack gap={4} w="full" mt={8}>
          <Text>問題文がここに表示されます。</Text>
          
          {/* 解答UI（選択肢など）をここに実装予定 */}
          
          <Button 
            colorScheme="blue" 
            size="lg" 
            onClick={() => router.push('/quiz/result')}
          >
            解答を確定する
          </Button>
        </VStack>
      </VStack>
      </Container>
  )
}
