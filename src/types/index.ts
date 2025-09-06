export * from './quiz'

export interface User {
  id: string
  email: string
  name: string
}

export interface Note {
  id: string
  noteId?: string  // DynamoDBから取得する場合のプロパティ
  userId: string
  title: string
  content?: string  // ファイルノートの場合は空の可能性
  createdAt: string
  tags?: string[]
  // DynamoDBの追加フィールド
  sourceType?: 'text' | 'file' | 'notion'
  fileName?: string
  s3Path?: string
  contentType?: string
  fileSize?: number
  notionUrl?: string
}
