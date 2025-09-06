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
import { FaTrash, FaFileAlt, FaList } from 'react-icons/fa'
import { Note } from '@/types'
import { useRouter } from 'next/navigation'
import { fetchAuthSession } from 'aws-amplify/auth'

export default function NoteListSection() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  // API呼び出し関数（シンプルなHTTPリクエスト）
  const fetchRecentNotes = async () => {
    try {
      setLoading(true)
      
      // Cognito認証セッションを取得
      const session = await fetchAuthSession()
      console.log('Auth session:', session)
      
      const idToken = session.tokens?.idToken?.toString()
      console.log('ID Token exists:', !!idToken)
      
      if (!idToken) {
        console.log('Authentication required - no ID token')
        setNotes([]) // 認証なしの場合は空配列
        return
      }

      console.log('Making API request to notes endpoint...')
      
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

      console.log('API response status:', response.status)

      if (response.ok) {
        const fetchedNotes = await response.json()
        console.log('Fetched notes:', fetchedNotes)
        setNotes(fetchedNotes)
      } else {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        setNotes([]) // エラー時は空配列
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      setNotes([]) // エラー時は空配列
    } finally {
      setLoading(false)
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
        <Text fontSize="lg" fontWeight="bold" color="green.600">
          過去のノート
        </Text>

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
                                  {note.content && (
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
                                        <Text
                                          fontSize="sm"
                                          lineHeight={1.6}
                                          whiteSpace="pre-wrap"
                                        >
                                          {note.content}
                                        </Text>
                                      </Box>
                                    </Box>
                                  )}

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