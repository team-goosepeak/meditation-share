-- ========================================
-- 개발 단계: RLS 완전 비활성화
-- ========================================
-- 
-- 이 마이그레이션은 개발을 위해 Row Level Security를 비활성화합니다.
-- 프로덕션 배포 전에 다시 활성화해야 합니다!
--
-- 왜 비활성화하나요?
-- 1. 개발 속도 향상 (정책 디버깅에 시간 낭비 방지)
-- 2. 기능 개발에 집중
-- 3. 프로토타입/MVP 단계에서는 불필요한 복잡성
--
-- 주의사항:
-- - 로컬 개발 환경에서만 사용하세요
-- - 프로덕션 배포 전에 005_enable_rls_for_production.sql 실행 필요
-- ========================================

-- 1. 모든 기존 RLS 정책 제거
-- ========================================

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- public 스키마의 모든 테이블에서 모든 정책 제거
    FOR r IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;


-- 2. 모든 테이블의 RLS 비활성화
-- ========================================

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.churches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks DISABLE ROW LEVEL SECURITY;


-- 3. 확인 쿼리
-- ========================================

-- RLS 상태 확인 (모두 false여야 함)
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 정책 확인 (결과가 없어야 함)
SELECT COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public';


-- ========================================
-- 개발 완료 후 RLS 활성화 방법
-- ========================================
-- 
-- 프로덕션 배포 전에 다음 파일을 실행하세요:
-- 005_enable_rls_for_production.sql
-- 
-- 또는 수동으로:
-- 
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.church_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
-- 
-- 그리고 적절한 RLS 정책 생성
-- ========================================

