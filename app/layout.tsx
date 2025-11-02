import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '리플렉션 - Worship Reflection',
  description: '설교 말씀을 중심으로 묵상과 신앙 고백을 나누는 소셜 플랫폼',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
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

