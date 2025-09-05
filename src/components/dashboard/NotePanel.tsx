'use client'

import {
  VStack,
  HStack,
  Box,
  Button,
  Text,
  Input,
  Textarea,
  IconButton,
  Separator,
  Card,
  Tabs,
  FileUpload,
} from '@chakra-ui/react'
import { useState } from 'react'
import { FaEdit, FaTrash, FaFileAlt, FaUpload, FaLink } from 'react-icons/fa'
import { Note } from '@/types'

interface NotePanelProps {
  notes?: Note[]
}

type InputMethod = 'text' | 'file' | 'notion'

export default function NotePanel({ notes = [] }: NotePanelProps) {
  const [inputMethod, setInputMethod] = useState<InputMethod>('text')
  const [textContent, setTextContent] = useState('')
  const [notionUrl, setNotionUrl] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  const handleTextSave = () => {
    if (!textContent.trim()) return
    // TODO: 実際の保存処理を実装
    console.log('Save text note:', { content: textContent })
    setTextContent('')
  }

  const handleFileUpload = (files: File[]) => {
    if (!files?.length) return
    // TODO: ファイル処理を実装
    console.log('Upload files:', files.map(f => f.name))
  }

  const handleNotionImport = () => {
    if (!notionUrl.trim()) return
    // TODO: Notion連携を実装
    console.log('Import from Notion:', notionUrl)
    setNotionUrl('')
  }

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
  }

  const handleDeleteNote = (noteId: string) => {
    // TODO: 実際の削除処理を実装
    console.log('Delete note:', noteId)
  }

  return (
    <VStack gap={{ base: 4, md: 6 }} align="stretch" h="full">
      {/* 入力方法選択とノート作成 */}
      <Box
        p={{ base: 4, md: 6 }}
        bg="white"
        borderRadius="lg"
        shadow="sm"
        border="1px"
        borderColor="gray.200"
      >
        <VStack gap={{ base: 3, md: 4 }} align="stretch">
          <Text fontSize="lg" fontWeight="bold" color="purple.600">
            ノート管理
          </Text>

          {/* 入力方法選択タブ */}
          <Tabs.Root value={inputMethod} onValueChange={(e) => setInputMethod(e.value as InputMethod)}>
            <Tabs.List>
              <Tabs.Trigger value="text">
                <FaEdit />
                テキスト
              </Tabs.Trigger>
              <Tabs.Trigger value="file">
                <FaUpload />
                ファイル
              </Tabs.Trigger>
              <Tabs.Trigger value="notion">
                <FaLink />
                Notion連携
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="text">
              <VStack gap={3} align="stretch">
                <Textarea
                  placeholder="ノート内容を入力してください"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  resize="vertical"
                  minH="200px"
                  size="md"
                />
                <Button
                  colorScheme="purple"
                  onClick={handleTextSave}
                  disabled={!textContent.trim()}
                  w="full"
                >
                  ノートを保存
                </Button>
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="file">
              <VStack gap={3} align="stretch">
                <FileUpload.Root
                  accept="image/*,.pdf,.txt,.docx"
                  onFileChange={(e) => handleFileUpload(e.acceptedFiles)}
                >
                  <FileUpload.Dropzone>
                    <VStack gap={2} p={8}>
                      <FaUpload size={24} />
                      <Text fontSize="sm" textAlign="center">
                        ファイルをドロップまたはクリックして選択
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        PDF, Word, テキスト, 画像ファイルに対応
                      </Text>
                    </VStack>
                  </FileUpload.Dropzone>
                  <FileUpload.Trigger asChild>
                    <Button variant="outline" w="full">
                      ファイルを選択
                    </Button>
                  </FileUpload.Trigger>
                </FileUpload.Root>
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="notion">
              <VStack gap={3} align="stretch">
                <Input
                  placeholder="NotionページのURLを入力"
                  value={notionUrl}
                  onChange={(e) => setNotionUrl(e.target.value)}
                  size="md"
                />
                <Button
                  colorScheme="purple"
                  onClick={handleNotionImport}
                  disabled={!notionUrl.trim()}
                  w="full"
                >
                  Notionから取得
                </Button>
              </VStack>
            </Tabs.Content>
          </Tabs.Root>
        </VStack>
      </Box>

      <Separator />

      {/* 過去のノート一覧 */}
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
                  <Text fontSize="xs">上のタブからノートを作成してください</Text>
                </Box>
              ) : (
                notes.map((note) => (
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
                        <Text 
                          fontSize="sm" 
                          fontWeight="medium" 
                          truncate
                        >
                          {note.title}
                        </Text>
                        <Text 
                          fontSize="xs" 
                          color="gray.500"
                          lineClamp={2}
                        >
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
    </VStack>
  )
}