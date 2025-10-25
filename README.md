# Meditation Share

설교 말씀을 중심으로 묵상과 신앙 고백을 나누는 소셜 플랫폼입니다.

## 🌟 주요 기능

### MVP 기능
- ✅ **설교 기록 포스트 작성**: 제목, 본문, 성경 구절, 태그, 공개 범위 설정
- ✅ **성경 구절 검색**: 개역한글판 (KorRV) 전체 66권 조회, 한글/약어 지원
- ✅ **피드 (타임라인)**: 전체/교회/팔로잉 필터
- ✅ **댓글 & 응원 (리액션)**: 감사, 기도, 아멘, 은혜 리액션
- ✅ **교회/그룹 기능**: 교회 생성, 가입, 관리
- ✅ **온보딩**: 사용자 프로필 설정 및 교회 가입
- ✅ **인증 시스템**: 이메일 기반 회원가입/로그인

### 향후 추가 예정
- 🎵 설교 오디오/영상 업로드
- 🏆 묵상 챌린지
- 💬 소그룹 채팅
- 📊 목회자 대시보드
- 🙏 기도 제목 피드
- 🍎 iOS 앱 빌드

## 🛠 기술 스택

### Frontend
- **Next.js 14** - React 프레임워크 (App Router)
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링

### Backend & Database
- **Supabase** - PostgreSQL 데이터베이스, 인증, Row Level Security
- **Supabase Auth** - 이메일 인증, 소셜 로그인 (확장 가능)

### Mobile
- **Capacitor** - 웹 앱을 네이티브 앱으로 변환 (Android, iOS)

### 배포
- **Vercel** (권장) - Next.js 최적화 호스팅
- **Google Play Store** - Android 앱 배포

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+ 
- npm 또는 yarn
- Supabase 계정

### 1. 저장소 클론

```bash
git clone https://github.com/your-repo/meditation-share.git
cd meditation-share
```

### 2. 의존성 설치

```bash
npm install
```

### 3. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정에서 API URL과 anon key 복사
3. SQL 에디터에서 마이그레이션 실행:

```bash
# supabase/migrations/001_initial_schema.sql 파일의 내용을 
# Supabase SQL Editor에 복사하여 실행
```

### 4. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 📱 모바일 앱 빌드 (Android)

Capacitor를 사용하여 Android 앱을 빌드할 수 있습니다.

### 사전 요구사항
- Android Studio 설치
- JDK 17 이상
- Android SDK (API Level 22+)

### 빌드 명령어

```bash
# NextJS 앱 빌드 및 Capacitor와 동기화
npm run build:android

# Android Studio 열기
npm run open:android

# 에뮬레이터/기기에서 직접 실행
npm run cap:run:android
```

### 자세한 가이드
Android 앱 빌드 및 배포에 대한 자세한 내용은 [ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md)를 참조하세요.

### 6. 성경 데이터 준비 (선택)

성경 구절 검색 기능을 사용하려면:

```bash
cd supabase/bible/util
node split-bible.js
```

이 스크립트는 15MB의 KorRV.json 파일을 66개의 작은 책 파일로 분할합니다.
성경 검색 기능 상세 가이드: [supabase/bible/USAGE.md](supabase/bible/USAGE.md)

## 📁 프로젝트 구조

```
meditation-share/
├── app/                      # Next.js App Router 페이지
│   ├── auth/                # 인증 관련 페이지
│   │   ├── login/
│   │   └── signup/
│   ├── feed/                # 메인 피드
│   ├── posts/               # 포스트 관련
│   │   ├── new/            # 새 포스트 작성
│   │   └── [id]/           # 포스트 상세
│   ├── churches/            # 교회 관련
│   │   ├── new/            # 새 교회 생성
│   │   └── [id]/           # 교회 상세
│   ├── onboarding/          # 온보딩 플로우
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx             # 랜딩 페이지
│   └── globals.css          # 전역 스타일
├── components/              # 재사용 가능한 컴포넌트
│   ├── Layout.tsx          # 메인 레이아웃
│   └── PostCard.tsx        # 포스트 카드
├── lib/                     # 유틸리티 & API
│   ├── supabase.ts         # Supabase 클라이언트
│   ├── auth.ts             # 인증 함수
│   └── api/                # API 함수들
│       ├── posts.ts
│       ├── comments.ts
│       ├── reactions.ts
│       ├── churches.ts
│       └── bible.ts        # 성경 구절 조회
├── android/                 # Capacitor Android 프로젝트
│   ├── app/                # Android 앱 소스
│   └── key.properties.example # 앱 서명 설정 예제
├── supabase/
│   ├── migrations/          # DB 마이그레이션
│   └── bible/              # 성경 데이터
│       ├── raw/            # 원본 JSON 파일
│       │   ├── KorRV.json  # 개역한글판
│       │   └── KorHKJV.json # 킹제임스
│       ├── util/           # 유틸리티 스크립트
│       │   ├── split-bible.js
│       │   └── test-bible-api.ts
│       ├── KorRV/          # 개역한글판 분할 데이터
│       │   └── books/      # 책별 분할 JSON (66개)
│       └── README.md       # 저작권 & 가이드
├── public/                  # 정적 파일
├── capacitor.config.ts      # Capacitor 설정
└── out/                     # NextJS 빌드 출력 (static export)
```

## 📖 문서

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - 전체 시스템 아키텍처 상세 설명
  - 프로젝트 구조 및 설계 원칙
  - 데이터베이스 ERD 및 RLS 정책
  - API 레이어 설계
  - 프론트엔드 아키텍처
  - 성능 최적화 전략
- **[ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md)** - Android 앱 빌드 및 배포 가이드
  - Android Studio 설정
  - 개발 빌드 및 테스트
  - 프로덕션 빌드 (APK/AAB)
  - Google Play Store 배포
  - 트러블슈팅
- **[supabase/bible/USAGE.md](supabase/bible/USAGE.md)** - 성경 구절 검색 가이드
  - API 사용법 및 예시
  - 지원하는 책 이름 및 약어
  - UI 컴포넌트 사용법
  - 성능 최적화 전략

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- **profiles** - 사용자 프로필
- **churches** - 교회 정보
- **church_members** - 교회 멤버십 (다대다 관계)
- **posts** - 묵상/설교 포스트
- **comments** - 댓글
- **reactions** - 리액션 (감사, 기도, 아멘, 은혜)
- **notifications** - 알림
- **follows** - 팔로우 관계
- **bookmarks** - 북마크

### 보안
- Row Level Security (RLS) 활성화
- 공개 범위별 접근 제어 (public, church, friends, private)
- 교회 멤버만 교회 게시물 접근 가능

## 🎨 UI/UX 가이드

### 디자인 원칙
- **온화한 색조**: 크림/베이지, 딥 네이비
- **여백 중심**: 깔끔하고 읽기 편한 레이아웃
- **안전한 공간**: 비판 없는 격려 중심 커뮤니티

### 컬러 팔레트
- Primary: `#577fa3` (네이비 블루)
- Cream: `#f5f1ea` (따뜻한 베이지)

## 📱 API 엔드포인트

### 포스트
- `POST /api/posts` - 새 포스트 작성
- `GET /api/posts` - 피드 조회 (필터링)
- `GET /api/posts/{id}` - 포스트 상세
- `PUT /api/posts/{id}` - 포스트 수정
- `DELETE /api/posts/{id}` - 포스트 삭제

### 댓글
- `POST /api/posts/{id}/comments` - 댓글 작성
- `GET /api/posts/{id}/comments` - 댓글 조회

### 교회
- `POST /api/churches` - 교회 생성
- `GET /api/churches` - 교회 목록
- `POST /api/churches/join` - 교회 가입 (초대 코드)

### 인증
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃

## 🧪 테스트 계정

개발 환경에서 테스트용 계정을 만들어 사용하세요:

```typescript
Email: test@example.com
Password: test123456
```

## 📝 커뮤니티 가이드라인

### 비판 금지 원칙
- 공격적이거나 비판적인 표현 금지
- 격려와 응원 중심의 댓글
- 신고 기능 활용

### 게시물 공개 범위
- **전체 공개**: 모든 사용자에게 공개
- **교회 공개**: 같은 교회 멤버에게만 공개
- **친구 공개**: 팔로우 관계에게만 공개
- **비공개**: 본인만 볼 수 있음

## 🚀 배포

### Vercel 배포

1. [Vercel](https://vercel.com)에 프로젝트 import
2. 환경 변수 설정 (Supabase URL, Key)
3. 배포 완료!

```bash
# 또는 CLI 사용
npm install -g vercel
vercel
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License.

## 📞 문의

프로젝트 관련 문의나 버그 리포트는 GitHub Issues를 이용해주세요.

---

**Made with ❤️ for the Christian community**

