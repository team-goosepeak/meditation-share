'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const user = await getCurrentUser()
      if (user) {
        // 로그인된 경우 피드로 이동
        router.push('/feed')
      } else {
        // 로그인 안된 경우 info 페이지로 이동
        router.push('/info')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // 에러 발생 시 info 페이지로 이동
      router.push('/info')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-8">
          Meditation Share
        </h1>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
        <p className="mt-6 text-xl text-white/80">로딩 중...</p>
      </div>
    </div>
  )
}


