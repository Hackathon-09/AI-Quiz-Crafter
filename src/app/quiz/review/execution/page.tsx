'use client'

import {
  Container,
  VStack,
  HStack,
  Box,
  Button,
  Text,
  Progress,
  Card,
  Heading,
  RadioGroup,
  Textarea,
  Badge,
  Alert,
  Separator,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Question, ReviewSession, ReviewSettings, UserAnswer } from '@/types/quiz'
import { mockQuestions } from '@/data/mockQuestions'
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaCheck, 
  FaClock, 
  FaBrain,
  FaEye,
  FaLightbulb
} from 'react-icons/fa'

export default function ReviewExecutionPage() {
  const router = useRouter()
  const [session, setSession] = useState<ReviewSession | null>(null)
  const [currentAnswer, setCurrentAnswer] = useState<string>('')
  const [timeSpent, setTimeSpent] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)

  // 復習セッションを初期化
  useEffect(() => {
    let settings: ReviewSettings
    
    try {
      const settingsData = sessionStorage.getItem('reviewSettings')
      if (!settingsData) {
        console.error('No review settings found')
        router.push('/dashboard')
        return
      }
      settings = JSON.parse(settingsData)
    } catch (error) {
      console.error('Failed to parse review settings:', error)
      router.push('/dashboard')
      return
    }

    // 復習対象の問題を取得（実際はAPIから取得）
    const getReviewQuestions = (): Question[] => {
      // モックデータから復習対象を選択
      let filteredQuestions = mockQuestions

      // 対象モードに応じてフィルタリング
      switch (settings.targetMode) {
        case 'incorrect':
          // 過去に間違えた問題（仮の実装）
          filteredQuestions = mockQuestions.filter(q => Math.random() > 0.7)
          break
        case 'low-score':
          // 正答率が低い問題（仮の実装）
          filteredQuestions = mockQuestions.filter(q => Math.random() > 0.6)
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
          break
      }

      return filteredQuestions.slice(0, parseInt(settings.questionCount))
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
            <Button colorScheme="orange" onClick={() => router.push('/quiz/create?mode=review')}>
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
      
      sessionStorage.setItem('reviewSession', JSON.stringify(updatedSession))
      router.push('/quiz/review/result')
    } else {
      // 次の問題へ
      updatedSession.currentQuestionIndex += 1
      setSession(updatedSession)
      setCurrentAnswer('')
      setShowExplanation(false)
      setIsAnswered(false)
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
      setShowExplanation(false)
      setIsAnswered(!!previousAnswer)
    }
  }

  const handleShowExplanation = () => {
    setShowExplanation(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderAnswerInput = () => {
    // フラッシュカードモードの場合は選択肢を表示しない
    if (session.settings.reviewFormat === 'flashcard') {
      return (
        <VStack gap={4}>
          <Text fontSize="lg" color="gray.600" textAlign="center">
            答えを思い浮かべたら「答えを見る」ボタンを押してください
          </Text>
          <Button 
            colorScheme="blue" 
            onClick={() => setIsAnswered(true)}
            disabled={isAnswered}
          >
            <FaEye />
            答えを見る
          </Button>
          
          {isAnswered && (
            <Box p={4} bg="blue.50" borderRadius="md" border="2px solid" borderColor="blue.200">
              <Text fontSize="lg" fontWeight="bold" color="blue.700" textAlign="center">
                正解: {currentQuestion.type === 'multiple-choice' && currentQuestion.choices
                  ? currentQuestion.choices[currentQuestion.correctAnswer as number]
                  : currentQuestion.correctAnswer}
              </Text>
            </Box>
          )}
        </VStack>
      )
    }

    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <RadioGroup.Root
            value={currentAnswer}
            onValueChange={(details) => {
              setCurrentAnswer(details.value || '')
              setIsAnswered(true)
            }}
          >
            <VStack gap={3} align="stretch">
              {currentQuestion.choices?.map((choice, index) => (
                <RadioGroup.Item
                  key={index}
                  value={index.toString()}
                  p={4}
                  borderRadius="md"
                  border="1px"
                  borderColor="gray.200"
                  _hover={{ bg: 'gray.50' }}
                  cursor="pointer"
                >
                  <HStack>
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <Text fontSize="md">{choice}</Text>
                  </HStack>
                </RadioGroup.Item>
              ))}
            </VStack>
          </RadioGroup.Root>
        )

      case 'true-false':
        return (
          <RadioGroup.Root
            value={currentAnswer}
            onValueChange={(details) => {
              setCurrentAnswer(details.value || '')
              setIsAnswered(true)
            }}
          >
            <HStack gap={6} justify="center">
              {currentQuestion.options?.map((option) => (
                <RadioGroup.Item
                  key={option}
                  value={option}
                  p={4}
                  minW="120px"
                  textAlign="center"
                  borderRadius="md"
                  border="2px"
                  borderColor="gray.200"
                  _hover={{ bg: 'blue.50', borderColor: 'blue.300' }}
                  cursor="pointer"
                >
                  <VStack>
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <Text fontSize="lg" fontWeight="medium">
                      {option}
                    </Text>
                  </VStack>
                </RadioGroup.Item>
              ))}
            </HStack>
          </RadioGroup.Root>
        )

      case 'essay':
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => {
              setCurrentAnswer(e.target.value)
              setIsAnswered(e.target.value.trim().length > 0)
            }}
            placeholder="復習した内容を入力してください"
            minH="150px"
            resize="vertical"
            size="md"
          />
        )

      default:
        return <Text>未対応の問題形式です</Text>
    }
  }

  return (
    <Container maxW="container.md" py={{ base: 4, md: 6 }}>
      {/* ヘッダー */}
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
              <FaBrain color="orange" />
              <Badge colorScheme="orange" size="lg">
                復習 {session.currentQuestionIndex + 1} / {session.questions.length}
              </Badge>
            </HStack>
          </HStack>

          <Box w="full">
            <Progress.Root value={progress} size="md" colorScheme="orange" />
          </Box>

          {/* 復習モード表示 */}
          <HStack gap={2} fontSize="sm" color="orange.600">
            <Text>モード:</Text>
            <Text fontWeight="medium">
              {session.settings.reviewFormat === 'quiz' && '📝 クイズ形式'}
              {session.settings.reviewFormat === 'flashcard' && '🗂 フラッシュカード'}
              {session.settings.reviewFormat === 'explanation' && '📚 解説重視'}
            </Text>
          </HStack>
        </VStack>
      </Card.Root>

      {/* 過去の回答情報 */}
      <Card.Root mb={4} p={4} bg="yellow.50" border="1px solid" borderColor="yellow.200">
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
            <Text color="gray.600">
              解答時間: {formatTime(originalAnswer.timeSpent || 0)}
            </Text>
          </HStack>
        </VStack>
      </Card.Root>

      {/* 問題表示 */}
      <Card.Root mb={6}>
        <VStack gap={6} align="stretch" p={{ base: 6, md: 8 }}>
          <VStack gap={3} align="start">
            <HStack gap={2}>
              <Badge
                colorScheme={
                  currentQuestion.difficulty === 'basic'
                    ? 'green'
                    : currentQuestion.difficulty === 'standard'
                      ? 'yellow'
                      : 'red'
                }
              >
                {currentQuestion.difficulty === 'basic'
                  ? '基礎'
                  : currentQuestion.difficulty === 'standard'
                    ? '標準'
                    : '応用'}
              </Badge>
              <Badge variant="outline">
                {currentQuestion.type === 'multiple-choice'
                  ? '選択問題'
                  : currentQuestion.type === 'true-false'
                    ? '○×問題'
                    : '記述問題'}
              </Badge>
              {currentQuestion.tags && currentQuestion.tags.map(tag => (
                <Badge key={tag} colorScheme="blue" size="sm">{tag}</Badge>
              ))}
            </HStack>

            <Heading size="lg" lineHeight={1.6}>
              {currentQuestion.question}
            </Heading>
          </VStack>

          {/* 回答入力エリア */}
          <Box>{renderAnswerInput()}</Box>

          {/* 解説表示エリア */}
          {(showExplanation || session.settings.reviewFormat === 'explanation' || isAnswered) && currentQuestion.explanation && (
            <Box>
              <Separator mb={4} />
              <Alert.Root>
                <Alert.Content>
                  <Alert.Title>💡 解説</Alert.Title>
                  <Alert.Description>
                    {currentQuestion.explanation}
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            </Box>
          )}

          {/* 解説表示ボタン */}
          {!showExplanation && session.settings.reviewFormat !== 'explanation' && !isAnswered && currentQuestion.explanation && (
            <Button
              variant="outline"
              colorScheme="blue"
              onClick={handleShowExplanation}
              size="sm"
            >
              <FaLightbulb />
              解説を見る
            </Button>
          )}
        </VStack>
      </Card.Root>

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
          disabled={!isAnswered && session.settings.reviewFormat !== 'explanation'}
        >
          {isLastQuestion ? <FaCheck /> : <FaArrowRight />}
          {isLastQuestion ? '復習完了' : '次へ'}
        </Button>
      </HStack>
    </Container>
  )
}