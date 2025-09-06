'use client'

import {
  Container,
  Grid,
  GridItem,
  Heading,
  VStack,
  HStack,
  Box,
  Text,
  Input,
  InputGroup,
  Button,
  Card,
  IconButton,
  Select,
  RadioGroup,
  Portal,
} from '@chakra-ui/react'
import { useState } from 'react'
import {
  FaFileAlt,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCalendarAlt,
  FaTag,
  FaTimes,
  FaSortAmountDown,
  FaSortAmountUp,
} from 'react-icons/fa'
import { Note } from '@/types'
import { mockNotes } from '@/data/mockNotes'
import { createListCollection } from '@chakra-ui/react'

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(mockNotes)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagFilterType, setTagFilterType] = useState<'or' | 'and'>('and')

  // Select用のコレクション定義
  const sortOptions = createListCollection({
    items: [
      { label: '作成日時', value: 'createdAt' },
      { label: 'タイトル順', value: 'title' },
    ],
  })

  // フィルターのためのチェックボックスグループ
  const allTags = notes.flatMap((note) => note.tags || [])
  const uniqueTags = [...new Set(allTags)]
  const tagOptions = createListCollection({
    items: uniqueTags.map((tag) => ({ label: tag, value: tag })),
  })

  const filteredNotes = notes
    .filter((note) => {
      const searchMatch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

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

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId))
    if (selectedNote?.id === noteId) {
      setSelectedNote(null)
    }
  }

  return (
    <Container maxW="container.xl" py={{ base: 4, md: 6 }}>
      <Heading mb={{ base: 4, md: 6 }} size={{ base: 'lg', md: 'xl' }}>
        ノート一覧
      </Heading>

      <Grid
        templateColumns={{
          base: '1fr',
          lg: '1fr 1fr',
        }}
        gap={{ base: 4, md: 6 }}
        minH="600px"
      >
        {/* 左カラム: ノート一覧 */}
        <GridItem>
          <VStack gap={4} align="stretch">
            {/* 検索・フィルター */}
            <Card.Root p={4}>
              <VStack gap={3} align="stretch">
                <HStack gap={3}>
                  <InputGroup startElement={<FaSearch />} flex={1}>
                    <Input
                      placeholder="ノートを検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                  <Select.Root
                    collection={sortOptions}
                    value={[sortBy]}
                    onValueChange={(e) => setSortBy(e.value[0])}
                    size="md"
                    width="200px"
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
                              <HStack>
                                {option.value === 'createdAt' ? (
                                  <FaCalendarAlt />
                                ) : (
                                  <FaTag />
                                )}
                                <Text>{option.label}</Text>
                              </HStack>
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                  <Button
                    size="md"
                    variant="outline"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    minW="50px"
                  >
                    {sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                  </Button>
                </HStack>

                <VStack align="stretch" mt={3}>
                  <HStack justify="space-between" align="center">
                    <Text fontWeight="bold">タグで絞り込み</Text>
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

                <Text fontSize="sm" color="gray.500">
                  {filteredNotes.length}件のノートが見つかりました
                </Text>
              </VStack>
            </Card.Root>

            {/* ノート一覧 */}
            <Box maxH="600px" overflowY="auto">
              <VStack gap={2} align="stretch">
                {filteredNotes.length === 0 ? (
                  <Card.Root p={6} textAlign="center">
                    <VStack gap={3}>
                      <FaFileAlt size={48} color="gray" />
                      <Text fontSize="lg" color="gray.500">
                        ノートが見つかりません
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        検索条件を変更してお試しください
                      </Text>
                    </VStack>
                  </Card.Root>
                ) : (
                  filteredNotes.map((note) => (
                    <Card.Root
                      key={note.id}
                      p={4}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        bg: 'purple.50',
                        transform: 'translateY(-1px)',
                      }}
                      onClick={() => setSelectedNote(note)}
                      bg={selectedNote?.id === note.id ? 'purple.50' : 'white'}
                      border="1px"
                      borderColor={
                        selectedNote?.id === note.id ? 'purple.200' : 'gray.200'
                      }
                    >
                      <HStack justify="space-between">
                        <VStack align="start" gap={2} flex={1}>
                          <Text fontSize="md" fontWeight="bold" truncate>
                            {note.title}
                          </Text>
                          <Text fontSize="sm" color="gray.600" lineClamp={2}>
                            {(() => {
                              if (note.content === undefined || note.content === null) {
                                return 'コンテンツなし'
                              }
                              return note.content.length > 150 
                                ? `${note.content.substring(0, 150)}...`
                                : note.content
                            })()}
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            {new Date(note.createdAt).toLocaleDateString(
                              'ja-JP',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </Text>
                        </VStack>
                        <VStack gap={2}>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={(e) => {
                              e.stopPropagation()
                              // TODO: 編集機能を実装
                              console.log('Edit note:', note.id)
                            }}
                          >
                            <FaEdit />
                          </IconButton>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (
                                confirm(`「${note.title}」を削除しますか？`)
                              ) {
                                handleDeleteNote(note.id)
                              }
                            }}
                          >
                            <FaTrash />
                          </IconButton>
                        </VStack>
                      </HStack>
                    </Card.Root>
                  ))
                )}
              </VStack>
            </Box>
          </VStack>
        </GridItem>

        {/* 右カラム: 選択されたノートの詳細 */}
        <GridItem>
          <Card.Root p={6} h="full">
            {selectedNote ? (
              <VStack gap={4} align="stretch" h="full">
                <Box>
                  <Heading size="lg" mb={3}>
                    {selectedNote.title}
                  </Heading>
                  <Text fontSize="sm" color="gray.500" mb={4}>
                    作成日:{' '}
                    {new Date(selectedNote.createdAt).toLocaleDateString(
                      'ja-JP',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </Text>
                </Box>

                <Box
                  flex={1}
                  p={4}
                  bg="gray.50"
                  borderRadius="md"
                  overflowY="auto"
                >
                  <Text fontSize="md" lineHeight={1.7} whiteSpace="pre-wrap">
                    {selectedNote.content === undefined || selectedNote.content === null 
                      ? 'コンテンツがありません' 
                      : selectedNote.content
                    }
                  </Text>
                </Box>

                <HStack gap={2}>
                  <Button
                    colorScheme="blue"
                    onClick={() => {
                      // TODO: 編集機能を実装
                      console.log('Edit note:', selectedNote.id)
                    }}
                    flex={1}
                  >
                    <FaEdit />
                    編集
                  </Button>
                  <Button
                    colorScheme="red"
                    variant="outline"
                    onClick={() => {
                      if (
                        confirm(`「${selectedNote.title}」を削除しますか？`)
                      ) {
                        handleDeleteNote(selectedNote.id)
                      }
                    }}
                    flex={1}
                  >
                    <FaTrash />
                    削除
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <VStack gap={4} justify="center" h="full" textAlign="center">
                <FaFileAlt size={64} color="gray" />
                <Text fontSize="lg" color="gray.500">
                  ノートを選択してください
                </Text>
                <Text fontSize="sm" color="gray.400">
                  左側の一覧からノートをクリックして詳細を表示
                </Text>
              </VStack>
            )}
          </Card.Root>
        </GridItem>
      </Grid>
    </Container>
  )
}
