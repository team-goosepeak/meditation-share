# Meditation Share API 문서

이 문서는 Meditation Share의 API 함수들에 대한 상세한 설명입니다.

## 목차

- [인증 (Authentication)](#인증-authentication)
- [포스트 (Posts)](#포스트-posts)
- [댓글 (Comments)](#댓글-comments)
- [리액션 (Reactions)](#리액션-reactions)
- [교회 (Churches)](#교회-churches)

---

## 인증 (Authentication)

### `signUp(email, password, displayName)`

새 사용자를 등록합니다.

**매개변수:**
- `email` (string): 사용자 이메일
- `password` (string): 비밀번호 (최소 6자)
- `displayName` (string): 사용자 표시 이름

**반환값:** `Promise<AuthResponse>`

**예제:**
```typescript
import { signUp } from '@/lib/auth'

const { user, session } = await signUp(
  'user@example.com',
  'password123',
  '홍길동'
)
```

### `signIn(email, password)`

사용자 로그인을 처리합니다.

**매개변수:**
- `email` (string): 사용자 이메일
- `password` (string): 비밀번호

**반환값:** `Promise<AuthResponse>`

**예제:**
```typescript
import { signIn } from '@/lib/auth'

const { user, session } = await signIn(
  'user@example.com',
  'password123'
)
```

### `signOut()`

사용자 로그아웃을 처리합니다.

**반환값:** `Promise<void>`

### `getCurrentUser()`

현재 로그인한 사용자 정보를 가져옵니다.

**반환값:** `Promise<User | null>`

### `getProfile(userId)`

특정 사용자의 프로필 정보를 가져옵니다.

**매개변수:**
- `userId` (string): 사용자 ID

**반환값:** `Promise<Profile>`

### `updateProfile(userId, updates)`

사용자 프로필을 업데이트합니다.

**매개변수:**
- `userId` (string): 사용자 ID
- `updates` (object): 업데이트할 필드
  - `display_name?` (string): 표시 이름
  - `avatar_url?` (string): 프로필 이미지 URL
  - `bio?` (string): 자기소개

**반환값:** `Promise<Profile>`

---

## 포스트 (Posts)

### `createPost(data)`

새 묵상 포스트를 작성합니다.

**매개변수:**
```typescript
{
  title: string              // 포스트 제목
  body: string               // 포스트 본문
  scriptures?: Scripture[]   // 관련 성경 구절
  tags?: string[]            // 태그 배열
  visibility: 'public' | 'church' | 'friends' | 'private'
  churchId?: string          // 교회 ID (visibility가 'church'일 때)
  sermonDate?: string        // 예배 일시 (ISO 8601)
  sermonLocation?: string    // 예배 장소
}
```

**Scripture 타입:**
```typescript
{
  book: string        // 책명 (예: "요한복음")
  chapter: number     // 장
  verseFrom: number   // 시작 절
  verseTo?: number    // 끝 절 (선택)
}
```

**반환값:** `Promise<Post>`

**예제:**
```typescript
import { createPost } from '@/lib/api/posts'

const post = await createPost({
  title: '2025-10-23 - 사랑의 본질',
  body: '오늘 설교에서 하나님의 사랑에 대해 깊이 묵상했습니다...',
  scriptures: [
    {
      book: '요한복음',
      chapter: 3,
      verseFrom: 16,
      verseTo: 18
    }
  ],
  tags: ['사랑', '은혜'],
  visibility: 'public',
  sermonDate: '2025-10-23',
  sermonLocation: '본당'
})
```

### `getPosts(options)`

포스트 목록을 가져옵니다.

**매개변수:**
```typescript
{
  filter?: 'all' | 'following' | 'church'  // 필터 타입
  churchId?: string                         // 특정 교회 필터링
  userId?: string                           // 특정 사용자 필터링
  limit?: number                            // 가져올 개수 (기본: 20)
  offset?: number                           // 오프셋 (페이지네이션)
}
```

**반환값:** `Promise<Post[]>`

**예제:**
```typescript
import { getPosts } from '@/lib/api/posts'

// 전체 공개 포스트
const allPosts = await getPosts({ filter: 'all' })

// 특정 교회 포스트
const churchPosts = await getPosts({ 
  filter: 'church', 
  churchId: 'church-uuid' 
})

// 페이지네이션
const page2Posts = await getPosts({ 
  limit: 10, 
  offset: 10 
})
```

### `getPost(postId)`

특정 포스트의 상세 정보를 가져옵니다.

**매개변수:**
- `postId` (string): 포스트 ID

**반환값:** `Promise<Post>`

### `updatePost(postId, updates)`

포스트를 수정합니다.

**매개변수:**
- `postId` (string): 포스트 ID
- `updates` (object): 업데이트할 필드

**반환값:** `Promise<Post>`

### `deletePost(postId)`

포스트를 삭제합니다.

**매개변수:**
- `postId` (string): 포스트 ID

**반환값:** `Promise<void>`

---

## 댓글 (Comments)

### `createComment(data)`

포스트에 댓글을 작성합니다.

**매개변수:**
```typescript
{
  postId: string           // 포스트 ID
  body: string             // 댓글 내용
  parentCommentId?: string // 대댓글인 경우 부모 댓글 ID
}
```

**반환값:** `Promise<Comment>`

**예제:**
```typescript
import { createComment } from '@/lib/api/comments'

const comment = await createComment({
  postId: 'post-uuid',
  body: '정말 은혜로운 묵상입니다! 감사합니다.'
})

// 대댓글
const reply = await createComment({
  postId: 'post-uuid',
  body: '저도 같은 마음입니다!',
  parentCommentId: 'parent-comment-uuid'
})
```

### `getComments(postId)`

특정 포스트의 모든 댓글을 가져옵니다.

**매개변수:**
- `postId` (string): 포스트 ID

**반환값:** `Promise<Comment[]>`

### `updateComment(commentId, body)`

댓글을 수정합니다.

**매개변수:**
- `commentId` (string): 댓글 ID
- `body` (string): 수정할 내용

**반환값:** `Promise<Comment>`

### `deleteComment(commentId)`

댓글을 삭제합니다.

**매개변수:**
- `commentId` (string): 댓글 ID

**반환값:** `Promise<void>`

---

## 리액션 (Reactions)

### 리액션 타입

```typescript
type ReactionType = 'heart' | 'pray' | 'amen' | 'thanks'
```

- `heart` (❤️): 감사
- `pray` (🙏): 기도
- `amen` (✨): 아멘
- `thanks` (🙌): 은혜

### `addReaction(postId, type)`

포스트에 리액션을 추가합니다. 이미 같은 타입의 리액션이 있으면 제거합니다 (토글).

**매개변수:**
- `postId` (string): 포스트 ID
- `type` (ReactionType): 리액션 타입

**반환값:** `Promise<Reaction>`

**예제:**
```typescript
import { addReaction } from '@/lib/api/reactions'

await addReaction('post-uuid', 'heart')
await addReaction('post-uuid', 'pray')
```

### `removeReaction(postId, type)`

포스트에서 리액션을 제거합니다.

**매개변수:**
- `postId` (string): 포스트 ID
- `type` (ReactionType): 리액션 타입

**반환값:** `Promise<void>`

### `getPostReactions(postId)`

포스트의 모든 리액션과 카운트를 가져옵니다.

**매개변수:**
- `postId` (string): 포스트 ID

**반환값:**
```typescript
Promise<{
  reactions: Reaction[]
  counts: { type: string; count: number }[]
}>
```

**예제:**
```typescript
import { getPostReactions } from '@/lib/api/reactions'

const { reactions, counts } = await getPostReactions('post-uuid')
// counts: [{ type: 'heart', count: 5 }, { type: 'pray', count: 3 }]
```

### `getUserReactionsForPost(postId)`

현재 사용자가 특정 포스트에 추가한 리액션들을 가져옵니다.

**매개변수:**
- `postId` (string): 포스트 ID

**반환값:** `Promise<ReactionType[]>`

---

## 교회 (Churches)

### `createChurch(data)`

새 교회를 생성합니다. 생성자는 자동으로 관리자가 됩니다.

**매개변수:**
```typescript
{
  name: string         // 교회 이름
  address?: string     // 주소
  description?: string // 설명
}
```

**반환값:** `Promise<Church>` (자동 생성된 `join_code` 포함)

**예제:**
```typescript
import { createChurch } from '@/lib/api/churches'

const church = await createChurch({
  name: '사랑의 교회',
  address: '서울시 강남구...',
  description: '복음을 전하는 교회입니다'
})

console.log(church.join_code) // "ABC12345"
```

### `getChurch(churchId)`

특정 교회의 정보를 가져옵니다.

**매개변수:**
- `churchId` (string): 교회 ID

**반환값:** `Promise<Church>`

### `getChurches()`

모든 교회 목록을 가져옵니다.

**반환값:** `Promise<Church[]>`

### `getUserChurches(userId)`

특정 사용자가 가입한 교회 목록을 가져옵니다.

**매개변수:**
- `userId` (string): 사용자 ID

**반환값:** `Promise<Church[]>`

**예제:**
```typescript
import { getUserChurches, getCurrentUser } from '@/lib/api/churches'

const user = await getCurrentUser()
const myChurches = await getUserChurches(user.id)
```

### `joinChurch(joinCode)`

초대 코드를 사용하여 교회에 가입합니다.

**매개변수:**
- `joinCode` (string): 교회 초대 코드

**반환값:** `Promise<ChurchMember>`

**예제:**
```typescript
import { joinChurch } from '@/lib/api/churches'

try {
  await joinChurch('ABC12345')
  alert('교회에 가입되었습니다!')
} catch (error) {
  if (error.message === 'Already a member of this church') {
    alert('이미 가입한 교회입니다')
  }
}
```

### `leaveChurch(churchId)`

교회에서 탈퇴합니다.

**매개변수:**
- `churchId` (string): 교회 ID

**반환값:** `Promise<void>`

### `getChurchMembers(churchId)`

교회의 모든 멤버 목록을 가져옵니다.

**매개변수:**
- `churchId` (string): 교회 ID

**반환값:** `Promise<ChurchMember[]>`

---

## 타입 정의

### Post
```typescript
{
  id: string
  author_id: string
  church_id?: string
  title: string
  body: string
  scriptures: Scripture[]
  tags: string[]
  visibility: 'public' | 'church' | 'friends' | 'private'
  sermon_date?: string
  sermon_location?: string
  created_at: string
  updated_at: string
  author?: Profile
  church?: Church
  reactions_count?: ReactionCount[]
  comments_count?: number
}
```

### Comment
```typescript
{
  id: string
  post_id: string
  author_id: string
  parent_comment_id?: string
  body: string
  created_at: string
  updated_at: string
  author?: Profile
}
```

### Church
```typescript
{
  id: string
  name: string
  address?: string
  description?: string
  pastor_id?: string
  join_code: string
  created_at: string
  updated_at: string
}
```

### Profile
```typescript
{
  id: string
  display_name: string
  email: string
  avatar_url?: string
  bio?: string
  role: 'member' | 'pastor' | 'admin'
  created_at: string
  updated_at: string
}
```

---

## 에러 처리

모든 API 함수는 에러 발생 시 예외를 던집니다. try-catch로 처리하세요:

```typescript
try {
  const post = await createPost({ ... })
} catch (error) {
  console.error('Failed to create post:', error)
  // 사용자에게 에러 메시지 표시
  alert('게시물 작성에 실패했습니다')
}
```

### 일반적인 에러

- `User not authenticated`: 로그인되지 않음
- `Invalid join code`: 잘못된 교회 초대 코드
- `Already a member of this church`: 이미 가입한 교회
- `Permission denied`: 권한 없음 (RLS 정책)

---

## Rate Limiting

Supabase는 기본적으로 rate limiting을 제공합니다:
- Anon key: 분당 60 요청
- Authenticated: 분당 200 요청

프로덕션에서는 Supabase Pro 플랜 사용을 권장합니다.

---

**더 많은 정보는 [Supabase 공식 문서](https://supabase.com/docs)를 참고하세요.**

