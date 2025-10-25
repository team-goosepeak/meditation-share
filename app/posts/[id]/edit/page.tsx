'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Layout from '@/components/Layout'
import { getPost, updatePost } from '@/lib/api/posts'
import { getUserChurches } from '@/lib/api/churches'
import { getCurrentUser } from '@/lib/auth'
import { Church, Scripture, Post } from '@/lib/supabase'
import { getBibleVerses, getAllBookNames, type BibleBookName, type BibleVerse } from '@/lib/api/bible'

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [isLoadingPost, setIsLoadingPost] = useState(true)
  
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

  // Writing mode
  const [writingMode, setWritingMode] = useState<'direct' | 'ai-guided'>('direct')
  const [aiNotes, setAiNotes] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [refineError, setRefineError] = useState<string | null>(null)

  // Scripture input fields
  const [scriptureBook, setScriptureBook] = useState<BibleBookName | ''>('')
  const [scriptureChapter, setScriptureChapter] = useState('')
  const [scriptureVerseFrom, setScriptureVerseFrom] = useState('')
  const [scriptureVerseTo, setScriptureVerseTo] = useState('')
  const [previewVerses, setPreviewVerses] = useState<BibleVerse[] | null>(null)
  const [isLoadingVerse, setIsLoadingVerse] = useState(false)
  const [verseError, setVerseError] = useState<string | null>(null)

  const loadChurches = useCallback(async () => {
    try {
      const user = await getCurrentUser()
      if (user) {
        const userChurches = await getUserChurches(user.id)
        setChurches(userChurches)
      }
    } catch (error) {
      console.error('Failed to load churches:', error)
    }
  }, [])

  useEffect(() => {
    loadPost()
    loadChurches()
  }, [postId, loadChurches])

  async function loadPost() {
    setIsLoadingPost(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const postData = await getPost(postId)
      
      // 작성자 확인
      if (postData.author_id !== user.id) {
        alert('자신의 글만 수정할 수 있습니다.')
        router.push(`/posts/${postId}`)
        return
      }

      setPost(postData)
      setTitle(postData.title)
      setBody(postData.body)
      setScriptures(postData.scriptures || [])
      setTags(postData.tags || [])
      setVisibility(postData.visibility)
      setSelectedChurch(postData.church_id || '')
      setSermonDate(postData.sermon_date || '')
      setSermonLocation(postData.sermon_location || '')
    } catch (error) {
      console.error('Failed to load post:', error)
      alert('포스트를 불러올 수 없습니다.')
      router.push('/feed')
    } finally {
      setIsLoadingPost(false)
    }
  }

  async function previewScripture() {
    if (!scriptureBook || !scriptureChapter || !scriptureVerseFrom) {
      setVerseError('책, 장, 절을 모두 입력해주세요.')
      return
    }

    setIsLoadingVerse(true)
    setVerseError(null)
    setPreviewVerses(null)

    try {
      const chapter = parseInt(scriptureChapter)
      const verseFrom = parseInt(scriptureVerseFrom)
      const verseTo = scriptureVerseTo ? parseInt(scriptureVerseTo) : undefined

      const result = await getBibleVerses(
        scriptureBook as BibleBookName,
        chapter,
        verseFrom,
        verseTo
      )

      setPreviewVerses(result.verses)
    } catch (error: any) {
      setVerseError(error.message || '성경 구절을 불러올 수 없습니다.')
    } finally {
      setIsLoadingVerse(false)
    }
  }

  function addScripture() {
    if (!scriptureBook || !scriptureChapter || !scriptureVerseFrom || !previewVerses) {
      return
    }

    const newScripture: Scripture = {
      book: scriptureBook,
      chapter: parseInt(scriptureChapter),
      verseFrom: parseInt(scriptureVerseFrom),
      verseTo: scriptureVerseTo ? parseInt(scriptureVerseTo) : undefined,
      text: previewVerses.map(v => v.text.trim()).join(' '),
      verses: previewVerses.map(v => ({
        verse: v.verse,
        text: v.text.trim()
      })),
    }

    setScriptures([...scriptures, newScripture])
    
    setScriptureBook('')
    setScriptureChapter('')
    setScriptureVerseFrom('')
    setScriptureVerseTo('')
    setPreviewVerses(null)
    setVerseError(null)
  }

  function removeScripture(index: number) {
    setScriptures(scriptures.filter((_, i) => i !== index))
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

  async function handleAIRefine() {
    if (!aiNotes.trim()) {
      setRefineError('메모 내용을 입력해주세요.')
      return
    }

    setIsRefining(true)
    setRefineError(null)

    try {
      const response = await fetch('/api/ai/refine-meditation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: aiNotes,
          scriptures: scriptures,
          previousVersion: body || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'AI 검수에 실패했습니다.')
      }

      setBody(data.refinedText)
    } catch (error: any) {
      console.error('AI refine error:', error)
      setRefineError(error.message || 'AI 검수 중 오류가 발생했습니다.')
    } finally {
      setIsRefining(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return

    setIsLoading(true)

    try {
      await updatePost(postId, {
        title: title.trim(),
        body: body.trim(),
        scriptures,
        tags,
        visibility,
        sermon_date: sermonDate || undefined,
        sermon_location: sermonLocation || undefined,
      })

      router.push(`/posts/${postId}`)
    } catch (error) {
      console.error('Failed to update post:', error)
      alert('게시물 수정에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
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
        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-6">묵상 수정</h1>

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

            {/* Scriptures */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                관련 성경 구절
              </label>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-4">
                    <label className="block text-xs text-gray-600 mb-1">
                      성경책
                    </label>
                    <select
                      value={scriptureBook}
                      onChange={(e) => {
                        setScriptureBook(e.target.value as BibleBookName)
                        setPreviewVerses(null)
                        setVerseError(null)
                      }}
                      className="input-field w-full"
                    >
                      <option value="">선택하세요</option>
                      {getAllBookNames().map((book) => (
                        <option key={book} value={book}>
                          {book}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">
                      장
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={scriptureChapter}
                      onChange={(e) => {
                        setScriptureChapter(e.target.value)
                        setPreviewVerses(null)
                        setVerseError(null)
                      }}
                      className="input-field w-full"
                      placeholder="1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">
                      시작 절
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={scriptureVerseFrom}
                      onChange={(e) => {
                        setScriptureVerseFrom(e.target.value)
                        setPreviewVerses(null)
                        setVerseError(null)
                      }}
                      className="input-field w-full"
                      placeholder="1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">
                      끝 절
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={scriptureVerseTo}
                      onChange={(e) => {
                        setScriptureVerseTo(e.target.value)
                        setPreviewVerses(null)
                        setVerseError(null)
                      }}
                      className="input-field w-full"
                      placeholder="5"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-end">
                    <button
                      type="button"
                      onClick={previewScripture}
                      disabled={isLoadingVerse || !scriptureBook || !scriptureChapter || !scriptureVerseFrom}
                      className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingVerse ? '로딩...' : '미리보기'}
                    </button>
                  </div>
                </div>

                {verseError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{verseError}</p>
                  </div>
                )}

                {previewVerses && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-bold text-blue-900">
                        📖 {scriptureBook} {scriptureChapter}:{scriptureVerseFrom}
                        {scriptureVerseTo && scriptureVerseTo !== scriptureVerseFrom && `-${scriptureVerseTo}`}
                      </p>
                      <button
                        type="button"
                        onClick={addScripture}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        추가
                      </button>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed space-y-1">
                      {previewVerses.map((verse) => (
                        <p key={verse.verse} className="italic">
                          {scriptureChapter}:{verse.verse} &quot;{verse.text.trim()}&quot;
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {scriptures.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    추가된 구절 ({scriptures.length}개)
                  </p>
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
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          삭제
                        </button>
                      </div>
                      {scripture.verses ? (
                        <div className="text-sm text-gray-700 leading-relaxed space-y-1">
                          {scripture.verses.map((v) => (
                            <p key={v.verse} className="italic">
                              {scripture.chapter}:{v.verse} &quot;{v.text}&quot;
                            </p>
                          ))}
                        </div>
                      ) : scripture.text && (
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {scripture.text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Body - Writing Mode Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  묵상 내용 *
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setWritingMode('direct')}
                    className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                      writingMode === 'direct'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    직접 쓰기
                  </button>
                  <button
                    type="button"
                    onClick={() => setWritingMode('ai-guided')}
                    className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                      writingMode === 'ai-guided'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    🤖 AI 가이더
                  </button>
                </div>
              </div>

              {writingMode === 'direct' ? (
                <>
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
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <textarea
                      value={aiNotes}
                      onChange={(e) => setAiNotes(e.target.value)}
                      className="input-field"
                      rows={6}
                      placeholder="묵상하면서 떠오른 생각들을 간략하게 메모해주세요..."
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      💡 간단한 키워드나 짧은 문장으로 메모하세요. AI가 완성된 묵상 글로 다듬어드립니다.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleAIRefine}
                      disabled={isRefining || !aiNotes.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isRefining ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          AI 검수 중...
                        </>
                      ) : (
                        <>
                          ✨ AI 검수
                        </>
                      )}
                    </button>
                    {body && (
                      <span className="text-sm text-green-600 font-medium">
                        ✓ 검수 완료 (아래에서 수정 가능)
                      </span>
                    )}
                  </div>

                  {refineError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{refineError}</p>
                    </div>
                  )}

                  {body && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          AI가 다듬은 글 (수정 가능)
                        </label>
                        <button
                          type="button"
                          onClick={handleAIRefine}
                          disabled={isRefining}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          🔄 다시 검수하기
                        </button>
                      </div>
                      <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="input-field"
                        rows={10}
                        required
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        💡 AI가 다듬은 글을 직접 수정하거나 &quot;다시 검수하기&quot;로 다른 버전을 받아보세요.
                      </p>
                    </div>
                  )}
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
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-primary-900 hover:text-primary-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                공개 범위
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="input-field"
              >
                <option value="public">전체 공개</option>
                <option value="church">교회 멤버만</option>
                <option value="friends">친구만</option>
                <option value="private">나만 보기</option>
              </select>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 btn-secondary"
                disabled={isLoading}
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
                disabled={isLoading}
              >
                {isLoading ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

