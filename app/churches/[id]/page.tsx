'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Layout from '@/components/Layout'
import PostCard from '@/components/PostCard'
import { getChurch, getChurchMembers } from '@/lib/api/churches'
import { getPosts } from '@/lib/api/posts'
import { Church, Post } from '@/lib/supabase'

export default function ChurchDetailPage() {
  const params = useParams()
  const churchId = params.id as string

  const [church, setChurch] = useState<Church | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'info'>('posts')
  const [showJoinCode, setShowJoinCode] = useState(false)

  useEffect(() => {
    loadData()
  }, [churchId])

  async function loadData() {
    setIsLoading(true)
    try {
      const [churchData, membersData, postsData] = await Promise.all([
        getChurch(churchId),
        getChurchMembers(churchId),
        getPosts({ filter: 'church', churchId }),
      ])
      setChurch(churchData)
      setMembers(membersData)
      setPosts(postsData)
    } catch (error) {
      console.error('Failed to load church data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </Layout>
    )
  }

  if (!church) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">교회를 찾을 수 없습니다</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Church Header */}
        <div className="card p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{church.name}</h1>
              {church.address && (
                <p className="text-gray-600 mb-2">📍 {church.address}</p>
              )}
              {church.description && (
                <p className="text-gray-700">{church.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-700">{members.length}</p>
              <p className="text-sm text-gray-600">멤버</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-700">{posts.length}</p>
              <p className="text-sm text-gray-600">게시물</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setShowJoinCode(!showJoinCode)}
                className="btn-secondary"
              >
                초대 코드 보기
              </button>
            </div>
          </div>

          {showJoinCode && (
            <div className="mt-4 p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">초대 코드:</p>
              <p className="text-2xl font-mono font-bold text-primary-700">{church.join_code}</p>
              <p className="text-sm text-gray-600 mt-2">
                이 코드를 교인들과 공유하여 교회에 초대하세요
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'posts'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            게시물
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'members'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            멤버
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'info'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            정보
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="card p-8 text-center text-gray-600">
                아직 게시물이 없습니다
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} onReactionUpdate={loadData} />
              ))
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="card p-6">
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-semibold">
                        {member.user?.display_name?.[0] || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.user?.display_name}</p>
                      <p className="text-sm text-gray-500">{member.user?.email}</p>
                    </div>
                  </div>
                  <span className="text-sm px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {member.role === 'admin' ? '관리자' : member.role === 'pastor' ? '목회자' : '멤버'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="card p-6">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">교회 이름</dt>
                <dd className="mt-1 text-lg text-gray-900">{church.name}</dd>
              </div>
              {church.address && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">주소</dt>
                  <dd className="mt-1 text-gray-900">{church.address}</dd>
                </div>
              )}
              {church.description && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">소개</dt>
                  <dd className="mt-1 text-gray-900">{church.description}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">생성일</dt>
                <dd className="mt-1 text-gray-900">
                  {new Date(church.created_at).toLocaleDateString('ko-KR')}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </Layout>
  )
}

