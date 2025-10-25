'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { getChurches, getUserChurches, joinChurch } from '@/lib/api/churches'
import { getCurrentUser } from '@/lib/auth'
import { Church } from '@/lib/supabase'
import Link from 'next/link'

export default function ChurchesPage() {
  const router = useRouter()
  const [myChurches, setMyChurches] = useState<Church[]>([])
  const [allChurches, setAllChurches] = useState<Church[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [joinCode, setJoinCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setIsLoading(true)
    try {
      const user = await getCurrentUser()
      if (user) {
        const [userChurches, churches] = await Promise.all([
          getUserChurches(user.id),
          getChurches(),
        ])
        setMyChurches(userChurches as Church[])
        setAllChurches(churches)
      }
    } catch (error) {
      console.error('Failed to load churches:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleJoinChurch(e: React.FormEvent) {
    e.preventDefault()
    if (!joinCode.trim()) return

    setIsJoining(true)
    try {
      await joinChurch(joinCode.trim())
      setJoinCode('')
      setShowJoinModal(false)
      loadData()
      alert('교회에 가입되었습니다!')
    } catch (error: any) {
      alert(error.message || '교회 가입에 실패했습니다')
    } finally {
      setIsJoining(false)
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">교회</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-secondary"
            >
              초대 코드로 가입
            </button>
            <Link href="/churches/new" className="btn-primary">
              새 교회 만들기
            </Link>
          </div>
        </div>

        {/* My Churches */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">내 교회</h2>
          {myChurches.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-600 mb-4">아직 가입한 교회가 없습니다</p>
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn-primary"
              >
                교회 가입하기
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {myChurches.map((church) => (
                <Link
                  key={church.id}
                  href={`/churches/${church.id}`}
                  className="card p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold mb-2">{church.name}</h3>
                  {church.address && (
                    <p className="text-sm text-gray-600 mb-2">📍 {church.address}</p>
                  )}
                  {church.description && (
                    <p className="text-sm text-gray-700">{church.description}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* All Churches */}
        <section>
          <h2 className="text-2xl font-bold mb-4">모든 교회</h2>
          {allChurches.length === 0 ? (
            <div className="card p-8 text-center text-gray-600">
              등록된 교회가 없습니다
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allChurches.map((church) => (
                <div
                  key={church.id}
                  className="card p-6"
                >
                  <h3 className="text-lg font-semibold mb-2">{church.name}</h3>
                  {church.address && (
                    <p className="text-sm text-gray-600 mb-2">📍 {church.address}</p>
                  )}
                  {church.description && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{church.description}</p>
                  )}
                  <Link
                    href={`/churches/${church.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    자세히 보기 →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Join Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">교회 가입</h2>
              <p className="text-gray-600 mb-6">
                목회자나 교회 관리자로부터 받은 초대 코드를 입력하세요
              </p>
              <form onSubmit={handleJoinChurch} className="space-y-4">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="input-field"
                  placeholder="초대 코드 입력"
                  required
                />
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isJoining}
                    className="flex-1 btn-primary"
                  >
                    {isJoining ? '가입 중...' : '가입하기'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

