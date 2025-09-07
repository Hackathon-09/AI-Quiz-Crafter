'use client'

import {
  VStack,
  HStack,
  Box,
  Button,
  Text,
} from '@chakra-ui/react'
import { useState, useEffect, ReactElement } from 'react'
import { Note } from '@/types'
import { fetchAuthSession } from 'aws-amplify/auth'

interface FilePreviewProps {
  note: Note
  fetchFileContent?: (note: Note) => Promise<string>
  loadingFileContent?: {[key: string]: boolean}
  handleDownloadFile?: (note: Note) => Promise<void>
  maxHeight?: string
  showFileName?: boolean
}

export default function FilePreview({ 
  note, 
  fetchFileContent, 
  loadingFileContent = {}, 
  handleDownloadFile,
  maxHeight = "400px",
  showFileName = true 
}: FilePreviewProps) {
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

  const isMarkdownFile = (fileName?: string, contentType?: string) => {
    return fileName?.toLowerCase().endsWith('.md') || 
           contentType === 'text/markdown' ||
           note.sourceType === 'notion'
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

  // Markdownレンダリング
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n')
    const result: ReactElement[] = []
    let inCodeBlock = false
    let codeBlockLines: string[] = []
    let codeLanguage = ''
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true
          codeLanguage = line.substring(3).trim()
          codeBlockLines = []
        } else {
          inCodeBlock = false
          result.push(
            <Box key={i} my={3}>
              {codeLanguage && (
                <Text fontSize="xs" color="gray.600" mb={1} fontWeight="medium">
                  {codeLanguage}
                </Text>
              )}
              <Box
                p={3}
                bg="gray.800"
                color="gray.100"
                borderRadius="md"
                fontSize="sm"
                fontFamily="mono"
                overflowX="auto"
                border="1px"
                borderColor="gray.300"
              >
                <Text as="pre" whiteSpace="pre-wrap">
                  {codeBlockLines.join('\n')}
                </Text>
              </Box>
            </Box>
          )
          codeBlockLines = []
          codeLanguage = ''
        }
        continue
      }
      
      if (inCodeBlock) {
        codeBlockLines.push(line)
        continue
      }
      
      const processInlineCode = (text: string) => {
        const parts = text.split(/(`[^`]+`)/g)
        return parts.map((part, partIndex) => {
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <Text 
                key={partIndex} 
                as="code" 
                bg="gray.200" 
                px={1} 
                py={0.5} 
                borderRadius="sm" 
                fontSize="sm"
                fontFamily="mono"
              >
                {part.slice(1, -1)}
              </Text>
            )
          }
          return part
        })
      }
      
      if (line.startsWith('# ')) {
        result.push(
          <Text key={i} fontSize="xl" fontWeight="bold" mb={3} mt={4} color="blue.600">
            {processInlineCode(line.substring(2))}
          </Text>
        )
      } else if (line.startsWith('## ')) {
        result.push(
          <Text key={i} fontSize="lg" fontWeight="bold" mb={2} mt={3} color="blue.500">
            {processInlineCode(line.substring(3))}
          </Text>
        )
      } else if (line.startsWith('### ')) {
        result.push(
          <Text key={i} fontSize="md" fontWeight="bold" mb={2} mt={2} color="blue.400">
            {processInlineCode(line.substring(4))}
          </Text>
        )
      } else if (line.trim() === '---') {
        result.push(<Box key={i} h="1px" bg="gray.300" my={4} />)
      } else if (line.startsWith('> ')) {
        result.push(
          <Box key={i} borderLeft="4px" borderColor="blue.300" pl={4} py={2} bg="blue.50" my={2}>
            <Text fontSize="sm" fontStyle="italic" color="gray.600">
              {processInlineCode(line.substring(2))}
            </Text>
          </Box>
        )
      } else if (line.match(/^- \[x\] /)) {
        result.push(
          <HStack key={i} align="start" my={1}>
            <Text color="green.500">✓</Text>
            <Text fontSize="sm" textDecoration="line-through" color="gray.500">
              {processInlineCode(line.substring(6))}
            </Text>
          </HStack>
        )
      } else if (line.match(/^- \[ \] /)) {
        result.push(
          <HStack key={i} align="start" my={1}>
            <Text color="gray.400">☐</Text>
            <Text fontSize="sm">{processInlineCode(line.substring(6))}</Text>
          </HStack>
        )
      } else if (line.startsWith('- ')) {
        result.push(
          <HStack key={i} align="start" my={1}>
            <Text color="blue.400">•</Text>
            <Text fontSize="sm">{processInlineCode(line.substring(2))}</Text>
          </HStack>
        )
      } else if (line.match(/^\d+\. /)) {
        const match = line.match(/^(\d+)\. (.*)/)
        if (match) {
          result.push(
            <HStack key={i} align="start" my={1}>
              <Text color="blue.500" fontWeight="medium" minW="20px">
                {match[1]}.
              </Text>
              <Text fontSize="sm">{processInlineCode(match[2])}</Text>
            </HStack>
          )
        }
      } else if (line.trim() === '') {
        result.push(<Box key={i} h={2} />)
      } else {
        result.push(
          <Text key={i} fontSize="sm" lineHeight={1.6} mb={1}>
            {processInlineCode(line)}
          </Text>
        )
      }
    }
    
    return result
  }

  // PDFビューアコンポーネント
  const PDFViewer = () => {
    const [pdfUrl, setPdfUrl] = useState<string>('')
    const [error, setError] = useState<string>('')

    useEffect(() => {
      const getPdfUrl = async () => {
        if (!note.s3Path) return

        try {
          const session = await fetchAuthSession()
          const idToken = session.tokens?.idToken?.toString()
          
          if (!idToken) {
            setError('認証が必要です')
            return
          }

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
                contentType: note.contentType || 'application/pdf',
                s3Key: note.s3Path,
                operation: 'download'
              })
            }
          )

          if (response.ok) {
            const data = await response.json()
            const downloadUrl = data.downloadUrl || data.uploadUrl
            if (downloadUrl) {
              setPdfUrl(downloadUrl)
            } else {
              setError('PDFのURLを取得できませんでした')
            }
          } else {
            setError('PDFの取得に失敗しました')
          }
        } catch (error) {
          console.error('PDF URL取得エラー:', error)
          setError('PDFの読み込み中にエラーが発生しました')
        }
      }

      getPdfUrl()
    }, [note])

    if (error) {
      return (
        <VStack align="center" gap={3} py={4}>
          <Text fontSize="sm" color="red.600" fontWeight="medium">
            📄 PDFファイル
          </Text>
          <Text fontSize="sm" color="red.500" textAlign="center">
            {error}
          </Text>
          {handleDownloadFile && (
            <Button 
              size="sm" 
              colorScheme="blue" 
              variant="outline"
              onClick={() => handleDownloadFile(note)}
            >
              ブラウザで表示
            </Button>
          )}
        </VStack>
      )
    }

    return (
      <VStack align="center" gap={3}>
        <Text fontSize="sm" color="orange.600" fontWeight="medium">
          📄 PDFファイル
        </Text>
        
        {showFileName && (
          <Text fontSize="xs" color="gray.600" textAlign="center">
            {note.fileName}
          </Text>
        )}
        
        {pdfUrl ? (
          <VStack gap={3} w="full">
            <Box 
              w="full" 
              h={maxHeight} 
              border="1px" 
              borderColor="gray.200" 
              borderRadius="md" 
              overflow="hidden"
              bg="gray.50"
            >
              <object
                data={pdfUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                style={{ display: 'block' }}
              >
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title="PDF Preview"
                />
              </object>
            </Box>
            
            <HStack gap={2} flexWrap="wrap" justify="center">
              <Button 
                size="sm" 
                colorScheme="blue" 
                variant="solid"
                onClick={() => window.open(pdfUrl, '_blank')}
              >
                新しいタブで開く
              </Button>
              
              {handleDownloadFile && (
                <Button 
                  size="sm" 
                  colorScheme="orange" 
                  variant="outline"
                  onClick={() => handleDownloadFile(note)}
                >
                  ダウンロード
                </Button>
              )}
            </HStack>
          </VStack>
        ) : (
          <VStack gap={3}>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              PDFプレビューを準備中...
            </Text>
            
            {handleDownloadFile && (
              <Button 
                size="sm" 
                colorScheme="blue" 
                variant="outline"
                onClick={() => handleDownloadFile(note)}
              >
                ブラウザで表示
              </Button>
            )}
          </VStack>
        )}
      </VStack>
    )
  }

  // 画像ビューアコンポーネント
  const ImageViewer = () => {
    const [imageUrl, setImageUrl] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [imageLoading, setImageLoading] = useState(false)

    useEffect(() => {
      const getImageUrl = async () => {
        if (!note.s3Path) return

        try {
          setImageLoading(true)
          const session = await fetchAuthSession()
          const idToken = session.tokens?.idToken?.toString()
          
          if (!idToken) {
            setError('認証が必要です')
            return
          }

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
                contentType: note.contentType || 'image/jpeg',
                s3Key: note.s3Path,
                operation: 'download'
              })
            }
          )

          if (response.ok) {
            const data = await response.json()
            const downloadUrl = data.downloadUrl || data.uploadUrl
            if (downloadUrl) {
              setImageUrl(downloadUrl)
            } else {
              setError('画像のURLを取得できませんでした')
            }
          } else {
            setError('画像の取得に失敗しました')
          }
        } catch (error) {
          console.error('画像URL取得エラー:', error)
          setError('画像の読み込み中にエラーが発生しました')
        } finally {
          setImageLoading(false)
        }
      }

      getImageUrl()
    }, [note])

    if (isLoading || imageLoading) {
      return (
        <VStack align="center" gap={3} py={8}>
          <Text fontSize="sm" color="gray.500" fontStyle="italic">
            画像を読み込み中...
          </Text>
        </VStack>
      )
    }

    if (error) {
      return (
        <VStack align="center" gap={3} py={4}>
          <Text fontSize="sm" color="red.600" fontWeight="medium">
            🖼️ 画像ファイル
          </Text>
          <Text fontSize="sm" color="red.500" textAlign="center">
            {error}
          </Text>
          {handleDownloadFile && (
            <Button 
              size="sm" 
              colorScheme="green" 
              variant="outline"
              onClick={() => handleDownloadFile(note)}
            >
              ブラウザで表示
            </Button>
          )}
        </VStack>
      )
    }

    return (
      <VStack align="center" gap={3}>
        <Text fontSize="sm" color="green.600" fontWeight="medium">
          🖼️ 画像ファイル
        </Text>
        
        {imageUrl && (
          <Box
            w="full"
            maxH={maxHeight}
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            overflow="hidden"
            bg="gray.50"
          >
            <img
              src={imageUrl}
              alt={note.fileName || '画像'}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: maxHeight,
                objectFit: 'contain',
                display: 'block'
              }}
              onError={() => setError('画像の表示に失敗しました')}
            />
          </Box>
        )}
        
        {showFileName && (
          <Text fontSize="xs" color="gray.600" textAlign="center">
            {note.fileName}
          </Text>
        )}
        
        <HStack gap={2}>
          {handleDownloadFile && (
            <Button 
              size="sm" 
              colorScheme="green" 
              variant="outline"
              onClick={() => handleDownloadFile(note)}
            >
              ダウンロード
            </Button>
          )}
          
          {imageUrl && (
            <Button 
              size="sm" 
              colorScheme="blue" 
              variant="outline"
              onClick={() => window.open(imageUrl, '_blank')}
            >
              拡大表示
            </Button>
          )}
        </HStack>
      </VStack>
    )
  }

  // コンテンツ読み込み
  useEffect(() => {
    if (note.sourceType === 'file' && note.s3Path && fetchFileContent) {
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
        maxH={maxHeight}
        overflowY="auto"
        border="1px"
        borderColor="gray.200"
      >
        {isLoading || (note.s3Path && loadingFileContent[note.s3Path]) ? (
          <Text fontSize="sm" color="gray.500" fontStyle="italic">
            ファイル内容を読み込み中...
          </Text>
        ) : isPdfFile(note.fileName, note.contentType) ? (
          <PDFViewer />
        ) : isWordFile(note.fileName, note.contentType) ? (
          <VStack align="center" gap={3}>
            <Text fontSize="sm" color="blue.600" fontWeight="medium">
              📝 Wordファイル
            </Text>
            {handleDownloadFile && (
              <Button 
                size="sm" 
                colorScheme="blue" 
                variant="outline"
                onClick={() => handleDownloadFile(note)}
              >
                ブラウザで表示
              </Button>
            )}
          </VStack>
        ) : isImageFile(note.fileName, note.contentType) ? (
          <ImageViewer />
        ) : isMarkdownFile(note.fileName, note.contentType) ? (
          <VStack align="start" gap={1}>
            {renderMarkdown(displayContent || 'コンテンツがありません')}
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