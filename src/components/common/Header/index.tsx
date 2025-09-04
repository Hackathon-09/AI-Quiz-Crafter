'use client'

import { Flex, Heading, HStack, IconButton, Text } from '@chakra-ui/react'
import { IoSettings } from 'react-icons/io5'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()

  return (
    <Flex 
      as="header" 
      w="full" 
      h="60px" 
      bg="white" 
      borderBottomWidth="1px" 
      px={6} 
      align="center" 
      justify="space-between"
      shadow="sm"
    >
      <Heading 
        size="md" 
        cursor="pointer"
        onClick={() => router.push('/dashboard')}
      >
        AI Quiz Crafter
      </Heading>
      
      <HStack gap={4}>
        <IconButton
          aria-label="設定"
          variant="ghost"
          onClick={() => router.push('/settings')}
        >
          <IoSettings />
        </IconButton>
        <Text fontSize="sm" cursor="pointer">
          ログアウト
        </Text>
      </HStack>
    </Flex>
  )
}