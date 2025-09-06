'use client'

import {
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Flex,
  SimpleGrid,
  Icon,
  Box,
  Image,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/common/Layout'
import { FaArrowRight, FaFileImport, FaMagic, FaChartLine } from 'react-icons/fa'

export default function LandingPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/auth')
  }

  return (
    <Layout showHeader={false}>
      {/* Hero Section */}
      <Flex
        w="full"
        h={{ base: 'auto', md: '90vh' }}
        align="center"
        justify="center"
        bgGradient="linear(to-br, blue.500, purple.500)"
        p={{ base: 8, md: 0 }}
      >
        <Container maxW="container.xl" py={{ base: 12, md: 20 }}>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={10}>
            <VStack
              gap={6}
              align="flex-start"
              justify="center"
              color="white"
              textAlign="left"
            >
              <Heading
                as="h1"
                size="3xl"
                fontWeight="bold"
                color={"black"}
                textShadow="2px 2px 8px rgba(0,0,0,0.3)"
              >
                AI Quiz Crafter
              </Heading>
              <Text
                fontSize="2xl"
                color={"black"}
                textShadow="1px 1px 4px rgba(0,0,0,0.3)"
              >
                AIによる問題生成学習システム
              </Text>
              <Text fontSize="lg" color={"black"} maxW="lg">
                あなたの学習ノートから、AIが最適化されたクイズを自動生成。
                効率的な学習で知識の定着と苦手分野の克服をサポートします。
              </Text>
              <HStack gap={4} pt={4}>
                <Button
                  size="lg"
                  colorScheme="whiteAlpha"
                  variant="solid"
                  onClick={handleGetStarted}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                >
                  <HStack>
                    <Text>始める</Text>
                    <Icon as={FaArrowRight} />
                  </HStack>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  color="white"
                  borderColor="whiteAlpha.500"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  onClick={handleGetStarted}
                >
                  ログイン
                </Button>
              </HStack>
            </VStack>
            <Flex
              align="center"
              justify="center"
              display={{ base: 'none', md: 'flex' }}
            >
              <Image
                src="/main_icon.svg"
                alt="AI Quiz Crafter Icon"
                w={40}
                h={40}
                filter="drop-shadow(0 0 2rem #00000050)"
              />
            </Flex>
          </SimpleGrid>
        </Container>
      </Flex>

      {/* Features Section */}
      <Box bg="white" py={{ base: 16, md: 24 }}>
        <Container maxW="container.lg">
          <VStack gap={4} mb={12} textAlign="center">
            <Heading as="h2" size="xl">
              AI Quiz Crafter の主な機能
            </Heading>
            <Text fontSize="lg" color="gray.600">
              あなたの学習を次のレベルへ引き上げる3つのステップ
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={10}>
            <VStack
              p={8}
              bg="gray.50"
              borderRadius="lg"
              boxShadow="md"
              gap={4}
              align="center"
            >
              <Icon as={FaFileImport} w={12} h={12} color="blue.500" />
              <Heading as="h3" size="md">
                簡単アップロード
              </Heading>
              <Text textAlign="center" color="gray.700">
                学習ノートや資料をアップロードするだけで、AIが内容を解析します。
              </Text>
            </VStack>
            <VStack
              p={8}
              bg="gray.50"
              borderRadius="lg"
              boxShadow="md"
              gap={4}
              align="center"
            >
              <Icon as={FaMagic} w={12} h={12} color="purple.500" />
              <Heading as="h3" size="md">
                AIがクイズを自動生成
              </Heading>
              <Text textAlign="center" color="gray.700">
                解析された内容から、AIが重要なポイントを抑えた多様な形式のクイズを生成します。
              </Text>
            </VStack>
            <VStack
              p={8}
              bg="gray.50"
              borderRadius="lg"
              boxShadow="md"
              gap={4}
              align="center"
            >
              <Icon as={FaChartLine} w={12} h={12} color="teal.500" />
              <Heading as="h3" size="md">
                苦手分野を克服
              </Heading>
              <Text textAlign="center" color="gray.700">
                クイズの結果を分析し、あなたの弱点を可視化。効率的な復習をサポートします。
              </Text>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>
    </Layout>
  )
}
