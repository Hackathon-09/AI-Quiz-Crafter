'use client'

import {
  VStack,
  HStack,
  Box,
  Button,
  Text,
  Progress,
  SimpleGrid,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function StatisticsPanel() {
  const router = useRouter()

  const handleReviewMode = () => {
    router.push('/review/settings')
  }

  const handleViewHistory = () => {
    router.push('/review/history')
  }

  return (
    <Box
      p={{ base: 4, md: 6 }}
      bg="white"
      borderRadius="lg"
      shadow="sm"
      border="1px"
      borderColor="gray.200"
      h="full"
    >
      <VStack gap={{ base: 3, md: 4 }} align="stretch">
        <Text fontSize="lg" fontWeight="bold" color="green.600">
          学習統計
        </Text>

        {/* 統計サマリー */}
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
          <Box>
            <Text fontSize="sm" color="gray.500">
              総解答数
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              45
            </Text>
            <Text fontSize="xs" color="green.500">
              今週 +12
            </Text>
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.500">
              正答率
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              78%
            </Text>
            <Text fontSize="xs" color="green.500">
              先週より +5%
            </Text>
          </Box>
        </SimpleGrid>

        {/* 分野別正答率 */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={3}>
            分野別正答率
          </Text>
          <VStack gap={2}>
            <Box w="full">
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm">数学</Text>
                <Text fontSize="sm">85%</Text>
              </HStack>
              <Progress.Root value={85}>
                <Progress.Track>
                  <Progress.Range colorPalette="blue" />
                </Progress.Track>
              </Progress.Root>
            </Box>
            <Box w="full">
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm">日本史</Text>
                <Text fontSize="sm">65%</Text>
              </HStack>
              <Progress.Root value={65}>
                <Progress.Track>
                  <Progress.Range colorPalette="orange" />
                </Progress.Track>
              </Progress.Root>
            </Box>
            <Box w="full">
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm">英語</Text>
                <Text fontSize="sm">92%</Text>
              </HStack>
              <Progress.Root value={92}>
                <Progress.Track>
                  <Progress.Range colorPalette="green" />
                </Progress.Track>
              </Progress.Root>
            </Box>
          </VStack>
        </Box>

        {/* 復習・履歴ボタン */}
        <VStack gap={3}>
          <Button
            variant="outline"
            colorScheme="orange"
            size={{ base: 'md', md: 'lg' }}
            onClick={handleReviewMode}
            w="full"
          >
            📚 復習モードを開始
          </Button>
          
          <Button
            variant="ghost"
            colorScheme="blue"
            size={{ base: 'sm', md: 'md' }}
            onClick={handleViewHistory}
            w="full"
          >
            📊 学習履歴を見る
          </Button>
        </VStack>
      </VStack>
    </Box>
  )
}