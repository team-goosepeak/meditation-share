'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { getCurrentUser, signOut } from '@/lib/auth'
import { App } from '@capacitor/app'
import { 
  HomeIcon, 
  BuildingLibraryIcon, 
  PlusCircleIcon, 
  BookOpenIcon, 
  UserCircleIcon 
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  BuildingLibraryIcon as BuildingLibraryIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  UserCircleIcon as UserCircleIconSolid
} from '@heroicons/react/24/solid'

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    setupBackButtonHandler()
  }, [])

  // Android 뒤로가기 버튼 핸들러
  async function setupBackButtonHandler() {
    try {
      await App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          // 히스토리가 있으면 뒤로가기
          window.history.back()
        } else {
          // 루트 페이지면 앱 종료 확인
          if (pathname === '/main/feed' || pathname === '/main' || pathname === '/') {
            App.exitApp()
          } else {
            // 그 외는 피드로 이동
            router.push('/main/feed')
          }
        }
      })
    } catch (error) {
      // 웹 환경에서는 에러 무시
      console.log('Running in web environment')
    }

    // 클린업
    return () => {
      App.removeAllListeners()
    }
  }

  async function checkAuth() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
      } else {
        setUser(currentUser)
      }
    } catch (error) {
      router.push('/auth/login')
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 경로 깊이 계산 (뒤로가기 버튼 표시 여부)
  const pathDepth = pathname?.split('/').filter(Boolean).length || 0
  const shouldShowBackButton = pathDepth >= 2

  // 페이지 제목 설정
  const getPageTitle = () => {
    if (pathname === '/main/feed' || pathname === '/main') return '피드'
    if (pathname === '/main/churches') return '교회'
    if (pathname?.startsWith('/main/churches/') && !pathname.includes('/new')) return '교회 상세'
    if (pathname === '/main/churches/new') return '새 교회 만들기'
    if (pathname === '/main/posts/new') return '새 묵상 작성'
    if (pathname?.includes('/edit')) return '묵상 수정'
    if (pathname?.startsWith('/main/posts/')) return '묵상 상세'
    if (pathname === '/main/journal') return '묵상 일지'
    if (pathname === '/main/profile') return '마이페이지'
    return '리플렉션'
  }

  // 탭 네비게이션 항목
  const tabs = [
    { name: '피드', path: '/main/feed', icon: HomeIcon, activeIcon: HomeIconSolid },
    { name: '교회', path: '/main/churches', icon: BuildingLibraryIcon, activeIcon: BuildingLibraryIconSolid },
    { name: '작성', path: '/main/posts/new', icon: PlusCircleIcon, activeIcon: PlusCircleIconSolid },
    { name: '일지', path: '/main/journal', icon: BookOpenIcon, activeIcon: BookOpenIconSolid },
    { name: '프로필', path: '/main/profile', icon: UserCircleIcon, activeIcon: UserCircleIconSolid },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {/* 모바일 앱 컨테이너 (최대 512px) */}
      <div className="w-full max-w-[512px] min-h-screen bg-white shadow-xl relative flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 h-14 flex items-center">
          {/* 뒤로가기 버튼 */}
          {shouldShowBackButton && (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-lg transition-colors"
              aria-label="뒤로가기"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          
          {/* 페이지 제목 */}
          <h1 className="text-lg font-bold text-gray-900 flex-1 text-center">
            {getPageTitle()}
          </h1>

          {/* 우측 공간 (밸런스용) */}
          <div className="w-10"></div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>

        {/* Bottom Tab Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-[512px] mx-auto bg-white border-t border-gray-200 z-50">
          <div className="grid grid-cols-5 h-16">
            {tabs.map((tab) => {
              const isActive = pathname === tab.path || 
                (tab.path === '/main/feed' && (pathname === '/main' || pathname === '/main/')) ||
                (tab.path === '/main/churches' && pathname?.startsWith('/main/churches')) ||
                (tab.path === '/main/posts/new' && pathname?.startsWith('/main/posts/'))
              const Icon = isActive ? tab.activeIcon : tab.icon
              
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-500 active:bg-gray-50'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{tab.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}

