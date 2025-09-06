'use client'

import {
  VStack,
  HStack,
  Box,
  Button,
  Text,
  IconButton,
  Card,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FaTrash, FaFileAlt, FaList } from 'react-icons/fa'
import { Note } from '@/types'
import { useRouter } from 'next/navigation'
import { fetchAuthSession } from 'aws-amplify/auth'

export default function NoteListSection() {
  const router = useRouter()
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
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

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
  }

  const handleDeleteNote = (noteId: string) => {
    // TODO: 実際の削除処理を実装
    console.log('Delete note:', noteId)
  }

  return (
    <Box
      p={{ base: 4, md: 6 }}
      bg="white"
      borderRadius="lg"
      shadow="sm"
      border="1px"
      borderColor="gray.200"
      flex={1}
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
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ bg: 'purple.50', transform: 'translateY(-1px)' }}
                  onClick={() => handleSelectNote(note)}
                  bg={selectedNote?.noteId === note.noteId || selectedNote?.id === note.id ? 'purple.50' : 'white'}
                  border="1px"
                  borderColor={
                    selectedNote?.noteId === note.noteId || selectedNote?.id === note.id ? 'purple.200' : 'gray.200'
                  }
                >
                  <HStack justify="space-between">
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontSize="sm" fontWeight="medium" truncate>
                        {note.title}
                      </Text>
                      <Text fontSize="xs" color="gray.500" lineClamp={2}>
                        {(() => {
                          if (note.content === undefined || note.content === null) {
                            return 'コンテンツなし'
                          }
                          return note.content.length > 100 
                            ? `${note.content.substring(0, 100)}...`
                            : note.content
                        })()}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </Text>
                      {note.tags && note.tags.length > 0 && (
                        <Text fontSize="xs" color="purple.500">
                          {note.tags.slice(0, 3).join(', ')}
                        </Text>
                      )}
                    </VStack>
                    <IconButton
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNote(note.noteId || note.id)
                      }}
                    >
                      <FaTrash size={12} />
                    </IconButton>
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

        {/* 選択されたノートの詳細表示 */}
        {selectedNote && (
          <Box
            mt={4}
            p={4}
            bg="gray.50"
            borderRadius="md"
            border="1px"
            borderColor="gray.200"
          >
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              {selectedNote.title}
            </Text>
            <Text fontSize="xs" color="gray.500" mb={3}>
              作成日: {new Date(selectedNote.createdAt).toLocaleString()}
            </Text>
            <Text fontSize="sm" lineHeight={1.6} whiteSpace="pre-wrap">
              {selectedNote.content === undefined || selectedNote.content === null 
                ? 'コンテンツがありません' 
                : selectedNote.content
              }
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}