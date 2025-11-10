# Vercel 배포 가이드

## 배포 전 체크리스트

### 1. 환경변수 확인

다음 환경변수들이 모두 설정되어 있는지 확인하세요:

#### 필수 환경변수

```bash
# 한국관광공사 API
NEXT_PUBLIC_TOUR_API_KEY=your_tour_api_key
TOUR_API_KEY=your_tour_api_key  # 서버 사이드용 (백업)

# 네이버 지도
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_naver_map_client_id

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STORAGE_BUCKET=uploads

# 사이트 URL (서버 사이드 API 호출용)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
# 또는 프로덕션 도메인
# NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. 빌드 테스트

로컬에서 프로덕션 빌드가 성공하는지 확인:

```bash
pnpm build
```

빌드가 성공하면 다음 명령어로 프로덕션 서버를 테스트:

```bash
pnpm start
```

### 3. 코드 품질 확인

```bash
# 린팅
pnpm lint

# 타입 체크 (TypeScript)
pnpm tsc --noEmit
```

## Vercel 배포 단계

### 방법 1: Vercel CLI 사용

1. **Vercel CLI 설치** (전역 설치)

```bash
npm i -g vercel
```

2. **Vercel 로그인**

```bash
vercel login
```

3. **프로젝트 배포**

```bash
# 프로덕션 배포
vercel --prod

# 또는 대화형 배포
vercel
```

### 방법 2: Vercel 웹 대시보드 사용

1. **GitHub/GitLab/Bitbucket 저장소 연결**

   - [Vercel Dashboard](https://vercel.com/dashboard) 접속
   - "Add New Project" 클릭
   - GitHub/GitLab/Bitbucket 저장소 선택
   - 프로젝트 선택

2. **프로젝트 설정**

   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `pnpm build` (또는 `npm run build`)
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `pnpm install` (또는 `npm install`)

3. **환경변수 설정**

   - "Environment Variables" 섹션에서 위의 모든 환경변수 추가
   - 각 환경변수에 대해 다음 환경 선택:
     - Production
     - Preview
     - Development (선택 사항)

4. **배포 실행**

   - "Deploy" 버튼 클릭
   - 배포 완료까지 대기 (보통 2-5분)

## 배포 후 확인 사항

### 1. 기본 기능 테스트

- [ ] 홈페이지 로드 확인
- [ ] 관광지 목록 표시 확인
- [ ] 검색 기능 동작 확인
- [ ] 필터 기능 동작 확인
- [ ] 지도 표시 확인
- [ ] 상세페이지 이동 확인
- [ ] 북마크 기능 동작 확인 (로그인 필요)

### 2. 환경변수 확인

- [ ] API 호출이 정상적으로 동작하는지 확인
- [ ] 네이버 지도가 표시되는지 확인
- [ ] Clerk 로그인이 동작하는지 확인
- [ ] Supabase 연결이 정상인지 확인

### 3. 성능 확인

- [ ] Lighthouse 점수 확인 (목표: 80점 이상)
- [ ] 페이지 로딩 속도 확인
- [ ] 이미지 최적화 확인

### 4. SEO 확인

- [ ] Open Graph 메타태그 확인
- [ ] sitemap.xml 접근 가능한지 확인
- [ ] robots.txt 접근 가능한지 확인

## 문제 해결

### 빌드 실패

1. **환경변수 누락 확인**
   - Vercel 대시보드에서 모든 환경변수가 설정되어 있는지 확인

2. **의존성 문제**
   - `package.json`의 의존성 버전 확인
   - `pnpm-lock.yaml` 또는 `package-lock.json`이 커밋되어 있는지 확인

3. **TypeScript 오류**
   - 로컬에서 `pnpm tsc --noEmit` 실행하여 타입 오류 확인

### 런타임 오류

1. **API 호출 실패**
   - `NEXT_PUBLIC_SITE_URL`이 올바르게 설정되어 있는지 확인
   - API 키가 올바른지 확인

2. **지도 표시 안 됨**
   - `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 확인
   - 네이버 클라우드 플랫폼에서 도메인 등록 확인

3. **인증 오류**
   - Clerk 대시보드에서 도메인 등록 확인
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` 등 URL 설정 확인

## 커스텀 도메인 설정

1. **Vercel 대시보드에서 도메인 추가**
   - 프로젝트 설정 → Domains
   - 도메인 입력 및 DNS 설정 안내 따르기

2. **환경변수 업데이트**
   - `NEXT_PUBLIC_SITE_URL`을 커스텀 도메인으로 변경
   - Clerk 대시보드에서도 도메인 등록

## 모니터링

- **Vercel Analytics**: 대시보드에서 활성화 가능
- **에러 로그**: Vercel 대시보드 → 프로젝트 → Logs
- **성능 모니터링**: Vercel Speed Insights

## 롤백

배포 후 문제가 발생하면:

1. Vercel 대시보드 → 프로젝트 → Deployments
2. 이전 배포 버전 선택
3. "Promote to Production" 클릭

## 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Clerk 배포 가이드](https://clerk.com/docs/deployments/overview)
- [Supabase 배포 가이드](https://supabase.com/docs/guides/hosting)

