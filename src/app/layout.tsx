'use client'

import { Providers } from './providers'
import { VercelAnalytics } from '@/components/common/Analytics'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3182ce" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI Quiz Crafter" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
        <VercelAnalytics />
      </body>
    </html>
  )
}
