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
import { FaCheck, FaSearch, FaSortAmountDown, FaSortAmountUp, FaSync } from 'react-icons/fa'
import { useState, useEffect } from 'react'
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
import { fetchAuthSession } from 'aws-amplify/auth'
import FilePreview from '@/components/shared/FilePreview'

export default function QuizCreationPanel() {
  const router = useRouter()
  const [questionCount, setQuestionCount] = useState<QuestionCount>('5')
  const [questionType, setQuestionType] =
    useState<QuestionType>('multiple-choice')
  const [difficulty, setDifficulty] = useState<Difficulty>('standard')
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [fileContent, setFileContent] = useState<{[key: string]: string}>({})
  const [loadingFileContent, setLoadingFileContent] = useState<{[key: string]: boolean}>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagFilterType, setTagFilterType] = useState<'or' | 'and'>('and')

  // API呼び出し関数
  const fetchNotes = async () => {
    try {
      setLoading(true)
      
      // Cognito認証セッションを取得
      const session = await fetchAuthSession()
      const idToken = session.tokens?.idToken?.toString()
      
      if (!idToken) {
        console.log('Authentication required - no ID token')
        setNotes([])
        return
      }

      console.log('Making API request to notes endpoint...')
      
      // API Gateway経由でノートを取得
      const response = await fetch(
        'https://8hpurwn5q9.execute-api.ap-northeast-1.amazonaws.com/v1/notes',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
        }
      )

      if (response.ok) {
        const fetchedNotes = await response.json()
        console.log('Fetched notes:', fetchedNotes)
        setNotes(fetchedNotes)
      } else {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        setNotes([])
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      setNotes([])
    } finally {
      setLoading(false)
    }
  }

  // ファイルダウンロード用のPresigned URL取得関数
  const getDownloadUrl = async (note: Note): Promise<string | null> => {
    if (!note.s3Path || note.sourceType !== 'file') {
      return null
    }

    try {
      const session = await fetchAuthSession()
      const idToken = session.tokens?.idToken?.toString()
      
      if (!idToken) {
        return null
      }

      const response = await fetch(
        'https://8hpurwn5q9.execute-api.ap-northeast-1.amazonaws.com/v1/upload-url',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            fileName: note.fileName || '',
            contentType: note.contentType || 'application/octet-stream',
            s3Key: note.s3Path,
            operation: 'download'
          })
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        return data.downloadUrl || data.uploadUrl || null
      }
      
      return null
    } catch (error) {
      console.error('Error getting download URL:', error)
      return null
    }
  }

  // ファイルダウンロード実行関数
  const handleDownloadFile = async (note: Note) => {
    try {
      const downloadUrl = await getDownloadUrl(note)
      
      if (downloadUrl) {
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = note.fileName || 'download'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert('ファイルのダウンロードに失敗しました')
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('ダウンロード中にエラーが発生しました')
    }
  }

  // ファイル内容を取得する関数
  const fetchFileContent = async (note: Note): Promise<string> => {
    if (!note.s3Path || note.sourceType !== 'file') {
      return ''
    }
    
    if (fileContent[note.s3Path]) {
      return fileContent[note.s3Path]
    }

    if (loadingFileContent[note.s3Path]) {
      return 'ファイル内容を読み込み中...'
    }

    try {
      setLoadingFileContent(prev => ({...prev, [note.s3Path!]: true}))
      
      const session = await fetchAuthSession()
      const idToken = session.tokens?.idToken?.toString()
      
      if (!idToken) {
        return 'ファイル内容の取得には認証が必要です'
      }

      const response = await fetch(
        'https://8hpurwn5q9.execute-api.ap-northeast-1.amazonaws.com/v1/upload-url',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            fileName: note.fileName || '',
            contentType: note.contentType || 'application/octet-stream',
            s3Key: note.s3Path,
            operation: 'download'
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        const downloadUrl = data.downloadUrl || data.uploadUrl
        if (!downloadUrl) {
          return 'ダウンロードURLが見つかりません'
        }
        const fileResponse = await fetch(downloadUrl)
        
        if (fileResponse.ok) {
          const content = await fileResponse.text()
          setFileContent(prev => ({...prev, [note.s3Path!]: content}))
          return content
        } else {
          return `ファイル取得エラー: ${fileResponse.status} ${fileResponse.statusText}`
        }
      } else {
        return `Presigned URL取得エラー: ${response.status}`
      }
      
      return 'ファイル内容の取得に失敗しました'
    } catch (error) {
      console.error('Error fetching file content:', error)
      return 'ファイル内容の取得中にエラーが発生しました'
    } finally {
      setLoadingFileContent(prev => ({...prev, [note.s3Path!]: false}))
    }
  }

  // コンポーネントマウント時にノートを取得
  useEffect(() => {
    fetchNotes()
  }, [])

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
        (note.content || '').toLowerCase().includes(searchQuery.toLowerCase())

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
              <HStack justify="space-between" align="center">
                <Text fontSize="sm" fontWeight="medium">
                  ノートを選択 ({selectedNotes.length}個選択中)
                </Text>
                <IconButton
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => fetchNotes()}
                  loading={loading}
                  aria-label="リロード"
                >
                  <FaSync />
                </IconButton>
              </HStack>
              
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

                  <HStack justify="space-between" align="center">
                    <Text fontSize="xs" color="gray.500">
                      {filteredNotes.length}件のノートが見つかりました
                    </Text>
                    {notes.length > 0 && (
                      <Text fontSize="xs" color="gray.400">
                        全{notes.length}件中
                      </Text>
                    )}
                  </HStack>
                </VStack>
              </Card.Root>

              {/* ノート一覧 */}
              <Box maxH="300px" overflowY="auto" flex={1}>
                <VStack gap={2} align="stretch">
                  {loading ? (
                    <Card.Root p={4} textAlign="center">
                      <Text fontSize="sm" color="gray.500">
                        ノートを読み込み中...
                      </Text>
                    </Card.Root>
                  ) : filteredNotes.length === 0 ? (
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
                      const noteId = note.noteId || note.id
                      const isSelected = selectedNotes.includes(noteId)
                      return (
                        <Card.Root
                          key={noteId}
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
                                  setSelectedNotes(prev => prev.filter(id => id !== noteId))
                                } else {
                                  setSelectedNotes(prev => [...prev, noteId])
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
                                  {(() => {
                                    const content = note.content || ''
                                    return content.length > 60 ? `${content.substring(0, 60)}...` : content || 'コンテンツなし'
                                  })()}
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
                                      e.stopPropagation()
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
                                          <FilePreview 
                                            note={note} 
                                            fetchFileContent={fetchFileContent}
                                            loadingFileContent={loadingFileContent}
                                            handleDownloadFile={handleDownloadFile}
                                            maxHeight="400px"
                                            showFileName={false}
                                          />

                                          {/* アクションボタン */}
                                          <HStack justify="end" gap={2}>
                                            <Button
                                              variant={isSelected ? "solid" : "outline"}
                                              colorScheme="blue"
                                              onClick={() => {
                                                if (isSelected) {
                                                  setSelectedNotes(prev => prev.filter(id => id !== noteId))
                                                } else {
                                                  setSelectedNotes(prev => [...prev, noteId])
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