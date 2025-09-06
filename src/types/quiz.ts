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
  type: QuestionType
  question: string
  choices?: string[]  // multiple-choice用の選択肢
  options?: string[]  // true-false用の選択肢
  correctAnswer: string | number  // 正解
  explanation?: string
  tags?: string[]
  difficulty: Difficulty
}

/**
 * クイズセッション（実行時の状態管理用）
 */
export interface QuizSession {
  id: string
  questions: Question[]
  answers: { [questionId: string]: string | string[] }
  currentQuestionIndex: number
  startTime: Date
  completedAt?: Date
  settings: QuizSettings
  isCompleted: boolean
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

/**
 * 復習対象モード
 */
export const REVIEW_TARGET_MODES = ['incorrect', 'low-score', 'category', 'all'] as const
export type ReviewTargetMode = typeof REVIEW_TARGET_MODES[number]

/**
 * 復習形式
 */
export const REVIEW_FORMATS = ['quiz', 'flashcard', 'explanation'] as const
export type ReviewFormat = typeof REVIEW_FORMATS[number]

/**
 * 復習モードの設定
 */
export interface ReviewSettings {
  targetMode: ReviewTargetMode
  categories?: string[]
  scoreThreshold?: number
  daysPeriod?: number
  reviewFormat: ReviewFormat
  questionCount: QuestionCount
}

/**
 * 復習セッション
 */
export interface ReviewSession {
  id: string
  userId: string
  settings: ReviewSettings
  questions: Question[]
  originalAnswers: { [questionId: string]: UserAnswer }
  reviewAnswers: { [questionId: string]: string | string[] }
  currentQuestionIndex: number
  startTime: Date
  completedAt?: Date
  isCompleted: boolean
  improvementCount: number
}

/**
 * 復習結果
 */
export interface ReviewResult {
  id: string
  reviewSessionId: string
  userId: string
  beforeAccuracy: number
  afterAccuracy: number
  improvementRate: number
  weakAreas: string[]
  strengthAreas: string[]
  nextReviewDate: Date
  completedAt: Date
}

/**
 * 学習統計
 */
export interface LearningStats {
  userId: string
  totalQuizzes: number
  totalQuestions: number
  overallAccuracy: number
  weeklyProgress: number
  categoryStats: { [category: string]: { accuracy: number; count: number } }
  recentResults: QuizResult[]
  improvementTrend: number
}
