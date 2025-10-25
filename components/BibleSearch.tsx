'use client'

import { useState } from 'react'
import {
  searchBible,
  parseBibleReference,
  formatBibleReference,
  formatBibleText,
  searchBookNames,
  type BibleReference,
  type BibleBookName,
} from '@/lib/api/bible'

interface BibleSearchProps {
  onSelect: (reference: BibleReference) => void
  className?: string
}

export default function BibleSearch({ onSelect, className = '' }: BibleSearchProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<BibleReference | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<BibleBookName[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // 자동완성 처리
  const handleInputChange = (value: string) => {
    setQuery(value)
    setError(null)
    setResult(null)

    // 책 이름 자동완성
    const words = value.split(' ')
    if (words.length === 1 && value.length > 0) {
      const matches = searchBookNames(value)
      setSuggestions(matches.slice(0, 10))
      setShowSuggestions(matches.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  // 자동완성 선택
  const handleSuggestionClick = (bookName: BibleBookName) => {
    setQuery(bookName + ' ')
    setShowSuggestions(false)
    setSuggestions([])
  }

  // 검색 실행
  const handleSearch = async () => {
    if (!query.trim()) {
      setError('검색어를 입력해주세요.')
      return
    }

    // 파싱 검증
    const parsed = parseBibleReference(query)
    if (!parsed) {
      setError('올바른 형식으로 입력해주세요. (예: 요한복음 3:16, 창세기 1:1-3)')
      return
    }

    setIsSearching(true)
    setError(null)
    setResult(null)

    try {
      const bibleRef = await searchBible(query)
      
      if (!bibleRef) {
        setError('성경 구절을 찾을 수 없습니다.')
        return
      }

      setResult(bibleRef)
    } catch (err: any) {
      setError(err.message || '검색 중 오류가 발생했습니다.')
    } finally {
      setIsSearching(false)
    }
  }

  // 엔터키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  // 선택하기
  const handleSelectReference = () => {
    if (result) {
      onSelect(result)
      setQuery('')
      setResult(null)
      setError(null)
    }
  }

  return (
    <div className={`bible-search ${className}`}>
      {/* 검색 입력 */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true)
                }
              }}
              placeholder="예: 요한복음 3:16, 창 1:1-3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* 자동완성 드롭다운 */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((bookName) => (
                  <button
                    key={bookName}
                    onClick={() => handleSuggestionClick(bookName)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  >
                    {bookName}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? '검색 중...' : '검색'}
          </button>
        </div>

        {/* 도움말 */}
        <p className="mt-1 text-sm text-gray-500">
          💡 팁: 약어 사용 가능 (예: 요 3:16, 창 1:1-3)
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* 검색 결과 */}
      {result && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">
              {formatBibleReference(result)}
            </h3>
            <button
              onClick={handleSelectReference}
              className="px-4 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              선택하기
            </button>
          </div>
          
          <div className="text-gray-700 leading-relaxed">
            {result.verses.map((verse, idx) => (
              <p key={verse.verse} className="mb-1">
                <span className="font-semibold text-blue-600">{verse.verse}.</span>{' '}
                {verse.text.trim()}
              </p>
            ))}
          </div>

          <p className="mt-2 text-xs text-gray-500">
            개역한글판 (KorRV) - 대한성서공회
          </p>
        </div>
      )}
    </div>
  )
}

