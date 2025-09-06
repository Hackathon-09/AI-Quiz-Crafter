'use client'

import {
  VStack,
  HStack,
  Box,
  Button,
  Text,
  Select,
  RadioGroup,
  Separator,
  Progress,
  SimpleGrid,
  CheckboxGroup,
  Checkbox,
  Portal,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createListCollection } from '@chakra-ui/react'
import {
  QuizSettings,
  QuestionType,
  Difficulty,
  QuestionCount,
  QUESTION_TYPES,
  DIFFICULTIES,
  QUESTION_COUNT_OPTIONS,
} from '@/types/quiz'

export default function QuizPanel() {
  const router = useRouter()
  const [questionCount, setQuestionCount] = useState<QuestionCount>('5')
  const [questionType, setQuestionType] =
    useState<QuestionType>('multiple-choice')
  const [difficulty, setDifficulty] = useState<Difficulty>('standard')

  // Select用のコレクション定義
  const questionCountOptions = createListCollection({
    items: QUESTION_COUNT_OPTIONS,
  })

  const handleGenerateQuiz = () => {
    const settings: QuizSettings = {
      questionCount,
      questionType,
      difficulty,
    }

    // 設定をsessionStorageに保存（URLが長くならない）
    sessionStorage.setItem('quizSettings', JSON.stringify(settings))
    router.push('/quiz/execution')
  }

  const handleReviewMode = () => {
    router.push('/review/settings')
  }

  const handleViewHistory = () => {
    router.push('/review/history')
  }

  return (
    <VStack gap={{ base: 4, md: 6 }} align="stretch" h="full">
      {/* クイズ設定パネル */}
      <Box
        p={{ base: 4, md: 6 }}
        bg="white"
        borderRadius="lg"
        shadow="sm"
        border="1px"
        borderColor="gray.200"
      >
        <VStack gap={{ base: 3, md: 4 }} align="stretch">
          <Text fontSize="lg" fontWeight="bold" color="blue.600">
            クイズ設定
          </Text>

          {/* 問題数指定 */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              問題数
            </Text>
            <Select.Root
              collection={questionCountOptions}
              value={[questionCount]}
              onValueChange={(e) => {
                const value = e.value[0]
                if (typeof value === 'string') {
                  setQuestionCount(value as QuestionCount)
                }
              }}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="問題数を選択" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {questionCountOptions.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Box>

          {/* 問題形式選択 */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              問題形式
            </Text>
            <RadioGroup.Root
              value={questionType}
              onValueChange={(details) => {
                const value = details.value
                if (QUESTION_TYPES.includes(value as QuestionType)) {
                  setQuestionType(value as QuestionType)
                }
              }}
            >
              <VStack align="start" gap={2}>
                {QUESTION_TYPES.map((type) => (
                  <RadioGroup.Item value={type} key={type}>
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <RadioGroup.ItemText>
                      {type === 'multiple-choice'
                        ? '選択式'
                        : type === 'true-false'
                          ? '正誤式'
                          : '記述式'}
                    </RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </VStack>
            </RadioGroup.Root>
          </Box>

          {/* 難易度選択 */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              難易度
            </Text>
            <RadioGroup.Root
              value={difficulty}
              onValueChange={(details) => {
                const value = details.value
                if (value && DIFFICULTIES.includes(value as Difficulty)) {
                  setDifficulty(value as Difficulty)
                }
              }}
            >
              <HStack gap={{ base: 2, md: 4 }} flexWrap="wrap">
                <RadioGroup.Item value="basic">
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>基礎</RadioGroup.ItemText>
                </RadioGroup.Item>
                <RadioGroup.Item value="standard">
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>標準</RadioGroup.ItemText>
                </RadioGroup.Item>
                <RadioGroup.Item value="advanced">
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>応用</RadioGroup.ItemText>
                </RadioGroup.Item>
              </HStack>
            </RadioGroup.Root>
          </Box>

          {/* メインアクションボタン */}
          <Button
            colorScheme="blue"
            size={{ base: 'md', md: 'lg' }}
            onClick={handleGenerateQuiz}
            disabled={false}
            w="full"
          >
            クイズを生成する
          </Button>
        </VStack>
      </Box>

      <Separator />

      {/* 学習統計エリア */}
      <Box
        p={{ base: 4, md: 6 }}
        bg="white"
        borderRadius="lg"
        shadow="sm"
        border="1px"
        borderColor="gray.200"
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
    </VStack>
  )
}
