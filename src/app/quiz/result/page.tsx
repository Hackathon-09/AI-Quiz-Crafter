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
} from '@chakra-ui/react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Question, QuizSession } from '@/types/quiz'
import { FaHome, FaRedo, FaCheck, FaTimes } from 'react-icons/fa'
import ResultSummary from '@/components/quiz/ResultSummary'

export default function QuizResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [session, setSession] = useState<QuizSession | null>(null)
  const hasInitialized = useRef(false)
  const [results, setResults] = useState<{
    totalQuestions: number
    correctCount: number
    incorrectCount: number
    score: number
    timeSpent: number
    details: Array<{
      question: Question
      userAnswer: string | string[]
      isCorrect: boolean
    }>
  } | null>(null)

  const calculateResults = useCallback((session: QuizSession) => {
      const details = session.questions.map(question => {
        const userAnswer = session.answers[question.id] || ''
        let isCorrect = false

        if (question.type === 'multiple-choice') {
          const answerString = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer
          const answerIndex = parseInt(answerString)
          isCorrect = answerIndex === question.correctAnswer
        } else if (question.type === 'true-false') {
          const answerString = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer
          isCorrect = answerString === question.correctAnswer
        } else if (question.type === 'essay') {
          // 記述問題は一旦正解とする（実際はAI評価）
          const answerString = Array.isArray(userAnswer) ? userAnswer.join(' ') : userAnswer
          isCorrect = answerString.trim().length > 0
        }

        return {
          question,
          userAnswer,
          isCorrect
        }
      })

      const correctCount = details.filter(d => d.isCorrect).length
      const score = Math.round((correctCount / session.questions.length) * 100)
      
      // より正確な時間計算（セッション完了時の時刻を使用）
      const endTime = session.completedAt || new Date()
      const timeSpent = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000)

      return {
        totalQuestions: session.questions.length,
        correctCount,
        incorrectCount: session.questions.length - correctCount,
        score,
        timeSpent,
        details
      }
    }, [])

  useEffect(() => {
    // 重複実行を防ぐ
    if (hasInitialized.current) {
      return
    }
    
    try {
      let parsedSession: QuizSession
      
      // sessionStorageからセッションデータを取得
      console.log('Checking sessionStorage for quizSession...')
      const sessionData = sessionStorage.getItem('quizSession')
      console.log('Session data from storage:', sessionData)
      
      if (!sessionData) {
        // フォールバック: URLパラメータもチェック
        const urlSessionData = searchParams.get('data')
        if (!urlSessionData) {
          console.error('No session data found')
          router.push('/dashboard')
          return
        }
        const decodedData = decodeURIComponent(urlSessionData)
        parsedSession = JSON.parse(decodedData)
      } else {
        parsedSession = JSON.parse(sessionData)
      }
      
      // データの整合性チェック
      if (!parsedSession.questions || parsedSession.questions.length === 0) {
        console.error('Invalid session data: no questions found')
        router.push('/dashboard')
        return
      }
      
      if (!parsedSession.answers) {
        console.error('Invalid session data: no answers found')
        router.push('/dashboard')
        return
      }
      
      // startTimeが文字列の場合はDateオブジェクトに変換
      if (typeof parsedSession.startTime === 'string') {
        parsedSession.startTime = new Date(parsedSession.startTime)
      }
      
      // completedAtが文字列の場合はDateオブジェクトに変換
      if (parsedSession.completedAt && typeof parsedSession.completedAt === 'string') {
        parsedSession.completedAt = new Date(parsedSession.completedAt)
      }
      
      // セッションが完了していることを確認
      if (!parsedSession.isCompleted) {
        console.error('Session is not completed')
        router.push('/quiz/execution')
        return
      }
      
      setSession(parsedSession)
      setResults(calculateResults(parsedSession))
      
      // 初期化完了フラグを設定
      hasInitialized.current = true
      
      // データを使用後はsessionStorageから削除（セキュリティとメモリのため）
      sessionStorage.removeItem('quizSession')
    } catch (error) {
      console.error('Failed to parse session data:', error)
      router.push('/dashboard')
    }
  }, [searchParams, calculateResults, router])


  if (!session || !results) {
    return (
      <Container maxW="container.md" py={8}>
        <Card.Root p={8} textAlign="center">
          <VStack gap={4}>
            <Text fontSize="lg">結果を読み込み中...</Text>
            <Text fontSize="sm" color="gray.600">
              クイズセッションデータを処理しています
            </Text>
          </VStack>
        </Card.Root>
      </Container>
    )
  }

  return (
    <Container maxW="container.md" py={{ base: 4, md: 6 }}>
      {/* 結果サマリー */}
      <VStack gap={2} mb={6}>
        <HStack gap={2}>
          <Text fontSize="3xl">🎉</Text>
          <Heading size="lg" color="blue.600">クイズ結果</Heading>
        </HStack>
      </VStack>
      
      <ResultSummary
        totalQuestions={results.totalQuestions}
        correctCount={results.correctCount}
        incorrectCount={results.incorrectCount}
        score={results.score}
        timeSpent={results.timeSpent}
        mode="quiz"
      />

      {/* 問題別詳細結果 */}
      <VStack gap={4} align="stretch">
        <Heading size="md">問題別結果・解説</Heading>
        
        {results.details.map((detail, index) => (
          <Card.Root key={detail.question.id}>
            <VStack gap={4} align="stretch" p={{ base: 4, md: 6 }}>
              {/* 問題ヘッダー */}
              <HStack justify="space-between" wrap="wrap" gap={2}>
                <HStack gap={2}>
                  <Badge variant="outline">問題 {index + 1}</Badge>
                  <Badge
                    colorScheme={
                      detail.question.difficulty === 'basic'
                        ? 'green'
                        : detail.question.difficulty === 'standard'
                          ? 'yellow'
                          : 'red'
                    }
                  >
                    {detail.question.difficulty === 'basic'
                      ? '基礎'
                      : detail.question.difficulty === 'standard'
                        ? '標準'
                        : '応用'}
                  </Badge>
                </HStack>

                <Box
                  px={4}
                  py={2}
                  borderRadius="full"
                  bg={detail.isCorrect ? 'green.100' : 'red.100'}
                  border="2px solid"
                  borderColor={detail.isCorrect ? 'green.400' : 'red.400'}
                  boxShadow="md"
                >
                  <HStack gap={2}>
                    <Box
                      p={1}
                      borderRadius="full"
                      bg={detail.isCorrect ? 'green.500' : 'red.500'}
                    >
                      {detail.isCorrect ? 
                        <FaCheck size="16" color="white" /> : 
                        <FaTimes size="16" color="white" />
                      }
                    </Box>
                    <Text 
                      fontSize="lg" 
                      fontWeight="bold" 
                      color={detail.isCorrect ? 'green.700' : 'red.700'}
                    >
                      {detail.isCorrect ? '正解' : '不正解'}
                    </Text>
                  </HStack>
                </Box>
              </HStack>

              {/* 問題文 */}
              <Box>
                <Text fontWeight="medium" mb={2}>
                  {detail.question.question}
                </Text>
              </Box>

              <Separator />

              {/* 解答情報 */}
              <VStack gap={4} align="stretch">
                <VStack gap={3} align="stretch">
                  <Box 
                    p={4}
                    borderRadius="lg"
                    bg={detail.isCorrect ? 'green.50' : 'red.50'}
                    border="1px solid"
                    borderColor={detail.isCorrect ? 'green.200' : 'red.200'}
                  >
                    <VStack gap={2} align="start">
                      <HStack gap={2}>
                        <Box
                          p={1}
                          borderRadius="full"
                          bg={detail.isCorrect ? 'green.500' : 'red.500'}
                        >
                          {detail.isCorrect ? 
                            <FaCheck size="12" color="white" /> : 
                            <FaTimes size="12" color="white" />
                          }
                        </Box>
                        <Text fontSize="sm" fontWeight="medium" color="gray.700">
                          あなたの解答
                        </Text>
                      </HStack>
                      <Text 
                        fontWeight="bold" 
                        fontSize="lg"
                        color={detail.isCorrect ? 'green.700' : 'red.700'}
                        pl={6}
                      >
                        {(() => {
                          const userAnswer = Array.isArray(detail.userAnswer) 
                            ? detail.userAnswer[0] 
                            : detail.userAnswer
                          
                          if (!userAnswer) return '未回答'
                          
                          // multiple-choice問題の場合は選択肢テキストを表示
                          if (detail.question.type === 'multiple-choice' && detail.question.choices) {
                            const answerIndex = parseInt(userAnswer)
                            if (!isNaN(answerIndex) && answerIndex >= 0 && answerIndex < detail.question.choices.length) {
                              return detail.question.choices[answerIndex]
                            }
                          }
                          
                          return userAnswer
                        })()}
                      </Text>
                    </VStack>
                  </Box>

                  <Box 
                    p={4}
                    borderRadius="lg"
                    bg="green.50"
                    border="1px solid"
                    borderColor="green.200"
                  >
                    <VStack gap={2} align="start">
                      <HStack gap={2}>
                        <Box
                          p={1}
                          borderRadius="full"
                          bg="green.500"
                        >
                          <FaCheck size="12" color="white" />
                        </Box>
                        <Text fontSize="sm" fontWeight="medium" color="gray.700">
                          正解
                        </Text>
                      </HStack>
                      <Text 
                        fontWeight="bold" 
                        fontSize="lg"
                        color="green.700"
                        pl={6}
                      >
                        {detail.question.type === 'multiple-choice' && detail.question.choices
                          ? detail.question.choices[detail.question.correctAnswer as number]
                          : detail.question.correctAnswer}
                      </Text>
                    </VStack>
                  </Box>
                </VStack>

                {/* 解説 */}
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
            </VStack>
          </Card.Root>
        ))}
      </VStack>

      {/* アクションボタン */}
      <HStack justify="center" gap={4} mt={8} wrap="wrap">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
        >
          <FaHome />
          ダッシュボード
        </Button>

        <Button
          colorScheme="blue"
          onClick={() => {
            // 同じ設定でもう一度挑戦
            sessionStorage.setItem('quizSettings', JSON.stringify(session.settings))
            router.push('/quiz/execution')
          }}
        >
          <FaRedo />
          もう一度挑戦
        </Button>
      </HStack>
    </Container>
  )
}