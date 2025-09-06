'use client'

import {
  VStack,
  HStack,
  Box,
  Text,
  Card,
  Badge,
  Progress,
} from '@chakra-ui/react'
import { ReviewFormat } from '@/types/quiz'
import { FaClock, FaBrain } from 'react-icons/fa'

interface QuizHeaderProps {
  currentQuestion: number
  totalQuestions: number
  timeSpent: number
  progress: number
  mode?: 'quiz' | 'review'
  reviewFormat?: ReviewFormat
  colorScheme?: string
}

export default function QuizHeader({
  currentQuestion,
  totalQuestions,
  timeSpent,
  progress,
  mode = 'quiz',
  reviewFormat,
  colorScheme = 'blue'
}: QuizHeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getReviewFormatDisplay = (format: string) => {
    switch (format) {
      case 'quiz': return '📝 クイズ形式'
      case 'flashcard': return '🗂 フラッシュカード'
      case 'explanation': return '📚 解説重視'
      default: return format
    }
  }

  return (
    <Card.Root mb={6} p={4}>
      <VStack gap={4}>
        <HStack w="full" justify="space-between">
          <HStack gap={2}>
            <FaClock />
            <Text fontSize="sm" color="gray.600">
              経過時間: {formatTime(timeSpent)}
            </Text>
          </HStack>
          <HStack gap={2}>
            {mode === 'review' && <FaBrain color="orange" />}
            <Badge 
              colorScheme={mode === 'review' ? 'orange' : colorScheme} 
              size="lg"
            >
              {mode === 'review' ? '復習' : 'クイズ'} {currentQuestion} / {totalQuestions}
            </Badge>
          </HStack>
        </HStack>

        <Box w="full">
          <Progress.Root 
            value={progress} 
            size="md" 
            colorScheme={mode === 'review' ? 'orange' : colorScheme}
          />
        </Box>

        {/* 復習モード表示 */}
        {mode === 'review' && reviewFormat && (
          <HStack gap={2} fontSize="sm" color="orange.600">
            <Text>モード:</Text>
            <Text fontWeight="medium">
              {getReviewFormatDisplay(reviewFormat)}
            </Text>
          </HStack>
        )}
      </VStack>
    </Card.Root>
  )
}