'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Post } from '@/lib/supabase'
import { addReaction, ReactionType } from '@/lib/api/reactions'
import { getCurrentUser } from '@/lib/auth'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import ScriptureBadges from '@/components/ScriptureBadges'

interface PostCardProps {
  post: Post
  onReactionUpdate?: () => void
}

export default function PostCard({ post, onReactionUpdate }: PostCardProps) {
  const [isReacting, setIsReacting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    loadCurrentUser()
  }, [])

  async function loadCurrentUser() {
    try {
      const user = await getCurrentUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    } catch (error) {
      console.error('Failed to load current user:', error)
    }
  }

  async function handleReaction(type: ReactionType) {
    if (isReacting) return
    setIsReacting(true)

    try {
      await addReaction(post.id, type)
      onReactionUpdate?.()
    } catch (error) {
      console.error('Failed to add reaction:', error)
    } finally {
      setIsReacting(false)
    }
  }

  const reactionIcons: Record<ReactionType, string> = {
    heart: '❤️',
    pray: '🙏',
    amen: '✨',
    thanks: '🙌',
  }

  const reactionLabels: Record<ReactionType, string> = {
    heart: '감사',
    pray: '기도',
    amen: '아멘',
    thanks: '은혜',
  }

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-semibold">
              {post.author?.display_name?.[0] || '?'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{post.author?.display_name}</p>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post.church && (
            <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
              {post.church.name}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <Link href={`/main/posts/${post.id}`} className="block">
        <h3 className="text-lg font-semibold mb-2 hover:text-primary-700 transition-colors">
          {post.title}
        </h3>

        {/* Scriptures */}
        <ScriptureBadges scriptures={post.scriptures || []} className="mb-3" />

        <p className="text-gray-700 mb-3 line-clamp-3 whitespace-pre-line">{post.body}</p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* Reactions and Comments */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          {(['heart', 'pray', 'amen', 'thanks'] as ReactionType[]).map((type) => {
            const count = post.reactions_count?.find(r => r.type === type)?.count || 0
            return (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                disabled={isReacting}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                title={reactionLabels[type]}
              >
                <span>{reactionIcons[type]}</span>
                {count > 0 && <span className="text-gray-600">{count}</span>}
              </button>
            )
          })}
        </div>

        <Link
          href={`/main/posts/${post.id}`}
          className="flex items-center space-x-1 text-gray-600 hover:text-primary-700 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{post.comments_count || 0}</span>
        </Link>
      </div>
    </div>
  )
}

