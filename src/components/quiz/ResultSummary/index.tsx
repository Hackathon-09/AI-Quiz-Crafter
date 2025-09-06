'use client'

import {
  VStack,
  HStack,
  Box,
  Text,
  Card,
  Progress,
  SimpleGrid,
} from '@chakra-ui/react'
import {
  FaCheck,
  FaTimes,
  FaClock,
  FaTrophy,
  FaArrowUp,
} from 'react-icons/fa'

interface ScoreDisplayProps {
  score: number
  grade: string
  color: string
  bg: string
  description: string
  mode?: 'quiz' | 'review'
  improvementRate?: number
}

interface StatBoxProps {
  icon: React.ReactNode
  value: string | number
  label: string
  colorScheme: string
}

interface ResultSummaryProps {
  totalQuestions: number
  correctCount: number
  incorrectCount: number
  score: number
  timeSpent: number
  mode?: 'quiz' | 'review'
  improvementCount?: number
  accuracyBefore?: number
  accuracyAfter?: number
  improvementRate?: number
}

const StatBox = ({ icon, value, label, colorScheme }: StatBoxProps) => (
  <VStack>
    <Box 
      p={3} 
      borderRadius="lg" 
      bg={`${colorScheme}.50`}
      border="2px solid"
      borderColor={`${colorScheme}.200`}
    >
      <VStack gap={1}>
        <Box color={`${colorScheme}.600`}>
          {icon}
        </Box>
        <Text fontSize="xl" fontWeight="bold" color={`${colorScheme}.600`}>
          {value}
        </Text>
      </VStack>
    </Box>
    <Text fontSize="sm" fontWeight="medium" color={`${colorScheme}.600`}>
      {label}
    </Text>
  </VStack>
)

const ScoreDisplay = ({ 
  score, 
  grade, 
  color, 
  bg, 
  description, 
  mode = 'quiz',
  improvementRate 
}: ScoreDisplayProps) => (
  <VStack>
    <Box position="relative">
      <Box
        position="relative"
        w={mode === 'review' ? '180px' : '200px'}
        h={mode === 'review' ? '180px' : '200px'}
        borderRadius="full"
        bg={`linear-gradient(135deg, ${bg} 0%, white 100%)`}
        border="4px solid"
        borderColor={color}
        boxShadow={`0 ${mode === 'review' ? 15 : 20}px ${mode === 'review' ? 30 : 40}px rgba(0,0,0,0.1), 0 0 0 ${mode === 'review' ? 6 : 8}px ${bg}${mode === 'review' ? '' : ', 0 0 30px ' + color + '40'}`}
        _hover={{
          transform: "scale(1.05)",
          transition: "all 0.3s ease"
        }}
      >
        <VStack 
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          gap={mode === 'review' ? 1 : 2}
        >
          {mode === 'review' && typeof improvementRate === 'number' && (
            <FaArrowUp size="24" color={color} />
          )}
          <Text 
            fontSize={mode === 'review' ? '3xl' : '5xl'} 
            fontWeight="900" 
            color={color}
            textShadow="2px 2px 4px rgba(0,0,0,0.1)"
          >
            {mode === 'review' && typeof improvementRate === 'number' 
              ? `${improvementRate > 0 ? '+' : ''}${Math.round(improvementRate)}%`
              : score
            }
          </Text>
          <Text 
            fontSize={mode === 'review' ? 'sm' : 'lg'} 
            fontWeight="bold" 
            color="gray.600"
            letterSpacing="wider"
          >
            {mode === 'review' ? 'IMPROVEMENT' : 'POINTS'}
          </Text>
        </VStack>
        
        <Box
          position="absolute"
          top={mode === 'review' ? '-8px' : '-10px'}
          right={mode === 'review' ? '-8px' : '-10px'}
          w={mode === 'review' ? '50px' : '60px'}
          h={mode === 'review' ? '50px' : '60px'}
          borderRadius="full"
          bg={color}
          border="3px solid white"
          boxShadow="0 4px 12px rgba(0,0,0,0.2)"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text 
            fontSize={mode === 'review' ? 'xl' : '2xl'} 
            fontWeight="black" 
            color="white"
          >
            {grade}
          </Text>
        </Box>
      </Box>
    </Box>
    
    <VStack gap={2}>
      <HStack gap={2}>
        <FaTrophy 
          size="24" 
          color={score >= 95 ? '#9f7aea' : 
                 score >= 85 ? 'gold' : 
                 score >= 70 ? 'silver' : 
                 score >= 55 ? '#cd7f32' : '#cd7f32'} 
        />
        <Text 
          fontSize="xl" 
          fontWeight="bold" 
          color={color}
          textAlign="center"
        >
          {description}
        </Text>
        <FaTrophy 
          size="24" 
          color={score >= 95 ? '#9f7aea' : 
                 score >= 85 ? 'gold' : 
                 score >= 70 ? 'silver' : 
                 score >= 55 ? '#cd7f32' : '#cd7f32'} 
        />
      </HStack>
      
      {mode === 'review' && typeof improvementRate === 'number' && (
        <HStack gap={4} fontSize="sm" color="gray.600">
          <Text>復習前: {Math.round(score - improvementRate)}%</Text>
          <Text>→</Text>
          <Text fontWeight="bold" color={color}>
            復習後: {Math.round(score)}%
          </Text>
        </HStack>
      )}
    </VStack>
  </VStack>
)

export default function ResultSummary({
  totalQuestions,
  correctCount,
  incorrectCount,
  score,
  timeSpent,
  mode = 'quiz',
  improvementCount = 0,
  accuracyBefore,
  accuracyAfter,
  improvementRate,
}: ResultSummaryProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreGrade = (score: number, isReview = false) => {
    if (isReview && typeof improvementRate === 'number') {
      if (improvementRate >= 30) return { grade: 'S', color: 'purple.500', bg: 'purple.50', description: '素晴らしい成長です！' }
      if (improvementRate >= 20) return { grade: 'A', color: 'green.500', bg: 'green.50', description: '大きく向上しました！' }
      if (improvementRate >= 10) return { grade: 'B', color: 'blue.500', bg: 'blue.50', description: '着実に向上しています' }
      if (improvementRate >= 0) return { grade: 'C', color: 'yellow.500', bg: 'yellow.50', description: '少し向上しました' }
      return { grade: 'D', color: 'red.500', bg: 'red.50', description: '復習を続けましょう' }
    } else {
      if (score >= 95) return { grade: 'S', color: 'purple.500', bg: 'purple.50', description: '完璧です！伝説的な成績！' }
      if (score >= 85) return { grade: 'A', color: 'green.500', bg: 'green.50', description: '素晴らしい結果です！' }
      if (score >= 70) return { grade: 'B', color: 'blue.500', bg: 'blue.50', description: 'よくできました！' }
      if (score >= 55) return { grade: 'C', color: 'orange.500', bg: 'orange.50', description: 'もう少し頑張りましょう' }
      return { grade: 'D', color: 'red.500', bg: 'red.50', description: '復習して再挑戦しましょう' }
    }
  }

  const gradeInfo = getScoreGrade(score, mode === 'review')

  return (
    <Card.Root mb={6}>
      <VStack gap={6} p={{ base: 6, md: 8 }}>
        <VStack gap={8} w="full">
          {/* スコア表示 */}
          <ScoreDisplay 
            score={score}
            grade={gradeInfo.grade}
            color={gradeInfo.color}
            bg={gradeInfo.bg}
            description={gradeInfo.description}
            mode={mode}
            improvementRate={improvementRate}
          />

          {/* 統計情報 */}
          <SimpleGrid columns={{ base: mode === 'review' ? 2 : 3, md: mode === 'review' ? 4 : 3 }} gap={4} w="full">
            <StatBox
              icon={<FaCheck size="20" />}
              value={correctCount}
              label={mode === 'review' ? '復習後正解' : '正解'}
              colorScheme="green"
            />

            {mode === 'review' && (
              <StatBox
                icon={<FaArrowUp size="20" />}
                value={improvementCount}
                label="改善問題"
                colorScheme="orange"
              />
            )}

            <StatBox
              icon={<FaTimes size="20" />}
              value={incorrectCount}
              label={mode === 'review' ? '要復習' : '不正解'}
              colorScheme="red"
            />

            <StatBox
              icon={<FaClock size="20" />}
              value={formatTime(timeSpent)}
              label={mode === 'review' ? '復習時間' : '解答時間'}
              colorScheme="blue"
            />
          </SimpleGrid>

          {/* プログレスバー */}
          <Box w="full" px={4}>
            <VStack gap={2}>
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" fontWeight="medium" color="gray.600">進捗</Text>
                <Text fontSize="sm" fontWeight="bold" color={gradeInfo.color}>
                  {score}%
                </Text>
              </HStack>
              <Progress.Root 
                value={score} 
                size="xl" 
                colorScheme={gradeInfo.color.split('.')[0]}
                borderRadius="full"
              />
            </VStack>
          </Box>
        </VStack>
      </VStack>
    </Card.Root>
  )
}