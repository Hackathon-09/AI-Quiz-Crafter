'use client'

import {
  VStack,
  HStack,
  Box,
  Button,
  Text,
  Select,
  RadioGroup,
  Portal,
  Card,
  Badge,
  Input,
  InputGroup,
  Grid,
  GridItem,
  IconButton,
  CloseButton,
} from '@chakra-ui/react'
import { 
  Dialog
} from '@chakra-ui/react'
import { FaCheck, FaSearch, FaCalendarAlt, FaSortAmountDown, FaSortAmountUp, FaInfoCircle, FaTimes } from 'react-icons/fa'
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
import { Note } from '@/types'
import { mockNotes } from '@/data/mockNotes'

export default function QuizCreationPanel() {
  const router = useRouter()
  const [questionCount, setQuestionCount] = useState<QuestionCount>('5')
  const [questionType, setQuestionType] =
    useState<QuestionType>('multiple-choice')
  const [difficulty, setDifficulty] = useState<Difficulty>('standard')
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const [notes] = useState<Note[]>(mockNotes)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagFilterType, setTagFilterType] = useState<'or' | 'and'>('and')

  // Select用のコレクション定義
  const questionCountOptions = createListCollection({
    items: QUESTION_COUNT_OPTIONS,
  })

  const sortOptions = createListCollection({
    items: [
      { label: '作成日時', value: 'createdAt' },
      { label: 'タイトル順', value: 'title' },
    ],
  })

  // タグフィルターのための準備
  const allTags = notes.flatMap((note) => note.tags || [])
  const uniqueTags = [...new Set(allTags)]
  const tagOptions = createListCollection({
    items: uniqueTags.map((tag) => ({ label: tag, value: tag })),
  })

  // フィルター済みのノート一覧
  const filteredNotes = notes
    .filter((note) => {
      const searchMatch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())

      if (selectedTags.length === 0) {
        return searchMatch
      }

      const noteTags = note.tags || []
      const tagMatch =
        tagFilterType === 'or'
          ? selectedTags.some((tag) => noteTags.includes(tag))
          : selectedTags.every((tag) => noteTags.includes(tag))

      return searchMatch && tagMatch
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title)
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

  const handleGenerateQuiz = () => {
    const settings: QuizSettings = {
      questionCount,
      questionType,
      difficulty,
      selectedNotes: selectedNotes,
    }

    // 設定をsessionStorageに保存（URLが長くならない）
    sessionStorage.setItem('quizSettings', JSON.stringify(settings))
    router.push('/quiz/execution')
  }

  return (
    <Box
      p={{ base: 4, md: 6 }}
      bg="white"
      borderRadius="lg"
      shadow="sm"
      border="1px"
      borderColor="gray.200"
      w="full"
    >
      <VStack gap={{ base: 4, md: 6 }} align="stretch">
        <Text fontSize="lg" fontWeight="bold" color="blue.600">
          クイズ作成
        </Text>

        {/* メインレイアウト：左1/3設定、右2/3ノート一覧 */}
        <Grid
          templateColumns={{ base: "1fr", lg: "1fr 2fr" }}
          gap={{ base: 4, md: 6 }}
          minH="400px"
        >
          {/* 左側：設定エリア */}
          <GridItem>
            <VStack gap={4} align="stretch" h="full">
              {/* 問題数指定 */}
              <VStack align="stretch" gap={4}>
                <Text fontSize="sm" fontWeight="medium">
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
              </VStack>

              {/* 問題形式選択 */}
              <VStack align="stretch" gap={2}>
                <Text fontSize="sm" fontWeight="medium">
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
              </VStack>

              {/* 難易度選択 */}
              <VStack align="stretch" gap={2}>
                <Text fontSize="sm" fontWeight="medium">
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
                  <VStack align="start" gap={2}>
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
                  </VStack>
                </RadioGroup.Root>
              </VStack>
            </VStack>
          </GridItem>

          {/* 右側：ノート一覧エリア */}
          <GridItem>
            <VStack gap={4} align="stretch" h="full">
              <Text fontSize="sm" fontWeight="medium">
                ノートを選択 ({selectedNotes.length}個選択中)
              </Text>
              
              {/* 検索・フィルター */}
              <Card.Root p={3}>
                <VStack gap={3} align="stretch">
                  <HStack gap={3}>
                    <InputGroup startElement={<FaSearch />} flex={1}>
                      <Input
                        placeholder="ノートを検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="sm"
                      />
                    </InputGroup>
                    <Select.Root
                      collection={sortOptions}
                      value={[sortBy]}
                      onValueChange={(e) => setSortBy(e.value[0])}
                      size="sm"
                      width="120px"
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content>
                            {sortOptions.items.map((option) => (
                              <Select.Item key={option.value} item={option}>
                                {option.label}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      minW="40px"
                    >
                      {sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                    </Button>
                  </HStack>

                  {/* タグフィルター */}
                  <VStack align="stretch" gap={2}>
                    <HStack justify="space-between" align="center">
                      <Text fontSize="sm" fontWeight="bold">タグで絞り込み</Text>
                      <Button
                        size="xs"
                        variant={tagFilterType === 'or' ? 'solid' : 'outline'}
                        colorScheme="purple"
                        onClick={() =>
                          setTagFilterType(tagFilterType === 'and' ? 'or' : 'and')
                        }
                        minW="60px"
                      >
                        {tagFilterType === 'and' ? 'AND' : 'OR'}
                      </Button>
                    </HStack>
                    <Select.Root
                      multiple
                      collection={tagOptions}
                      value={selectedTags}
                      onValueChange={(details) => setSelectedTags(details.value)}
                      size="sm"
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="タグを選択" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content>
                            {tagOptions.items.map((tag) => (
                              <Select.Item item={tag} key={tag.value}>
                                {tag.label}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                  </VStack>

                  <Text fontSize="xs" color="gray.500">
                    {filteredNotes.length}件のノートが見つかりました
                  </Text>
                </VStack>
              </Card.Root>

              {/* ノート一覧 */}
              <Box maxH="300px" overflowY="auto" flex={1}>
                <VStack gap={2} align="stretch">
                  {filteredNotes.length === 0 ? (
                    <Card.Root p={4} textAlign="center">
                      <VStack gap={2}>
                        <Text fontSize="sm" color="gray.500">
                          ノートが見つかりません
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          検索条件を変更してお試しください
                        </Text>
                      </VStack>
                    </Card.Root>
                  ) : (
                    filteredNotes.map((note) => {
                      const isSelected = selectedNotes.includes(note.id)
                      return (
                        <Card.Root
                          key={note.id}
                          p={3}
                          transition="all 0.2s"
                          bg={isSelected ? 'blue.50' : 'white'}
                          border="1px"
                          borderColor={isSelected ? 'blue.200' : 'gray.200'}
                          _hover={{ 
                            bg: isSelected ? 'blue.100' : 'blue.50', 
                            borderColor: 'blue.300',
                            transform: 'translateY(-1px)'
                          }}
                        >
                          <HStack justify="space-between">
                            {/* クリック可能なメインエリア */}
                            <Box
                              flex={1}
                              cursor="pointer"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedNotes(prev => prev.filter(id => id !== note.id))
                                } else {
                                  setSelectedNotes(prev => [...prev, note.id])
                                }
                              }}
                            >
                              <VStack align="start" gap={1}>
                                <HStack>
                                  <Text fontSize="sm" fontWeight="medium" truncate>
                                    {note.title}
                                  </Text>
                                  {note.tags && note.tags.length > 0 && (
                                    <Badge size="sm" colorPalette="blue" variant="subtle">
                                      {note.tags[0]}
                                    </Badge>
                                  )}
                                </HStack>
                                <Text fontSize="xs" color="gray.500" lineClamp={1}>
                                  {note.content.substring(0, 60)}
                                  {note.content.length > 60 ? '...' : ''}
                                </Text>
                                <Text fontSize="xs" color="gray.400">
                                  {new Date(note.createdAt).toLocaleDateString()}
                                </Text>
                              </VStack>
                            </Box>
                            
                            {/* 右側のアクション */}
                            <HStack gap={2} flexShrink={0}>
                              {/* 詳細表示ボタン */}
                              <Dialog.Root size="lg" placement="center">
                                <Dialog.Trigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="blue"
                                    onClick={(e) => {
                                      e.stopPropagation() // カード選択を防ぐ
                                    }}
                                  >
                                    ノートを見る
                                  </Button>
                                </Dialog.Trigger>
                                <Portal>
                                  <Dialog.Backdrop />
                                  <Dialog.Positioner>
                                    <Dialog.Content>
                                      <Dialog.Header>
                                        <Dialog.Title>{note.title}</Dialog.Title>
                                        <Dialog.CloseTrigger asChild>
                                          <CloseButton size="sm" />
                                        </Dialog.CloseTrigger>
                                      </Dialog.Header>
                                      <Dialog.Body>
                                        <VStack align="stretch" gap={4}>
                                          {/* メタ情報 */}
                                          <Box>
                                            <HStack justify="space-between" mb={2} flexWrap="wrap">
                                              <Text fontSize="sm" color="gray.500">
                                                作成日: {new Date(note.createdAt).toLocaleDateString('ja-JP', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                })}
                                              </Text>
                                              {note.tags && note.tags.length > 0 && (
                                                <HStack gap={1} flexWrap="wrap">
                                                  {note.tags.map((tag, index) => (
                                                    <Badge key={index} size="sm" colorPalette="blue" variant="subtle">
                                                      {tag}
                                                    </Badge>
                                                  ))}
                                                </HStack>
                                              )}
                                            </HStack>
                                          </Box>
                                          
                                          {/* ノート内容 */}
                                          <Box
                                            p={4}
                                            bg="gray.50"
                                            borderRadius="md"
                                            maxH="400px"
                                            overflowY="auto"
                                            border="1px"
                                            borderColor="gray.200"
                                          >
                                            <Text fontSize="sm" lineHeight={1.7} whiteSpace="pre-wrap">
                                              {note.content}
                                            </Text>
                                          </Box>

                                          {/* アクションボタン */}
                                          <HStack justify="end" gap={2}>
                                            <Button
                                              variant={isSelected ? "solid" : "outline"}
                                              colorScheme="blue"
                                              onClick={() => {
                                                if (isSelected) {
                                                  setSelectedNotes(prev => prev.filter(id => id !== note.id))
                                                } else {
                                                  setSelectedNotes(prev => [...prev, note.id])
                                                }
                                              }}
                                            >
                                              {isSelected ? "選択を解除" : "クイズに使用"}
                                            </Button>
                                          </HStack>
                                        </VStack>
                                      </Dialog.Body>
                                    </Dialog.Content>
                                  </Dialog.Positioner>
                                </Portal>
                              </Dialog.Root>

                              {/* 選択状態のインジケーター */}
                              {isSelected && (
                                <Box
                                  w={5}
                                  h={5}
                                  bg="blue.500"
                                  borderRadius="full"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <FaCheck size={10} color="white" />
                                </Box>
                              )}
                            </HStack>
                          </HStack>
                        </Card.Root>
                      )
                    })
                  )}
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>

        {/* 下部：クイズ生成ボタン */}
        <Button
          colorScheme="blue"
          size="lg"
          onClick={handleGenerateQuiz}
          disabled={selectedNotes.length === 0}
          w="full"
        >
          選択したノートからクイズを生成する ({selectedNotes.length}個のノート)
        </Button>
      </VStack>
    </Box>
  )
}