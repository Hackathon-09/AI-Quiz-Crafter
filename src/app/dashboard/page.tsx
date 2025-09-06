'use client'

import { Container, Grid, GridItem, Heading, VStack } from '@chakra-ui/react'
import NoteInputSection from '@/components/dashboard/note/NoteInputSection'
import NoteListSection from '@/components/dashboard/note/NoteListSection'
import StatisticsPanel from '@/components/dashboard/StatisticsPanel'
import QuizCreationPanel from '@/components/dashboard/QuizCreationPanel'
import { mockNotes } from '@/data/mockNotes'

export default function DashboardPage() {
  return (
    <Container maxW="container.xl" py={{ base: 4, md: 6 }}>
      <Heading mb={{ base: 4, md: 6 }} size={{ base: "lg", md: "xl" }}>
        ダッシュボード
      </Heading>
      
      <VStack gap={{ base: 4, md: 6 }} align="stretch">
        {/* 最上段：ノート登録、過去のノート、学習統計を3列配置 */}
        <Grid 
          templateColumns={{ 
            base: "1fr", 
            md: "1fr 1fr",
            lg: "1fr 1fr 1fr" 
          }}
          gap={{ base: 4, md: 6 }} 
          alignItems="stretch"
        >
          <GridItem>
            <NoteInputSection />
          </GridItem>
          
          <GridItem>
            <NoteListSection />
          </GridItem>
          
          <GridItem>
            <StatisticsPanel />
          </GridItem>
        </Grid>

        {/* 次の段：クイズ作成を横幅いっぱいで配置 */}
        <QuizCreationPanel />
      </VStack>
    </Container>
  )
}