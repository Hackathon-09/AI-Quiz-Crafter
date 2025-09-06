'use client'

import {
  Container,
  Heading,
  VStack,
  HStack,
  Box,
  Button,
  Text,
  Card,
  Badge,
  SimpleGrid,
  Progress,
  Tabs,
  Select,
  Portal,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createListCollection } from '@chakra-ui/react'
import {
  FaHome,
  FaChartLine,
  FaCalendar,
  FaBrain,
  FaTrophy,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaClock,
  FaBook,
} from 'react-icons/fa'

// モックデータ
const mockReviewSessions = [
  {
    id: 'rs1',
    date: '2024-01-15',
    targetMode: 'incorrect',
    questionCount: 10,
    accuracyBefore: 45,
    accuracyAfter: 78,
    improvementRate: 33,
    timeSpent: 720,
    categories: ['数学', '物理'],
    completedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: 'rs2',
    date: '2024-01-12',
    targetMode: 'low-score',
    questionCount: 8,
    accuracyBefore: 62,
    accuracyAfter: 75,
    improvementRate: 13,
    timeSpent: 540,
    categories: ['英語', '現代文'],
    completedAt: '2024-01-12T16:45:00Z'
  },
  {
    id: 'rs3',
    date: '2024-01-10',
    targetMode: 'category',
    questionCount: 15,
    accuracyBefore: 70,
    accuracyAfter: 87,
    improvementRate: 17,
    timeSpent: 900,
    categories: ['日本史'],
    completedAt: '2024-01-10T13:20:00Z'
  },
  {
    id: 'rs4',
    date: '2024-01-08',
    targetMode: 'all',
    questionCount: 20,
    accuracyBefore: 55,
    accuracyAfter: 62,
    improvementRate: 7,
    timeSpent: 1200,
    categories: ['数学', '化学', '生物'],
    completedAt: '2024-01-08T11:15:00Z'
  },
]

const mockLearningStats = {
  totalSessions: 15,
  totalTimeSpent: 12600, // 秒
  averageImprovement: 18.5,
  bestImprovement: 35,
  currentStreak: 5,
  weeklyTarget: 3,
  weeklyCompleted: 2,
  categoryProgress: {
    '数学': { sessions: 5, avgImprovement: 22, trend: 'up' },
    '英語': { sessions: 3, avgImprovement: 15, trend: 'stable' },
    '日本史': { sessions: 4, avgImprovement: 28, trend: 'up' },
    '物理': { sessions: 2, avgImprovement: 12, trend: 'down' },
    '化学': { sessions: 3, avgImprovement: 18, trend: 'up' },
  }
}

export default function ReviewHistoryPage() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [activeTab, setActiveTab] = useState('history')

  const periodOptions = createListCollection({
    items: [
      { label: '全期間', value: 'all' },
      { label: '今週', value: 'week' },
      { label: '今月', value: 'month' },
      { label: '過去3ヶ月', value: 'quarter' },
    ],
  })

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}時間${mins}分`
    }
    return `${mins}分`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const getImprovementColor = (rate: number) => {
    if (rate >= 25) return 'purple'
    if (rate >= 15) return 'green'
    if (rate >= 5) return 'blue'
    if (rate >= 0) return 'yellow'
    return 'red'
  }

  const getImprovementIcon = (rate: number) => {
    if (rate > 5) return <FaArrowUp />
    if (rate < -5) return <FaArrowDown />
    return <FaEquals />
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <FaArrowUp color="green" />
      case 'down': return <FaArrowDown color="red" />
      default: return <FaEquals color="gray" />
    }
  }

  const getTargetModeLabel = (mode: string) => {
    switch (mode) {
      case 'incorrect': return '間違い復習'
      case 'low-score': return '低スコア復習'
      case 'category': return '分野別復習'
      case 'all': return '全範囲復習'
      default: return mode
    }
  }

  return (
    <Container maxW="container.lg" py={6}>
      <VStack gap={6} align="stretch">
        {/* ヘッダー */}
        <VStack gap={2}>
          <HStack gap={2}>
            <FaChartLine color="blue" />
            <Heading size="lg" color="blue.600">
              学習履歴・分析
            </Heading>
          </HStack>
          <Text fontSize="md" color="gray.600" textAlign="center">
            あなたの復習進捗と学習パフォーマンスを確認しましょう
          </Text>
        </VStack>

        {/* 期間選択 */}
        <HStack gap={4} align="center">
          <Text fontSize="sm" fontWeight="medium">表示期間:</Text>
          <Box minW="150px">
            <Select.Root
              collection={periodOptions}
              value={[selectedPeriod]}
              onValueChange={(e) => setSelectedPeriod(e.value[0] || 'all')}
              size="sm"
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {periodOptions.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Box>
        </HStack>

        {/* タブ */}
        <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
          <Tabs.List>
            <Tabs.Trigger value="overview">
              <FaTrophy />
              概要
            </Tabs.Trigger>
            <Tabs.Trigger value="history">
              <FaCalendar />
              履歴
            </Tabs.Trigger>
            <Tabs.Trigger value="analytics">
              <FaChartLine />
              分析
            </Tabs.Trigger>
          </Tabs.List>

          {/* 概要タブ */}
          <Tabs.Content value="overview">
            <VStack gap={6} align="stretch">
              {/* 学習統計サマリー */}
              <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                <Card.Root p={4} textAlign="center">
                  <VStack gap={2}>
                    <FaBook size="24" color="blue" />
                    <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                      {mockLearningStats.totalSessions}
                    </Text>
                    <Text fontSize="sm" color="gray.600">復習セッション</Text>
                  </VStack>
                </Card.Root>

                <Card.Root p={4} textAlign="center">
                  <VStack gap={2}>
                    <FaClock size="24" color="green" />
                    <Text fontSize="2xl" fontWeight="bold" color="green.600">
                      {formatTime(mockLearningStats.totalTimeSpent)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">総学習時間</Text>
                  </VStack>
                </Card.Root>

                <Card.Root p={4} textAlign="center">
                  <VStack gap={2}>
                    <FaArrowUp size="24" color="purple" />
                    <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                      {mockLearningStats.averageImprovement}%
                    </Text>
                    <Text fontSize="sm" color="gray.600">平均向上率</Text>
                  </VStack>
                </Card.Root>

                <Card.Root p={4} textAlign="center">
                  <VStack gap={2}>
                    <FaTrophy size="24" color="orange" />
                    <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                      {mockLearningStats.currentStreak}
                    </Text>
                    <Text fontSize="sm" color="gray.600">連続学習日</Text>
                  </VStack>
                </Card.Root>
              </SimpleGrid>

              {/* 週間目標 */}
              <Card.Root p={6}>
                <VStack gap={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold">今週の復習目標</Text>
                    <Badge 
                      colorScheme={mockLearningStats.weeklyCompleted >= mockLearningStats.weeklyTarget ? 'green' : 'orange'}
                    >
                      {mockLearningStats.weeklyCompleted}/{mockLearningStats.weeklyTarget}回
                    </Badge>
                  </HStack>
                  <Progress.Root 
                    value={(mockLearningStats.weeklyCompleted / mockLearningStats.weeklyTarget) * 100}
                    colorScheme={mockLearningStats.weeklyCompleted >= mockLearningStats.weeklyTarget ? 'green' : 'orange'}
                  />
                  <Text fontSize="sm" color="gray.600">
                    {mockLearningStats.weeklyCompleted >= mockLearningStats.weeklyTarget 
                      ? '今週の目標達成！素晴らしいです！'
                      : `あと${mockLearningStats.weeklyTarget - mockLearningStats.weeklyCompleted}回で目標達成です`
                    }
                  </Text>
                </VStack>
              </Card.Root>
            </VStack>
          </Tabs.Content>

          {/* 履歴タブ */}
          <Tabs.Content value="history">
            <VStack gap={4} align="stretch">
              {mockReviewSessions.map((session) => (
                <Card.Root key={session.id}>
                  <HStack gap={6} p={6} align="start">
                    {/* 日付・アイコン */}
                    <VStack gap={1} minW="80px">
                      <FaBrain size="24" color="orange" />
                      <Text fontSize="sm" fontWeight="bold" color="gray.700">
                        {formatDate(session.date)}
                      </Text>
                    </VStack>

                    {/* メイン情報 */}
                    <VStack gap={3} align="start" flex="1">
                      <HStack gap={2} wrap="wrap">
                        <Badge colorScheme="blue">
                          {getTargetModeLabel(session.targetMode)}
                        </Badge>
                        <Badge variant="outline">
                          {session.questionCount}問
                        </Badge>
                        <Badge variant="outline">
                          {formatTime(session.timeSpent)}
                        </Badge>
                      </HStack>

                      <HStack gap={4} wrap="wrap">
                        <HStack gap={1}>
                          <Text fontSize="sm" color="gray.600">復習前:</Text>
                          <Text fontSize="sm" fontWeight="bold">{session.accuracyBefore}%</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.400">→</Text>
                        <HStack gap={1}>
                          <Text fontSize="sm" color="gray.600">復習後:</Text>
                          <Text fontSize="sm" fontWeight="bold" color="green.600">
                            {session.accuracyAfter}%
                          </Text>
                        </HStack>
                      </HStack>

                      <HStack gap={2} wrap="wrap">
                        <Text fontSize="sm" color="gray.600">分野:</Text>
                        {session.categories.map(cat => (
                          <Badge key={cat} size="sm" colorScheme="gray">
                            {cat}
                          </Badge>
                        ))}
                      </HStack>
                    </VStack>

                    {/* 向上率 */}
                    <VStack gap={1} minW="80px" textAlign="center">
                      <HStack gap={1}>
                        {getImprovementIcon(session.improvementRate)}
                        <Text 
                          fontSize="lg" 
                          fontWeight="bold" 
                          color={`${getImprovementColor(session.improvementRate)}.600`}
                        >
                          {session.improvementRate > 0 ? '+' : ''}{session.improvementRate}%
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">向上率</Text>
                    </VStack>
                  </HStack>
                </Card.Root>
              ))}
            </VStack>
          </Tabs.Content>

          {/* 分析タブ */}
          <Tabs.Content value="analytics">
            <VStack gap={6} align="stretch">
              {/* 分野別パフォーマンス */}
              <Card.Root p={6}>
                <VStack gap={4} align="stretch">
                  <Heading size="md">分野別パフォーマンス</Heading>
                  
                  {Object.entries(mockLearningStats.categoryProgress).map(([category, stats]) => (
                    <HStack key={category} justify="space-between" p={4} bg="gray.50" borderRadius="md">
                      <VStack align="start" gap={1}>
                        <Text fontWeight="bold">{category}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {stats.sessions}回の復習
                        </Text>
                      </VStack>
                      
                      <HStack gap={4}>
                        <VStack gap={1}>
                          <Text fontSize="sm" color="gray.600">平均向上</Text>
                          <Text fontWeight="bold" color="green.600">
                            +{stats.avgImprovement}%
                          </Text>
                        </VStack>
                        
                        <VStack gap={1}>
                          <Text fontSize="sm" color="gray.600">トレンド</Text>
                          <Box>
                            {getTrendIcon(stats.trend)}
                          </Box>
                        </VStack>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              </Card.Root>

              {/* おすすめアクション */}
              <Card.Root p={6} bg="blue.50" border="1px solid" borderColor="blue.200">
                <VStack gap={3} align="start">
                  <HStack gap={2}>
                    <FaBrain color="blue" />
                    <Text fontSize="lg" fontWeight="bold" color="blue.700">
                      学習アドバイス
                    </Text>
                  </HStack>
                  <VStack gap={2} align="start">
                    <Text fontSize="sm" color="blue.700">
                      • <strong>物理</strong>の成績が下がり気味です。基礎的な問題から復習してみましょう
                    </Text>
                    <Text fontSize="sm" color="blue.700">
                      • <strong>数学</strong>は順調に向上しています。この調子で続けましょう
                    </Text>
                    <Text fontSize="sm" color="blue.700">
                      • 今週はあと1回復習すると目標達成です。頑張りましょう！
                    </Text>
                  </VStack>
                </VStack>
              </Card.Root>
            </VStack>
          </Tabs.Content>
        </Tabs.Root>

        {/* アクションボタン */}
        <HStack justify="center" gap={4}>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            <FaHome />
            ダッシュボード
          </Button>

          <Button
            colorScheme="orange"
            onClick={() => router.push('/review/settings')}
          >
            <FaBrain />
            復習を開始
          </Button>
        </HStack>
      </VStack>
    </Container>
  )
}