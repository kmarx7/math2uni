# 계정 로그인과 학습 기록

## 현재 범위 / ADR-004

2026-10-31 사용자 요청으로 최초 MVP의 인증 제외 범위를 확장했다. 이메일을 아이디로 사용하는 회원가입·비밀번호 로그인·로그아웃, 학습 페이지/API의 서버 인증, 계정별 PostgreSQL 저장 어댑터와 마이그레이션을 추가했다. `feat/account-login`은 `feat/math90-mvp`에서 분기했다.

사용자의 “연결해줘” 동의 후 `kmarx7's Org`에 조회 비용 월 $0의 Math 90 전용 프로젝트를 생성하고 연결했다. 프로젝트 ref는 `aaeitniisrtssiuertxo`, 리전은 서울 `ap-northeast-2`이다. 마이그레이션과 실제 PostgreSQL RLS 소유권 검증을 통과했고 보안·성능 advisors에 지적 사항이 없다. `.env.local`에 URL과 publishable 키만 저장했으며 Git에서는 제외한다. 후속 대화에서 사용자가 실제 로그인 동작 성공을 확인했다. 이메일 발송 전 과정을 에이전트가 자동 검증했다고 주장하지 않는다.

## 사용자 흐름

1. `/` 또는 `/learn/M0-01` 진입 시 미로그인 사용자를 `/login`으로 이동한다.
2. `/signup`에서 이메일, 영문·숫자 포함 10~128자 비밀번호와 확인을 입력한다. 비밀번호를 채팅으로 받거나 코드에 넣지 않는다.
3. 운영 Supabase의 기본 이메일 인증이 켜져 있으면 인증 메일을 확인하고 로그인한다. 이미 가입된 주소 여부는 가입 성공 메시지로 구분하지 않는다.
4. 로그인하면 서버가 인증한 계정 UUID로 진도와 기존 기록을 불러온다. 문제를 제출하면 서버 채점과 기록 저장이 완료된 후 피드백을 표시한다.
5. 단원 확인·힌트·오답·재시도·복습·평가 점수는 계정에 연결된다. 서버 저장 실패는 오류로 표시하며 저장 완료처럼 처리하지 않는다.
6. 로그아웃은 현재 세션을 종료하고 로그인 화면으로 이동한다. 새 브라우저에서도 같은 계정으로 로그인하면 같은 DB 기록을 불러온다.

## 인증 경계

- Supabase Auth가 비밀번호 저장·검증을 담당한다. 자체 비밀번호 테이블/해시 구현은 없다.
- `@supabase/ssr`의 쿠키 세션을 사용한다. 쿠키는 HttpOnly, SameSite=Lax이며 production에서는 Secure이다. 토큰과 비밀번호를 localStorage에 보관하지 않는다.
- `proxy.ts`는 검증된 `getClaims()`로 보호 경로를 확인하고 세션 쿠키를 갱신한다. 쿠키 존재 여부만으로 통과시키지 않는다.
- 보호 레이아웃과 각 API는 `getUser()`로 Auth 서버에서 계정을 다시 확인한다. 익명 사용자와 이메일 없는 사용자는 허용하지 않는다.
- 로그인/가입/로그아웃/기록·채점 POST는 같은 Origin만 허용한다. 답안·비밀번호 길이와 요청 크기를 제한하고 토큰·인증 코드·비밀번호를 응답/로그에 노출하지 않는다.
- 서버 설정이 없으면 학습 접근을 차단하고 로그인 화면에 연결 준비 상태를 표시한다. 가짜 로컬 로그인이나 운영 인증 우회는 없다.
- 키는 publishable 키만 사용한다. service_role/secret 키는 앱에 필요하지 않다.
- 실전 시험 보안·계정 복구·2단계 인증·사용자 삭제 UI는 이번 변경에 포함하지 않는다. SMTP는 실제 이메일 인증 운영 전에 별도 확인이 필요하다.

## 저장 계약

`AccountProgressRepository.load(userId)` → `{ progress, revision }`, `compareAndSwap(userId, expectedRevision, next)` → boolean. 원래 LocalProgressRepository는 과거 자료 보존·단위 테스트용으로 남기지만 현행 학습 화면은 사용하지 않는다. 기존 익명 프로필을 특정 계정에 자동 귀속시키지 않는다.

`public.learning_progress`는 `user_id` 기본키/`auth.users` 외래키, `state` JSONB, 정수 revision, 생성/수정 시각을 저장한다. JSON의 profileId도 소유 계정 UUID와 같아야 한다. Zod로 읽기/쓰기 스키마를 검증한다.

RLS는 SELECT/INSERT/UPDATE 모두 `auth.uid() = user_id`를 요구하고 UPDATE에는 USING과 WITH CHECK를 모두 둔다. anon 권한과 사용자 DELETE 권한은 없다. 클라이언트가 전달한 userId는 신뢰하지 않는다. API는 조회 파라미터와 관계없이 검증된 계정 ID를 사용한다.

동시 학습 창의 변경은 revision 비교 후 저장하며 충돌 시 최신 상태를 다시 읽고 최대 5회 재시도한다. 답안 제출 ID는 문항별 attempt ID에 포함해 같은 요청의 중복 기록을 막는다. 같은 제출 ID로 답안이 달라지면 실패한다. 전체 평가는 원자적으로 저장한다.

진도 API는 검증된 블록 확인 작업만 받는다. 전체 state나 임의 평가 점수 덮어쓰기 요청은 받지 않는다. 문제 정답과 점수는 서버 채점 결과에서 기록한다. 학습 스냅샷은 교육 지표이며 독립적이고 변조 불가능한 고부담 시험 성적표는 아니다. 현재 10,000회 기록 상한 이후의 보관 정책은 후속 범위다.

## 연결된 프로젝트

[Supabase Math 90 관리 화면](https://supabase.com/dashboard/project/aaeitniisrtssiuertxo)에서 확인한다. 이메일 가입은 활성화, 이메일 자동 확인은 비활성화(인증 메일 확인 필요), 익명 가입은 비활성화 상태다. 사용자는 `http://localhost:3000/signup`에서 직접 계정을 만든다. 비밀번호를 채팅에 보내지 않는다.

기본 이메일 서비스의 실제 발송/수신과 배포 도메인의 Redirect URL은 별도 확인 대상이다. Auth 설정을 변경하는 연결 도구가 없어 Site URL/Redirect URL은 임의 변경하지 않았으며, 현재 로컬 기본 주소를 사용한다. 다른 도메인에 배포할 때 관리 화면에서 해당 주소를 등록해야 한다.

SQL 도구가 반환한 실제 적용 버전 `20261031083910`과 로컬 파일명을 동기화했다. `supabase/tests/learning_progress_rls.sql`은 실제 실행한 롤백 검증을 재현한다.

## 새 환경 설정 절차

1. 허용된 Supabase 프로젝트를 생성하거나 기존 전용 프로젝트를 선택한다.
2. 프로젝트의 테이블을 확인하고 `supabase/migrations/20261031083910_account_learning_progress.sql`을 적용한다. 기존 데이터가 있는 프로젝트에 무작정 적용하지 않는다.
3. `.env.example`을 `.env.local`로 복사하고 해당 프로젝트의 URL과 **publishable** 키를 입력한다. `.env.local`은 Git에서 제외한다.
4. Supabase Auth의 Site URL을 실제 앱 주소로 지정하고 `/auth/callback` 주소를 허용 Redirect URL에 등록한다. 로컬은 `http://localhost:3000/auth/callback`이다. 이메일 인증을 유지하고 테스트용 기본 메일러의 제약과 SMTP 설정을 확인한다.
5. 앱을 다시 실행하고 실제 테스트 계정으로 가입·이메일 인증·로그인·기록 저장·로그아웃·재로그인을 확인한다.
6. 서로 다른 두 계정의 DB/RLS 접근과 advisors를 검사한다. 이 절차가 끝나기 전에는 실제 연결 검증 완료로 표시하지 않는다.

## 테스트와 실제 서비스의 구분

- `npm test`: Auth SDK 경계 모의 객체로 인증 오류/Origin/토큰 비노출을 검사하고, 저장소 CAS·중복 제출·계정 분리를 검사한다.
- `npm run test:e2e` 또는 `test:smoke`: 포트 54329의 격리된 `scripts/test-auth-service.mjs`와 포트 3005의 테스트 앱을 시작한다. 테스트 앱은 별도 `.next-e2e` 빌드 디렉터리를 사용한다.
- 테스트 서버는 유효한 테스트 JWT/JWKS와 Supabase 모양의 응답을 제공한다. SDK·쿠키·화면·서버 API의 실제 HTTP 왕복은 검사하지만 **Supabase 자체의 이메일 발송이나 PostgreSQL RLS를 실행하는 것이 아니다.** 자동 이메일 확인과 메모리 저장은 이 테스트 파일에만 있다. 앱에는 모의 로그인 경로나 테스트 서버 폴백이 없다.
- `.test` 도메인의 더미 계정/비밀번호만 테스트에 쓰며 실제 사용자 비밀번호/메일을 사용하거나 전송하지 않는다.

## 근거 문서

- [Supabase SSR / Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs)
- [비밀번호 인증](https://supabase.com/docs/guides/auth/passwords)
- [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [SSR 버전 변경 이력](https://github.com/supabase/ssr/releases)

설치 버전은 @supabase/ssr 0.12.7, @supabase/supabase-js 2.118.0으로 고정했다.
