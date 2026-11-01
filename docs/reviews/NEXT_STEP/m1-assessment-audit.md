# M1-01~M1-05 평가 초안 및 미리보기 경계 감사

## 확인한 현재 동작

- `/api/assessment` GET은 인증 계정에 문항의 공개 DTO만 보낸다. POST는 `scoreAssessment()`에 서버 문항 집합과 제출한 답 전체를 전달한다. 문항 ID 수와 답 개수가 정확히 일치해야 채점하고, 그 뒤에만 정답·풀이를 포함한 결과를 반환한다.
- 서버 문항 조회는 사람 승인 문항 또는 로컬 개발 preview를 제공한다. M1 초안은 `purpose: practice`이며 현재 평가 초안은 없다. 공개 DTO에는 답·해설·채점 규칙이 없다.
- `applySubmission()`은 `unitId`의 `unitProgress` 점수와 Attempt를 기록한다. M0-01 점수는 호환을 위해 루트 `assessmentScore`에도 기록된다. 숙달도 계산은 현재 `extended`만 제외하므로 M1의 새 초안 컬렉션이 추가되면 기존 개념 숙달도·복습 목록에 섞일 수 있다.
- `Lesson`의 `draftPreview` 표시는 공식 완료 문구를 가리지만 `isComplete()`와 보통의 progress context/API 호출은 그대로 실행된다. 그러므로 화면 배너만으로 공식 완료와 데이터 기록을 분리할 수 없다. 현재 ProgressState에는 `proposalProgress`가 없고 `unitProgress` 키는 정규 단원 ID만 허용한다.

## 권고 설계

1. 평가 초안은 서버 전용 문항은행에 `purpose: assessment`, `status: draft`, 고유 버전으로 둔다. 공개 API 선택은 제안 단원 ID allowlist와 `NODE_ENV=development && MATH90_CONTENT_PREVIEW=1`을 모두 요구한다. production에서 해당 환경변수는 권한이 되지 않는다.
2. 기존 `core`/`extended`와 별개의 명시적 컬렉션(예: `proposal-preview`)을 사용한다. 계약과 Attempt의 collection enum을 확장하고, 서버가 `unitId + collection + purpose` 조합을 검증한다. 클라이언트가 전달한 임의 컬렉션이나 제안 목록 외 단원은 거부한다.
3. GET은 assessment 문항의 공개 allowlist 필드만 반환한다. POST는 현재처럼 서버의 정확한 전체 문항 집합과 제출 ID 집합을 동일하게 요구하고, 비어 있는 집합·일부 답·추가 ID·잘못된 답 형식은 점수·해설을 반환하지 않고 거부한다. 점수와 모든 해설은 성공한 전체 제출에서만 반환한다. 응답에는 `preview: true`/초안 버전을 넣어 UI에 검토용임을 표시한다.
4. 제안 평가 결과를 공식 진도로부터 구조적으로 격리한다. 권고안은 ProgressState에 선택적 `proposalProgress[unitId]`를 추가하고 여기에 preview 블록 확인·preview 평가 점수만 적재하는 것이다. 기존 schemaVersion 1 상태에서 선택 필드로 읽고, 이전 `completedBlocks`, 루트 `assessmentScore`, `unitProgress`는 변경하지 않는다. 새 레코드도 초안 단원이 정본 등록될 때 자동 승격하지 않는다.
5. Attempt에도 `proposal-preview` collection을 저장하고 `mastery()`, `isComplete()`, 공식 복습 추천/오답노트에서 제외한다. 검토 목적으로 별도 조회가 필요하면 preview 기록 전용 화면/선택으로 노출한다. 분리하지 않고 공유 attempts에 넣으면 현재 `mastery()`가 M1 concept ID의 점수를 계산해 학습자 숙달도 UI나 후속 경로 추천에 반영할 수 있다.
6. `Lesson`은 `draftPreview`이면 공식 `done` 계산·단원 완료 버튼·공식 완료/다음 단원 조건을 호출하지 않는다. preview 전용 progress 작업만 사용하고, 결과 점수는 “검토용 점수, 정본 진도에 미반영”이라고 표시한다. 문항 미검수 상태도 지속 표시한다.
7. 승인되지 않은 초안 평가를 production에서 제공하지 않는다. 사람 승인 후에도 동일 버전·권리·수학 검사 기록이 `canPublish()`를 통과하기 전에는 운영 문항으로 선택할 수 없다. 개발 preview 허용과 `approved` 상태는 서로 다른 상태다.

## 구체적인 API/UI 인수 기준

### GET `/api/assessment?unitId=M1-01&collection=proposal-preview`

- 로그인 및 same-origin 경계를 유지한다.
- 개발 preview 조건에서만 200과 M1-01 평가 문항/가족을 돌려준다. 각 문항은 ID, 단원/기술/원형, 유형, 입력 형식, 본문, 보기, purpose, version만 가진다.
- 답안, 해설, 풀이 단계, 오개념, 채점 규칙, provenance/review 내부 정보는 GET JSON, RSC payload, HTML에 없다.
- production, preview 플래그 미설정, 미등록 ID, practice 목적 컬렉션 등에는 초안을 비운 성공 응답 대신 명시적인 404/403/400으로 닫는다. 상태 코드는 프로젝트 API 규칙에 맞춰 일관되게 정한다.

### POST `/api/assessment`

- `{unitId, collection, answers, requestId}`의 엄격한 스키마와 same-origin을 유지한다.
- 일부 답, 추가/중복/알 수 없는 문항 ID, 빈 assessment bank, invalid/unsupported 입력은 점수/해설을 반환하지 않고 저장하지 않는다.
- 정확한 전체 제출 이후에만 채점 결과/해설을 반환한다. 응답 재시도는 같은 requestId에서 멱등이며 다른 답안으로 재사용할 수 없다.
- 새 preview Attempt와 점수는 `proposalProgress`에만 기록한다. 루트 `assessmentScore`, 기존 `unitProgress[M1-01]`, 기본 mastery, 공식 완료 상태는 그대로다.

### `/learn/M1-01` preview UI

- 초안/미검수 배너를 유지하고 정본 커리큘럼 미등록임을 분명히 한다.
- 전체 답안 제출 전에는 점수·정답·해설이 화면, 네트워크 GET 응답, 브라우저 저장소에 나타나지 않는다.
- 제출 후 점수를 검토용으로 표시하되 일반 단원 완료 메시지나 공식 숙달을 표시하지 않는다.
- 기존 M0-01 루트 진도와 점수를 읽고 써서 변형하지 않는다.

## 수용 테스트 제안

- `scoreAssessment`: 전체 ID 일치, 일부/추가 답 거부, invalid·unsupported 거부, 올바른 답/해설 반환.
- API: GET/POST 비로그인 차단, same-origin, production 초안 차단, preview 플래그 없는 환경 차단, draft approval 미통과, 평가 답안 사전 노출 금지.
- Progress: M0-01 legacy root snapshot byte-for-byte equivalent fields; preview submission은 기존 M1 `unitProgress`, root score, mastery, official completion, review schedule에 영향 없음; proposalProgress만 갱신.
- 멱등성: 동일 requestId·동일 전체 답은 중복 attempt/점수 갱신을 만들지 않고, 다른 답은 거부.
- UI E2E: 모든 입력란을 채우기 전 제출 불가, 전체 제출 전 해설 미노출, 이후 preview 점수만 노출, 새로고침 후 preview 분리 저장, M0-01 기록 보존.
- 빌드 산출물 검사: draft assessment private import가 client bundle 및 공개 curriculum JSON에 포함되지 않음.

## M1-06~M1-10 확장성

- 단원 ID별 하드코딩 조건을 늘리지 말고 검토용 registry를 둔다. Registry 항목은 unitId, proposal/content version, lesson file key, assessment collection, lifecycle state이며 source는 proposal metadata와 일치 검증한다.
- 공통 preview 라우트와 공통 `/api/assessment` 계약은 registry 조회를 사용한다. 단원별 데이터 파일만 추가하며 등록되지 않은 항목은 fail-closed 한다.
- 단원별 문항은 고유 family와 skill ID를 유지한다. 같은 숫자 변형은 새 원형으로 집계하지 않는다. assessment bank는 practice bank와 분리하고 전체 제출 규칙을 동일 적용한다.
- 검증 스크립트는 registry에 등록된 모든 draft 단원에 대해 중복 ID, 원형 참조, skill 참조, answerRule 채점, 해설-정답 정합성, 선택지 중복 정답, 전체 제출 수를 순회한다. 테스트에 M1-06~10 단원이 아직 없더라도 임의의 고정 예시만 검사하지 않고 registry 전체를 대상으로 한다.
- 승인·구현·테스트 상태는 각자 기록한다. preview 구현/tested가 lesson/problem 콘텐츠를 승인하거나 게시 상태로 바꾸지 않는다.

## 위험과 결정 필요 사항

- **저장 위치 호환성:** `proposalProgress`는 JSONB state에 선택 필드로 넣으면 DB DDL/RLS 변경 없이 추가 가능해 보이지만, 상태 스키마·CAS 재시도·migration round-trip 테스트가 필요하다. 실제 저장소 계약 확인 없이 기존 `unitProgress`의 키 규칙을 완화하면 정본과 preview가 뒤섞일 수 있다.
- **오답/복습 누출:** collection 필터가 mastery에서만 빠지고 복습/오답 API에서 남으면 검토 문항이 일반 학습 경험으로 노출된다. 모든 집계와 화면 소비처에서 `proposal-preview`를 명시적으로 제외해야 한다.
- **전체 제출 재시도:** 기존 DB idempotency는 attempt ID 기반이다. preview도 개별 답안이 아닌 전체 제출의 원자적 동일성을 보장해야 한다.
- **사람 검수:** 자체 제작 초안의 계산 검사는 콘텐츠 오류 가능성을 줄이지만 사람 승인·권리 검수의 대체물이 아니다. M1-01~05의 평가 문항은 검수 전 production에 게시할 수 없다.
- **공식 완료 규칙:** M1 후보가 정본 승인될 때 proposalProgress를 기존 unitProgress로 자동 복사할지에 대한 정책은 아직 결정되지 않았다. 기본값은 이관하지 않고 학생이 해당 정본 단원을 새로 수행하도록 하는 것이다.
