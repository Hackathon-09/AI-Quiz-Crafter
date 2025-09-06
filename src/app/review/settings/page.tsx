'use client'

import {
  Container,
  Heading,
  VStack,
  HStack,
  Box,
  Button,
  Text,
  RadioGroup,
  Select,
  Card,
  Badge,
  Portal,
  Separator,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createListCollection } from '@chakra-ui/react'
import {
  ReviewSettings,
  ReviewTargetMode,
  ReviewFormat,
  QuestionCount,
  QUESTION_COUNT_OPTIONS,
} from '@/types/quiz'
import { FaBook, FaChartLine, FaBrain, FaListUl } from 'react-icons/fa'

export default function ReviewSettingsPage() {
  const router = useRouter()
  
  // 復習モード用の状態
  const [targetMode, setTargetMode] = useState<ReviewTargetMode>('incorrect')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [scoreThreshold, setScoreThreshold] = useState('70')
  const [daysPeriod, setDaysPeriod] = useState('7')
  const [reviewFormat, setReviewFormat] = useState<ReviewFormat>('quiz')
  const [questionCount, setQuestionCount] = useState<QuestionCount>('10')

  // Select用のコレクション定義
  const questionCountOptions = createListCollection({
    items: QUESTION_COUNT_OPTIONS,
  })

  const scoreThresholdOptions = createListCollection({
    items: [
      { label: '50%以下', value: '50' },
      { label: '60%以下', value: '60' },
      { label: '70%以下', value: '70' },
      { label: '80%以下', value: '80' },
    ],
  })

  const daysPeriodOptions = createListCollection({
    items: [
      { label: '過去3日', value: '3' },
      { label: '過去7日', value: '7' },
      { label: '過去14日', value: '14' },
      { label: '過去30日', value: '30' },
    ],
  })

  // カテゴリ一覧（実際にはAPIから取得）
  const availableCategories = [
    { name: '数学', color: 'blue', icon: '📊' },
    { name: '日本史', color: 'red', icon: '🏯' },
    { name: '世界史', color: 'orange', icon: '🌍' },
    { name: '英語', color: 'green', icon: '🇺🇸' },
    { name: '物理', color: 'purple', icon: '⚛️' },
    { name: '化学', color: 'teal', icon: '🧪' },
    { name: '生物', color: 'cyan', icon: '🧬' },
    { name: '現代文', color: 'pink', icon: '📚' },
    { name: '古文', color: 'yellow', icon: '📜' },
    { name: '地理', color: 'gray', icon: '🗺️' }
  ]

  const handleStartReview = () => {
    const settings: ReviewSettings = {
      targetMode,
      categories: targetMode === 'category' ? selectedCategories : undefined,
      scoreThreshold: targetMode === 'low-score' ? parseInt(scoreThreshold) : undefined,
      daysPeriod: parseInt(daysPeriod),
      reviewFormat,
      questionCount,
    }

    sessionStorage.setItem('reviewSettings', JSON.stringify(settings))
    router.push('/review/execution')
  }

  return (
    <Container maxW="container.md" py={6}>
      <VStack gap={6} align="stretch">
        {/* ヘッダー */}
        <VStack gap={2}>
          <HStack gap={2}>
            <FaBrain color="orange" />
            <Heading size="lg" color="orange.600">
              復習モード設定
            </Heading>
          </HStack>
          <Text fontSize="md" color="gray.600" textAlign="center">
            過去の学習内容を効率的に復習しましょう
          </Text>
        </VStack>

        {/* 復習対象設定 */}
        <Card.Root>
          <VStack gap={4} p={6} align="stretch">
            <HStack gap={2}>
              <FaListUl color="blue" />
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                復習対象
              </Text>
            </HStack>

            <RadioGroup.Root
              value={targetMode}
              onValueChange={(details) => {
                const value = details.value as ReviewTargetMode
                setTargetMode(value)
              }}
            >
              <VStack align="start" gap={3}>
                <RadioGroup.Item value="incorrect">
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <VStack align="start" gap={1}>
                    <RadioGroup.ItemText fontWeight="medium">
                      間違えた問題のみ
                    </RadioGroup.ItemText>
                    <Text fontSize="sm" color="gray.600" ml={6}>
                      過去に不正解だった問題を重点的に復習
                    </Text>
                  </VStack>
                </RadioGroup.Item>

                <RadioGroup.Item value="low-score">
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <VStack align="start" gap={1}>
                    <RadioGroup.ItemText fontWeight="medium">
                      正答率の低い問題
                    </RadioGroup.ItemText>
                    <Text fontSize="sm" color="gray.600" ml={6}>
                      指定した正答率以下の問題を復習
                    </Text>
                  </VStack>
                </RadioGroup.Item>

                <RadioGroup.Item value="category">
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <VStack align="start" gap={1}>
                    <RadioGroup.ItemText fontWeight="medium">
                      特定の分野・カテゴリ
                    </RadioGroup.ItemText>
                    <Text fontSize="sm" color="gray.600" ml={6}>
                      選択した分野の問題を復習
                    </Text>
                  </VStack>
                </RadioGroup.Item>

                <RadioGroup.Item value="all">
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <VStack align="start" gap={1}>
                    <RadioGroup.ItemText fontWeight="medium">
                      全ての過去問題
                    </RadioGroup.ItemText>
                    <Text fontSize="sm" color="gray.600" ml={6}>
                      解答済みの全問題から復習
                    </Text>
                  </VStack>
                </RadioGroup.Item>
              </VStack>
            </RadioGroup.Root>

            {/* 条件設定 */}
            {targetMode === 'low-score' && (
              <Box ml={6} p={4} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  正答率の閾値
                </Text>
                <Select.Root
                  collection={scoreThresholdOptions}
                  value={[scoreThreshold]}
                  onValueChange={(e) => setScoreThreshold(e.value[0] || '70')}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="閾値を選択" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {scoreThresholdOptions.items.map((item) => (
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
            )}

            {targetMode === 'category' && (
              <Box ml={6} p={4} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="medium" mb={3}>
                  復習したい分野を選択
                </Text>
                
                {/* タグ形式の選択UI */}
                <Box>
                  <HStack wrap="wrap" gap={2} mb={3}>
                    {availableCategories.map((category) => (
                      <Button
                        key={category.name}
                        size="sm"
                        variant={selectedCategories.includes(category.name) ? 'solid' : 'outline'}
                        colorScheme={selectedCategories.includes(category.name) ? category.color : 'gray'}
                        onClick={() => {
                          setSelectedCategories(prev => 
                            prev.includes(category.name)
                              ? prev.filter(c => c !== category.name)
                              : [...prev, category.name]
                          )
                        }}
                        borderRadius="full"
                        px={4}
                        py={2}
                        fontSize="sm"
                        fontWeight="medium"
                        transition="all 0.2s"
                        _hover={{
                          transform: "translateY(-1px)",
                          boxShadow: "md"
                        }}
                      >
                        <HStack gap={1}>
                          <Text>{category.icon}</Text>
                          <Text>
                            {selectedCategories.includes(category.name) && "✓ "}
                            {category.name}
                          </Text>
                        </HStack>
                      </Button>
                    ))}
                  </HStack>
                  
                  {/* 選択状況の表示 */}
                  <HStack justify="space-between" align="center">
                    <Text fontSize="xs" color="gray.600">
                      {selectedCategories.length > 0 
                        ? `${selectedCategories.length}個の分野を選択中`
                        : '分野を選択してください'
                      }
                    </Text>
                    {selectedCategories.length > 0 && (
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="gray"
                        onClick={() => setSelectedCategories([])}
                        fontSize="xs"
                      >
                        すべて解除
                      </Button>
                    )}
                  </HStack>
                </Box>
              </Box>
            )}
          </VStack>
        </Card.Root>

        {/* 復習設定 */}
        <Card.Root>
          <VStack gap={4} p={6} align="stretch">
            <HStack gap={2}>
              <FaChartLine color="green" />
              <Text fontSize="lg" fontWeight="bold" color="green.600">
                復習設定
              </Text>
            </HStack>

            {/* 期間設定 */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                対象期間
              </Text>
              <Select.Root
                collection={daysPeriodOptions}
                value={[daysPeriod]}
                onValueChange={(e) => setDaysPeriod(e.value[0] || '7')}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="期間を選択" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {daysPeriodOptions.items.map((item) => (
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

            {/* 復習形式 */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={3}>
                復習形式
              </Text>
              <RadioGroup.Root
                value={reviewFormat}
                onValueChange={(details) => {
                  const value = details.value as ReviewFormat
                  setReviewFormat(value)
                }}
              >
                <VStack align="start" gap={3}>
                  <RadioGroup.Item value="quiz">
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <VStack align="start" gap={1}>
                      <RadioGroup.ItemText fontWeight="medium">
                        📝 クイズ形式
                      </RadioGroup.ItemText>
                      <Text fontSize="sm" color="gray.600" ml={6}>
                        通常のクイズと同様の形式で復習
                      </Text>
                    </VStack>
                  </RadioGroup.Item>

                  <RadioGroup.Item value="flashcard">
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <VStack align="start" gap={1}>
                      <RadioGroup.ItemText fontWeight="medium">
                        🗂 フラッシュカード形式
                      </RadioGroup.ItemText>
                      <Text fontSize="sm" color="gray.600" ml={6}>
                        問題と解答を素早く確認
                      </Text>
                    </VStack>
                  </RadioGroup.Item>

                  <RadioGroup.Item value="explanation">
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <VStack align="start" gap={1}>
                      <RadioGroup.ItemText fontWeight="medium">
                        📚 解説重視形式
                      </RadioGroup.ItemText>
                      <Text fontSize="sm" color="gray.600" ml={6}>
                        解説をじっくり読んで理解を深める
                      </Text>
                    </VStack>
                  </RadioGroup.Item>
                </VStack>
              </RadioGroup.Root>
            </Box>

            {/* 問題数 */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                復習問題数
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
          </VStack>
        </Card.Root>

        {/* アクションボタン */}
        <VStack gap={3}>
          <HStack justify="space-between" gap={4} w="full">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              キャンセル
            </Button>
            
            <Button
              colorScheme="orange"
              size="lg"
              onClick={handleStartReview}
              disabled={
                targetMode === 'category' && selectedCategories.length === 0
              }
            >
              <FaBook />
              復習を開始する
            </Button>
          </HStack>
          
          {/* デバッグ用クイック開始ボタン */}
          <Button
            variant="outline"
            colorScheme="blue"
            size="sm"
            onClick={() => {
              const quickSettings: ReviewSettings = {
                targetMode: 'all',
                questionCount: '3',
                reviewFormat: 'quiz',
                daysPeriod: 7
              }
              sessionStorage.setItem('reviewSettings', JSON.stringify(quickSettings))
              router.push('/review/execution')
            }}
          >
            🚀 クイック開始（テスト用）
          </Button>
        </VStack>
      </VStack>
    </Container>
  )
}