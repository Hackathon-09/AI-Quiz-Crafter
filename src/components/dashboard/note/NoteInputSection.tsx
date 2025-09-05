'use client'

import {
  VStack,
  Box,
  Button,
  Text,
  Input,
  Textarea,
  Tabs,
  FileUpload,
} from '@chakra-ui/react'
import { useState } from 'react'
import { FaEdit, FaUpload, FaLink } from 'react-icons/fa'

type InputMethod = 'text' | 'file' | 'notion'

export default function NoteInputSection() {
  const [inputMethod, setInputMethod] = useState<InputMethod>('text')
  const [textContent, setTextContent] = useState('')
  const [notionUrl, setNotionUrl] = useState('')

  const handleTextSave = () => {
    if (!textContent.trim()) return
    // TODO: 実際の保存処理を実装
    console.log('Save text note:', { content: textContent })
    setTextContent('')
  }

  const handleFileUpload = (files: File[]) => {
    if (!files?.length) return
    // TODO: ファイル処理を実装
    console.log('Upload files:', files.map((f) => f.name))
  }

  const handleNotionImport = () => {
    if (!notionUrl.trim()) return
    // TODO: Notion連携を実装
    console.log('Import from Notion:', notionUrl)
    setNotionUrl('')
  }

  return (
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
        <Tabs.Root
          value={inputMethod}
          onValueChange={(e) => setInputMethod(e.value as InputMethod)}
        >
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
  )
}