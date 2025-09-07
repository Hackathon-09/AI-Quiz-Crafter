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
  Badge,
} from '@chakra-ui/react'
import { useState } from 'react'
import {
  FaFileAlt,
  FaTrash,
  FaSearch,
  FaCalendarAlt,
  FaTag,
  FaTimes,
  FaSortAmountDown,
  FaSortAmountUp,
} from 'react-icons/fa'
import { Note } from '@/types'
import { createListCollection } from '@chakra-ui/react'
import { fetchAuthSession } from 'aws-amplify/auth'
import { useEffect } from 'react'
import FilePreview from '@/components/shared/FilePreview'


export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagFilterType, setTagFilterType] = useState<'or' | 'and'>('and')
  const [fileContent, setFileContent] = useState<{ [key: string]: string }>({})
  const [loadingFileContent, setLoadingFileContent] = useState<{
    [key: string]: boolean
  }>({})

  // API呼び出し関数
  const fetchAllNotes = async () => {
    try {
      setLoading(true)

      // Cognito認証セッションを取得
      const session = await fetchAuthSession()
      console.log('Auth session:', session)

      const idToken = session.tokens?.idToken?.toString()
      console.log('ID Token exists:', !!idToken)
      console.log('ID Token (first 20 chars):', idToken?.substring(0, 20))

      if (!idToken) {
        console.error('Authentication required - no ID token')
        alert('認証が必要です。再度ログインしてください。')
        setNotes([])
        return
      }

      console.log('Making API request to notes endpoint...')

      // API Gateway経由で全てのノートを取得
      const response = await fetch(
        'https://8hpurwn5q9.execute-api.ap-northeast-1.amazonaws.com/v1/notes',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
        }
      )

      console.log('API response status:', response.status)
      console.log(
        'API response headers:',
        Object.fromEntries(response.headers.entries())
      )

      if (response.ok) {
        const responseText = await response.text()
        console.log('Raw API response:', responseText)

        try {
          const fetchedNotes = JSON.parse(responseText)
          console.log('Parsed notes:', fetchedNotes)
          console.log('Notes type:', typeof fetchedNotes)
          console.log('Is array:', Array.isArray(fetchedNotes))
          console.log('Notes length:', fetchedNotes?.length)

          if (Array.isArray(fetchedNotes)) {
            setNotes(fetchedNotes)
          } else {
            console.error('API response is not an array:', fetchedNotes)
            setNotes([])
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError)
          console.error('Response text:', responseText)
          setNotes([])
        }
      } else {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        if (response.status === 401) {
          alert('認証エラー: 再度ログインしてください')
        } else if (response.status === 403) {
          alert('アクセス権限がありません')
        } else {
          alert(`API エラー: ${response.status} - ${errorText}`)
        }
        setNotes([])
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      alert('ノートの取得中にエラーが発生しました')
      setNotes([])
    } finally {
      setLoading(false)
    }
  }

  // ファイルダウンロード用のPresigned URL取得関数
  const getDownloadUrl = async (note: Note): Promise<string | null> => {
    console.log('Getting download URL for note:', {
      fileName: note.fileName,
      s3Path: note.s3Path,
      sourceType: note.sourceType,
    })

    if (!note.s3Path || note.sourceType !== 'file') {
      console.log('Invalid note for download:', {
        s3Path: note.s3Path,
        sourceType: note.sourceType,
      })
      return null
    }

    try {
      const session = await fetchAuthSession()
      const idToken = session.tokens?.idToken?.toString()

      if (!idToken) {
        console.error('Authentication required for download')
        return null
      }

      const requestBody = {
        fileName: note.fileName || '',
        contentType: note.contentType || 'application/octet-stream',
        s3Key: note.s3Path,
        operation: 'download',
      }
      console.log('Download API request body:', requestBody)

      const response = await fetch(
        'https://8hpurwn5q9.execute-api.ap-northeast-1.amazonaws.com/v1/upload-url',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      )

      console.log('Download API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Download API response data:', data)
        return data.downloadUrl || data.uploadUrl || null
      } else {
        const errorText = await response.text()
        console.error('Download API error:', response.status, errorText)
      }

      return null
    } catch (error) {
      console.error('Error getting download URL:', error)
      return null
    }
  }

  // ファイルダウンロード実行関数
  const handleDownloadFile = async (note: Note) => {
    console.log('Download clicked for note:', note)

    try {
      const downloadUrl = await getDownloadUrl(note)
      console.log('Download URL received:', downloadUrl)

      if (downloadUrl) {
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = note.fileName || 'download'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        console.log('Download initiated for:', note.fileName)
      } else {
        console.error('No download URL received')
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
      setLoadingFileContent((prev) => ({ ...prev, [note.s3Path!]: true }))

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
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            fileName: note.fileName || '',
            contentType: note.contentType || 'application/octet-stream',
            s3Key: note.s3Path,
            operation: 'download',
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('Presigned URL response:', data)

        const downloadUrl = data.downloadUrl || data.uploadUrl
        if (!downloadUrl) {
          console.error('No download URL found in response:', data)
          return 'ダウンロードURLが見つかりません'
        }
        const fileResponse = await fetch(downloadUrl)
        console.log('File fetch response status:', fileResponse.status)

        if (fileResponse.ok) {
          const content = await fileResponse.text()
          console.log('File content length:', content.length)
          setFileContent((prev) => ({ ...prev, [note.s3Path!]: content }))
          return content
        } else {
          console.error(
            'Failed to fetch file from S3:',
            fileResponse.status,
            fileResponse.statusText
          )
          return `ファイル取得エラー: ${fileResponse.status} ${fileResponse.statusText}`
        }
      } else {
        const errorText = await response.text()
        console.error(
          'Failed to get presigned URL:',
          response.status,
          errorText
        )
        return `Presigned URL取得エラー: ${response.status}`
      }

      return 'ファイル内容の取得に失敗しました'
    } catch (error) {
      console.error('Error fetching file content:', error)
      return 'ファイル内容の取得中にエラーが発生しました'
    } finally {
      setLoadingFileContent((prev) => ({ ...prev, [note.s3Path!]: false }))
    }
  }


  // コンポーネントマウント時にノートを取得
  useEffect(() => {
    fetchAllNotes()
  }, [])

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
        (note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false)

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
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title)
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

  const handleDeleteNote = async (noteId: string) => {
    try {
      // 削除確認
      const confirmed = window.confirm(
        'このノートを削除しますか？この操作は元に戻せません。'
      )
      if (!confirmed) return

      // Cognito認証セッションを取得
      const session = await fetchAuthSession()
      const idToken = session.tokens?.idToken?.toString()

      if (!idToken) {
        alert('認証が必要です')
        return
      }

      console.log('Deleting note:', noteId)

      // API Gateway経由でノートを削除
      const response = await fetch(
        `https://8hpurwn5q9.execute-api.ap-northeast-1.amazonaws.com/v1/notes?noteId=${noteId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
        }
      )

      if (response.ok) {
        console.log('Note deleted successfully')
        // ローカル状態からも削除
        setNotes((prevNotes) =>
          prevNotes.filter((note) => (note.noteId || note.id) !== noteId)
        )
        if (
          selectedNote &&
          (selectedNote.noteId || selectedNote.id) === noteId
        ) {
          setSelectedNote(null)
        }
        alert('ノートが削除されました')
      } else {
        const errorText = await response.text()
        console.error('Failed to delete note:', response.status, errorText)
        alert('ノートの削除に失敗しました')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('削除中にエラーが発生しました')
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
          <VStack gap={4} align="stretch" h="full">
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
                    onClick={() =>
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }
                    minW="50px"
                  >
                    {sortOrder === 'desc' ? (
                      <FaSortAmountDown />
                    ) : (
                      <FaSortAmountUp />
                    )}
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
            <Box flex={1} overflowY="auto">
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
                      key={note.noteId || note.id}
                      p={4}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        bg: 'purple.50',
                        transform: 'translateY(-1px)',
                      }}
                      onClick={() => setSelectedNote(note)}
                      bg={
                        (selectedNote?.noteId || selectedNote?.id) ===
                        (note.noteId || note.id)
                          ? 'purple.50'
                          : 'white'
                      }
                      border="1px"
                      borderColor={
                        (selectedNote?.noteId || selectedNote?.id) ===
                        (note.noteId || note.id)
                          ? 'purple.200'
                          : 'gray.200'
                      }
                    >
                      <HStack justify="space-between">
                        <VStack align="start" gap={2} flex={1}>
                          <Text fontSize="md" fontWeight="bold" truncate>
                            {note.title}
                          </Text>
                          <Text fontSize="sm" color="gray.600" lineClamp={2}>
                            {(() => {
                              if (
                                note.content === undefined ||
                                note.content === null
                              ) {
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
                        
                        <VStack gap={1}>
                          <IconButton
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={async (e) => {
                              e.stopPropagation()
                              await handleDeleteNote(note.noteId || note.id)
                            }}
                          >
                            <FaTrash size={12} />
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
        <GridItem position="sticky" top="calc(60px + 1rem)" alignSelf="start">
          <Card.Root p={6} maxH="calc(100vh - 120px)" overflowY="auto">
            {selectedNote ? (
              <VStack gap={4} align="stretch" h="full">
                <Box>
                  <HStack justify="space-between" align="center" mb={3}>
                    <Heading size="lg" flex={1} pr={4}>
                      {selectedNote.title}
                    </Heading>
                    {selectedNote.sourceType && (
                      <Badge 
                        colorScheme="blue" 
                        variant="outline"
                        borderStyle="solid"
                        borderWidth="1px"
                        fontWeight="semibold"
                        flexShrink={0}
                      >
                        📄 {selectedNote.sourceType === 'text'
                          ? 'テキスト'
                          : selectedNote.sourceType === 'file'
                            ? 'ファイル'
                            : selectedNote.sourceType === 'notion'
                              ? 'Notion'
                              : selectedNote.sourceType}
                      </Badge>
                    )}
                  </HStack>
                  <HStack justify="space-between" align="center" flexWrap="wrap">
                    <Text fontSize="sm" color="gray.500">
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
                    {/* タグを右側に配置 */}
                    {selectedNote.tags && selectedNote.tags.length > 0 && (
                      <HStack gap={2} flexWrap="wrap">
                        {selectedNote.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            colorScheme="purple" 
                            variant="solid"
                            borderRadius="full"
                            px={3}
                            size="sm"
                          >
                            🏷️ {tag}
                          </Badge>
                        ))}
                      </HStack>
                    )}
                  </HStack>
                </Box>


                {/* ファイル情報 */}
                {selectedNote.sourceType === 'file' &&
                  selectedNote.fileName && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        ファイル情報
                      </Text>
                      <HStack gap={4}>
                        <Text fontSize="sm" color="gray.600">
                          ファイル名: {selectedNote.fileName}
                        </Text>
                        {selectedNote.fileSize && (
                          <Text fontSize="sm" color="gray.600">
                            サイズ: {(selectedNote.fileSize / 1024).toFixed(1)}
                            KB
                          </Text>
                        )}
                      </HStack>
                    </Box>
                  )}

                {/* Notion情報 */}
                {selectedNote.sourceType === 'notion' &&
                  selectedNote.notionUrl && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Notion情報
                      </Text>
                      <Text
                        fontSize="sm"
                        color="blue.500"
                        wordBreak="break-all"
                      >
                        {selectedNote.notionUrl}
                      </Text>
                    </Box>
                  )}

                {/* コンテンツ表示 */}
                <Box flex={1}>
                  <FilePreview
                    note={selectedNote}
                    fetchFileContent={fetchFileContent}
                    loadingFileContent={loadingFileContent}
                    handleDownloadFile={handleDownloadFile}
                    maxHeight="400px"
                    showFileName={false}
                  />
                </Box>

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
