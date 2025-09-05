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
import { fetchAuthSession } from 'aws-amplify/auth'

type InputMethod = 'text' | 'file' | 'notion'

export default function NoteInputSection() {
  const [inputMethod, setInputMethod] = useState<InputMethod>('text')
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [textContent, setTextContent] = useState('')
  const [notionUrl, setNotionUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const API_BASE_URL = 'https://8hpurwn5q9.execute-api.ap-northeast-1.amazonaws.com/v1'

  const getAuthHeaders = async () => {
    try {
      const session = await fetchAuthSession()
      const token = session.tokens?.idToken?.toString()
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    } catch (error) {
      console.error('Failed to get auth token:', error)
      return {
        'Content-Type': 'application/json',
      }
    }
  }

  const sendNoteToAPI = async (noteData: any) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(noteData),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Note saved successfully:', result)
      return result
    } catch (error) {
      console.error('Failed to save note:', error)
      throw error
    }
  }

  const handleTextSave = async () => {
    if (!textContent.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const noteData = {
        sourceType: 'text',
        title: title || '無題のノート',
        content: textContent,
        tags: tags
      }
      
      await sendNoteToAPI(noteData)
      
      setTitle('')
      setTags('')
      setTextContent('')
    } catch (error) {
      console.error('Failed to save text note:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = async (files: File[]) => {
    if (!files?.length || isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const file = files[0]
      
      // Step 1: 署名付きURLを取得
      const headers = await getAuthHeaders()
      const urlResponse = await fetch(`${API_BASE_URL}/upload-url`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type
        }),
      })
      
      if (!urlResponse.ok) {
        throw new Error('Failed to get upload URL')
      }
      
      const { uploadUrl, s3Key, fileId } = await urlResponse.json()
      
      // Step 2: S3に直接ファイルをアップロード
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3')
      }
      
      // Step 3: ノート情報をデータベースに保存
      const noteData = {
        sourceType: 'file',
        title: title || file.name,
        fileName: file.name,
        s3Key: s3Key,
        noteId: fileId,
        contentType: file.type,
        fileSize: file.size,
        tags: tags
      }
      
      await sendNoteToAPI(noteData)
      
      setTitle('')
      setTags('')
    } catch (error) {
      console.error('Failed to upload file:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNotionImport = async () => {
    if (!notionUrl.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const noteData = {
        sourceType: 'notion',
        title: title || '無題のNotion',
        notionUrl: notionUrl,
        tags: tags
      }
      
      await sendNoteToAPI(noteData)
      
      setTitle('')
      setTags('')
      setNotionUrl('')
    } catch (error) {
      console.error('Failed to import from Notion:', error)
    } finally {
      setIsSubmitting(false)
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
              <Input
                placeholder="タイトルを入力してください"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="md"
              />
              <Input
                placeholder="タグを入力してください（例: 勉強, メモ, アイデア）"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                size="md"
              />
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
                disabled={!textContent.trim() || isSubmitting}
                isLoading={isSubmitting}
                loadingText="保存中..."
                w="full"
              >
                ノートを保存
              </Button>
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="file">
            <VStack gap={3} align="stretch">
              <Input
                placeholder="タイトルを入力してください"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="md"
              />
              <Input
                placeholder="タグを入力してください（例: 勉強, メモ, アイデア）"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                size="md"
              />
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
                placeholder="タイトルを入力してください"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="md"
              />
              <Input
                placeholder="タグを入力してください（例: 勉強, メモ, アイデア）"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                size="md"
              />
              <Input
                placeholder="NotionページのURLを入力"
                value={notionUrl}
                onChange={(e) => setNotionUrl(e.target.value)}
                size="md"
              />
              <Button
                colorScheme="purple"
                onClick={handleNotionImport}
                disabled={!notionUrl.trim() || isSubmitting}
                isLoading={isSubmitting}
                loadingText="取得中..."
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