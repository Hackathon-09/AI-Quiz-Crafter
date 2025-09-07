'use client'

import {
  VStack,
  HStack,
  Box,
  Button,
  Text,
  IconButton,
  Card,
  Portal,
  CloseButton,
  Badge,
  Separator,
} from '@chakra-ui/react'
import { 
  Dialog
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FaTrash, FaFileAlt, FaList, FaSync } from 'react-icons/fa'
import { Note } from '@/types'
import { useRouter } from 'next/navigation'
import { fetchAuthSession } from 'aws-amplify/auth'

// ファイル内容表示コンポーネント
interface FileContentDisplayProps {
  note: Note
  fetchFileContent: (note: Note) => Promise<string>
  loadingFileContent: {[key: string]: boolean}
  handleDownloadFile: (note: Note) => Promise<void>
}

function FileContentDisplay({ note, fetchFileContent, loadingFileContent, handleDownloadFile }: FileContentDisplayProps) {
  const [displayContent, setDisplayContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // ファイル形式判定
  const isTextFile = (fileName?: string, contentType?: string) => {
    if (!fileName && !contentType) return false
    
    const textExtensions = ['.txt', '.md', '.json', '.csv', '.log']
    const textContentTypes = ['text/', 'application/json', 'application/csv']
    
    if (fileName) {
      const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
      if (textExtensions.some(e => ext === e)) return true
    }
    
    if (contentType) {
      if (textContentTypes.some(t => contentType.startsWith(t))) return true
    }
    
    return false
  }

  const isPdfFile = (fileName?: string, contentType?: string) => {
    return fileName?.toLowerCase().endsWith('.pdf') || 
           contentType === 'application/pdf'
  }

  const isWordFile = (fileName?: string, contentType?: string) => {
    return fileName?.toLowerCase().endsWith('.docx') || 
           contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }

  const isImageFile = (fileName?: string, contentType?: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
    
    if (fileName) {
      const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
      if (imageExtensions.some(e => ext === e)) return true
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
      <Text fontSize="sm" fontWeight="medium" mb={2}>内容</Text>
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
        ) : note.sourceType === 'file' && isPdfFile(note.fileName, note.contentType) ? (
          <VStack align="center" gap={3}>
            <Text fontSize="sm" color="orange.600" fontWeight="medium">
              📄 PDFファイルです
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              PDFファイルは直接表示できません。<br />
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
        ) : note.sourceType === 'file' && isWordFile(note.fileName, note.contentType) ? (
          <VStack align="center" gap={3}>
            <Text fontSize="sm" color="blue.600" fontWeight="medium">
              📝 Wordファイルです
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              Wordファイルは直接表示できません。<br />
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
        ) : note.sourceType === 'file' && isImageFile(note.fileName, note.contentType) ? (
          <VStack align="center" gap={3}>
            <Text fontSize="sm" color="green.600" fontWeight="medium">
              🖼️ 画像ファイルです
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              画像ファイルは直接表示できません。<br />
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
        ) : note.sourceType === 'file' && !isTextFile(note.fileName, note.contentType) ? (
          <VStack align="center" gap={2}>
            <Text fontSize="sm" color="purple.600" fontWeight="medium">
              📁 {note.contentType || 'バイナリファイル'}
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              このファイル形式は直接表示できません。
            </Text>
          </VStack>
        ) : (
          <Text
            fontSize="sm"
            lineHeight={1.6}
            whiteSpace="pre-wrap"
          >
            {displayContent || 'コンテンツがありません'}
          </Text>
        )}
      </Box>
    </Box>
  )
}

export default function NoteListSection() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [fileContent, setFileContent] = useState<{[key: string]: string}>({}) // ファイル内容のキャッシュ
  const [loadingFileContent, setLoadingFileContent] = useState<{[key: string]: boolean}>({}) // ファイル内容のロード状態

  // API呼び出し関数（シンプルなHTTPリクエスト）
  const fetchRecentNotes = async () => {
    try {
      setLoading(true)
      
      // Cognito認証セッションを取得
      const session = await fetchAuthSession()
      console.log('[Dashboard] Auth session:', session)
      
      const idToken = session.tokens?.idToken?.toString()
      console.log('[Dashboard] ID Token exists:', !!idToken)
      console.log('[Dashboard] ID Token (first 20 chars):', idToken?.substring(0, 20))
      
      if (!idToken) {
        console.error('[Dashboard] Authentication required - no ID token')
        setNotes([]) // 認証なしの場合は空配列
        return
      }

      console.log('[Dashboard] Making API request to notes endpoint...')
      
      // API Gateway経由でノートを取得（降順10件）
      const response = await fetch(
        'https://8hpurwn5q9.execute-api.ap-northeast-1.amazonaws.com/v1/notes?limit=10',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
        }
      )

      console.log('[Dashboard] API response status:', response.status)
      console.log('[Dashboard] API response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const responseText = await response.text()
        console.log('[Dashboard] Raw API response:', responseText)
        
        try {
          const fetchedNotes = JSON.parse(responseText)
          console.log('[Dashboard] Parsed notes:', fetchedNotes)
          console.log('[Dashboard] Notes type:', typeof fetchedNotes)
          console.log('[Dashboard] Is array:', Array.isArray(fetchedNotes))
          console.log('[Dashboard] Notes length:', fetchedNotes?.length)
          
          if (Array.isArray(fetchedNotes)) {
            setNotes(fetchedNotes)
          } else {
            console.error('[Dashboard] API response is not an array:', fetchedNotes)
            setNotes([])
          }
        } catch (parseError) {
          console.error('[Dashboard] JSON parse error:', parseError)
          console.error('[Dashboard] Response text:', responseText)
          setNotes([])
        }
      } else {
        const errorText = await response.text()
        console.error('[Dashboard] API Error:', response.status, errorText)
        setNotes([]) // エラー時は空配列
      }
    } catch (error) {
      console.error('[Dashboard] Error fetching notes:', error)
      setNotes([]) // エラー時は空配列
    } finally {
      setLoading(false)
    }
  }

  // ファイルダウンロード用のPresigned URL取得関数
  const getDownloadUrl = async (note: Note): Promise<string | null> => {
    console.log('Getting download URL for note:', { fileName: note.fileName, s3Path: note.s3Path, sourceType: note.sourceType })
    
    if (!note.s3Path || note.sourceType !== 'file') {
      console.log('Invalid note for download:', { s3Path: note.s3Path, sourceType: note.sourceType })
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
        operation: 'download'
      }
      console.log('Download API request body:', requestBody)

      const response = await fetch(
        'https://8hpurwn5q9.execute-api.ap-northeast-1.amazonaws.com/v1/upload-url',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify(requestBody)
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
        // ダウンロードリンクを作成してクリック
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = note.fileName || 'download'
        link.target = '_blank' // 新しいタブで開く
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
    
    // キャッシュされている場合は返す
    if (fileContent[note.s3Path]) {
      return fileContent[note.s3Path]
    }

    // 既にロード中の場合は待機
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

      // S3からファイル内容を取得（Presigned URLを使用）
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
        console.log('Presigned URL response:', data)
        console.log('Download URL:', data.downloadUrl)
        console.log('Note info:', { fileName: note.fileName, s3Path: note.s3Path })
        
        // Presigned URLからファイル内容を取得
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
          // キャッシュに保存
          setFileContent(prev => ({...prev, [note.s3Path!]: content}))
          return content
        } else {
          console.error('Failed to fetch file from S3:', fileResponse.status, fileResponse.statusText)
          return `ファイル取得エラー: ${fileResponse.status} ${fileResponse.statusText}`
        }
      } else {
        const errorText = await response.text()
        console.error('Failed to get presigned URL:', response.status, errorText)
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
    fetchRecentNotes()
  }, [])

  const handleDeleteNote = async (noteId: string) => {
    try {
      // 削除確認
      const confirmed = window.confirm('このノートを削除しますか？この操作は元に戻せません。')
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
            'Authorization': `Bearer ${idToken}`,
          },
        }
      )

      if (response.ok) {
        console.log('Note deleted successfully')
        // ローカル状態からも削除
        setNotes(prevNotes => prevNotes.filter(note => (note.noteId || note.id) !== noteId))
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
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="bold" color="green.600">
            登録済みのノート
          </Text>
          <IconButton
            size="sm"
            variant="outline"
            colorScheme="green"
            onClick={() => fetchRecentNotes()}
            loading={loading}
            aria-label="リロード"
          >
            <FaSync />
          </IconButton>
        </HStack>

        <Box maxH="400px" overflowY="auto">
          <VStack gap={2} align="stretch">
            {loading ? (
              <Box
                p={4}
                textAlign="center"
                color="gray.500"
                bg="gray.50"
                borderRadius="md"
              >
                <Text fontSize="sm">ノートを読み込み中...</Text>
              </Box>
            ) : notes.length === 0 ? (
              <Box
                p={4}
                textAlign="center"
                color="gray.500"
                bg="gray.50"
                borderRadius="md"
              >
                <FaFileAlt size={32} style={{ margin: '0 auto 8px' }} />
                <Text fontSize="sm">ノートがありません</Text>
                <Text fontSize="xs">
                  上のタブからノートを作成してください
                </Text>
              </Box>
            ) : (
              notes.slice(0, 10).map((note) => (
                <Card.Root
                  key={note.noteId || note.id}
                  p={3}
                  bg="blue.50"
                  transition="all 0.2s"
                  _hover={{ 
                    bg: 'purple.100', 
                    transform: 'translateY(-1px)',
                    borderColor: 'purple.400',
                    shadow: 'md'
                  }}
                  border="2px"
                  borderColor="blue.200"
                  borderRadius="lg"
                  shadow="sm"
                >
                  <HStack justify="space-between">
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontSize="sm" fontWeight="medium" truncate>
                        {note.title}
                      </Text>
                      <Text fontSize="xs" color="gray.600" lineClamp={2}>
                        {(() => {
                          if (note.content === undefined || note.content === null) {
                            return 'コンテンツなし'
                          }
                          return note.content.length > 100 
                            ? `${note.content.substring(0, 100)}...`
                            : note.content
                        })()}
                      </Text>
                      <HStack gap={2} mt={1}>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </Text>
                        {note.tags && note.tags.length > 0 && (
                          <Badge size="sm" colorScheme="purple">
                            {note.tags[0]}
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                    
                    <VStack gap={1}>
                      {/* ノート詳細表示ボタン */}
                      <Dialog.Root size="lg" placement="center">
                        <Dialog.Trigger asChild>
                          <Button
                            size="xs"
                            variant="outline"
                            colorScheme="purple"
                          >
                            詳細
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
                                  <HStack gap={4} flexWrap="wrap">
                                    <Text fontSize="sm" color="gray.600">
                                      作成日: {new Date(note.createdAt).toLocaleDateString('ja-JP', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </Text>
                                    {note.sourceType && (
                                      <Badge colorScheme="blue">
                                        {note.sourceType === 'text' ? 'テキスト' : 
                                         note.sourceType === 'file' ? 'ファイル' : 
                                         note.sourceType === 'notion' ? 'Notion' : note.sourceType}
                                      </Badge>
                                    )}
                                  </HStack>

                                  {/* タグ */}
                                  {note.tags && note.tags.length > 0 && (
                                    <Box>
                                      <Text fontSize="sm" fontWeight="medium" mb={2}>タグ</Text>
                                      <HStack gap={2} flexWrap="wrap">
                                        {note.tags.map((tag, index) => (
                                          <Badge key={index} colorScheme="purple">{tag}</Badge>
                                        ))}
                                      </HStack>
                                    </Box>
                                  )}

                                  {/* コンテンツ */}
                                  <FileContentDisplay note={note} 
                                    fetchFileContent={fetchFileContent}
                                    loadingFileContent={loadingFileContent}
                                    handleDownloadFile={handleDownloadFile}
                                  />

                                  {/* ファイル情報 */}
                                  {note.sourceType === 'file' && note.fileName && (
                                    <Box>
                                      <Text fontSize="sm" fontWeight="medium" mb={2}>ファイル情報</Text>
                                      <HStack gap={4}>
                                        <Text fontSize="sm" color="gray.600">
                                          ファイル名: {note.fileName}
                                        </Text>
                                        {note.fileSize && (
                                          <Text fontSize="sm" color="gray.600">
                                            サイズ: {(note.fileSize / 1024).toFixed(1)}KB
                                          </Text>
                                        )}
                                      </HStack>
                                    </Box>
                                  )}

                                  {/* Notion情報 */}
                                  {note.sourceType === 'notion' && note.notionUrl && (
                                    <Box>
                                      <Text fontSize="sm" fontWeight="medium" mb={2}>Notion情報</Text>
                                      <Text fontSize="sm" color="blue.500" wordBreak="break-all">
                                        {note.notionUrl}
                                      </Text>
                                    </Box>
                                  )}
                                </VStack>
                              </Dialog.Body>
                            </Dialog.Content>
                          </Dialog.Positioner>
                        </Portal>
                      </Dialog.Root>

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

        {/* ノート一覧ページへのリンク */}
        {notes.length > 0 && (
          <Button
            variant="outline"
            colorScheme="purple"
            size="sm"
            onClick={() => router.push('/notes')}
            w="full"
          >
            <FaList />
            すべてのノートを見る ({notes.length}件)
          </Button>
        )}

      </VStack>
    </Box>
  )
}