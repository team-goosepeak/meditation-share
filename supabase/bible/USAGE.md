# 성경 구절 조회 시스템 사용 가이드

## 📚 개요

KorRV (개역한글판) 성경 데이터를 JSON 파일 기반으로 조회할 수 있는 시스템입니다.

### 주요 기능
- ✅ 66권 성경책 전체 지원
- ✅ 책별로 분할된 JSON (빠른 로딩)
- ✅ 한글 책 이름 및 약어 지원
- ✅ 자동완성 지원
- ✅ 구절 범위 조회 (예: 1:1-5)
- ✅ 클라이언트 캐싱

---

## 🚀 빠른 시작

### 1. JSON 분할 (이미 완료됨)

```bash
cd supabase/bible/util
node split-bible.js
```

### 2. API 사용 예시

```typescript
import { searchBible, getBibleVerses } from '@/lib/api/bible'

// 방법 1: 문자열로 검색
const result = await searchBible('요한복음 3:16')
console.log(result.verses[0].text)

// 방법 2: 직접 조회
const verses = await getBibleVerses('요한복음', 3, 16, 18)
console.log(verses) // 3:16-18 범위 조회
```

### 3. UI에서 사용

포스트 작성 페이지(`/posts/new`)에서 성경 구절을 추가할 수 있습니다:

1. 드롭다운에서 성경책 선택
2. 장, 절 번호 입력
3. "미리보기" 버튼 클릭하여 내용 확인
4. "추가" 버튼으로 포스트에 추가

---

## 📖 API 문서

### `searchBible(query: string)`

문자열로 성경 구절을 검색합니다.

**지원 형식:**
- `"요한복음 3:16"` - 단일 구절
- `"요한복음 3:16-18"` - 구절 범위
- `"요 3:16"` - 약어 사용
- `"창 1:1-3"` - 약어 + 범위

**예시:**
```typescript
const result = await searchBible('시편 23:1')

if (result) {
  console.log(result.book)        // "시편"
  console.log(result.chapter)     // 23
  console.log(result.verseFrom)   // 1
  console.log(result.verses[0].text) // "여호와는 나의 목자시니..."
}
```

---

### `getBibleVerses(bookName, chapter, verseFrom, verseTo?)`

직접 책, 장, 절을 지정하여 조회합니다.

**파라미터:**
- `bookName: BibleBookName` - 한글 책 이름 (예: "요한복음")
- `chapter: number` - 장 번호
- `verseFrom: number` - 시작 절
- `verseTo?: number` - 종료 절 (선택)

**예시:**
```typescript
const result = await getBibleVerses('요한복음', 3, 16, 17)

result.verses.forEach(verse => {
  console.log(`${verse.verse}. ${verse.text}`)
})
```

---

### `getAllBookNames()`

모든 성경책 이름 목록을 반환합니다 (드롭다운 등에서 사용).

**예시:**
```typescript
const books = getAllBookNames()
// ["창세기", "출애굽기", ..., "요한계시록"]

<select>
  {books.map(book => (
    <option key={book} value={book}>{book}</option>
  ))}
</select>
```

---

## 📝 지원하는 약어

| 책 이름 | 약어 | 책 이름 | 약어 |
|---------|------|---------|------|
| 창세기 | 창 | 마태복음 | 마 |
| 출애굽기 | 출 | 마가복음 | 막 |
| 요한복음 | 요 | 누가복음 | 눅 |
| 사무엘상 | 삼상 | 사무엘하 | 삼하 |
| 열왕기상 | 왕상 | 열왕기하 | 왕하 |

전체 약어 목록은 `lib/api/bible.ts`의 `BIBLE_BOOK_ALIASES` 참고

---

## 🎨 UI 사용 방법

### 포스트 작성 페이지에서 성경 구절 추가

1. **성경책 선택**: 드롭다운에서 66권 중 선택
2. **장/절 입력**: 숫자로 입력 (끝 절은 선택사항)
3. **미리보기**: 클릭하여 구절 내용 확인
4. **추가**: 확인 후 포스트에 추가

**특징:**
- 📖 66권 전체 드롭다운 지원
- 👀 실시간 미리보기
- ✅ 내용 확인 후 추가
- 🎯 명확한 입력 필드 레이블

**예시 입력:**
- 요한복음 3장 16절
- 창세기 1장 1절부터 3절까지
- 시편 23장 1절

---

## 🧪 테스트 방법

### 1. 개발 서버 실행

```bash
npm run dev
```

### 2. 포스트 작성 페이지 접속

```
http://localhost:3000/posts/new
```

### 3. 성경 구절 입력 테스트

다음 구절들을 입력해보세요:

- 성경책: **요한복음** / 장: **3** / 시작 절: **16**
- 성경책: **창세기** / 장: **1** / 시작 절: **1** / 끝 절: **3**
- 성경책: **시편** / 장: **23** / 시작 절: **1**

---

## 🔧 성능 최적화

### 1. 책별 분할
- 15MB JSON → 66개의 작은 파일
- 필요한 책만 로드
- 평균 파일 크기: ~200KB

### 2. 메모리 캐싱
```typescript
// 한 번 로드한 책은 캐시에 저장
const bookCache = new Map<string, any>()
```

### 3. HTTP 캐싱
```typescript
// API 라우트에서 1년 캐싱
'Cache-Control': 'public, max-age=31536000, immutable'
```

---

## 📂 파일 구조

```
supabase/bible/
├── raw/                    # 원본 데이터
│   ├── KorRV.json         # 개역한글판 (15MB)
│   └── KorHKJV.json       # 킹제임스 (사용 안 함)
├── util/                   # 유틸리티 스크립트
│   ├── split-bible.js     # 분할 스크립트
│   └── test-bible-api.ts  # 테스트 예시
├── KorRV/                  # 개역한글판 분할 데이터
│   └── books/             # 분할된 책들
│       ├── index.json     # 책 목록
│       ├── 01_Genesis.json
│       ├── 02_Exodus.json
│       ├── ...
│       └── 66_Revelation of John.json
├── README.md               # 저작권 정보
├── USAGE.md                # 이 문서
└── CHANGELOG.md            # 변경 이력

lib/api/
└── bible.ts                # 성경 조회 API

app/api/bible/books/[filename]/
└── route.ts                # 파일 서빙 API

components/
└── PostCard.tsx            # 구절 표시 (수정됨)

app/posts/new/
└── page.tsx                # 작성 페이지 (성경 입력 기능 포함)
```

---

## 🐛 문제 해결

### Q: "Book not found" 오류

**원인:** 책 파일이 없거나 파일명이 잘못됨

**해결:**
```bash
cd supabase/bible/util
node split-bible.js
```

### Q: 한글 깨짐

**원인:** 인코딩 문제

**해결:** 
- JSON 파일이 UTF-8로 저장되었는지 확인
- `fs.readFile(path, 'utf8')` 사용

### Q: 검색이 안 됨

**원인:** 책 이름 오타 또는 미지원 약어

**해결:**
- `getAllBookNames()` 로 지원하는 책 이름 확인
- `BIBLE_BOOK_ALIASES` 에서 약어 확인

---

## 📊 데이터 구조

### BibleReference
```typescript
{
  book: "요한복음",
  bookEnglish: "John",
  chapter: 3,
  verseFrom: 16,
  verseTo: 16,
  verses: [
    {
      verse: 16,
      chapter: 3,
      name: "John 3:16",
      text: "하나님이 세상을 이처럼 사랑하사..."
    }
  ]
}
```

### Scripture (Post에 저장)
```typescript
{
  book: "요한복음",
  chapter: 3,
  verseFrom: 16,
  verseTo?: 18,
  text?: "하나님이 세상을 이처럼 사랑하사..."
}
```

---

## 📜 저작권

**개역한글판 (KorRV)** 사용 중
- 대한성서공회 소유
- 저작재산권 보호기간 경과
- 인격권 유지 (성명 표시 필요)

자세한 내용은 `README.md` 참조

---

## 🎯 향후 개선 사항

- [ ] 전문 검색 (구절 내용으로 검색)
- [ ] 여러 번역본 지원 (KorHKJV 추가)
- [ ] 교차 참조 기능
- [ ] 즐겨찾기 구절
- [ ] 최근 검색 히스토리
- [ ] 오디오 낭독 기능

---

문의사항이 있으시면 이슈를 등록해주세요! 🙏

