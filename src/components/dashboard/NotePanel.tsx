'use client'

import { VStack, Separator } from '@chakra-ui/react'
import { Note } from '@/types'
import { mockNotes } from '@/data/mockNotes'
import NoteInputSection from './note/NoteInputSection'
import NoteListSection from './note/NoteListSection'

interface NotePanelProps {
  notes?: Note[]
}

export default function NotePanel({ notes = mockNotes }: NotePanelProps) {
  return (
    <VStack gap={{ base: 4, md: 6 }} align="stretch" h="full">
      {/* 入力方法選択とノート作成 */}
      <NoteInputSection />

      <Separator />

      {/* 過去のノート一覧 */}
      <NoteListSection notes={notes} />
    </VStack>
  )
}
