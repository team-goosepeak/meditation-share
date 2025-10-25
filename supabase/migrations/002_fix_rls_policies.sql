-- Fix infinite recursion in church_members RLS policy
-- 기존 정책 제거
DROP POLICY IF EXISTS "Church members are viewable by church members" ON public.church_members;

-- 수정된 정책: 자기 자신의 멤버십은 항상 볼 수 있고, 
-- 같은 교회의 다른 멤버들도 볼 수 있도록 함
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

-- posts 정책도 개선 (중복 쿼리 방지)
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;

CREATE POLICY "Public posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (
    visibility = 'public'
    OR author_id = auth.uid()
    OR (visibility = 'church' AND church_id IN (
      SELECT church_id FROM public.church_members WHERE user_id = auth.uid()
    ))
    OR (visibility = 'friends' AND author_id IN (
      SELECT following_id FROM public.follows WHERE follower_id = auth.uid()
    ))
  );

-- comments 정책도 개선
DROP POLICY IF EXISTS "Comments are viewable if post is viewable" ON public.comments;

CREATE POLICY "Comments are viewable if post is viewable"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_id
      AND (
        p.visibility = 'public'
        OR p.author_id = auth.uid()
        OR (p.visibility = 'church' AND p.church_id IN (
          SELECT church_id FROM public.church_members WHERE user_id = auth.uid()
        ))
        OR (p.visibility = 'friends' AND p.author_id IN (
          SELECT following_id FROM public.follows WHERE follower_id = auth.uid()
        ))
      )
    )
  );

-- reactions 정책도 개선
DROP POLICY IF EXISTS "Reactions are viewable if post is viewable" ON public.reactions;

CREATE POLICY "Reactions are viewable if post is viewable"
  ON public.reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_id
      AND (
        p.visibility = 'public'
        OR p.author_id = auth.uid()
        OR (p.visibility = 'church' AND p.church_id IN (
          SELECT church_id FROM public.church_members WHERE user_id = auth.uid()
        ))
        OR (p.visibility = 'friends' AND p.author_id IN (
          SELECT following_id FROM public.follows WHERE follower_id = auth.uid()
        ))
      )
    )
  );

