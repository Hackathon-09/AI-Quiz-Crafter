'use client'

import { VStack, Separator } from '@chakra-ui/react'
import NoteInputSection from './note/NoteInputSection'
import NoteListSection from './note/NoteListSection'

export default function NotePanel() {
  return (
    <VStack gap={{ base: 4, md: 6 }} align="stretch" h="full">
      {/* 入力方法選択とノート作成 */}
      <NoteInputSection />

      <Separator />

      {/* 過去のノート一覧 - API連携で実データを取得 */}
      <NoteListSection />
    </VStack>
  )
}
