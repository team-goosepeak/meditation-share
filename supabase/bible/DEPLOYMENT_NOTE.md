# 성경 데이터 배포 가이드

## 📋 개요

성경 데이터는 **서버 측에서만 접근**하여 보안을 유지합니다.

## 🔒 보안 구조

### 개발 환경 (웹)
```
클라이언트 → API Route → 서버 파일 시스템 → JSON 파일
```

- 클라이언트: `/api/bible/books/43_John.json` 호출
- API Route: `app/api/bible/books/[filename]/route.ts`
- 파일 시스템: `supabase/bible/KorRV/books/43_John.json`
- **성경 데이터는 public에 노출되지 않음**

### Android 빌드 환경
```
Static Export → public 폴더 포함
```

- Android 빌드 시에만 `public/bible/` 생성
- 빌드 후 자동 삭제

## 🚀 실행 방법

### 개발 서버 (API Routes 사용)
```bash
npm run dev
# → API Routes 작동
# → 성경 데이터는 서버에서만 접근
```

### Android 빌드 (Static Export)
```bash
npm run build:android
# → prebuild: public/bible/ 생성
# → build: ANDROID_BUILD=true (static export)
# → postbuild: public/bible/ 삭제
```

## ⚙️ 설정 파일

### next.config.js
```javascript
const isAndroidBuild = process.env.ANDROID_BUILD === 'true';

const nextConfig = {
  // Android 빌드 시에만 static export
  ...(isAndroidBuild && {
    output: 'export',
    trailingSlash: true,
  }),
}
```

### package.json
```json
{
  "scripts": {
    "dev": "next dev",  // ← API Routes 사용
    "prebuild:android": "mkdir -p public/bible && cp -r supabase/bible/KorRV/books public/bible/",
    "build:android": "ANDROID_BUILD=true next build && ...",
    "postbuild:android": "rm -rf public/bible"
  }
}
```

## 📁 파일 구조

```
meditation-share/
├── app/api/bible/books/[filename]/
│   └── route.ts              # API Route (서버 전용)
├── lib/api/
│   └── bible.ts              # 성경 조회 로직
├── supabase/bible/
│   ├── KorRV/books/          # 성경 JSON 파일 (서버 전용)
│   ├── raw/                  # 원본 파일 (gitignore)
│   └── util/                 # 유틸리티 스크립트
└── public/                   # public 폴더
    └── bible/                # Android 빌드 시에만 생성
```

## 🔐 보안 이점

### ✅ 장점
1. **데이터 보호**: 성경 JSON 파일이 public에 노출되지 않음
2. **선택적 접근**: API를 통해 필요한 책만 로드
3. **캐싱**: 서버/클라이언트 양쪽에서 캐싱 가능
4. **대역폭 절약**: 사용자가 필요한 데이터만 전송

### ❌ public 폴더에 두면 안 되는 이유
1. 모든 성경 데이터 노출 (약 8MB)
2. 무단 복제 가능
3. 대역폭 낭비
4. 캐시 제어 어려움

## 🐛 트러블슈팅

### Q: API Routes가 작동하지 않아요

**원인**: `output: 'export'`가 활성화되어 있음

**해결**:
```bash
# next.config.js 확인
# ANDROID_BUILD 환경변수 없이 실행
npm run dev
```

### Q: Android 빌드가 실패해요

**확인사항**:
1. `supabase/bible/KorRV/books/` 폴더 존재 확인
2. 빌드 스크립트 순서 확인
3. 디스크 공간 확인 (약 8MB 필요)

## 📊 성능

### API Route 응답 시간
- 첫 요청: ~50-100ms (파일 읽기)
- 캐시 히트: ~1-5ms (메모리)
- HTTP 캐싱: 1년 (브라우저)

### 파일 크기
- 작은 책: ~30KB (룻기)
- 큰 책: ~400KB (창세기)
- 평균: ~120KB

## 📝 주의사항

1. **개발 환경**: API Routes 반드시 사용
2. **Android 빌드**: 자동화된 스크립트 사용
3. **Vercel 배포**: API Routes 자동 지원
4. **성경 데이터**: public 폴더에 커밋 금지

---

**마지막 업데이트**: 2025-10-26

