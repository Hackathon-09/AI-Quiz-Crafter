'use client'

import {
  Container,
  Heading,
  VStack,
  HStack,
  Box,
  Button,
  Text,
  Card,
  Badge,
  Progress,
  Separator,
  Alert,
  SimpleGrid,
} from '@chakra-ui/react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ReviewSession, Question } from '@/types/quiz'
import { 
  FaHome, 
  FaRedo, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaTrophy,
  FaBrain,
  FaArrowUp,
  FaChartLine,
  FaCalendar,
  FaLightbulb
} from 'react-icons/fa'

export default function ReviewResultPage() {
  const router = useRouter()
  const [session, setSession] = useState<ReviewSession | null>(null)
  const [results, setResults] = useState<{
    totalQuestions: number
    correctCount: number
    incorrectCount: number
    improvementCount: number
    accuracyBefore: number
    accuracyAfter: number
    improvementRate: number
    timeSpent: number
    details: Array<{
      question: Question
      originalAnswer: { userAnswer: string; isCorrect: boolean }
      reviewAnswer: string | string[]
      isCorrectNow: boolean
      wasImproved: boolean
    }>
    weakAreas: string[]
    strengthAreas: string[]
  } | null>(null)

  const calculateResults = useCallback((session: ReviewSession) => {
    const details = session.questions.map(question => {
      const originalAnswer = session.originalAnswers[question.id]
      const reviewAnswer = session.reviewAnswers[question.id] || ''
      
      let isCorrectNow = false
      if (question.type === 'multiple-choice') {
        const answerString = Array.isArray(reviewAnswer) ? reviewAnswer[0] : reviewAnswer
        const answerIndex = parseInt(answerString)
        isCorrectNow = answerIndex === question.correctAnswer
      } else if (question.type === 'true-false') {
        const answerString = Array.isArray(reviewAnswer) ? reviewAnswer[0] : reviewAnswer
        isCorrectNow = answerString === question.correctAnswer
      } else if (question.type === 'essay') {
        const answerString = Array.isArray(reviewAnswer) ? reviewAnswer.join(' ') : reviewAnswer
        isCorrectNow = answerString.trim().length > 0
      }

      const wasImproved = !originalAnswer.isCorrect && isCorrectNow

      return {
        question,
        originalAnswer,
        reviewAnswer,
        isCorrectNow,
        wasImproved
      }
    })

    const correctCount = details.filter(d => d.isCorrectNow).length
    const improvementCount = details.filter(d => d.wasImproved).length
    const originalCorrectCount = details.filter(d => d.originalAnswer.isCorrect).length

    const accuracyBefore = (originalCorrectCount / session.questions.length) * 100
    const accuracyAfter = (correctCount / session.questions.length) * 100
    const improvementRate = accuracyAfter - accuracyBefore

    // 弱点・強化分野の分析
    const categoryStats: { [category: string]: { correct: number; total: number; improved: number } } = {}
    details.forEach(detail => {
      if (detail.question.tags) {
        detail.question.tags.forEach(tag => {
          if (!categoryStats[tag]) {
            categoryStats[tag] = { correct: 0, total: 0, improved: 0 }
          }
          categoryStats[tag].total += 1
          if (detail.isCorrectNow) categoryStats[tag].correct += 1
          if (detail.wasImproved) categoryStats[tag].improved += 1
        })
      }
    })

    const weakAreas = Object.entries(categoryStats)
      .filter(([_, stats]) => (stats.correct / stats.total) < 0.7)
      .map(([category]) => category)

    const strengthAreas = Object.entries(categoryStats)
      .filter(([_, stats]) => stats.improved > 0)
      .map(([category]) => category)

    const endTime = session.completedAt || new Date()
    const timeSpent = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000)

    return {
      totalQuestions: session.questions.length,
      correctCount,
      incorrectCount: session.questions.length - correctCount,
      improvementCount,
      accuracyBefore,
      accuracyAfter,
      improvementRate,
      timeSpent,
      details,
      weakAreas,
      strengthAreas
    }
  }, [])

  useEffect(() => {
    try {
      const sessionData = sessionStorage.getItem('reviewSession')
      if (!sessionData) {
        console.error('No review session data found')
        router.push('/dashboard')
        return
      }

      const parsedSession: ReviewSession = JSON.parse(sessionData)
      
      if (typeof parsedSession.startTime === 'string') {
        parsedSession.startTime = new Date(parsedSession.startTime)
      }
      
      if (parsedSession.completedAt && typeof parsedSession.completedAt === 'string') {
        parsedSession.completedAt = new Date(parsedSession.completedAt)
      }

      if (!parsedSession.isCompleted) {
        console.error('Review session is not completed')
        router.push('/quiz/review/execution')
        return
      }

      setSession(parsedSession)
      setResults(calculateResults(parsedSession))
      
      sessionStorage.removeItem('reviewSession')
    } catch (error) {
      console.error('Failed to parse review session data:', error)
      router.push('/dashboard')
    }
  }, [calculateResults, router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getImprovementGrade = (rate: number) => {
    if (rate >= 30) return { grade: 'S', color: 'purple.500', bg: 'purple.50', description: '素晴らしい成長です！' }
    if (rate >= 20) return { grade: 'A', color: 'green.500', bg: 'green.50', description: '大きく向上しました！' }
    if (rate >= 10) return { grade: 'B', color: 'blue.500', bg: 'blue.50', description: '着実に向上しています' }
    if (rate >= 0) return { grade: 'C', color: 'yellow.500', bg: 'yellow.50', description: '少し向上しました' }
    return { grade: 'D', color: 'red.500', bg: 'red.50', description: '復習を続けましょう' }
  }

  if (!session || !results) {
    return (
      <Container maxW="container.md" py={8}>
        <Card.Root p={8} textAlign="center">
          <VStack gap={4}>
            <FaBrain size="48" color="orange" />
            <Text fontSize="lg">復習結果を読み込み中...</Text>
          </VStack>
        </Card.Root>
      </Container>
    )
  }

  const improvementGrade = getImprovementGrade(results.improvementRate)

  return (
    <Container maxW="container.md" py={{ base: 4, md: 6 }}>
      {/* 復習結果サマリー */}
      <Card.Root mb={6}>
        <VStack gap={6} p={{ base: 6, md: 8 }}>
          <HStack gap={2}>
            <FaBrain color="orange" />
            <Heading size="lg" color="orange.600">復習完了！</Heading>
          </HStack>

          <VStack gap={8} w="full">
            {/* 改善スコア表示 */}
            <VStack>
              <Box position="relative">
                <Box
                  position="relative"
                  w="180px"
                  h="180px"
                  borderRadius="full"
                  bg={`linear-gradient(135deg, ${improvementGrade.bg} 0%, white 100%)`}
                  border="4px solid"
                  borderColor={improvementGrade.color}
                  boxShadow={`0 15px 30px rgba(0,0,0,0.1), 0 0 0 6px ${improvementGrade.bg}`}
                >
                  <VStack 
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    gap={1}
                  >
                    <FaArrowUp size="24" color={improvementGrade.color} />
                    <Text 
                      fontSize="3xl" 
                      fontWeight="900" 
                      color={improvementGrade.color}
                    >
                      {results.improvementRate > 0 ? '+' : ''}{Math.round(results.improvementRate)}%
                    </Text>
                    <Text 
                      fontSize="sm" 
                      fontWeight="bold" 
                      color="gray.600"
                      letterSpacing="wider"
                    >
                      IMPROVEMENT
                    </Text>
                  </VStack>
                  
                  <Box
                    position="absolute"
                    top="-8px"
                    right="-8px"
                    w="50px"
                    h="50px"
                    borderRadius="full"
                    bg={improvementGrade.color}
                    border="3px solid white"
                    boxShadow="0 3px 10px rgba(0,0,0,0.2)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text 
                      fontSize="xl" 
                      fontWeight="black" 
                      color="white"
                    >
                      {improvementGrade.grade}
                    </Text>
                  </Box>
                </Box>
              </Box>
              
              <VStack gap={2}>
                <Text 
                  fontSize="lg" 
                  fontWeight="bold" 
                  color={improvementGrade.color}
                  textAlign="center"
                >
                  {improvementGrade.description}
                </Text>
                
                <HStack gap={4} fontSize="sm" color="gray.600">
                  <Text>復習前: {Math.round(results.accuracyBefore)}%</Text>
                  <Text>→</Text>
                  <Text fontWeight="bold" color={improvementGrade.color}>
                    復習後: {Math.round(results.accuracyAfter)}%
                  </Text>
                </HStack>
              </VStack>
            </VStack>

            {/* 統計情報 */}
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} w="full">
              <VStack>
                <Box 
                  p={3} 
                  borderRadius="lg" 
                  bg="green.50"
                  border="2px solid"
                  borderColor="green.200"
                >
                  <VStack gap={1}>
                    <FaCheck size="20" color="green" />
                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                      {results.correctCount}
                    </Text>
                  </VStack>
                </Box>
                <Text fontSize="sm" fontWeight="medium" color="green.600">復習後正解</Text>
              </VStack>

              <VStack>
                <Box 
                  p={3} 
                  borderRadius="lg" 
                  bg="orange.50"
                  border="2px solid"
                  borderColor="orange.200"
                >
                  <VStack gap={1}>
                    <FaArrowUp size="20" color="orange" />
                    <Text fontSize="lg" fontWeight="bold" color="orange.600">
                      {results.improvementCount}
                    </Text>
                  </VStack>
                </Box>
                <Text fontSize="sm" fontWeight="medium" color="orange.600">改善問題</Text>
              </VStack>

              <VStack>
                <Box 
                  p={3} 
                  borderRadius="lg" 
                  bg="red.50"
                  border="2px solid"
                  borderColor="red.200"
                >
                  <VStack gap={1}>
                    <FaTimes size="20" color="red" />
                    <Text fontSize="lg" fontWeight="bold" color="red.600">
                      {results.incorrectCount}
                    </Text>
                  </VStack>
                </Box>
                <Text fontSize="sm" fontWeight="medium" color="red.600">要復習</Text>
              </VStack>

              <VStack>
                <Box 
                  p={3} 
                  borderRadius="lg" 
                  bg="blue.50"
                  border="2px solid"
                  borderColor="blue.200"
                >
                  <VStack gap={1}>
                    <FaClock size="20" color="blue" />
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      {formatTime(results.timeSpent)}
                    </Text>
                  </VStack>
                </Box>
                <Text fontSize="sm" fontWeight="medium" color="blue.600">復習時間</Text>
              </VStack>
            </SimpleGrid>
          </VStack>
        </VStack>
      </Card.Root>

      {/* 分野別分析 */}
      {(results.weakAreas.length > 0 || results.strengthAreas.length > 0) && (
        <Card.Root mb={6}>
          <VStack gap={4} p={6} align="stretch">
            <HStack gap={2}>
              <FaChartLine color="blue" />
              <Heading size="md" color="blue.600">学習分析</Heading>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              {results.strengthAreas.length > 0 && (
                <Box>
                  <HStack gap={2} mb={3}>
                    <FaTrophy color="gold" />
                    <Text fontWeight="bold" color="green.600">向上した分野</Text>
                  </HStack>
                  <VStack gap={2} align="start">
                    {results.strengthAreas.map(area => (
                      <Badge key={area} colorScheme="green" size="lg">
                        {area}
                      </Badge>
                    ))}
                  </VStack>
                </Box>
              )}

              {results.weakAreas.length > 0 && (
                <Box>
                  <HStack gap={2} mb={3}>
                    <FaLightbulb color="orange" />
                    <Text fontWeight="bold" color="orange.600">引き続き注意が必要な分野</Text>
                  </HStack>
                  <VStack gap={2} align="start">
                    {results.weakAreas.map(area => (
                      <Badge key={area} colorScheme="orange" size="lg">
                        {area}
                      </Badge>
                    ))}
                  </VStack>
                </Box>
              )}
            </SimpleGrid>
          </VStack>
        </Card.Root>
      )}

      {/* 次回復習推奨 */}
      <Card.Root mb={6} p={6} bg="blue.50" border="1px solid" borderColor="blue.200">
        <VStack gap={3} align="start">
          <HStack gap={2}>
            <FaCalendar color="blue" />
            <Text fontWeight="bold" color="blue.700">次回復習推奨</Text>
          </HStack>
          <Text fontSize="sm" color="blue.700">
            {results.improvementRate > 20 
              ? '素晴らしい成果です！1週間後に再復習することをお勧めします。'
              : results.improvementRate > 10
                ? '良い向上が見られます。3-4日後に再復習してみましょう。'
                : '明日もう一度復習することをお勧めします。継続が重要です！'
            }
          </Text>
        </VStack>
      </Card.Root>

      {/* 問題別詳細結果 */}
      <VStack gap={4} align="stretch" mb={6}>
        <Heading size="md">復習詳細</Heading>
        
        {results.details.map((detail, index) => (
          <Card.Root key={detail.question.id}>
            <VStack gap={4} align="stretch" p={6}>
              <HStack justify="space-between" wrap="wrap">
                <HStack gap={2}>
                  <Badge variant="outline">問題 {index + 1}</Badge>
                  {detail.question.tags?.map(tag => (
                    <Badge key={tag} colorScheme="blue" size="sm">{tag}</Badge>
                  ))}
                </HStack>

                <HStack gap={2}>
                  {/* 改善状況バッジ */}
                  {detail.wasImproved ? (
                    <Badge colorScheme="green" size="lg">
                      <FaArrowUp />
                      改善！
                    </Badge>
                  ) : detail.originalAnswer.isCorrect && detail.isCorrectNow ? (
                    <Badge colorScheme="blue" size="lg">
                      <FaCheck />
                      維持
                    </Badge>
                  ) : detail.isCorrectNow ? (
                    <Badge colorScheme="green" size="lg">
                      <FaCheck />
                      正解
                    </Badge>
                  ) : (
                    <Badge colorScheme="red" size="lg">
                      <FaTimes />
                      要復習
                    </Badge>
                  )}
                </HStack>
              </HStack>

              <Text fontWeight="medium">{detail.question.question}</Text>

              <Separator />

              {/* 復習前後の比較 */}
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Box 
                  p={4}
                  borderRadius="lg"
                  bg={detail.originalAnswer.isCorrect ? 'green.50' : 'red.50'}
                  border="1px solid"
                  borderColor={detail.originalAnswer.isCorrect ? 'green.200' : 'red.200'}
                >
                  <VStack gap={2} align="start">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      復習前
                    </Text>
                    <Text 
                      fontWeight="bold" 
                      color={detail.originalAnswer.isCorrect ? 'green.700' : 'red.700'}
                    >
                      {detail.originalAnswer.isCorrect ? '正解' : '不正解'}
                    </Text>
                  </VStack>
                </Box>

                <Box 
                  p={4}
                  borderRadius="lg"
                  bg={detail.isCorrectNow ? 'green.50' : 'red.50'}
                  border="1px solid"
                  borderColor={detail.isCorrectNow ? 'green.200' : 'red.200'}
                >
                  <VStack gap={2} align="start">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      復習後
                    </Text>
                    <Text 
                      fontWeight="bold" 
                      color={detail.isCorrectNow ? 'green.700' : 'red.700'}
                    >
                      {detail.isCorrectNow ? '正解' : '不正解'}
                    </Text>
                  </VStack>
                </Box>
              </SimpleGrid>

              {detail.question.explanation && (
                <Alert.Root>
                  <Alert.Content>
                    <Alert.Title>解説</Alert.Title>
                    <Alert.Description>
                      {detail.question.explanation}
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}
            </VStack>
          </Card.Root>
        ))}
      </VStack>

      {/* アクションボタン */}
      <HStack justify="center" gap={4} wrap="wrap">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
        >
          <FaHome />
          ダッシュボード
        </Button>

        <Button
          colorScheme="orange"
          onClick={() => {
            sessionStorage.setItem('reviewSettings', JSON.stringify(session.settings))
            router.push('/quiz/review/execution')
          }}
        >
          <FaRedo />
          もう一度復習
        </Button>

        <Button
          colorScheme="blue"
          onClick={() => router.push('/review/history')}
        >
          <FaChartLine />
          学習履歴を見る
        </Button>
      </HStack>
    </Container>
  )
}