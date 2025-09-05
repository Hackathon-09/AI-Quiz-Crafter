'use client'

import {
  VStack,
  HStack,
  Box,
  Button,
  Text,
  Input,
  Avatar,
  IconButton,
  Separator,
} from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface AiTeacherPanelProps {
  messages?: Message[]
}

export default function AiTeacherPanel({
  messages: initialMessages = [],
}: AiTeacherPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // TODO: 実際のAI APIとの通信を実装
    // 仮のAI応答をシミュレート
    setTimeout(() => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: `「${inputMessage}」について説明させていただきますね。\n\nこの質問は非常に良い点に着目していると思います。詳しく解説していきましょう。`,
        sender: 'ai',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Box
      borderRadius="lg"
      border="1px"
      borderColor="gray.200"
      bg="white"
      shadow="sm"
      overflow="hidden"
      h="full"
      maxH="800px"
    >
      <VStack gap={0} align="stretch" h="full">
        {/* ヘッダー */}
        <Box
          p={{ base: 4, md: 6 }}
          bg="white"
          borderBottom="1px"
          borderColor="gray.200"
        >
        <HStack gap={3}>
          {/* <Avatar size="sm" bg="blue.500" icon={<FaRobot />} /> */}
          <Avatar.Root size="sm" bg="blue.500">
            <Avatar.Fallback>
              <FaRobot color="white" />
            </Avatar.Fallback>
          </Avatar.Root>
          <VStack align="start" gap={1}>
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              AI教師
            </Text>
            <Text fontSize="xs" color="gray.500">
              オンライン
            </Text>
          </VStack>
        </HStack>
      </Box>

        {/* メッセージエリア */}
        <Box
          flex={1}
          bg="gray.50"
          overflowY="auto"
          p={{ base: 3, md: 4 }}
        >
        <VStack gap={3} align="stretch">
          {messages.length === 0 ? (
            <Box textAlign="center" py={8} color="gray.500">
              <FaRobot size={48} style={{ margin: '0 auto 16px' }} />
              <Text fontSize="sm" mb={2}>
                AI教師との会話を始めましょう
              </Text>
              <Text fontSize="xs">
                学習に関する質問や疑問点をお聞かせください
              </Text>
            </Box>
          ) : (
            messages.map((message) => (
              <HStack
                key={message.id}
                justify={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                align="end"
                gap={2}
              >
                {message.sender === 'ai' && (
                  <Avatar.Root size="xs" bg="blue.500">
                    <Avatar.Fallback>
                      <FaRobot color="white" size={12} />
                    </Avatar.Fallback>
                  </Avatar.Root>
                )}

                <VStack
                  align={message.sender === 'user' ? 'end' : 'start'}
                  gap={1}
                  maxW="75%"
                >
                  <Box
                    p={3}
                    borderRadius="18px"
                    bg={message.sender === 'user' ? 'blue.500' : 'white'}
                    color={message.sender === 'user' ? 'white' : 'gray.800'}
                    border={message.sender === 'ai' ? '1px' : 'none'}
                    borderColor="gray.200"
                    shadow={message.sender === 'ai' ? 'sm' : 'none'}
                    position="relative"
                    _after={
                      message.sender === 'user'
                        ? {
                            content: '""',
                            position: 'absolute',
                            right: '-16px',
                            bottom: '16px',
                            width: '12px',
                            height: '12px',
                            bg: 'blue.500',
                            borderRadius: 'full',
                          }
                        : {
                            content: '""',
                            position: 'absolute',
                            left: '-16px',
                            bottom: '16px',
                            width: '12px',
                            height: '12px',
                            bg: 'white',
                            borderRadius: 'full',
                            border: '1px solid',
                            borderColor: 'gray.200',
                          }
                    }
                    _before={
                      message.sender === 'user'
                        ? {
                            content: '""',
                            position: 'absolute',
                            right: '-10px',
                            bottom: '20px',
                            width: '6px',
                            height: '6px',
                            bg: 'blue.500',
                            borderRadius: 'full',
                          }
                        : {
                            content: '""',
                            position: 'absolute',
                            left: '-10px',
                            bottom: '20px',
                            width: '6px',
                            height: '6px',
                            bg: 'white',
                            borderRadius: 'full',
                            border: '1px solid',
                            borderColor: 'gray.200',
                          }
                    }
                  >
                    <Text fontSize="sm" whiteSpace="pre-wrap" lineHeight={1.5}>
                      {message.content}
                    </Text>
                  </Box>
                  <Text fontSize="xs" color="gray.400" px={2}>
                    {formatTime(message.timestamp)}
                  </Text>
                </VStack>

                {message.sender === 'user' && (
                  <Avatar.Root size="xs" bg="gray.400">
                    <Avatar.Fallback>
                      <FaUser color="white" size={12} />
                    </Avatar.Fallback>
                  </Avatar.Root>
                )}
              </HStack>
            ))
          )}

          {/* ローディング表示 */}
          {isLoading && (
            <HStack justify="flex-start" align="end" gap={2}>
              <Avatar.Root size="xs" bg="blue.500">
                <Avatar.Fallback>
                  <FaRobot color="white" size={12} />
                </Avatar.Fallback>
              </Avatar.Root>
              <Box
                p={3}
                borderRadius="18px"
                bg="white"
                border="1px"
                borderColor="gray.200"
                shadow="sm"
              >
                <HStack gap={1}>
                  <Box
                    w={2}
                    h={2}
                    bg="gray.400"
                    borderRadius="full"
                    animation="bounce 1.4s ease-in-out infinite"
                  />
                  <Box
                    w={2}
                    h={2}
                    bg="gray.400"
                    borderRadius="full"
                    animation="bounce 1.4s ease-in-out 0.2s infinite"
                  />
                  <Box
                    w={2}
                    h={2}
                    bg="gray.400"
                    borderRadius="full"
                    animation="bounce 1.4s ease-in-out 0.4s infinite"
                  />
                </HStack>
              </Box>
            </HStack>
          )}

          <div ref={messagesEndRef} />
        </VStack>
      </Box>

        {/* 入力エリア */}
        <Box
          p={{ base: 3, md: 4 }}
          bg="white"
          borderTop="1px"
          borderColor="gray.200"
        >
        <HStack gap={2}>
          <Input
            placeholder="メッセージを入力..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            size="md"
            borderRadius="20px"
            bg="gray.50"
            border="1px"
            borderColor="gray.200"
            _focus={{
              borderColor: 'blue.400',
              bg: 'white',
            }}
            disabled={isLoading}
          />
          <IconButton
            colorScheme="blue"
            size="md"
            borderRadius="full"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            <FaPaperPlane />
          </IconButton>
        </HStack>
      </Box>
      </VStack>
    </Box>
  )
}
