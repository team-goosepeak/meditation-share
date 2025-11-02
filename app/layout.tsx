import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '리플렉션 - Worship Reflection',
  description: '설교 말씀을 중심으로 묵상과 신앙 고백을 나누는 소셜 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-cream-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}

