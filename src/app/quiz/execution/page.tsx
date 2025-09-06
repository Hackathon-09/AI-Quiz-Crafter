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
import { useRouter, useSearchParams } from 'next/navigation'
import { Question, QuizSession, QuizSettings } from '@/types/quiz'
import { mockQuestions } from '@/data/mockQuestions'
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa'
import QuizHeader from '@/components/quiz/QuizHeader'
import QuestionDisplay from '@/components/quiz/QuestionDisplay'
import AnswerInput from '@/components/quiz/AnswerInput'

export default function QuizExecutionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [session, setSession] = useState<QuizSession | null>(null)
  const [currentAnswer, setCurrentAnswer] = useState<string>('')
  const [timeSpent, setTimeSpent] = useState(0)

  // クイズセッションを初期化
  useEffect(() => {
    let settings: QuizSettings
    
    try {
      // sessionStorageからクイズ設定を取得
      const settingsData = sessionStorage.getItem('quizSettings')
      if (!settingsData) {
        // フォールバック: URLパラメータもチェック
        const settingsParam = searchParams.get('settings')
        if (!settingsParam) {
          console.error('No quiz settings found')
          router.push('/dashboard')
          return
        }
        settings = JSON.parse(decodeURIComponent(settingsParam))
      } else {
        settings = JSON.parse(settingsData)
      }
      
      // 設定の妥当性チェック
      if (!settings.questionCount || !settings.questionType || !settings.difficulty) {
        console.error('Invalid quiz settings:', settings)
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Failed to parse settings:', error)
      router.push('/dashboard')
      return
    }

    // 設定に基づいて問題をフィルタリング
    const filteredQuestions = mockQuestions
      .filter(
        (q) =>
          q.type === settings.questionType && q.difficulty === settings.difficulty
      )
      .slice(0, parseInt(settings.questionCount))

    // フィルター結果が空の場合でもセッションを作成
    if (filteredQuestions.length === 0) {
      console.warn(`No questions found for type: ${settings.questionType}, difficulty: ${settings.difficulty}`)
    }

    const newSession: QuizSession = {
      id: `session-${Date.now()}`,
      questions: filteredQuestions,
      answers: {},
      currentQuestionIndex: 0,
      startTime: new Date(),
      settings: settings,
      isCompleted: false,
    }

    setSession(newSession)
  }, [searchParams])

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
          <Text>クイズを準備中...</Text>
        </Card.Root>
      </Container>
    )
  }

  // 問題が存在しない場合の処理
  if (session.questions.length === 0) {
    return (
      <Container maxW="container.md" py={8}>
        <Card.Root p={8} textAlign="center">
          <VStack gap={4}>
            <Text fontSize="xl" color="orange.500" fontWeight="bold">
              該当する問題が見つかりませんでした
            </Text>
            <VStack gap={2}>
              <Text fontSize="md" color="gray.700">
                選択された設定に該当する問題がありません
              </Text>
              <VStack gap={1} fontSize="sm" color="gray.600">
                <Text>問題数: {session.settings.questionCount}問</Text>
                <Text>
                  問題タイプ: {session.settings.questionType === 'multiple-choice' 
                    ? '選択式' 
                    : session.settings.questionType === 'true-false' 
                      ? '正誤式' 
                      : '記述式'}
                </Text>
                <Text>
                  難易度: {session.settings.difficulty === 'basic' 
                    ? '基礎' 
                    : session.settings.difficulty === 'standard' 
                      ? '標準' 
                      : '応用'}
                </Text>
              </VStack>
            </VStack>
            <VStack gap={3}>
              <Text fontSize="sm" color="gray.500">
                他の設定でお試しください
              </Text>
              <Button colorScheme="blue" onClick={() => router.push('/dashboard')}>
                ダッシュボードに戻る
              </Button>
            </VStack>
          </VStack>
        </Card.Root>
      </Container>
    )
  }

  const currentQuestion = session.questions[session.currentQuestionIndex]
  const progress =
    ((session.currentQuestionIndex + 1) / session.questions.length) * 100
  const isLastQuestion =
    session.currentQuestionIndex === session.questions.length - 1

  const handleAnswer = () => {
    if (!currentAnswer.trim()) return

    // 回答を保存
    const updatedSession = {
      ...session,
      answers: {
        ...session.answers,
        [currentQuestion.id]: currentAnswer,
      },
    }

    if (isLastQuestion) {
      // 最後の問題の場合は結果画面へ
      updatedSession.isCompleted = true
      updatedSession.completedAt = new Date()
      setSession(updatedSession)
      
      // sessionデータをsessionStorageに保存（URLが長くならない）
      console.log('Saving session to sessionStorage:', updatedSession)
      sessionStorage.setItem('quizSession', JSON.stringify(updatedSession))
      console.log('Session saved, navigating to result page')
      router.push('/quiz/result')
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
      const previousAnswer = session.answers[currentQuestion.id] || ''
      setCurrentAnswer(
        Array.isArray(previousAnswer) ? previousAnswer[0] || '' : previousAnswer
      )
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
        mode="quiz"
      />

      {/* 問題表示 */}
      <QuestionDisplay
        question={currentQuestion}
        questionNumber={session.currentQuestionIndex + 1}
        totalQuestions={session.questions.length}
        mode="quiz"
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
          colorScheme="blue"
          onClick={handleAnswer}
          disabled={!currentAnswer.trim()}
        >
          {isLastQuestion ? <FaCheck /> : <FaArrowRight />}
          {isLastQuestion ? '提出' : '次へ'}
        </Button>
      </HStack>
    </Container>
  )
}
