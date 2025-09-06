'use client'

import {
  Container,
  VStack,
  HStack,
  Box,
  Button,
  Text,
  Card,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Question, ReviewSession, ReviewSettings, UserAnswer, ReviewFormat } from '@/types/quiz'
import { mockQuestions } from '@/data/mockQuestions'
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaCheck,
  FaBrain
} from 'react-icons/fa'
import QuizHeader from '@/components/quiz/QuizHeader'
import QuestionDisplay from '@/components/quiz/QuestionDisplay'
import AnswerInput from '@/components/quiz/AnswerInput'

export default function ReviewExecutionPage() {
  const router = useRouter()
  const [session, setSession] = useState<ReviewSession | null>(null)
  const [currentAnswer, setCurrentAnswer] = useState<string>('')
  const [timeSpent, setTimeSpent] = useState(0)

  // 復習セッションを初期化
  useEffect(() => {
    let settings: ReviewSettings
    
    try {
      const settingsData = sessionStorage.getItem('reviewSettings')
      if (!settingsData) {
        console.warn('No review settings found, using default settings for testing')
        // テスト用のデフォルト設定を提供
        settings = {
          targetMode: 'all',
          questionCount: '5',
          reviewFormat: 'quiz',
          daysPeriod: 7
        }
      } else {
        settings = JSON.parse(settingsData)
      }
    } catch (error) {
      console.error('Failed to parse review settings:', error)
      // エラーの場合もデフォルト設定を使用
      settings = {
        targetMode: 'all',
        questionCount: '5',
        reviewFormat: 'quiz',
        daysPeriod: 7
      }
    }

    // 復習対象の問題を取得（実際はAPIから取得）
    const getReviewQuestions = (): Question[] => {
      
      // モックデータから復習対象を選択
      let filteredQuestions = [...mockQuestions] // コピーを作成

      // 対象モードに応じてフィルタリング
      switch (settings.targetMode) {
        case 'incorrect':
          // 過去に間違えた問題（仮の実装）- より多くの問題を含めるように調整
          filteredQuestions = mockQuestions.filter(() => Math.random() > 0.3)
          break
        case 'low-score':
          // 正答率が低い問題（仮の実装）- より多くの問題を含めるように調整
          filteredQuestions = mockQuestions.filter(() => Math.random() > 0.4)
          break
        case 'category':
          // カテゴリに該当する問題（タグベース）
          if (settings.categories && settings.categories.length > 0) {
            filteredQuestions = mockQuestions.filter(q => 
              q.tags?.some(tag => settings.categories?.includes(tag))
            )
          }
          break
        case 'all':
          // 全ての問題
          filteredQuestions = [...mockQuestions]
          break
      }

      // 問題数が不足している場合は、全ての問題から補完
      if (filteredQuestions.length === 0) {
        console.warn('No questions found for filter, using all questions')
        filteredQuestions = [...mockQuestions]
      }

      const requestedCount = parseInt(settings.questionCount)
      
      // 重複を避けるためにSetを使用してユニークな問題のみを取得
      const uniqueQuestions = Array.from(new Set(filteredQuestions.map(q => q.id)))
        .map(id => filteredQuestions.find(q => q.id === id)!)
        .filter(Boolean)

      let result = uniqueQuestions.slice(0, requestedCount)
      
      // それでも足りない場合は、全ての問題からランダムに補完（重複なし）
      if (result.length < requestedCount) {
        const usedIds = new Set(result.map(q => q.id))
        const remainingQuestions = mockQuestions.filter(q => !usedIds.has(q.id))
        const additionalNeeded = requestedCount - result.length
        result = [...result, ...remainingQuestions.slice(0, additionalNeeded)]
      }

      return result
    }

    const reviewQuestions = getReviewQuestions()

    // モック用の過去の回答データを生成
    const originalAnswers: { [questionId: string]: UserAnswer } = {}
    reviewQuestions.forEach(q => {
      originalAnswers[q.id] = {
        questionId: q.id,
        userAnswer: Math.random() > 0.5 ? 'incorrect_answer' : q.correctAnswer.toString(),
        isCorrect: Math.random() > 0.4,
        timeSpent: Math.floor(Math.random() * 120) + 30
      }
    })

    const newSession: ReviewSession = {
      id: `review-session-${Date.now()}`,
      userId: 'current-user', // 実際はauth から取得
      settings,
      questions: reviewQuestions,
      originalAnswers,
      reviewAnswers: {},
      currentQuestionIndex: 0,
      startTime: new Date(),
      isCompleted: false,
      improvementCount: 0,
    }

    setSession(newSession)
  }, [router])

  // タイマー
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!session) {
    return (
      <Container maxW="container.md" py={8}>
        <Card.Root p={8} textAlign="center">
          <VStack gap={4}>
            <FaBrain size="48" color="orange" />
            <Text fontSize="lg">復習セッションを準備中...</Text>
          </VStack>
        </Card.Root>
      </Container>
    )
  }

  if (session.questions.length === 0) {
    return (
      <Container maxW="container.md" py={8}>
        <Card.Root p={8} textAlign="center">
          <VStack gap={4}>
            <Text fontSize="xl" color="orange.500" fontWeight="bold">
              復習対象の問題が見つかりませんでした
            </Text>
            <Text fontSize="md" color="gray.700">
              設定を変更して再度お試しください
            </Text>
            <Button colorScheme="orange" onClick={() => router.push('/review/settings')}>
              設定を変更
            </Button>
          </VStack>
        </Card.Root>
      </Container>
    )
  }

  const currentQuestion = session.questions[session.currentQuestionIndex]
  const originalAnswer = session.originalAnswers[currentQuestion.id]
  const progress = ((session.currentQuestionIndex + 1) / session.questions.length) * 100
  const isLastQuestion = session.currentQuestionIndex === session.questions.length - 1

  const handleAnswer = () => {
    if (!session) {
      console.error('No session available for handleAnswer')
      return
    }
    
    if (!currentAnswer.trim()) return

    // 回答を保存
    const updatedSession = {
      ...session,
      reviewAnswers: {
        ...session.reviewAnswers,
        [currentQuestion.id]: currentAnswer,
      },
    }

    // 改善判定
    let isImproved = false
    if (currentQuestion.type === 'multiple-choice') {
      const answerIndex = parseInt(currentAnswer)
      const isCorrectNow = answerIndex === currentQuestion.correctAnswer
      const wasCorrectBefore = originalAnswer.isCorrect
      isImproved = !wasCorrectBefore && isCorrectNow
    } else if (currentQuestion.type === 'true-false') {
      const isCorrectNow = currentAnswer === currentQuestion.correctAnswer
      const wasCorrectBefore = originalAnswer.isCorrect
      isImproved = !wasCorrectBefore && isCorrectNow
    }

    if (isImproved) {
      updatedSession.improvementCount += 1
    }

    if (isLastQuestion) {
      // 最後の問題の場合は結果画面へ
      updatedSession.isCompleted = true
      updatedSession.completedAt = new Date()
      setSession(updatedSession)
      
      // セッションデータを保存
      const serializedData = JSON.stringify(updatedSession)
      sessionStorage.setItem('reviewSession', serializedData)
      console.log('Review session completed and saved')
      router.push('/review/result')
    } else {
      // 次の問題へ
      updatedSession.currentQuestionIndex += 1
      setSession(updatedSession)
      setCurrentAnswer('')
    }
  }

  const handlePrevious = () => {
    if (session.currentQuestionIndex > 0) {
      const updatedSession = {
        ...session,
        currentQuestionIndex: session.currentQuestionIndex - 1,
      }
      setSession(updatedSession)

      // 前の問題の回答があれば復元
      const previousAnswer = session.reviewAnswers[currentQuestion.id] || ''
      setCurrentAnswer(Array.isArray(previousAnswer) ? previousAnswer[0] || '' : previousAnswer)
    }
  }


  return (
    <Container maxW="container.md" py={{ base: 4, md: 6 }}>
      {/* ヘッダー */}
      <QuizHeader
        currentQuestion={session.currentQuestionIndex + 1}
        totalQuestions={session.questions.length}
        timeSpent={timeSpent}
        progress={progress}
        mode="review"
        reviewFormat={session.settings.reviewFormat}
      />

      {/* 問題表示 */}
      <QuestionDisplay
        question={currentQuestion}
        questionNumber={session.currentQuestionIndex + 1}
        totalQuestions={session.questions.length}
        showExplanation={false}
        originalAnswer={originalAnswer}
        mode="review"
      >
        <AnswerInput
          question={currentQuestion}
          currentAnswer={currentAnswer}
          onAnswerChange={setCurrentAnswer}
          mode="quiz"
        />
      </QuestionDisplay>

      {/* ナビゲーション */}
      <HStack justify="space-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={session.currentQuestionIndex === 0}
        >
          <FaArrowLeft />
          戻る
        </Button>

        <Button
          colorScheme="orange"
          onClick={handleAnswer}
          disabled={!currentAnswer.trim()}
        >
          {isLastQuestion ? <FaCheck /> : <FaArrowRight />}
          {isLastQuestion ? '復習完了' : '次へ'}
        </Button>
      </HStack>
    </Container>
  )
}