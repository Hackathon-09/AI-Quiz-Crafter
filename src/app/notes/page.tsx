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
  Textarea,
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
import { createListCollection } from '@chakra-ui/react'
import { fetchAuthSession } from 'aws-amplify/auth'
import { useEffect } from 'react'

// ファイル内容表示コンポーネント
interface FileContentDisplayProps {
  note: Note
  fetchFileContent: (note: Note) => Promise<string>
  loadingFileContent: { [key: string]: boolean }
  handleDownloadFile: (note: Note) => Promise<void>
  isEditing?: boolean
  editingContent?: string
  setEditingContent?: (content: string) => void
  editingNotionUrl?: string
  setEditingNotionUrl?: (url: string) => void
}

function FileContentDisplay({
  note,
  fetchFileContent,
  loadingFileContent,
  handleDownloadFile,
  isEditing = false,
  editingContent = '',
  setEditingContent,
  editingNotionUrl = '',
  setEditingNotionUrl,
}: FileContentDisplayProps) {
  const [displayContent, setDisplayContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // ファイル形式判定
  const isTextFile = (fileName?: string, contentType?: string) => {
    if (!fileName && !contentType) return false

    const textExtensions = ['.txt', '.md', '.json', '.csv', '.log']
    const textContentTypes = ['text/', 'application/json', 'application/csv']

    if (fileName) {
      const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
      if (textExtensions.some((e) => ext === e)) return true
    }

    if (contentType) {
      if (textContentTypes.some((t) => contentType.startsWith(t))) return true
    }

    return false
  }

  const isPdfFile = (fileName?: string, contentType?: string) => {
    return (
      fileName?.toLowerCase().endsWith('.pdf') ||
      contentType === 'application/pdf'
    )
  }

  const isWordFile = (fileName?: string, contentType?: string) => {
    return (
      fileName?.toLowerCase().endsWith('.docx') ||
      contentType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  }

  const isImageFile = (fileName?: string, contentType?: string) => {
    const imageExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.bmp',
      '.webp',
      '.svg',
    ]

    if (fileName) {
      const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
      if (imageExtensions.some((e) => ext === e)) return true
    }

    if (contentType?.startsWith('image/')) return true

    return false
  }

  useEffect(() => {
    if (note.sourceType === 'file' && note.s3Path) {
      setIsLoading(true)
      fetchFileContent(note).then((content) => {
        setDisplayContent(content)
        setIsLoading(false)
      })
    } else if (note.content) {
      setDisplayContent(note.content)
    }
  }, [note, fetchFileContent])

  if (!note.content && note.sourceType !== 'file') {
    return null
  }

  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" mb={2}>
        内容
      </Text>
      <Box
        p={4}
        bg="gray.50"
        borderRadius="md"
        maxH="400px"
        overflowY="auto"
        border="1px"
        borderColor="gray.200"
      >
        {isLoading || (note.s3Path && loadingFileContent[note.s3Path]) ? (
          <Text fontSize="sm" color="gray.500" fontStyle="italic">
            ファイル内容を読み込み中...
          </Text>
        ) : note.sourceType === 'file' &&
          isPdfFile(note.fileName, note.contentType) ? (
          <VStack align="center" gap={3}>
            <Text fontSize="sm" color="orange.600" fontWeight="medium">
              📄 PDFファイルです
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              PDFファイルは直接表示できません。
              <br />
              ブラウザで表示して閲覧してください。
            </Text>
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={() => handleDownloadFile(note)}
            >
              ブラウザで表示
            </Button>
          </VStack>
        ) : note.sourceType === 'file' &&
          isWordFile(note.fileName, note.contentType) ? (
          <VStack align="center" gap={3}>
            <Text fontSize="sm" color="blue.600" fontWeight="medium">
              📝 Wordファイルです
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              Wordファイルは直接表示できません。
              <br />
              ブラウザで表示して閲覧してください。
            </Text>
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={() => handleDownloadFile(note)}
            >
              ブラウザで表示
            </Button>
          </VStack>
        ) : note.sourceType === 'file' &&
          isImageFile(note.fileName, note.contentType) ? (
          <VStack align="center" gap={3}>
            <Text fontSize="sm" color="green.600" fontWeight="medium">
              🖼️ 画像ファイルです
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              画像ファイルは直接表示できません。
              <br />
              ブラウザで表示して閲覧してください。
            </Text>
            <Button
              size="sm"
              colorScheme="green"
              variant="outline"
              onClick={() => handleDownloadFile(note)}
            >
              ブラウザで表示
            </Button>
          </VStack>
        ) : note.sourceType === 'file' &&
          !isTextFile(note.fileName, note.contentType) ? (
          <VStack align="center" gap={2}>
            <Text fontSize="sm" color="purple.600" fontWeight="medium">
              📁 {note.contentType || 'バイナリファイル'}
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              このファイル形式は直接表示できません。
            </Text>
          </VStack>
        ) : (
          <>
            {/* Notionノートの編集 */}
            {note.sourceType === 'notion' && isEditing ? (
              <VStack align="stretch" gap={3}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    NotionURL
                  </Text>
                  <Input
                    value={editingNotionUrl}
                    onChange={(e) => setEditingNotionUrl?.(e.target.value)}
                    placeholder="https://notion.so/..."
                    border="2px"
                    borderColor="blue.300"
                  />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    メモ
                  </Text>
                  <Textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent?.(e.target.value)}
                    placeholder="Notionページに関するメモを入力..."
                    minH="200px"
                    border="2px"
                    borderColor="blue.300"
                    resize="vertical"
                  />
                </Box>
              </VStack>
            ) : /* テキストノートの編集 */ isEditing &&
              note.sourceType === 'text' ? (
              <Textarea
                value={editingContent}
                onChange={(e) => setEditingContent?.(e.target.value)}
                placeholder="ノート内容を入力..."
                minH="300px"
                border="2px"
                borderColor="blue.300"
                resize="vertical"
                fontSize="sm"
                lineHeight={1.6}
              />
            ) : (
              <Text fontSize="sm" lineHeight={1.6} whiteSpace="pre-wrap">
                {displayContent || 'コンテンツがありません'}
              </Text>
            )}
          </>
        )}
      </Box>
    </Box>
  )
}

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
  const [isEditing, setIsEditing] = useState(false)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingContent, setEditingContent] = useState('')
  const [editingNotionUrl, setEditingNotionUrl] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

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

  // 編集を開始する関数
  const startEditing = (note: Note) => {
    if (note.sourceType === 'file') {
      alert('ファイルノートは編集できません')
      return
    }

    setIsEditing(true)
    setEditingTitle(note.title)
    setEditingContent(note.content || '')
    setEditingNotionUrl(note.notionUrl || '')
  }

  // 編集をキャンセルする関数
  const cancelEditing = () => {
    setIsEditing(false)
    setEditingTitle('')
    setEditingContent('')
    setEditingNotionUrl('')
  }

  // ノートを更新する関数
  const updateNote = async () => {
    if (!selectedNote) return

    try {
      setIsUpdating(true)

      const session = await fetchAuthSession()
      const idToken = session.tokens?.idToken?.toString()

      if (!idToken) {
        alert('認証が必要です')
        return
      }

      const updateData: {
        noteId: string
        title: string
        content?: string
        notionUrl?: string
      } = {
        noteId: selectedNote.noteId || selectedNote.id,
        title: editingTitle,
      }

      if (selectedNote.sourceType === 'text') {
        updateData.content = editingContent
      } else if (selectedNote.sourceType === 'notion') {
        updateData.notionUrl = editingNotionUrl
      }

      console.log('Updating note:', updateData)

      const response = await fetch(
        'https://8hpurwn5q9.execute-api.ap-northeast-1.amazonaws.com/v1/notes',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(updateData),
        }
      )

      if (response.ok) {
        console.log('Note updated successfully')

        // ローカル状態を更新
        const updatedNote = { ...selectedNote }
        updatedNote.title = editingTitle
        if (selectedNote.sourceType === 'text') {
          updatedNote.content = editingContent
        } else if (selectedNote.sourceType === 'notion') {
          updatedNote.notionUrl = editingNotionUrl
        }

        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            (note.noteId || note.id) ===
            (selectedNote.noteId || selectedNote.id)
              ? updatedNote
              : note
          )
        )
        setSelectedNote(updatedNote)

        // 編集モードを終了
        setIsEditing(false)
        setEditingTitle('')
        setEditingContent('')
        setEditingNotionUrl('')

        alert('ノートが更新されました')
      } else {
        const errorText = await response.text()
        console.error('Failed to update note:', response.status, errorText)
        alert('ノートの更新に失敗しました')
      }
    } catch (error) {
      console.error('Error updating note:', error)
      alert('更新中にエラーが発生しました')
    } finally {
      setIsUpdating(false)
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
                  {isEditing ? (
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      fontSize="lg"
                      fontWeight="bold"
                      border="2px"
                      borderColor="blue.300"
                      mb={3}
                      placeholder="ノートのタイトル"
                    />
                  ) : (
                    <Heading size="lg" mb={3}>
                      {selectedNote.title}
                    </Heading>
                  )}
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

                {/* メタ情報 */}
                {(selectedNote.sourceType ||
                  selectedNote.fileName ||
                  selectedNote.tags) && (
                  <VStack align="stretch" gap={3}>
                    <HStack gap={4} flexWrap="wrap">
                      {selectedNote.sourceType && (
                        <Badge colorScheme="blue">
                          {selectedNote.sourceType === 'text'
                            ? 'テキスト'
                            : selectedNote.sourceType === 'file'
                              ? 'ファイル'
                              : selectedNote.sourceType === 'notion'
                                ? 'Notion'
                                : selectedNote.sourceType}
                        </Badge>
                      )}
                    </HStack>

                    {/* タグ */}
                    {selectedNote.tags && selectedNote.tags.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          タグ
                        </Text>
                        <HStack gap={2} flexWrap="wrap">
                          {selectedNote.tags.map((tag, index) => (
                            <Badge key={index} colorScheme="purple">
                              {tag}
                            </Badge>
                          ))}
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                )}

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
                  <FileContentDisplay
                    note={selectedNote}
                    fetchFileContent={fetchFileContent}
                    loadingFileContent={loadingFileContent}
                    handleDownloadFile={handleDownloadFile}
                    isEditing={isEditing}
                    editingContent={editingContent}
                    setEditingContent={setEditingContent}
                    editingNotionUrl={editingNotionUrl}
                    setEditingNotionUrl={setEditingNotionUrl}
                  />
                </Box>

                <HStack gap={2}>
                  {isEditing ? (
                    <>
                      <Button
                        colorScheme="blue"
                        onClick={updateNote}
                        flex={1}
                        loading={isUpdating}
                        disabled={!editingTitle.trim()}
                      >
                        保存
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelEditing}
                        flex={1}
                        disabled={isUpdating}
                      >
                        キャンセル
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        colorScheme="blue"
                        onClick={() => startEditing(selectedNote)}
                        flex={1}
                        disabled={selectedNote.sourceType === 'file'}
                      >
                        <FaEdit />
                        編集
                      </Button>
                      <Button
                        colorScheme="red"
                        variant="outline"
                        onClick={() => {
                          handleDeleteNote(
                            selectedNote.noteId || selectedNote.id
                          )
                        }}
                        flex={1}
                      >
                        <FaTrash />
                        削除
                      </Button>
                    </>
                  )}
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
