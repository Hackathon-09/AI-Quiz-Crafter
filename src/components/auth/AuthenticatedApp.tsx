'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import Layout from '@/components/common/Layout'

interface AuthenticatedAppProps {
  children: React.ReactNode
}

export default function AuthenticatedApp({ children }: AuthenticatedAppProps) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()

  // 認証が不要なパス（ルート、auth）
  const publicPaths = ['/', '/auth']
  const isPublicPath = publicPaths.includes(pathname)

  // 認証不要ページ
  if (isPublicPath) {
    // 認証済みユーザーがpublicページにアクセスした場合
    if (isAuthenticated && pathname !== '/') {
      // authページの場合はダッシュボードにリダイレクト
      if (pathname === '/auth') {
        window.location.href = '/dashboard'
        return null
      }
    }
    // 認証なしでも表示（ヘッダーなし）
    return <>{children}</>
  }

  // 認証が必要なページ
  // if (!isAuthenticated) {
  //   // 未認証の場合はauthページにリダイレクト
  //   window.location.href = '/auth'
  //   return null
  // }

  // 認証済みの場合はLayoutでラップ（ヘッダーあり）
  return (
    <Layout showHeader={true}>
      {children}
    </Layout>
  )
}