'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default function MainPage() {
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [router])

  async function checkAuth() {
    try {
      const user = await getCurrentUser()
      if (user) {
        // 로그인된 경우 피드로 이동
        router.replace('/main/feed')
      } else {
        // 로그인 안된 경우 info 페이지로 이동
        router.replace('/info')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // 에러 발생 시 info 페이지로 이동
      router.replace('/info')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
}

