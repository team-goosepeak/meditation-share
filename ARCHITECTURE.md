# Worship Reflection 아키텍처 문서

## 📐 전체 시스템 아키텍처

### 시스템 개요

Worship Reflection는 **3-Tier 아키텍처**를 기반으로 설계된 풀스택 웹 애플리케이션입니다:

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (Frontend)       │
│         Next.js 14 + React + TypeScript     │
└─────────────────────────────────────────────┘
                    ↓ HTTP/REST
┌─────────────────────────────────────────────┐
│         Application Layer (API)             │
│         Supabase Client SDK                 │
└─────────────────────────────────────────────┘
                    ↓ PostgreSQL Protocol
┌─────────────────────────────────────────────┐
│         Data Layer (Database + Auth)        │
│         Supabase (PostgreSQL + Auth)        │
└─────────────────────────────────────────────┘
```

### 기술 스택 선택 근거

1. **Next.js 14 (App Router)**
   - Server-Side Rendering (SSR)과 Static Generation을 통한 SEO 최적화
   - App Router의 레이아웃 시스템으로 효율적인 UI 구조화
   - API Routes 없이 직접 Supabase와 통신하여 간결한 아키텍처
   - React Server Components로 초기 로딩 성능 개선

2. **Supabase**
   - PostgreSQL 기반의 확장 가능한 데이터베이스
   - Row Level Security (RLS)를 통한 데이터 접근 제어
   - 실시간 구독 기능 (향후 활용 가능)
   - 내장 인증 시스템으로 개발 시간 단축
   - 자동 API 생성으로 백엔드 개발 최소화

3. **TypeScript**
   - 컴파일 타임 타입 체크로 런타임 오류 사전 방지
   - IDE 자동완성으로 개발 생산성 향상
   - 명시적 타입 정의로 코드 가독성 및 유지보수성 개선

4. **Tailwind CSS**
   - 유틸리티 우선 접근으로 빠른 UI 개발
   - 일관된 디자인 시스템 구축
   - 번들 크기 최적화 (미사용 CSS 자동 제거)

---

## 🏗 프로젝트 구조 및 설계 원칙

### 디렉토리 구조

```
meditation-share/
├── app/                           # Next.js App Router 페이지
│   ├── layout.tsx                # 루트 레이아웃 (전역 설정)
│   ├── page.tsx                  # 랜딩 페이지
│   ├── globals.css               # 전역 스타일
│   │
│   ├── auth/                     # 인증 관련 페이지 그룹
│   │   ├── login/page.tsx       # 로그인 페이지
│   │   └── signup/page.tsx      # 회원가입 페이지
│   │
│   ├── feed/                     # 피드 페이지
│   │   └── page.tsx             # 메인 타임라인
│   │
│   ├── posts/                    # 포스트 관련 페이지
│   │   ├── new/page.tsx         # 새 포스트 작성
│   │   └── [id]/page.tsx        # 포스트 상세 (동적 라우팅)
│   │
│   ├── churches/                 # 교회 관련 페이지
│   │   ├── page.tsx             # 교회 목록
│   │   ├── new/page.tsx         # 새 교회 생성
│   │   └── [id]/page.tsx        # 교회 상세
│   │
│   └── onboarding/               # 온보딩 플로우
│       └── page.tsx             # 3단계 온보딩
│
├── components/                    # 재사용 가능한 UI 컴포넌트
│   ├── Layout.tsx                # 인증된 사용자용 레이아웃
│   └── PostCard.tsx              # 포스트 카드 컴포넌트
│
├── lib/                          # 비즈니스 로직 및 유틸리티
│   ├── supabase.ts               # Supabase 클라이언트 & 타입 정의
│   ├── auth.ts                   # 인증 관련 함수
│   │
│   └── api/                      # 도메인별 API 함수 그룹
│       ├── posts.ts              # 포스트 CRUD 및 조회
│       ├── comments.ts           # 댓글 CRUD
│       ├── reactions.ts          # 리액션 추가/제거
│       └── churches.ts           # 교회 관리
│
└── supabase/
    └── migrations/               # 데이터베이스 스키마 버전 관리
        ├── 001_initial_schema.sql      # 초기 스키마
        └── 002_fix_rls_policies.sql    # RLS 정책 수정
```

### 설계 원칙

#### 1. **도메인 기반 구조화 (Domain-Driven Structure)**

각 비즈니스 도메인(포스트, 교회, 댓글 등)을 독립적인 모듈로 분리하여 관리합니다:

```
lib/api/
  ├── posts.ts      → 포스트 관련 모든 로직
  ├── comments.ts   → 댓글 관련 모든 로직
  ├── reactions.ts  → 리액션 관련 모든 로직
  └── churches.ts   → 교회 관련 모든 로직
```

**장점:**
- 기능 추가/수정 시 해당 도메인 파일만 수정
- 코드 충돌 최소화
- 팀 협업 시 역할 분담 용이

#### 2. **컴포넌트 재사용 원칙 (Component Reusability)**

UI 컴포넌트는 다음 기준으로 분리합니다:

- **Page Components** (`app/` 디렉토리): 라우팅과 직접 연결된 컴포넌트
- **Shared Components** (`components/` 디렉토리): 여러 페이지에서 재사용되는 컴포넌트

```typescript
// 예: PostCard는 feed, 교회 상세, 프로필 등 여러 곳에서 재사용
<PostCard post={post} onReactionUpdate={reload} />
```

#### 3. **타입 안정성 (Type Safety)**

모든 데이터 모델은 `lib/supabase.ts`에서 중앙 관리합니다:

```typescript
export type Post = {
  id: string
  author_id: string
  title: string
  body: string
  // ... 모든 필드 명시
}
```

**적용 방법:**
- 데이터베이스 스키마와 TypeScript 타입을 1:1 매칭
- API 함수의 입력/출력 타입 명시
- 컴파일 시점에 타입 불일치 감지

#### 4. **클라이언트 사이드 데이터 페칭 (Client-Side Data Fetching)**

이 프로젝트는 대부분의 페이지에서 클라이언트 사이드 렌더링(CSR)을 사용합니다:

```typescript
'use client'  // 클라이언트 컴포넌트 명시

const [posts, setPosts] = useState<Post[]>([])

useEffect(() => {
  loadPosts()
}, [])

async function loadPosts() {
  const data = await getPosts()
  setPosts(data)
}
```

**선택 이유:**
- 사용자별 맞춤 콘텐츠 (인증 상태 기반)
- 실시간 업데이트 가능성 (향후)
- 인터랙션이 많은 소셜 플랫폼 특성

---

## 🗄 데이터베이스 아키텍처

### ERD (Entity Relationship Diagram)

```
┌─────────────┐         ┌─────────────┐
│   profiles  │         │  churches   │
│             │         │             │
│ - id (PK)   │         │ - id (PK)   │
│ - email     │         │ - name      │
│ - name      │         │ - join_code │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │  ┌────────────────────┘
       │  │
       │  │  ┌──────────────────┐
       └──┼──│ church_members   │
          │  │                  │
          │  │ - church_id (FK) │
          │  │ - user_id (FK)   │
          │  └──────────────────┘
          │
          │  ┌──────────────────┐
          └──│     posts        │
             │                  │
             │ - id (PK)        │
             │ - author_id (FK) │
             │ - church_id (FK) │
             │ - visibility     │
             └────────┬─────────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
    ┌─────▼────┐ ┌───▼────┐ ┌───▼────┐
    │ comments │ │reactions│ │bookmarks│
    └──────────┘ └─────────┘ └────────┘
```

### 테이블 설계 상세

#### 1. **profiles** (사용자 프로필)
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**설계 결정:**
- Supabase Auth의 `auth.users`와 1:1 관계
- `id`를 외래키로 사용하여 인증과 프로필 자동 연결
- `role` 필드로 권한 관리 (member/pastor/admin)

#### 2. **churches** (교회)
```sql
CREATE TABLE public.churches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  description TEXT,
  pastor_id UUID REFERENCES public.profiles(id),
  join_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**설계 결정:**
- `join_code`: 8자리 무작위 코드로 교회 초대 기능 구현
- `pastor_id`: 교회 생성자 추적 (향후 관리자 권한 확장 가능)
- UNIQUE 제약으로 중복 초대 코드 방지

#### 3. **church_members** (교회 멤버십 - 다대다 관계)
```sql
CREATE TABLE public.church_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(church_id, user_id)
);
```

**설계 결정:**
- 사용자-교회 다대다 관계 (한 사용자가 여러 교회 가입 가능)
- `UNIQUE(church_id, user_id)`: 중복 가입 방지
- `ON DELETE CASCADE`: 교회나 사용자 삭제 시 멤버십도 자동 삭제

#### 4. **posts** (포스트)
```sql
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  church_id UUID REFERENCES public.churches(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scriptures JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  visibility TEXT DEFAULT 'public',
  sermon_date DATE,
  sermon_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**설계 결정:**
- `scriptures JSONB`: 여러 성경 구절을 유연하게 저장
  ```json
  [
    {"book": "요한복음", "chapter": 3, "verseFrom": 16, "verseTo": 18}
  ]
  ```
- `tags TEXT[]`: PostgreSQL 배열 타입으로 태그 관리
- `visibility`: 공개 범위 제어 (public/church/friends/private)
- `church_id ON DELETE SET NULL`: 교회 삭제 시 포스트는 유지

### Row Level Security (RLS) 정책

#### 문제 상황과 해결

**발생한 문제:**
```sql
-- ❌ 잘못된 정책 (무한 재귀 발생)
CREATE POLICY "Church members are viewable by church members"
  ON public.church_members FOR SELECT
  USING (
    church_id IN (
      SELECT church_id FROM public.church_members WHERE user_id = auth.uid()
    )
  );
```

`church_members` 테이블의 SELECT 정책이 다시 `church_members` 테이블을 조회하면서 **무한 재귀**가 발생했습니다.

**해결 방법:**
```sql
-- ✅ 수정된 정책 (재귀 방지)
CREATE POLICY "Users can view their own memberships"
  ON public.church_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view members of their churches"
  ON public.church_members FOR SELECT
  USING (
    church_id IN (
      SELECT cm.church_id 
      FROM public.church_members cm 
      WHERE cm.user_id = auth.uid()
    )
  );
```

**핵심 개선사항:**
1. **정책 분리**: 자기 자신의 멤버십과 같은 교회 멤버 조회를 별도 정책으로 분리
2. **명시적 테이블 별칭**: `cm`을 사용하여 서브쿼리와 메인 쿼리를 명확히 구분
3. **간단한 첫 번째 정책**: `user_id = auth.uid()`는 재귀 없이 즉시 평가 가능

#### RLS 정책 구조

```
┌────────────────────────────────────────────┐
│         Client Request                     │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│   Supabase Auth (JWT Token Validation)    │
└───────────────┬────────────────────────────┘
                │ auth.uid()
                ▼
┌────────────────────────────────────────────┐
│   PostgreSQL + RLS Policies                │
│                                            │
│   1. 요청 테이블의 정책 확인                │
│   2. USING 절 평가                         │
│   3. 조건 만족 시에만 데이터 반환           │
└────────────────────────────────────────────┘
```

**각 테이블의 RLS 정책 전략:**

1. **profiles**: 모든 프로필은 공개, 본인만 수정 가능
2. **churches**: 모든 교회는 공개 (검색 가능), 목회자만 수정
3. **church_members**: 본인 멤버십 + 같은 교회 멤버 조회 가능
4. **posts**: visibility에 따라 접근 제어
   - `public`: 모두 조회 가능
   - `church`: 같은 교회 멤버만 조회 가능
   - `friends`: 팔로우 관계만 조회 가능
   - `private`: 작성자만 조회 가능

---

## 🔐 인증 및 권한 관리

### 인증 플로우

```
┌──────────────┐
│  회원가입     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│ Supabase Auth: 사용자 생성        │
│ - email/password 저장             │
│ - JWT 토큰 발급                   │
└──────┬───────────────────────────┘
       │
       ▼ (Trigger: on_auth_user_created)
┌──────────────────────────────────┐
│ profiles 테이블: 자동 레코드 생성  │
│ - display_name 설정              │
│ - email 복사                     │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ 온보딩 페이지로 리다이렉트         │
│ - 프로필 완성                     │
│ - 교회 가입 (선택)                │
│ - 관심사 선택                     │
└──────────────────────────────────┘
```

### 구현 상세

#### 1. 회원가입 함수
```typescript
// lib/auth.ts
export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,  // 메타데이터로 전달
      },
    },
  })
  
  if (error) throw error
  return data
}
```

#### 2. 자동 프로필 생성 트리거
```sql
-- supabase/migrations/001_initial_schema.sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'display_name', 
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**설계 이유:**
- 인증(auth.users)과 프로필(profiles)을 분리하여 확장성 확보
- 트리거로 자동화하여 수동 에러 방지
- `SECURITY DEFINER`로 RLS 우회 (시스템 작업)

#### 3. 세션 관리

```typescript
// components/Layout.tsx
useEffect(() => {
  checkAuth()
}, [])

async function checkAuth() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    router.push('/auth/login')  // 미인증 시 로그인 페이지로
  }
}
```

---

## 📡 API 레이어 설계

### API 함수 구조화 원칙

각 도메인별 API 파일은 다음 패턴을 따릅니다:

```typescript
// lib/api/posts.ts 구조 예시

// 1. 생성 (Create)
export async function createPost(data: CreatePostData): Promise<Post> {
  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  // 데이터 삽입
  const { data, error } = await supabase
    .from('posts')
    .insert({ ...data, author_id: user.id })
    .select('*, author:profiles(*), church:churches(*)')
    .single()
  
  if (error) throw error
  return data
}

// 2. 조회 (Read)
export async function getPosts(options: GetPostsOptions): Promise<Post[]> {
  let query = supabase
    .from('posts')
    .select('*, author:profiles(*), church:churches(*)')
    .order('created_at', { ascending: false })
  
  // 필터 적용
  if (options.churchId) {
    query = query.eq('church_id', options.churchId)
  }
  
  // 페이지네이션
  if (options.limit) {
    query = query.range(options.offset, options.offset + options.limit - 1)
  }
  
  const { data, error } = await query
  if (error) throw error
  
  // 관계 데이터 추가 (리액션, 댓글 카운트)
  return await enrichPostsWithCounts(data)
}

// 3. 수정 (Update)
export async function updatePost(postId: string, updates: Partial<Post>): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// 4. 삭제 (Delete)
export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
  
  if (error) throw error
}
```

### 데이터 가져오기 전략

#### 1. **Eager Loading (즉시 로딩)**

관련 데이터를 한 번에 가져옵니다:

```typescript
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    author:profiles(*),
    church:churches(*)
  `)
```

**장점:**
- N+1 쿼리 문제 방지
- 네트워크 왕복 최소화

#### 2. **Count 쿼리 분리**

리액션과 댓글 수는 별도로 집계:

```typescript
async function enrichPostsWithCounts(posts: Post[]) {
  return await Promise.all(
    posts.map(async (post) => {
      // 리액션 카운트
      const { data: reactions } = await supabase
        .from('reactions')
        .select('type')
        .eq('post_id', post.id)
      
      // 댓글 카운트
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id)
      
      return {
        ...post,
        reactions_count: aggregateReactions(reactions),
        comments_count: count || 0
      }
    })
  )
}
```

**이유:**
- 메인 쿼리 복잡도 감소
- 유연한 집계 로직

---

## 🎨 프론트엔드 아키텍처

### 페이지 라우팅 구조

Next.js App Router의 파일 시스템 기반 라우팅:

```
app/
├── page.tsx                    → /
├── feed/page.tsx              → /feed
├── posts/
│   ├── new/page.tsx          → /posts/new
│   └── [id]/page.tsx         → /posts/:id
└── churches/
    ├── page.tsx              → /churches
    ├── new/page.tsx          → /churches/new
    └── [id]/page.tsx         → /churches/:id
```

**동적 라우팅 처리:**
```typescript
// app/posts/[id]/page.tsx
export default function PostDetailPage() {
  const params = useParams()
  const postId = params.id as string
  
  // postId를 사용하여 데이터 로드
}
```

### 상태 관리 전략

이 프로젝트는 **로컬 상태 관리**를 사용합니다 (Redux/Zustand 없음):

```typescript
// 페이지 레벨에서 상태 관리
const [posts, setPosts] = useState<Post[]>([])
const [isLoading, setIsLoading] = useState(true)

// 데이터 로드
useEffect(() => {
  loadPosts()
}, [filter])

// 새로고침 함수를 자식 컴포넌트에 전달
<PostCard 
  post={post} 
  onReactionUpdate={loadPosts}  // 콜백으로 부모 상태 업데이트
/>
```

**선택 이유:**
- 각 페이지가 독립적 (전역 상태 공유 불필요)
- 코드 복잡도 감소
- 페이지 전환 시 자연스러운 데이터 새로고침

### UI 컴포넌트 패턴

#### 1. **Container/Presentational 패턴**

```typescript
// Container: 데이터 로직 (app/feed/page.tsx)
export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  
  async function loadPosts() {
    const data = await getPosts()
    setPosts(data)
  }
  
  return (
    <Layout>
      {posts.map(post => (
        <PostCard post={post} onReactionUpdate={loadPosts} />
      ))}
    </Layout>
  )
}

// Presentational: UI 렌더링 (components/PostCard.tsx)
export default function PostCard({ post, onReactionUpdate }: PostCardProps) {
  async function handleReaction(type: ReactionType) {
    await addReaction(post.id, type)
    onReactionUpdate?.()  // 부모에게 업데이트 알림
  }
  
  return (
    <div className="card">
      {/* UI 렌더링 */}
    </div>
  )
}
```

#### 2. **레이아웃 중첩**

```
┌─────────────────────────────────────┐
│  app/layout.tsx (전역 레이아웃)      │
│  - HTML 구조                        │
│  - 전역 스타일                       │
│  ┌─────────────────────────────────┐│
│  │ components/Layout.tsx           ││
│  │ - 네비게이션                     ││
│  │ - 사이드바                       ││
│  │  ┌─────────────────────────────┐││
│  │  │ 페이지 컨텐츠               │││
│  │  │ (app/feed/page.tsx 등)     │││
│  │  └─────────────────────────────┘││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## 🚀 성능 최적화 전략

### 1. 데이터베이스 인덱스

```sql
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_church_id ON public.posts(church_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
```

**효과:**
- 작성자별 포스트 조회 속도 향상
- 교회별 필터링 성능 개선
- 최신순 정렬 최적화

### 2. 이미지 최적화 (향후)

```typescript
import Image from 'next/image'

<Image
  src={avatarUrl}
  width={40}
  height={40}
  alt="Profile"
/>
```

Next.js의 자동 이미지 최적화 활용

### 3. 페이지네이션

```typescript
const { data } = await supabase
  .from('posts')
  .select('*')
  .range(offset, offset + limit - 1)  // LIMIT & OFFSET
```

한 번에 20개씩 로드하여 초기 로딩 속도 개선

---

## 🔧 이번 오류 수정 내용

### 문제 진단

**오류 메시지:**
```
code: "42P17"
message: "infinite recursion detected in policy for relation \"church_members\""
```

### 근본 원인

Row Level Security 정책에서 **순환 참조**가 발생:

```sql
-- ❌ 문제의 정책
CREATE POLICY "Church members are viewable by church members"
  ON public.church_members FOR SELECT
  USING (
    church_id IN (
      SELECT church_id FROM public.church_members WHERE user_id = auth.uid()
      -- ↑ church_members 테이블을 조회하는 정책이
      -- ↓ 다시 church_members 테이블을 조회 → 무한 재귀
    )
  );
```

### 해결 방법

정책을 두 개로 분리하여 재귀 방지:

```sql
-- ✅ 해결 1: 자기 자신의 멤버십은 항상 조회 가능
CREATE POLICY "Users can view their own memberships"
  ON public.church_members FOR SELECT
  USING (user_id = auth.uid());
  -- 단순 비교로 즉시 평가, 재귀 없음

-- ✅ 해결 2: 같은 교회 멤버 조회 (명시적 별칭 사용)
CREATE POLICY "Users can view members of their churches"
  ON public.church_members FOR SELECT
  USING (
    church_id IN (
      SELECT cm.church_id 
      FROM public.church_members cm  -- 별칭 'cm' 사용
      WHERE cm.user_id = auth.uid()
    )
  );
```

### 마이그레이션 적용 방법

1. Supabase SQL Editor 접속
2. `supabase/migrations/002_fix_rls_policies.sql` 내용 복사
3. 실행하여 정책 업데이트
4. 개발 서버 재시작

---

## 📊 모니터링 및 디버깅

### Supabase 로그 확인

1. Dashboard → Logs → API
2. 느린 쿼리 식별
3. RLS 정책 에러 확인

### 클라이언트 에러 처리

```typescript
try {
  await createPost(data)
} catch (error: any) {
  console.error('Failed to create post:', error)
  
  // 사용자 친화적 메시지
  if (error.code === '42P17') {
    alert('데이터베이스 설정 오류입니다. 관리자에게 문의하세요.')
  } else {
    alert('게시물 작성에 실패했습니다.')
  }
}
```

---

이 아키텍처 문서는 프로젝트의 전체 구조와 설계 결정을 설명합니다. 새로운 개발자가 프로젝트에 참여하거나, 기능을 추가할 때 이 문서를 참고하여 일관된 구조를 유지할 수 있습니다.

