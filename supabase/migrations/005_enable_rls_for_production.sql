-- ========================================
-- 프로덕션 배포: RLS 활성화
-- ========================================
-- 
-- 이 파일은 프로덕션 배포 전에 실행하세요!
-- 현재는 실행하지 마세요 - 개발 완료 후에만 실행
-- ========================================

-- 1. 모든 테이블의 RLS 활성화
-- ========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;


-- 2. 단순하고 안전한 RLS 정책 생성
-- ========================================

-- profiles: 모든 사람이 조회 가능, 본인만 수정
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);


-- churches: 모든 사람이 조회 가능, 목회자만 수정
CREATE POLICY "churches_select" ON public.churches
  FOR SELECT USING (true);

CREATE POLICY "churches_insert" ON public.churches
  FOR INSERT WITH CHECK (auth.uid() = pastor_id);

CREATE POLICY "churches_update" ON public.churches
  FOR UPDATE USING (auth.uid() = pastor_id);


-- church_members: 단순한 정책 (재귀 없음)
CREATE POLICY "church_members_select" ON public.church_members
  FOR SELECT USING (
    user_id = auth.uid()  -- 자신의 멤버십만 조회
  );

CREATE POLICY "church_members_insert" ON public.church_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "church_members_delete" ON public.church_members
  FOR DELETE USING (user_id = auth.uid());


-- posts: visibility 기반 조회
CREATE POLICY "posts_select" ON public.posts
  FOR SELECT USING (
    visibility = 'public'  -- 공개 포스트
    OR author_id = auth.uid()  -- 내 포스트
    -- church, friends는 일단 제외 (복잡성 방지)
  );

CREATE POLICY "posts_insert" ON public.posts
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "posts_update" ON public.posts
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "posts_delete" ON public.posts
  FOR DELETE USING (author_id = auth.uid());


-- comments: 공개 포스트의 댓글만 조회
CREATE POLICY "comments_select" ON public.comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = comments.post_id
      AND (p.visibility = 'public' OR p.author_id = auth.uid())
    )
  );

CREATE POLICY "comments_insert" ON public.comments
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "comments_update" ON public.comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "comments_delete" ON public.comments
  FOR DELETE USING (author_id = auth.uid());


-- reactions: 공개 포스트의 리액션만
CREATE POLICY "reactions_select" ON public.reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = reactions.post_id
      AND p.visibility = 'public'
    )
  );

CREATE POLICY "reactions_insert" ON public.reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "reactions_delete" ON public.reactions
  FOR DELETE USING (user_id = auth.uid());


-- notifications: 본인의 알림만
CREATE POLICY "notifications_all" ON public.notifications
  FOR ALL USING (user_id = auth.uid());


-- follows: 모두 조회 가능
CREATE POLICY "follows_select" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "follows_insert" ON public.follows
  FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY "follows_delete" ON public.follows
  FOR DELETE USING (follower_id = auth.uid());


-- bookmarks: 본인의 북마크만
CREATE POLICY "bookmarks_all" ON public.bookmarks
  FOR ALL USING (user_id = auth.uid());


-- 3. 확인
-- ========================================

SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled,
    COUNT(*) FILTER (WHERE schemaname = 'public') as policy_count
FROM pg_tables 
LEFT JOIN pg_policies USING (schemaname, tablename)
WHERE schemaname = 'public'
GROUP BY schemaname, tablename, rowsecurity
ORDER BY tablename;

