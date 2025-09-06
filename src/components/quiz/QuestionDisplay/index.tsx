'use client'

import {
  VStack,
  HStack,
  Box,
  Text,
  Card,
  Heading,
  Badge,
  Alert,
  Separator,
} from '@chakra-ui/react'
import { Question, UserAnswer } from '@/types/quiz'
import { FaLightbulb } from 'react-icons/fa'

interface QuestionDisplayProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  showExplanation?: boolean
  originalAnswer?: UserAnswer
  mode?: 'quiz' | 'review'
  children?: React.ReactNode
}

export default function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  showExplanation = false,
  originalAnswer,
  mode = 'quiz',
  children,
}: QuestionDisplayProps) {
  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'basic':
        return { colorScheme: 'green', label: '基礎' }
      case 'standard':
        return { colorScheme: 'yellow', label: '標準' }
      case 'advanced':
        return { colorScheme: 'red', label: '応用' }
      default:
        return { colorScheme: 'gray', label: difficulty }
    }
  }

  const getQuestionTypeConfig = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return { label: '選択問題', icon: '📝' }
      case 'true-false':
        return { label: '○×問題', icon: '⚖️' }
      case 'essay':
        return { label: '記述問題', icon: '✍️' }
      default:
        return { label: type, icon: '❓' }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const difficultyConfig = getDifficultyConfig(question.difficulty)
  const typeConfig = getQuestionTypeConfig(question.type)

  return (
    <VStack gap={6} align="stretch">
      {/* 過去の学習状況（復習モードのみ） */}
      {mode === 'review' && originalAnswer && (
        <Card.Root p={4} bg="yellow.50" border="1px solid" borderColor="yellow.200">
          <VStack gap={2} align="start">
            <HStack gap={2}>
              <FaLightbulb color="orange" />
              <Text fontSize="sm" fontWeight="bold" color="orange.700">
                過去の学習状況
              </Text>
            </HStack>
            <HStack gap={4} fontSize="sm">
              <Text>
                前回の回答: <span style={{ 
                  color: originalAnswer.isCorrect ? 'green' : 'red',
                  fontWeight: 'bold'
                }}>
                  {originalAnswer.isCorrect ? '正解' : '不正解'}
                </span>
              </Text>
              {originalAnswer.timeSpent && (
                <Text color="gray.600">
                  解答時間: {formatTime(originalAnswer.timeSpent)}
                </Text>
              )}
            </HStack>
          </VStack>
        </Card.Root>
      )}

      {/* 問題表示 */}
      <Card.Root>
        <VStack gap={6} align="stretch" p={{ base: 6, md: 8 }}>
          {/* 問題メタ情報 */}
          <VStack gap={3} align="start">
            <HStack gap={2} wrap="wrap">
              <Badge variant="outline" size="lg">
                問題 {questionNumber} / {totalQuestions}
              </Badge>
              <Badge
                colorScheme={difficultyConfig.colorScheme}
                size="lg"
              >
                {difficultyConfig.label}
              </Badge>
              <Badge variant="outline" size="lg">
                {typeConfig.icon} {typeConfig.label}
              </Badge>
              {question.tags && question.tags.map(tag => (
                <Badge key={tag} colorScheme="blue" size="sm">
                  {tag}
                </Badge>
              ))}
            </HStack>

            {/* 問題文 */}
            <Heading size="lg" lineHeight={1.6} color="gray.800">
              {question.question}
            </Heading>
          </VStack>

          {/* 回答入力エリア（children として渡される） */}
          {children && (
            <Box>
              {children}
            </Box>
          )}

          {/* 解説表示エリア */}
          {showExplanation && question.explanation && (
            <Box>
              <Separator mb={4} />
              <Alert.Root>
                <Alert.Content>
                  <Alert.Title>💡 解説</Alert.Title>
                  <Alert.Description>
                    {question.explanation}
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            </Box>
          )}
        </VStack>
      </Card.Root>
    </VStack>
  )
}