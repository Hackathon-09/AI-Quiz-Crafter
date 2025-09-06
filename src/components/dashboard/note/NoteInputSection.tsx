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
  HStack,
} from '@chakra-ui/react'
import { useState } from 'react'
import { FaEdit, FaUpload, FaLink, FaInfoCircle } from 'react-icons/fa'
import { fetchAuthSession } from 'aws-amplify/auth'

type InputMethod = 'text' | 'file' | 'notion'

export default function NoteInputSection() {
  const [inputMethod, setInputMethod] = useState<InputMethod>('text')
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [textContent, setTextContent] = useState('')
  const [notionUrl, setNotionUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNotionInfo, setShowNotionInfo] = useState(false)

  const API_BASE_URL =
    'https://8hpurwn5q9.execute-api.ap-northeast-1.amazonaws.com/v1'

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    try {
      const session = await fetchAuthSession()
      const token = session.tokens?.idToken?.toString()
      if (token) {
        return {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      } else {
        return {
          'Content-Type': 'application/json',
        }
      }
    } catch (error) {
      console.error('Failed to get auth token:', error)
      return {
        'Content-Type': 'application/json',
      }
    }
  }

  const sendNoteToAPI = async (noteData: {
    sourceType: 'text' | 'file' | 'notion'
    title: string
    content?: string
    notionUrl?: string
    fileName?: string
    s3Key?: string
    noteId?: string
    contentType?: string
    fileSize?: number
    tags: string
  }) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(noteData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`HTTP ${response.status} error:`, errorText)
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`)
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
        sourceType: 'text' as const,
        title: title || '無題のノート',
        content: textContent,
        contentType: 'text/plain',
        tags: tags,
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
          contentType: file.type,
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
        sourceType: 'file' as const,
        title: title || file.name,
        fileName: file.name,
        s3Key: s3Key as string,
        noteId: fileId as string,
        contentType: file.type,
        fileSize: file.size,
        tags: tags,
      }

      console.log('Sending note data to API:', noteData)
      console.log('Values check:', { 
        s3Key: s3Key, 
        fileId: fileId, 
        hasS3Key: !!s3Key, 
        hasFileId: !!fileId 
      })

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
        sourceType: 'notion' as const,
        title: title || '無題のNotion',
        notionUrl: notionUrl,
        contentType: 'text/html',
        tags: tags,
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
          ノート登録
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
                loading={isSubmitting}
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
                onFileChange={(details) =>
                  handleFileUpload(details.acceptedFiles)
                }
                maxFiles={1}
              >
                <FileUpload.Dropzone
                  border="2px dashed"
                  borderColor="gray.300"
                  borderRadius="md"
                  p={8}
                  textAlign="center"
                  cursor="pointer"
                  _hover={{
                    borderColor: 'purple.400',
                    bg: 'purple.50',
                  }}
                >
                  <VStack gap={2}>
                    <FaUpload size={24} color="gray" />
                    <Text fontSize="sm" textAlign="center" color="gray.600">
                      ファイルをドロップまたはクリックして選択
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      PDF, Word, テキスト, 画像ファイルに対応
                    </Text>
                  </VStack>
                </FileUpload.Dropzone>

                <FileUpload.HiddenInput />

                <FileUpload.Trigger asChild>
                  <Button variant="outline" w="full" mt={3}>
                    ファイルを選択
                  </Button>
                </FileUpload.Trigger>
              </FileUpload.Root>
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="notion">
            <VStack gap={3} align="stretch">
              {/* Notion使い方の説明ヘッダー */}
              <HStack gap={2} align="center">
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                  Notionページの登録
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  p={1}
                  minW="auto"
                  h="auto"
                  onClick={() => setShowNotionInfo(!showNotionInfo)}
                  _hover={{ bg: 'blue.50' }}
                  borderRadius="full"
                >
                  <FaInfoCircle
                    color={showNotionInfo ? '#3182ce' : '#A0AEC0'}
                    size={16}
                  />
                </Button>
              </HStack>

              {/* Notion使い方の詳細説明（トグル表示） */}
              {showNotionInfo && (
                <Box
                  p={4}
                  bg="blue.50"
                  borderRadius="md"
                  border="1px"
                  borderColor="blue.200"
                >
                  <VStack gap={3} align="stretch">
                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" fontWeight="bold" color="blue.700">
                        1. Notionでページを開く
                      </Text>
                      <Text fontSize="xs" color="blue.600" pl={3}>
                        連携したいページをNotionアプリ(PCまたはスマホ)で開きます。
                      </Text>
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" fontWeight="bold" color="blue.700">
                        2. 「共有」→「Web公開」をオンにする
                      </Text>
                      <Text fontSize="xs" color="blue.600" pl={3}>
                        ページの右上にある
                        <Text as="span" fontWeight="bold">
                          「共有 (Share)」
                        </Text>
                        ボタンを押し、
                        <Text as="span" fontWeight="bold">
                          「Web公開」をオン
                        </Text>
                        にします。
                      </Text>
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" fontWeight="bold" color="blue.700">
                        3. URLを登録する
                      </Text>
                      <Text fontSize="xs" color="blue.600" pl={3}>
                        公開されたページのURLをコピーして、下の欄に貼り付けて登録してください。
                        <Text as="span" fontWeight="bold" color="orange.600">
                          ※インテグレーション設定は不要です
                        </Text>
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
              )}

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
                loading={isSubmitting}
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
