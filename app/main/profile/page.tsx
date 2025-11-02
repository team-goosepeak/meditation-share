'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/lib/auth'
import { getUserChurches } from '@/lib/api/churches'
import { getPosts } from '@/lib/api/posts'
import { Church } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [churches, setChurches] = useState<Church[]>([])
  const [postsCount, setPostsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    setIsLoading(true)
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      setUser(currentUser)

      // 소속 교회 불러오기
      const userChurches = await getUserChurches(currentUser.id)
      setChurches(userChurches)

      // 작성한 포스트 수 계산
      const allPosts = await getPosts({ filter: 'all' })
      const myPosts = allPosts.filter(post => post.author_id === currentUser.id)
      setPostsCount(myPosts.length)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">

        <Image
          src="/logo/logo_full.png"
          alt="Worship Reflection"
          width={300}
          height={300}
          className="mx-auto"
        />
        {/* 프로필 헤더 */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.display_name?.[0] || '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.display_name}</h2>
              <p className="text-primary-100 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{postsCount}</div>
            <div className="text-sm text-gray-600 mt-1">작성한 묵상</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{churches.length}</div>
            <div className="text-sm text-gray-600 mt-1">소속 교회</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">0</div>
            <div className="text-sm text-gray-600 mt-1">친구</div>
          </div>
        </div>

        {/* 소속 교회 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">소속 교회</h3>
            <Link
              href="/main/churches"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              더보기
            </Link>
          </div>
          {churches.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm mb-3">소속된 교회가 없습니다</p>
              <Link
                href="/main/churches"
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                교회 가입하기 →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {churches.map((church) => (
                <Link
                  key={church.id}
                  href={`/main/churches/${church.id}`}
                  className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{church.name}</h4>
                      {church.address && (
                        <p className="text-sm text-gray-600 mt-1">📍 {church.address}</p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 메뉴 */}
        <div className="space-y-2 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">설정</h3>

          <Link
            href="/info"
            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-900">앱 정보</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-red-600 font-medium">로그아웃</span>
            </div>
          </button>
        </div>

        <Footer />
    </div>
  )
}

