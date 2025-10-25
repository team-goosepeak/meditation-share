'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { getPost } from '@/lib/api/posts'
import { getComments, createComment } from '@/lib/api/comments'
import { addReaction, ReactionType } from '@/lib/api/reactions'
import { Post, Comment } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale/ko'

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentBody, setCommentBody] = useState('')
  const [isLoadingPost, setIsLoadingPost] = useState(true)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadPost()
    loadComments()
  }, [postId])

  async function loadPost() {
    setIsLoadingPost(true)
    try {
      const data = await getPost(postId)
      setPost(data)
    } catch (error) {
      console.error('Failed to load post:', error)
      router.push('/feed')
    } finally {
      setIsLoadingPost(false)
    }
  }

  async function loadComments() {
    setIsLoadingComments(true)
    try {
      const data = await getComments(postId)
      setComments(data)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  async function handleReaction(type: ReactionType) {
    try {
      await addReaction(postId, type)
      loadPost() // Reload to get updated reaction counts
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!commentBody.trim()) return

    setIsSubmitting(true)
    try {
      await createComment({ postId, body: commentBody.trim() })
      setCommentBody('')
      loadComments()
      loadPost() // Reload to update comment count
    } catch (error) {
      console.error('Failed to create comment:', error)
      alert('댓글 작성에 실패했습니다')
    } finally {
      setIsSubmitting(false)
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

  if (isLoadingPost) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </Layout>
    )
  }

  if (!post) {
    return null
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Post Content */}
        <div className="card p-8 mb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-lg">
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
            {post.church && (
              <span className="text-sm px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
                {post.church.name}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

          {/* Sermon Info */}
          {(post.sermon_date || post.sermon_location) && (
            <div className="mb-4 text-sm text-gray-600 flex items-center space-x-4">
              {post.sermon_date && (
                <span>📅 {new Date(post.sermon_date).toLocaleDateString('ko-KR')}</span>
              )}
              {post.sermon_location && <span>📍 {post.sermon_location}</span>}
            </div>
          )}

          {/* Scriptures */}
          {post.scriptures && post.scriptures.length > 0 && (
            <div className="mb-6 p-4 bg-cream-50 rounded-lg border border-cream-200">
              <p className="font-medium text-primary-700">
                {post.scriptures.map((s, i) => (
                  <span key={i}>
                    {i > 0 && ', '}
                    {s.book} {s.chapter}:{s.verseFrom}
                    {s.verseTo && s.verseTo !== s.verseFrom && `-${s.verseTo}`}
                  </span>
                ))}
              </p>
            </div>
          )}

          {/* Body */}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-800 whitespace-pre-wrap">{post.body}</p>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Reactions */}
          <div className="flex items-center space-x-2 pt-6 border-t border-gray-100">
            {(['heart', 'pray', 'amen', 'thanks'] as ReactionType[]).map((type) => {
              const count = post.reactions_count?.find(r => r.type === type)?.count || 0
              return (
                <button
                  key={type}
                  onClick={() => handleReaction(type)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title={reactionLabels[type]}
                >
                  <span className="text-xl">{reactionIcons[type]}</span>
                  <span className="text-sm font-medium text-gray-700">{reactionLabels[type]}</span>
                  {count > 0 && <span className="text-sm text-gray-500">({count})</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Comments Section */}
        <div className="card p-8">
          <h2 className="text-xl font-bold mb-6">
            댓글 {comments.length}개
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="격려와 응원의 댓글을 남겨주세요 (비판은 자제해주세요)"
              required
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? '작성 중...' : '댓글 작성'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="text-center py-8">
              <p className="text-gray-600">댓글을 불러오는 중...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 text-sm font-semibold">
                        {comment.author?.display_name?.[0] || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{comment.author?.display_name}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-800 ml-10">{comment.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

