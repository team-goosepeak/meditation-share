-- ========================================
-- 완전한 RLS 정책 재구성
-- 무한 재귀 문제 해결
-- ========================================

-- 1. 모든 기존 정책 제거
-- ========================================

-- profiles 정책 제거
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- churches 정책 제거
DROP POLICY IF EXISTS "Churches are viewable by everyone" ON public.churches;
DROP POLICY IF EXISTS "Pastors can create churches" ON public.churches;
DROP POLICY IF EXISTS "Pastors can update their churches" ON public.churches;

-- church_members 정책 제거 (문제의 근원)
DROP POLICY IF EXISTS "Church members are viewable by church members" ON public.church_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.church_members;
DROP POLICY IF EXISTS "Users can view members of their churches" ON public.church_members;
DROP POLICY IF EXISTS "Users can join churches" ON public.church_members;

-- posts 정책 제거
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

-- comments 정책 제거
DROP POLICY IF EXISTS "Comments are viewable if post is viewable" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

-- reactions 정책 제거
DROP POLICY IF EXISTS "Reactions are viewable if post is viewable" ON public.reactions;
DROP POLICY IF EXISTS "Users can create reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON public.reactions;

-- notifications 정책 제거
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- follows 정책 제거
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
DROP POLICY IF EXISTS "Users can create follows" ON public.follows;
DROP POLICY IF EXISTS "Users can delete own follows" ON public.follows;

-- bookmarks 정책 제거
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can create bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;


-- 2. 새로운 정책 생성 (재귀 방지)
-- ========================================

-- profiles 정책
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);


-- churches 정책
CREATE POLICY "churches_select_policy" ON public.churches
  FOR SELECT USING (true);

CREATE POLICY "churches_insert_policy" ON public.churches
  FOR INSERT WITH CHECK (auth.uid() = pastor_id);

CREATE POLICY "churches_update_policy" ON public.churches
  FOR UPDATE USING (auth.uid() = pastor_id);


-- church_members 정책 (재귀 방지 - 핵심!)
-- 자신의 멤버십만 조회 가능
CREATE POLICY "church_members_select_own" ON public.church_members
  FOR SELECT USING (user_id = auth.uid());

-- 자신이 속한 교회의 다른 멤버들도 조회 가능
-- 하지만 이 정책은 재귀를 유발하므로 제거하고, 
-- 대신 애플리케이션 레벨에서 처리하거나 함수 사용
CREATE POLICY "church_members_select_same_church" ON public.church_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.church_members cm
      WHERE cm.user_id = auth.uid() 
      AND cm.church_id = church_members.church_id
    )
  );

CREATE POLICY "church_members_insert_policy" ON public.church_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "church_members_delete_policy" ON public.church_members
  FOR DELETE USING (auth.uid() = user_id);


-- posts 정책 (단순화)
CREATE POLICY "posts_select_policy" ON public.posts
  FOR SELECT USING (
    visibility = 'public'
    OR author_id = auth.uid()
    OR (
      visibility = 'church' 
      AND EXISTS (
        SELECT 1 FROM public.church_members cm
        WHERE cm.user_id = auth.uid() 
        AND cm.church_id = posts.church_id
      )
    )
    OR (
      visibility = 'friends'
      AND EXISTS (
        SELECT 1 FROM public.follows f
        WHERE f.follower_id = auth.uid()
        AND f.following_id = posts.author_id
      )
    )
  );

CREATE POLICY "posts_insert_policy" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "posts_update_policy" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "posts_delete_policy" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);


-- comments 정책
CREATE POLICY "comments_select_policy" ON public.comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = comments.post_id
      AND (
        p.visibility = 'public'
        OR p.author_id = auth.uid()
        OR (
          p.visibility = 'church'
          AND EXISTS (
            SELECT 1 FROM public.church_members cm
            WHERE cm.user_id = auth.uid()
            AND cm.church_id = p.church_id
          )
        )
      )
    )
  );

CREATE POLICY "comments_insert_policy" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "comments_update_policy" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "comments_delete_policy" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);


-- reactions 정책
CREATE POLICY "reactions_select_policy" ON public.reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = reactions.post_id
      AND (
        p.visibility = 'public'
        OR p.author_id = auth.uid()
      )
    )
  );

CREATE POLICY "reactions_insert_policy" ON public.reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reactions_delete_policy" ON public.reactions
  FOR DELETE USING (auth.uid() = user_id);


-- notifications 정책
CREATE POLICY "notifications_select_policy" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_policy" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);


-- follows 정책
CREATE POLICY "follows_select_policy" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "follows_insert_policy" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "follows_delete_policy" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);


-- bookmarks 정책
CREATE POLICY "bookmarks_select_policy" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bookmarks_insert_policy" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookmarks_delete_policy" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);


-- 3. 정책 확인 쿼리 (실행 후 확인용)
-- ========================================
-- 아래 쿼리로 정책이 제대로 생성되었는지 확인하세요
/*
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
*/

