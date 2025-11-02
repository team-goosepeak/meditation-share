'use client'

import { useState, useEffect } from 'react'
import PostCard from '@/components/PostCard'
import { getPosts } from '@/lib/api/posts'
import { Post } from '@/lib/supabase'

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'following' | 'church'>('all')

  useEffect(() => {
    loadPosts()
  }, [filter])

  async function loadPosts() {
    setIsLoading(true)
    try {
      const data = await getPosts({ filter })
      setPosts(data)
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4">
        {/* Filter Tabs */}
        <div className="mb-6 flex space-x-2 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('church')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'church'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            우리 교회
          </button>
          <button
            onClick={() => setFilter('following')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'following'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            팔로잉
          </button>
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 card p-8">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">아직 게시물이 없습니다</h3>
            <p className="text-gray-600 mb-4">첫 번째 묵상을 작성해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onReactionUpdate={loadPosts} />
            ))}
          </div>
        )}
    </div>
  )
}

