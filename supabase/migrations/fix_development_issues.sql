-- 개발 환경 문제 해결을 위한 마이그레이션
-- 1. users 테이블 재생성 (스키마 캐시 갱신을 위해)
-- 2. Storage RLS 비활성화 (개발 환경용)

-- ============================================
-- 1. users 테이블 확인 및 재생성
-- ============================================

-- 기존 테이블이 있으면 삭제 (주의: 데이터가 있으면 백업 필요)
DROP TABLE IF EXISTS public.users CASCADE;

-- users 테이블 생성
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.users OWNER TO postgres;

-- Row Level Security 비활성화 (개발 환경)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;

-- ============================================
-- 2. Storage RLS 정책 수정 (개발 환경용)
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;

-- 개발 환경용: 모든 인증된 사용자가 uploads 버킷에 접근 가능
-- INSERT: 인증된 사용자는 누구나 업로드 가능
CREATE POLICY "Dev: Allow all authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- SELECT: 인증된 사용자는 누구나 조회 가능
CREATE POLICY "Dev: Allow all authenticated selects"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'uploads');

-- DELETE: 인증된 사용자는 누구나 삭제 가능
CREATE POLICY "Dev: Allow all authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');

-- UPDATE: 인증된 사용자는 누구나 업데이트 가능
CREATE POLICY "Dev: Allow all authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- ============================================
-- 3. uploads 버킷 확인 및 생성
-- ============================================

-- uploads 버킷 생성 (이미 존재하면 무시됨)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false,  -- private bucket
  6291456,  -- 6MB 제한 (6 * 1024 * 1024)
  NULL  -- 모든 파일 타입 허용
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 6291456;

