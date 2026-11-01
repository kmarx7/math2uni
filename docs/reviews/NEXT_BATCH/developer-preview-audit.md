# M1-01~M1-05 개발 미리보기 경계 점검

## 현재 구조 확인

- `/learn/[unitId]`는 Next.js Server Component이며 `curriculum.units`에서 `status: published`인 단원만 찾아 화면에 전달한다. 제안 커리큘럼은 별도 `curriculumProposal`에 있고 활성 curriculum에는 들어 있지 않다.
- 서버 전용 `lessonForDelivery()`는 현재 M0-01만 미리보기/운영 문서를 분기한다. `getLesson()`은 공개 콘텐츠 데이터 인덱스를 읽는다.
- 진도 POST는 `getLesson()`의 블록 ID인지 확인하므로, 제안 수업을 그 함수에 추가하면 운영 API가 제안 단원의 진도를 받아들일 수 있다. 라우트 렌더와 진도 허용 여부를 같은 등록 목록으로 결정하면 안 된다.
- 문제은행 서버는 `server-only`이며 답과 채점 규칙을 공개 DTO에서 제외한다. 연습 POST는 서버 원본에서 채점한다. 기존 API는 단원 ID 형식만 검사하므로 제안 문항을 은행에 연결할 경우 production 공개 게이트를 별도로 확인해야 한다.
- `Lesson`은 완료 블록을 계정 진도 API로 저장하고, 클라이언트의 완료/다음 단원 판정은 활성 curriculum과 content index를 조회한다. 제안 단원이 그 데이터에 직접 들어가면 현재 ID·순서·기록 호환 경계를 넓힐 위험이 있다.

## 권고하는 최소 구현

1. 기존 활성 curriculum, `getLesson()`, 기본 공개 manifest를 변경하지 않는다. M1 단원/문항은 제안 데이터와 별도 draft 콘텐츠 파일로 둔다.
2. 서버 전용 delivery 함수에 `getDraftLessonForPreview(unitId)`를 따로 두고 `NODE_ENV === "development" && MATH90_CONTENT_PREVIEW === "1"`일 때만 초안과 제안 단원 메타데이터를 선택한다. 조건이 아니거나 ID·스키마·콘텐츠 검사에 실패하면 404/fail-closed 한다. 기존 `/learn/[unitId]`에서 개발 전용 분기를 사용하거나 `/preview/learn/[unitId]` 별도 경로를 택할 수 있지만, 두 경로 모두 production 응답에서 초안 원문이 나오지 않는 테스트가 필요하다.
3. 초안 수업은 검토 배너를 표시하고 저장 가능한 학습 이벤트는 기존 `unitProgress[unitId]` 네임스페이스만 사용한다. 루트 M0-01 `completedBlocks`/`assessmentScore`는 건드리지 않는다. 단, MVP에서는 평가 점수나 mastery를 업데이트하지 않거나 제안용 상태로 격리한다. 기존 저장 계약을 바꾸지 않고 분리하려면 미리보기 진도는 세션 상태만 쓰는 선택지도 더 안전하다.
4. 문항은 연습 목적만 먼저 연결한다. preview 라우트가 제공하는 ID allowlist와 서버 은행 조회가 일치해야 하며, 평가 API에는 제안 문항을 넣지 않는다. 답·해설은 제출 전 클라이언트 DTO에 포함하지 않는다. 승인 상태를 `approved`/`published`로 변경하지 않는다.
5. curriculum plan에서 제안 단원으로 가는 링크는 개발 환경에서만 보인다. 계정 레이아웃/서버 계정 인증은 유지한다. mock 인증을 추가하지 않는다.

## 필수 회귀 조건

- 운영 설정에서 M1-01~M1-05 lesson URL, 콘텐츠 API, 문제 API는 미등록 상태로 거부되고 초안 문구·정답이 응답 HTML/JSON/client bundle에 나타나지 않는다.
- 개발 preview에서만 인증된 화면으로 초안 콘텐츠가 열린다. production에서는 환경 변수 값이 있더라도 preview를 강제 비활성화한다.
- M1 진도 key는 M0-01 루트 기록과 서로 독립적이며, 기존 schemaVersion 1 기록과 평가 점수는 그대로 유지된다.
- 문항 GET은 public allowlist 필드만 반환하고, 정답/해설/채점 규칙은 POST 제출 전 노출되지 않는다. M1 평가 자료는 평가 경로에서 차단한다.
- 제안 콘텐츠 스키마·문항 제약·정답 검사는 자동화하되, 사람 검수 전 승인 상태는 pending/null이다.

## Next.js 버전 근거 및 제한

설치된 Next.js 문서 `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`는 페이지가 기본 Server Component이고 `params`/`searchParams`가 Promise라고 명시한다. 현행 route가 이 계약을 따른다. 요청 시점의 `searchParams` 사용은 동적 렌더링을 유발하므로, query만으로 보안 권한을 부여하면 안 된다. preview 가능 여부는 서버 환경과 등록된 draft ID에서 결정해야 한다.

## 결론

M1-01~M1-05는 **미리보기 구현 가능**하지만, 현재 학습 레지스트리에 등록하거나 `getLesson()`에 섞는 것은 피한다. 콘텐츠 초안과 운영 공개·평가·숙달 판정은 분리한다. 별도 preview 진도 저장이 필요하다고 결정되면 그 전에 계정 저장 계약을 별도 설계·테스트한다.
