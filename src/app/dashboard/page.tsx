'use client'

import { Container, Grid, GridItem, Heading } from '@chakra-ui/react'
import Layout from '@/components/common/Layout'
import QuizPanel from '@/components/dashboard/QuizPanel'
import NotePanel from '@/components/dashboard/NotePanel'
import AiTeacherPanel from '@/components/dashboard/AiTeacherPanel'

export default function DashboardPage() {
  return (
    <Layout showHeader={true}>
      <Container maxW="container.xl" py={{ base: 4, md: 6 }}>
        <Heading mb={{ base: 4, md: 6 }} size={{ base: "lg", md: "xl" }}>
          ダッシュボード
        </Heading>
        
        <Grid 
          templateColumns={{ 
            base: "1fr", 
            lg: "1fr 1fr 1fr" 
          }}
          gap={{ base: 4, md: 6 }} 
          minH={{ base: "auto", lg: "600px" }}
        >
          {/* モバイル優先順: クイズ設定を最上部 */}
          <GridItem order={{ base: 1, lg: 2 }}>
            {/* 中央カラム: クイズ設定・統計 */}
            <QuizPanel />
          </GridItem>
          
          <GridItem order={{ base: 2, lg: 1 }}>
            {/* 左カラム: ノート管理 */}
            <NotePanel />
          </GridItem>
          
          <GridItem order={{ base: 3, lg: 3 }}>
            {/* 右カラム: AI教師 */}
            <AiTeacherPanel />
          </GridItem>
        </Grid>
      </Container>
    </Layout>
  )
}