'use client'

import { Container, Heading, Text, Button, VStack, HStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/common/Layout'

export default function LandingPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/auth')
  }

  return (
    <Layout showHeader={false}>
      <Container maxW="container.lg" py={20}>
        <VStack gap={8} textAlign="center">
          <Heading size="2xl">AI Quiz Crafter</Heading>
          <Text fontSize="xl" color="gray.600">
            AIによる問題生成学習システム
          </Text>
          <Text fontSize="md" maxW="600px" color="gray.500">
            あなたの学習ノートから、AIが最適化されたクイズを自動生成。
            効率的な学習で知識の定着と苦手分野の克服をサポートします。
          </Text>
          
          <HStack gap={4} pt={4}>
            <Button 
              colorScheme="blue" 
              size="lg"
              onClick={handleGetStarted}
            >
              始める
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleGetStarted}
            >
              ログイン
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Layout>
  )
}
