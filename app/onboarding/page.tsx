'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, updateProfile } from '@/lib/auth'
import { joinChurch, getUserChurches } from '@/lib/api/churches'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string>('')

  const availableInterests = [
    '신앙 성장',
    '가정',
    '직장',
    '청년',
    '찬양',
    '기도',
    '전도',
    '봉사',
  ]

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUserId(user.id)
      setDisplayName(user.user_metadata?.display_name || '')
    } catch (error) {
      router.push('/auth/login')
    }
  }

  function toggleInterest(interest: string) {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest))
    } else {
      setInterests([...interests, interest])
    }
  }

  async function handleNext() {
    if (step === 1) {
      // Update profile
      if (!displayName.trim()) {
        alert('이름을 입력해주세요')
        return
      }
      setIsLoading(true)
      try {
        await updateProfile(userId, {
          display_name: displayName.trim(),
          bio: bio.trim() || undefined,
        })
        setStep(2)
      } catch (error) {
        console.error('Failed to update profile:', error)
        alert('프로필 업데이트에 실패했습니다')
      } finally {
        setIsLoading(false)
      }
    } else if (step === 2) {
      // Optional: Join church
      if (joinCode.trim()) {
        setIsLoading(true)
        try {
          await joinChurch(joinCode.trim())
          setStep(3)
        } catch (error: any) {
          alert(error.message || '교회 가입에 실패했습니다')
        } finally {
          setIsLoading(false)
        }
      } else {
        setStep(3)
      }
    } else if (step === 3) {
      // Complete onboarding
      router.push('/main/feed')
    }
  }

  function handleSkip() {
    if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      router.push('/main/feed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm">단계 {step}/3</span>
            <span className="text-white text-sm">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="card p-8">
          {/* Step 1: Profile */}
          {step === 1 && (
            <div>
              <h1 className="text-3xl font-bold mb-2">환영합니다! 👋</h1>
              <p className="text-gray-600 mb-8">
                먼저 프로필을 설정해주세요
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field"
                    placeholder="홍길동"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    자기소개 (선택)
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="간단한 자기소개를 작성해주세요"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Church */}
          {step === 2 && (
            <div>
              <h1 className="text-3xl font-bold mb-2">교회에 가입하세요</h1>
              <p className="text-gray-600 mb-8">
                교회 초대 코드가 있다면 입력해주세요 (나중에도 가입할 수 있습니다)
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    초대 코드 (선택)
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="input-field"
                    placeholder="초대 코드 입력"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    목회자나 교회 관리자로부터 받은 코드를 입력하세요
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 교회에 가입하면 같은 교회 성도들과 묵상을 나눌 수 있습니다
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div>
              <h1 className="text-3xl font-bold mb-2">관심 주제를 선택하세요</h1>
              <p className="text-gray-600 mb-8">
                선택한 주제에 맞는 묵상을 추천해드립니다
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {availableInterests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      interests.includes(interest)
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <div className="bg-cream-50 border border-cream-200 rounded-lg p-6">
                <h3 className="font-semibold mb-3">💡 묵상 작성 팁</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• <strong>요약:</strong> 오늘 설교의 핵심 내용</li>
                  <li>• <strong>느낀 점:</strong> 개인적으로 와닿은 부분</li>
                  <li>• <strong>적용점:</strong> 삶에 어떻게 적용할지</li>
                  <li>• <strong>기도 제목:</strong> 기도하고 싶은 내용</li>
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary"
              >
                이전
              </button>
            )}
            <div className={`flex space-x-3 ${step === 1 ? 'ml-auto' : ''}`}>
              {step > 1 && (
                <button
                  onClick={handleSkip}
                  className="text-gray-600 hover:text-gray-900 px-4"
                >
                  건너뛰기
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? '처리 중...' : step === 3 ? '시작하기' : '다음'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

