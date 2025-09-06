'use client'

import {
  VStack,
  HStack,
  Box,
  Button,
  Text,
  RadioGroup,
  Textarea,
} from '@chakra-ui/react'
import { Question, ReviewFormat } from '@/types/quiz'
import { FaEye } from 'react-icons/fa'

interface AnswerInputProps {
  question: Question
  currentAnswer: string
  onAnswerChange: (answer: string) => void
  onAnswered?: () => void
  mode?: 'quiz' | ReviewFormat
  isAnswered?: boolean
  showCorrectAnswer?: boolean
}

export default function AnswerInput({
  question,
  currentAnswer,
  onAnswerChange,
  onAnswered,
  mode = 'quiz',
  isAnswered = false,
  showCorrectAnswer = false,
}: AnswerInputProps) {
  const handleAnswerChange = (value: string) => {
    onAnswerChange(value)
    onAnswered?.()
  }

  // フラッシュカードモードの場合
  if (mode === 'flashcard') {
    return (
      <VStack gap={4}>
        <Text fontSize="lg" color="gray.600" textAlign="center">
          答えを思い浮かべたら「答えを見る」ボタンを押してください
        </Text>
        <Button 
          colorScheme="blue" 
          onClick={() => onAnswered?.()}
          disabled={isAnswered}
        >
          <FaEye />
          答えを見る
        </Button>
        
        {isAnswered && (
          <Box p={4} bg="blue.50" borderRadius="md" border="2px solid" borderColor="blue.200">
            <Text fontSize="lg" fontWeight="bold" color="blue.700" textAlign="center">
              正解: {question.type === 'multiple-choice' && question.choices
                ? question.choices[question.correctAnswer as number]
                : question.correctAnswer}
            </Text>
          </Box>
        )}
      </VStack>
    )
  }

  switch (question.type) {
    case 'multiple-choice':
      return (
        <RadioGroup.Root
          value={currentAnswer}
          onValueChange={(details) => handleAnswerChange(details.value || '')}
        >
          <VStack gap={3} align="stretch">
            {question.choices?.map((choice, index) => {
              const isCorrect = index === question.correctAnswer
              const isSelected = currentAnswer === index.toString()
              
              return (
                <RadioGroup.Item
                  key={index}
                  value={index.toString()}
                  p={4}
                  borderRadius="md"
                  border="2px"
                  borderColor={
                    showCorrectAnswer && isCorrect
                      ? 'green.400'
                      : showCorrectAnswer && isSelected && !isCorrect
                        ? 'red.400'
                        : isSelected
                          ? 'blue.400'
                          : 'gray.200'
                  }
                  bg={
                    showCorrectAnswer && isCorrect
                      ? 'green.50'
                      : showCorrectAnswer && isSelected && !isCorrect
                        ? 'red.50'
                        : isSelected
                          ? 'blue.50'
                          : 'white'
                  }
                  _hover={!showCorrectAnswer ? { bg: 'gray.50', borderColor: 'blue.300' } : {}}
                  cursor={showCorrectAnswer ? 'default' : 'pointer'}
                  pointerEvents={showCorrectAnswer ? 'none' : 'auto'}
                >
                  <HStack justify="space-between" w="full">
                    <HStack>
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemIndicator />
                      <Text fontSize="md">{choice}</Text>
                    </HStack>
                    {showCorrectAnswer && isCorrect && (
                      <Text fontSize="sm" fontWeight="bold" color="green.600">
                        ✓ 正解
                      </Text>
                    )}
                  </HStack>
                </RadioGroup.Item>
              )
            })}
          </VStack>
        </RadioGroup.Root>
      )

    case 'true-false':
      return (
        <RadioGroup.Root
          value={currentAnswer}
          onValueChange={(details) => handleAnswerChange(details.value || '')}
        >
          <HStack gap={6} justify="center">
            {question.options?.map((option) => {
              const isCorrect = option === question.correctAnswer
              const isSelected = currentAnswer === option
              
              return (
                <RadioGroup.Item
                  key={option}
                  value={option}
                  p={4}
                  minW="120px"
                  textAlign="center"
                  borderRadius="md"
                  border="2px"
                  borderColor={
                    showCorrectAnswer && isCorrect
                      ? 'green.400'
                      : showCorrectAnswer && isSelected && !isCorrect
                        ? 'red.400'
                        : isSelected
                          ? 'blue.400'
                          : 'gray.200'
                  }
                  bg={
                    showCorrectAnswer && isCorrect
                      ? 'green.50'
                      : showCorrectAnswer && isSelected && !isCorrect
                        ? 'red.50'
                        : isSelected
                          ? 'blue.50'
                          : 'white'
                  }
                  _hover={!showCorrectAnswer ? { bg: 'blue.50', borderColor: 'blue.300' } : {}}
                  cursor={showCorrectAnswer ? 'default' : 'pointer'}
                  pointerEvents={showCorrectAnswer ? 'none' : 'auto'}
                >
                  <VStack>
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <Text fontSize="lg" fontWeight="medium">
                      {option}
                    </Text>
                    {showCorrectAnswer && isCorrect && (
                      <Text fontSize="xs" fontWeight="bold" color="green.600">
                        正解
                      </Text>
                    )}
                  </VStack>
                </RadioGroup.Item>
              )
            })}
          </HStack>
        </RadioGroup.Root>
      )

    case 'essay':
      return (
        <VStack gap={4} align="stretch">
          <Textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={mode === 'quiz' ? '回答を入力してください' : '復習した内容を入力してください'}
            minH="150px"
            resize="vertical"
            size="md"
            readOnly={showCorrectAnswer}
            bg={showCorrectAnswer ? 'gray.50' : 'white'}
          />
          {showCorrectAnswer && question.correctAnswer && (
            <Box p={4} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                模範解答:
              </Text>
              <Text color="green.700">
                {question.correctAnswer}
              </Text>
            </Box>
          )}
        </VStack>
      )

    default:
      return (
        <Text color="red.500" textAlign="center">
          未対応の問題形式です
        </Text>
      )
  }
}