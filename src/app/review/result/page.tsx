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
  FaBrain,
  FaArrowUp,
  FaArrowRight,
  FaChartLine,
  FaCalendar,
  FaLightbulb
} from 'react-icons/fa'
import ResultSummary from '@/components/quiz/ResultSummary'

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
        console.warn('Review session data not found')
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
        router.push('/review/execution')
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

  if (!session || !results) {
    return (
      <Container maxW="container.md" py={8}>
        <Card.Root p={8} textAlign="center">
          <VStack gap={4}>
            <FaBrain size="48" color="orange" />
            <Text fontSize="lg">復習結果を読み込み中...</Text>
            {!session && (
              <VStack gap={2}>
                <Text fontSize="sm" color="orange.500">
                  復習セッションデータを確認中...
                </Text>
                <Text fontSize="xs" color="gray.500">
                  開発環境でのページリロードが原因の場合があります
                </Text>
                <HStack gap={2} mt={2}>
                  <Button 
                    colorScheme="orange" 
                    onClick={() => router.push('/review/settings')}
                    size="sm"
                  >
                    復習設定に戻る
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.reload()}
                    size="sm"
                  >
                    ページを再読込
                  </Button>
                </HStack>
              </VStack>
            )}
          </VStack>
        </Card.Root>
      </Container>
    )
  }

  return (
    <Container maxW="container.md" py={{ base: 4, md: 6 }}>
      {/* 復習結果サマリー */}
      <VStack gap={2} mb={6}>
        <HStack gap={2}>
          <FaBrain color="orange" />
          <Heading size="lg" color="orange.600">復習完了！</Heading>
        </HStack>
      </VStack>
      
      <ResultSummary
        totalQuestions={results.totalQuestions}
        correctCount={results.correctCount}
        incorrectCount={results.incorrectCount}
        score={Math.round(results.accuracyAfter)}
        timeSpent={results.timeSpent}
        mode="review"
        improvementCount={results.improvementCount}
        improvementRate={results.improvementRate}
      />

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
                    <Text fontSize="2xl">🏆</Text>
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

                {/* 結果状態表示 */}
                <Box
                  px={4}
                  py={2}
                  borderRadius="full"
                  bg={detail.wasImproved 
                    ? 'green.100' 
                    : detail.isCorrectNow 
                      ? 'blue.100' 
                      : 'red.100'
                  }
                  border="2px solid"
                  borderColor={detail.wasImproved 
                    ? 'green.400' 
                    : detail.isCorrectNow 
                      ? 'blue.400' 
                      : 'red.400'
                  }
                  boxShadow="md"
                >
                  <HStack gap={2}>
                    <Box
                      p={1}
                      borderRadius="full"
                      bg={detail.wasImproved 
                        ? 'green.500' 
                        : detail.isCorrectNow 
                          ? 'blue.500' 
                          : 'red.500'
                      }
                    >
                      {detail.wasImproved ? (
                        <Text fontSize="sm">🎆</Text>
                      ) : detail.isCorrectNow ? (
                        <FaCheck size="16" color="white" />
                      ) : (
                        <FaTimes size="16" color="white" />
                      )}
                    </Box>
                    <Text 
                      fontSize="lg" 
                      fontWeight="bold" 
                      color={detail.wasImproved 
                        ? 'green.700' 
                        : detail.isCorrectNow 
                          ? 'blue.700' 
                          : 'red.700'
                      }
                    >
                      {detail.wasImproved 
                        ? '成長しました！' 
                        : detail.originalAnswer.isCorrect && detail.isCorrectNow
                          ? '安定正解'
                          : detail.isCorrectNow 
                            ? '正解' 
                            : '復習が必要'
                      }
                    </Text>
                  </HStack>
                </Box>
              </HStack>

              <Text fontWeight="medium">{detail.question.question}</Text>

              <Separator />

              {/* 復習前後の比較 */}
              <VStack gap={3} align="stretch">
                <Text fontSize="md" fontWeight="medium" color="gray.700">
                  復習結果比較
                </Text>
                
                <HStack justify="space-between" align="center">
                  {/* 復習前 */}
                  <VStack gap={1}>
                    <Text fontSize="sm" color="gray.600">復習前</Text>
                    <Box
                      px={3}
                      py={1}
                      borderRadius="md"
                      bg={detail.originalAnswer.isCorrect ? 'green.100' : 'red.100'}
                      border="1px solid"
                      borderColor={detail.originalAnswer.isCorrect ? 'green.300' : 'red.300'}
                    >
                      <HStack gap={1}>
                        {detail.originalAnswer.isCorrect ? (
                          <FaCheck size="12" color="green" />
                        ) : (
                          <FaTimes size="12" color="red" />
                        )}
                        <Text 
                          fontSize="sm"
                          fontWeight="bold" 
                          color={detail.originalAnswer.isCorrect ? 'green.700' : 'red.700'}
                        >
                          {detail.originalAnswer.isCorrect ? '正解' : '不正解'}
                        </Text>
                      </HStack>
                    </Box>
                  </VStack>

                  {/* 矢印アイコン */}
                  <Box px={2}>
                    <FaArrowRight 
                      size="16" 
                      color={detail.wasImproved ? 'green' : 'gray'}
                    />
                  </Box>

                  {/* 復習後 */}
                  <VStack gap={1}>
                    <Text fontSize="sm" color="gray.600">復習後</Text>
                    <Box
                      px={3}
                      py={1}
                      borderRadius="md"
                      bg={detail.isCorrectNow ? 'green.100' : 'red.100'}
                      border="1px solid"
                      borderColor={detail.isCorrectNow ? 'green.300' : 'red.300'}
                    >
                      <HStack gap={1}>
                        {detail.isCorrectNow ? (
                          <FaCheck size="12" color="green" />
                        ) : (
                          <FaTimes size="12" color="red" />
                        )}
                        <Text 
                          fontSize="sm"
                          fontWeight="bold" 
                          color={detail.isCorrectNow ? 'green.700' : 'red.700'}
                        >
                          {detail.isCorrectNow ? '正解' : '不正解'}
                        </Text>
                      </HStack>
                    </Box>
                  </VStack>
                </HStack>

                {/* 改善メッセージ */}
                {detail.wasImproved && (
                  <Box 
                    p={2} 
                    bg="green.50" 
                    borderRadius="md" 
                    border="1px solid" 
                    borderColor="green.200"
                    textAlign="center"
                  >
                    <HStack justify="center" gap={2}>
                      <Text>🎉</Text>
                      <Text fontSize="sm" fontWeight="medium" color="green.700">
                        素晴らしい！前回の間違いを克服しました
                      </Text>
                    </HStack>
                  </Box>
                )}
              </VStack>

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
            router.push('/review/execution')
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