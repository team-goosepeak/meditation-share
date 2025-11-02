'use client'

import Link from 'next/link'
import Footer from '@/components/Footer'
import Image from 'next/image'

export default function InfoPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <Image src="/logo/logo_full.png" alt="리플렉션 - Worship Reflection" width={300} height={100} className="mx-auto mb-0" />
            <p className="text-xl mb-4 text-gray-700">
              설교 말씀을 중심으로
            </p>
            <p className="text-xl mb-12 text-gray-700">
              묵상과 신앙 고백을 나누는 공간입니다.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signup" className="bg-primary-600 text-white hover:bg-primary-700 px-8 py-3 text-lg rounded-lg font-medium transition-colors">
                시작하기
              </Link>
              <Link href="/auth/login" className="bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-3 text-lg rounded-lg font-medium transition-colors">
                로그인
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-primary-700 to-primary-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">주요 기능</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">말씀 중심</h3>
              <p className="text-primary-100">설교 말씀과 성경 구절을 중심으로 묵상을 기록하고 나눕니다</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">교회 커뮤니티</h3>
              <p className="text-primary-100">같은 교회 성도들과 함께 신앙을 나누고 격려합니다</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">안전한 고백</h3>
              <p className="text-primary-100">비판 없는 안전한 공간에서 신앙 고백을 나눕니다</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">지금 시작하세요</h2>
          <p className="text-xl text-gray-700 mb-8">
            매주 듣는 설교를 묵상하고, 신앙 생활을 기록하세요
          </p>
          <Link href="/auth/signup" className="btn-primary px-8 py-3 text-lg inline-block">
            무료로 시작하기
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

