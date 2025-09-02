// src/types/index.ts
export interface User {
  id: string
  email: string
  name: string
}

export interface Note {
  id: string
  userId: string
  title: string
  content: string
  createdAt: string
}

export interface Quiz {
  id: string
  noteId: string
  questions: Question[]
}

export interface Question {
  id: string
  question: string
  choices?: string[]
  answer: string
  explanation: string
}
