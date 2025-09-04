'use client'

import { Container, Grid, GridItem, Heading } from '@chakra-ui/react'
import Layout from '@/components/common/Layout'

export default function DashboardPage() {
  return (
    <Layout showHeader={true}>
      <Container maxW="container.xl" py={6}>
        <Heading mb={6}>ダッシュボード</Heading>
        
        <Grid templateColumns="1fr 1fr 1fr" gap={6} minH="600px">
          <GridItem>
            {/* 左カラム: ノート管理 */}
            <Heading size="md" mb={4}>ノート管理</Heading>
            {/* NotePanel コンポーネントをここに実装予定 */}
          </GridItem>
          
          <GridItem>
            {/* 中央カラム: クイズ設定・統計 */}
            <Heading size="md" mb={4}>クイズ設定</Heading>
            {/* QuizPanel コンポーネントをここに実装予定 */}
          </GridItem>
          
          <GridItem>
            {/* 右カラム: AI教師 */}
            <Heading size="md" mb={4}>AI教師</Heading>
            {/* AiTeacherPanel コンポーネントをここに実装予定 */}
          </GridItem>
        </Grid>
      </Container>
    </Layout>
  )
}