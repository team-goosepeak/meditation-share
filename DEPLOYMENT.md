# Meditation Share 배포 가이드

이 문서는 Meditation Share를 실제 프로덕션 환경에 배포하는 방법을 안내합니다.

## 📋 배포 체크리스트

배포 전 확인사항:

- [ ] Supabase 프로젝트 생성 및 마이그레이션 완료
- [ ] 환경 변수 설정
- [ ] 로컬 테스트 완료
- [ ] Git 저장소에 코드 푸시
- [ ] 도메인 준비 (선택)

## 🚀 Vercel 배포 (권장)

Vercel은 Next.js에 최적화된 플랫폼으로 가장 간단하게 배포할 수 있습니다.

### 방법 1: GitHub 연동 (권장)

1. **GitHub에 코드 푸시**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/meditation-share.git
   git push -u origin main
   ```

2. **Vercel 프로젝트 생성**
   - https://vercel.com 접속
   - "New Project" 클릭
   - GitHub 저장소 연결
   - "meditation-share" 저장소 선택

3. **환경 변수 설정**
   
   "Environment Variables" 섹션에서 다음 변수 추가:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **배포**
   - "Deploy" 클릭
   - 약 2-3분 후 배포 완료
   - 배포 URL 확인 (예: https://meditation-share.vercel.app)

### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel

# 환경 변수 추가
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# 프로덕션 배포
vercel --prod
```

### 자동 배포 설정

GitHub 연동 시 자동으로 설정됩니다:
- `main` 브랜치에 푸시 → 프로덕션 배포
- PR 생성 → 프리뷰 배포

## 🌐 커스텀 도메인 설정

### Vercel에서 도메인 연결

1. Vercel 프로젝트 대시보드 → "Settings" → "Domains"
2. 도메인 입력 (예: meditation-share.com)
3. DNS 레코드 설정:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. DNS 전파 대기 (최대 48시간, 보통 몇 분)

### Supabase에서 도메인 허용

1. Supabase 대시보드 → "Authentication" → "URL Configuration"
2. "Site URL" 업데이트: `https://meditation-share.com`
3. "Redirect URLs" 추가:
   ```
   https://meditation-share.com/**
   https://*.meditation-share.com/**
   ```

## 🔒 보안 설정

### 1. 환경 변수 보안

프로덕션 환경 변수는 절대 코드에 포함하지 마세요:
- ✅ Vercel 대시보드에서 설정
- ✅ `.env.local`은 `.gitignore`에 추가
- ❌ `.env` 파일을 Git에 커밋하지 않기

### 2. Supabase RLS 정책 확인

모든 테이블에 Row Level Security가 활성화되어 있는지 확인:

```sql
-- Supabase SQL Editor에서 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

모든 테이블의 `rowsecurity`가 `true`여야 합니다.

### 3. API Rate Limiting

Supabase Pro 플랜 사용 시:
- API rate limit 증가
- 더 나은 성능 보장
- 프로덕션 지원

### 4. CORS 설정

Next.js는 기본적으로 CORS를 처리하므로 별도 설정 불필요합니다.

## 📊 모니터링 & 분석

### Vercel Analytics

1. Vercel 대시보드 → "Analytics" 탭
2. 실시간 트래픽, 성능 지표 확인

### Supabase 로그

1. Supabase 대시보드 → "Logs" 섹션
2. API 요청, 에러 로그 확인

### Google Analytics 추가 (선택)

`app/layout.tsx`에 추가:

```typescript
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## 🔄 업데이트 배포

### Git Push로 자동 배포

```bash
# 변경사항 커밋
git add .
git commit -m "Update feature X"
git push origin main

# Vercel이 자동으로 배포
```

### 수동 롤백

Vercel 대시보드에서:
1. "Deployments" 탭
2. 이전 배포 선택
3. "..." → "Promote to Production"

## 🐛 프로덕션 문제 해결

### 빌드 실패

```bash
# 로컬에서 프로덕션 빌드 테스트
npm run build

# 에러 메시지 확인 및 수정
```

### 환경 변수 문제

1. Vercel 대시보드에서 환경 변수 확인
2. `NEXT_PUBLIC_` 접두사 확인
3. 배포 다시 트리거

### Supabase 연결 실패

1. Supabase URL이 올바른지 확인
2. API 키가 유효한지 확인
3. Supabase 프로젝트 상태 확인

### 성능 이슈

1. Vercel Analytics에서 느린 페이지 확인
2. 이미지 최적화 (`next/image` 사용)
3. API 호출 최소화 (캐싱)
4. Supabase 쿼리 최적화

## 📱 모바일 앱 배포 (향후)

Capacitor를 사용한 모바일 앱:

```bash
# Capacitor 추가
npm install @capacitor/core @capacitor/cli
npx cap init

# iOS/Android 프로젝트 추가
npx cap add ios
npx cap add android

# 빌드
npm run build
npx cap sync

# Xcode/Android Studio에서 빌드
npx cap open ios
npx cap open android
```

## 💰 비용 예상

### Vercel
- **Hobby (무료)**: 개인 프로젝트, 취미용
  - 100GB 대역폭/월
  - 무제한 배포
- **Pro ($20/월)**: 프로덕션 앱
  - 1TB 대역폭/월
  - 고급 분석

### Supabase
- **Free**: 개발/테스트
  - 500MB 데이터베이스
  - 1GB 파일 스토리지
  - 50,000 월간 활성 사용자
- **Pro ($25/월)**: 프로덕션
  - 8GB 데이터베이스
  - 100GB 파일 스토리지
  - 100,000 월간 활성 사용자

### 권장 시작 플랜
- Vercel: Hobby (무료) → 트래픽 증가 시 Pro
- Supabase: Free → 사용자 증가 시 Pro

## 🎯 프로덕션 체크리스트

배포 후 확인사항:

- [ ] 회원가입/로그인 테스트
- [ ] 포스트 작성 테스트
- [ ] 댓글/리액션 테스트
- [ ] 교회 생성/가입 테스트
- [ ] 모바일 반응형 확인
- [ ] 이메일 인증 테스트
- [ ] 에러 로그 확인
- [ ] 성능 모니터링 설정
- [ ] 백업 설정 (Supabase 자동 백업 확인)

## 🆘 지원

문제 발생 시:
- Vercel 지원: https://vercel.com/support
- Supabase 지원: https://supabase.com/support
- GitHub Issues: 프로젝트 이슈 트래커

---

**축하합니다! 🎉 Meditation Share가 성공적으로 배포되었습니다!**

