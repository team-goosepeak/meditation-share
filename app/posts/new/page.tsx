'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import BibleSearch from '@/components/BibleSearch'
import { createPost } from '@/lib/api/posts'
import { getUserChurches } from '@/lib/api/churches'
import { getCurrentUser } from '@/lib/auth'
import { Church, Scripture } from '@/lib/supabase'
import { BibleReference } from '@/lib/api/bible'

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [scriptures, setScriptures] = useState<Scripture[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'church' | 'friends' | 'private'>('public')
  const [selectedChurch, setSelectedChurch] = useState<string>('')
  const [churches, setChurches] = useState<Church[]>([])
  const [sermonDate, setSermonDate] = useState('')
  const [sermonLocation, setSermonLocation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)

  // Scripture input fields
  const [scriptureBook, setScriptureBook] = useState('')
  const [scriptureChapter, setScriptureChapter] = useState('')
  const [scriptureVerseFrom, setScriptureVerseFrom] = useState('')
  const [scriptureVerseTo, setScriptureVerseTo] = useState('')

  useEffect(() => {
    loadChurches()
  }, [])

  async function loadChurches() {
    try {
      const user = await getCurrentUser()
      if (user) {
        const userChurches = await getUserChurches(user.id)
        setChurches(userChurches as Church[])
      }
    } catch (error) {
      console.error('Failed to load churches:', error)
    }
  }

  function addScripture() {
    if (!scriptureBook || !scriptureChapter || !scriptureVerseFrom) return

    const newScripture: Scripture = {
      book: scriptureBook,
      chapter: parseInt(scriptureChapter),
      verseFrom: parseInt(scriptureVerseFrom),
      verseTo: scriptureVerseTo ? parseInt(scriptureVerseTo) : undefined,
    }

    setScriptures([...scriptures, newScripture])
    setScriptureBook('')
    setScriptureChapter('')
    setScriptureVerseFrom('')
    setScriptureVerseTo('')
  }

  function removeScripture(index: number) {
    setScriptures(scriptures.filter((_, i) => i !== index))
  }

  function handleBibleSelect(reference: BibleReference) {
    const newScripture: Scripture = {
      book: reference.book,
      chapter: reference.chapter,
      verseFrom: reference.verseFrom,
      verseTo: reference.verseTo || reference.verseFrom,
      text: reference.verses.map(v => v.text.trim()).join(' '),
    }

    setScriptures([...scriptures, newScripture])
  }

  function addTag() {
    if (!tagInput.trim()) return
    if (tags.includes(tagInput.trim())) return

    setTags([...tags, tagInput.trim()])
    setTagInput('')
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return

    setIsLoading(true)

    try {
      await createPost({
        title: title.trim(),
        body: body.trim(),
        scriptures,
        tags,
        visibility,
        churchId: selectedChurch || undefined,
        sermonDate: sermonDate || undefined,
        sermonLocation: sermonLocation || undefined,
      })

      router.push('/feed')
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('게시물 작성에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-6">새 묵상 작성</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="예: 2025-10-23 - 사랑의 본질"
                required
              />
            </div>

            {/* Sermon Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예배 일시
                </label>
                <input
                  type="date"
                  value={sermonDate}
                  onChange={(e) => setSermonDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예배 장소
                </label>
                <input
                  type="text"
                  value={sermonLocation}
                  onChange={(e) => setSermonLocation(e.target.value)}
                  className="input-field"
                  placeholder="예: 온라인, 본당"
                />
              </div>
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                묵상 내용 *
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="input-field"
                rows={10}
                placeholder="오늘 설교에서 느낀 점, 적용할 점, 기도 제목 등을 자유롭게 작성해보세요..."
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                💡 팁: 요약 → 느낀 점 → 적용점 → 기도제목 순서로 작성해보세요
              </p>
            </div>

            {/* Scriptures */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  관련 성경 구절
                </label>
                <button
                  type="button"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showManualInput ? '🔍 검색 입력으로 전환' : '✍️ 수동 입력으로 전환'}
                </button>
              </div>

              {!showManualInput ? (
                /* 성경 검색 컴포넌트 */
                <BibleSearch onSelect={handleBibleSelect} />
              ) : (
                /* 기존 수동 입력 */
                <div className="grid grid-cols-12 gap-2 mb-2">
                  <input
                    type="text"
                    value={scriptureBook}
                    onChange={(e) => setScriptureBook(e.target.value)}
                    className="input-field col-span-4"
                    placeholder="요한복음"
                  />
                  <input
                    type="number"
                    value={scriptureChapter}
                    onChange={(e) => setScriptureChapter(e.target.value)}
                    className="input-field col-span-2"
                    placeholder="3"
                  />
                  <input
                    type="number"
                    value={scriptureVerseFrom}
                    onChange={(e) => setScriptureVerseFrom(e.target.value)}
                    className="input-field col-span-2"
                    placeholder="16"
                  />
                  <input
                    type="number"
                    value={scriptureVerseTo}
                    onChange={(e) => setScriptureVerseTo(e.target.value)}
                    className="input-field col-span-2"
                    placeholder="18"
                  />
                  <button
                    type="button"
                    onClick={addScripture}
                    className="btn-primary col-span-2"
                  >
                    추가
                  </button>
                </div>
              )}

              {scriptures.length > 0 && (
                <div className="space-y-2 mt-4">
                  {scriptures.map((scripture, index) => (
                    <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-bold text-blue-900">
                          📖 {scripture.book} {scripture.chapter}:{scripture.verseFrom}
                          {scripture.verseTo && scripture.verseTo !== scripture.verseFrom && `-${scripture.verseTo}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeScripture(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          삭제
                        </button>
                      </div>
                      {scripture.text && (
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {scripture.text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                태그
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="input-field flex-1"
                  placeholder="감사, 용서, 가정..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn-primary"
                >
                  추가
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Visibility and Church */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  공개 범위 *
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="input-field"
                  required
                >
                  <option value="public">전체 공개</option>
                  <option value="church">교회 내 공개</option>
                  <option value="friends">친구 공개</option>
                  <option value="private">비공개</option>
                </select>
              </div>

              {visibility === 'church' && churches.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    교회 선택 *
                  </label>
                  <select
                    value={selectedChurch}
                    onChange={(e) => setSelectedChurch(e.target.value)}
                    className="input-field"
                    required={visibility === 'church'}
                  >
                    <option value="">교회를 선택하세요</option>
                    {churches.map((church) => (
                      <option key={church.id} value={church.id}>
                        {church.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-3 pt-4">
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
                {isLoading ? '작성 중...' : '게시하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

