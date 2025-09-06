'use client'

import { Container, Heading, VStack, Text } from '@chakra-ui/react'
import Layout from '@/components/common/Layout'

export default function SettingsPage() {
  return (

    <Container maxW="container.md" py={10}>
      <VStack gap={6} align="start">
        <Heading>ユーザー設定</Heading>
        <Text>プロファイル情報やパスワードの変更などを行います。</Text>
        {/* 設定フォームをここに実装予定 */}
      </VStack>
    </Container>

  )
}