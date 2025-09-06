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
import { useState } from 'react'
import { FaTrash, FaFileAlt, FaList } from 'react-icons/fa'
import { Note } from '@/types'
import { useRouter } from 'next/navigation'

interface NoteListSectionProps {
  notes: Note[]
}

export default function NoteListSection({ notes }: NoteListSectionProps) {
  const router = useRouter()
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

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
      h="full"
    >
      <VStack gap={{ base: 3, md: 4 }} align="stretch">
        <Text fontSize="lg" fontWeight="bold" color="green.600">
          過去のノート
        </Text>

        <Box maxH="400px" overflowY="auto">
          <VStack gap={2} align="stretch">
            {notes.length === 0 ? (
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
              notes.slice(0, 5).map((note) => (
                <Card.Root
                  key={note.id}
                  p={3}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ bg: 'purple.50', transform: 'translateY(-1px)' }}
                  onClick={() => handleSelectNote(note)}
                  bg={selectedNote?.id === note.id ? 'purple.50' : 'white'}
                  border="1px"
                  borderColor={
                    selectedNote?.id === note.id ? 'purple.200' : 'gray.200'
                  }
                >
                  <HStack justify="space-between">
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontSize="sm" fontWeight="medium" truncate>
                        {note.title}
                      </Text>
                      <Text fontSize="xs" color="gray.500" lineClamp={2}>
                        {note.content.substring(0, 100)}
                        {note.content.length > 100 ? '...' : ''}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </Text>
                    </VStack>
                    <IconButton
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNote(note.id)
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
              {selectedNote.content}
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}