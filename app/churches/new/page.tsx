'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { createChurch } from '@/lib/api/churches'

export default function NewChurchPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      const church = await createChurch({
        name: name.trim(),
        address: address.trim() || undefined,
        description: description.trim() || undefined,
      })
      router.push(`/churches/${church.id}`)
    } catch (error) {
      console.error('Failed to create church:', error)
      alert('교회 생성에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-6">새 교회 만들기</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                교회 이름 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="예: 사랑의 교회"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주소
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field"
                placeholder="서울시 강남구..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                소개
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                rows={4}
                placeholder="교회에 대한 간단한 소개를 작성해주세요"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 교회를 만들면 초대 코드가 자동으로 생성됩니다.
                이 코드를 교인들과 공유하여 교회에 초대할 수 있습니다.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? '생성 중...' : '교회 만들기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

