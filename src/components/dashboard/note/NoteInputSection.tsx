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
import { FaEdit, FaUpload, FaLink, FaInfoCircle, FaTimes } from 'react-icons/fa'
import { fetchAuthSession } from 'aws-amplify/auth'

type InputMethod = 'text' | 'file' | 'notion'

export default function NoteInputSection() {
  const [inputMethod, setInputMethod] = useState<InputMethod>('text')
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [textContent, setTextContent] = useState('')
  const [notionUrl, setNotionUrl] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNotionInfo, setShowNotionInfo] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [fileUploadKey, setFileUploadKey] = useState(0)

  const API_BASE_URL =
    'https://8hpurwn5q9.execute-api.ap-northeast-1.amazonaws.com/v1'

  const removeFile = (indexToRemove: number) => {
    const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove)
    setSelectedFiles(newFiles)
    if (newFiles.length === 0) {
      setFileUploadKey(prev => prev + 1) // FileUploadコンポーネントをリセット
    }
  }

  const clearAllFiles = () => {
    setSelectedFiles([])
    setFileUploadKey(prev => prev + 1) // FileUploadコンポーネントをリセット
  }

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
      setSuccessMessage('テキストノートが正常に保存されました')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to save text note:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFiles?.length || isSubmitting) return

    setIsSubmitting(true)

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
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
          throw new Error(`Failed to get upload URL for ${file.name}`)
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
          throw new Error(`Failed to upload ${file.name} to S3`)
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

        return await sendNoteToAPI(noteData)
      })

      await Promise.all(uploadPromises)

      // 成功後にフォームをクリア
      setTitle('')
      setTags('')
      setSelectedFiles([])
      setFileUploadKey(prev => prev + 1) // FileUploadコンポーネントをリセット
      setSuccessMessage(`${selectedFiles.length}個のファイルが正常に保存されました`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to upload files:', error)
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
      setSuccessMessage('Notionページが正常に取得・保存されました')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to import from Notion:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* スナックバー */}
      {successMessage && (
        <Box
          position="fixed"
          bottom={4}
          right={4}
          zIndex={9999}
          bg="green.500"
          color="white"
          p={4}
          borderRadius="md"
          shadow="lg"
          maxW="300px"
          animation="fade-in 0.3s ease-in-out"
        >
          <Text fontSize="sm" fontWeight="medium">
            {successMessage}
          </Text>
        </Box>
      )}

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
                placeholder="タイトルを入力してください（必須）"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="lg"
                w="full"
                required
              />
              <Input
                placeholder="タグを入力してください（例: 勉強, メモ, アイデア）"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                size="lg"
                w="full"
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
                disabled={!title.trim() || !textContent.trim() || isSubmitting}
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
                placeholder="タイトルを入力してください（必須）"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="lg"
                w="full"
                required
              />
              <Input
                placeholder="タグを入力してください（例: 勉強, メモ, アイデア）"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                size="lg"
                w="full"
              />
              <FileUpload.Root
                key={fileUploadKey}
                accept="image/*,.pdf,.txt,.docx"
                onFileChange={(details) =>
                  setSelectedFiles(details.acceptedFiles)
                }
                maxFiles={5}
                w="full"
              >
                <FileUpload.Dropzone
                  border="2px dashed"
                  borderColor="gray.300"
                  borderRadius="md"
                  p={8}
                  textAlign="center"
                  cursor="pointer"
                  w="full"
                  minH="120px"
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
                      PDF, Word, テキスト, 画像ファイルに対応（最大5ファイル）
                    </Text>
                  </VStack>
                </FileUpload.Dropzone>

                <FileUpload.HiddenInput />
              </FileUpload.Root>

              {/* 選択されたファイル一覧 */}
              {selectedFiles.length > 0 && (
                <Box mt={3} p={3} bg="gray.50" borderRadius="md">
                  <HStack justify="space-between" align="center" mb={2}>
                    <Text fontSize="sm" fontWeight="semibold">
                      選択されたファイル ({selectedFiles.length}個)
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      color="red.500"
                      onClick={clearAllFiles}
                      _hover={{ bg: 'red.50' }}
                    >
                      全て削除
                    </Button>
                  </HStack>
                  <VStack gap={1} align="stretch">
                    {selectedFiles.map((file, index) => (
                      <HStack key={index} justify="space-between" align="center">
                        <Text fontSize="xs" color="gray.600" truncate flex="1">
                          {file.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mr={2}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          color="red.500"
                          p={1}
                          minW="auto"
                          h="20px"
                          onClick={() => removeFile(index)}
                          _hover={{ bg: 'red.50' }}
                        >
                          <FaTimes size={10} />
                        </Button>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* ファイル登録ボタン */}
              <Button
                colorScheme="purple"
                onClick={handleFileUpload}
                disabled={!title.trim() || !selectedFiles.length || isSubmitting}
                loading={isSubmitting}
                loadingText="登録中..."
                w="full"
                mt={selectedFiles.length > 0 ? 2 : 0}
              >
                ファイルを保存
              </Button>
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
                placeholder="タイトルを入力してください（必須）"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="lg"
                w="full"
                required
              />
              <Input
                placeholder="タグを入力してください（例: 勉強, メモ, アイデア）"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                size="lg"
                w="full"
              />
              <Input
                placeholder="NotionページのURLを入力"
                value={notionUrl}
                onChange={(e) => setNotionUrl(e.target.value)}
                size="lg"
                w="full"
              />
              <Button
                colorScheme="purple"
                onClick={handleNotionImport}
                disabled={!title.trim() || !notionUrl.trim() || isSubmitting}
                loading={isSubmitting}
                loadingText="取得中..."
                w="full"
              >
                Notionページを保存
              </Button>
            </VStack>
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
      </Box>
    </>
  )
}
