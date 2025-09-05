/**
 * クイズの回答形式（文字列ベース - UI互換性のため）
 */
export const QUESTION_TYPES = ['multiple-choice', 'essay', 'true-false'] as const

export type QuestionType = typeof QUESTION_TYPES[number]

/**
 * QuestionTypeの定数
 */
export const QUESTION_TYPE = {
  MULTIPLE_CHOICE: 'multiple-choice' as const,
  ESSAY: 'essay' as const,
  TRUE_FALSE: 'true-false' as const,
} satisfies Record<string, QuestionType>

/**
 * クイズの難易度（文字列ベース - UI互換性のため）
 */
export const DIFFICULTIES = ['basic', 'standard', 'advanced'] as const

export type Difficulty = typeof DIFFICULTIES[number]

/**
 * Difficultyの定数
 */
export const DIFFICULTY = {
  BASIC: 'basic' as const,
  STANDARD: 'standard' as const,
  ADVANCED: 'advanced' as const,
} satisfies Record<string, Difficulty>

/**
 * クイズの質問数（文字列ベース - UI互換性のため）
 */
export const QUESTION_COUNTS = ['3', '5', '10', '20'] as const

export type QuestionCount = typeof QUESTION_COUNTS[number]

/**
 * UI用の選択肢オプション
 */
export const QUESTION_COUNT_OPTIONS = QUESTION_COUNTS.map(count => ({
  label: `${count}問`,
  value: count,
}))

/**
 * QuestionCountを数値として使用する際のヘルパー
 */
export const getQuestionCountNumber = (count: QuestionCount): number => {
  return parseInt(count, 10)
}

/**
 * クイズ出題形式の設定
 * @property questionCount - 質問数
 * @property questionType - 質問形式
 * @property difficulty - 難易度
 */
export interface QuizSettings {
  questionCount: QuestionCount
  questionType: QuestionType
  difficulty: Difficulty
}

/**
 * 問題
 */
export interface Question {
  id: string
  question: string
  choices?: string[]
  answer: string
  explanation: string
  tags?: string[]
  difficulty?: Difficulty
}

/**
 * クイズ
 */
export interface Quiz {
  id: string
  noteId: string
  settings: QuizSettings
  questions: Question[]
  createdAt: string
}

/**
 * クイズの結果
 */
export interface QuizResult {
  id: string
  quizId: string
  userId: string
  answers: UserAnswer[]
  score: number
  completedAt: string
}

/**
 * ユーザーの回答
 */
export interface UserAnswer {
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timeSpent?: number
}
