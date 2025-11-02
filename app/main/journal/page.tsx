'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPosts } from '@/lib/api/posts'
import { getCurrentUser } from '@/lib/auth'
import { Post } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import Link from 'next/link'
import ScriptureBadges from '@/components/ScriptureBadges'

export default function JournalPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    loadJournal()
  }, [])

  async function loadJournal() {
    setIsLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setCurrentUserId(user.id)

      // 내가 작성한 묵상만 가져오기
      const allPosts = await getPosts({ filter: 'all' })
      const myPosts = allPosts.filter(post => post.author_id === user.id)
      
      // 날짜순 정렬
      myPosts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      
      setPosts(myPosts)
    } catch (error) {
      console.error('Failed to load journal:', error)
    } finally {
      setIsLoading(false)
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
        {/* 헤더 섹션 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">나의 묵상 일지</h2>
          <p className="text-gray-600">총 {posts.length}개의 묵상을 기록했습니다</p>
        </div>

        {/* 묵상 목록 */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">아직 작성한 묵상이 없습니다</p>
            <Link
              href="/main/posts/new"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              첫 묵상 작성하기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/main/posts/${post.id}`}
                className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* 날짜 */}
                {post.sermon_date && (
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(post.sermon_date).toLocaleDateString('ko-KR')}
                    {post.sermon_location && (
                      <span className="ml-2">• {post.sermon_location}</span>
                    )}
                  </div>
                )}

                {/* 제목 */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h3>

                {/* 성경 구절 */}
                <ScriptureBadges scriptures={post.scriptures || []} className="mb-2" />

                {/* 내용 미리보기 */}
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {post.body}
                </p>

                {/* 태그 */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs text-gray-500">
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{post.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* 작성 시간 및 반응 */}
                <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                  <span>
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}
                  </span>
                  <div className="flex items-center space-x-3">
                    {post.reactions_count && post.reactions_count.length > 0 && (
                      <span className="flex items-center">
                        ❤️ {post.reactions_count.reduce((sum, r) => sum + r.count, 0)}
                      </span>
                    )}
                    {post.comments_count !== undefined && post.comments_count > 0 && (
                      <span className="flex items-center">
                        💬 {post.comments_count}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  )
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

