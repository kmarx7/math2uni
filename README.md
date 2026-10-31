# Math 90

수학의 기초부터 개념·실험·연습·형성평가·오답·복습을 연결하는 한국어 자기주도 학습 MVP입니다. 실제 성적을 보장하지 않습니다.

## 실행

Node.js 22 이상과 npm, E2E 검증에는 Google Chrome이 필요합니다.

```sh
npm ci
npm run dev
```

http://localhost:3000 에서 시작합니다. 로컬 개발은 **미승인 콘텐츠 검토 모드**이며 화면에 검토 배너를 표시합니다. 운영 환경은 사람 승인 전 문항을 공개하지 않습니다. 외부 API 키나 DB 설정은 필요하지 않습니다.

```sh
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm start
```

`test:smoke`는 동일한 Playwright E2E 모음의 별칭입니다. 첫 E2E 실행 전 Chrome을 설치하세요. Chrome 대신 Playwright Chromium을 사용하려면 playwright.config.ts에서 `channel: 'chrome'`을 제거하고 `npx playwright install chromium`을 실행합니다. CI는 개발 서버를 자동 실행합니다.

## 구현 범위

- 7개 모듈의 계약, 저장소 인터페이스와 의존 그래프 검사
- LEVEL 0의 12개 초안 메타데이터, M0-01 공통 블록 학습
- 자리표 조작, 선수학습 자기 점검, 세 원형의 D1~D3 문제
- 고정 6문항 + 검증된 템플릿 1개 (로컬 검토용)
- 서버 채점과 제출 후 정답·해설, 전체 제출 형성평가
- 로컬 프로필 분리, 진도·힌트·재시도·오답 기록, 숙달·1/3/7일 복습
- 반응형 대시보드·커리큘럼·오답노트·복습 화면

170단원 정본/전체 콘텐츠, 공식 성취기준 매핑, D4~D5 문항, 로그인·Supabase·AI 튜터·Python·실전 모의평가·관리자 UI는 미구현입니다. 정본 목록이 미제공되어 `npm run curriculum:canonical`은 의도적으로 실패하는 별도 출시 게이트입니다. 일반 MVP 테스트와 구분합니다.

## 콘텐츠 검수와 승인

초기 샘플은 AI 보조 작성 및 자동 수학 검사를 거친 **reviewed** 상태입니다. 자동 검사를 사람 승인으로 기록하지 않았습니다. `npm run dev`는 `MATH90_CONTENT_PREVIEW=1`로 검토 화면만 제공합니다. production은 이 변수를 무시하고 `canPublish`를 통과한 문항만 제공합니다.

사람 관리자는 문제 본문·정답·풀이·권리·버전을 직접 검토한 후 `src/data/approvals.json`에 다음 구조의 이력을 추가하는 Git 변경을 검토·병합해야 합니다. 개별 문항은 문항 ID, 생성 문항은 템플릿 ID를 entityId로 사용합니다. 콘텐츠 변경 시 버전을 올리고 다시 승인해야 합니다. 이 파일은 현재 빈 배열이며 아래는 **형식 예시**일 뿐 승인된 데이터가 아닙니다.

```json
{
  "entityId": "p-place-1",
  "version": "1.0.0",
  "reviewer": "실제 검수 관리자 이름",
  "at": "2026-10-31T00:00:00.000Z",
  "decision": "approved",
  "actorType": "human",
  "mathChecked": true
}
```

로컬 프로필은 인증 계정이 아니며 같은 브라우저 저장소를 공유하는 사람이 기록을 읽거나 바꿀 수 있습니다. 기기 간 동기화가 없고 브라우저 데이터를 지우면 기록이 사라집니다. 평가용 답안은 서버에만 두지만 고부담 시험의 부정행위 방지 기능은 없습니다.

## 문서

- [마스터 아키텍처](docs/ARCHITECTURE.md)
- [교육과정](docs/CURRICULUM.md)
- [콘텐츠 계약](docs/CONTENT_SCHEMA.md)
- [문제은행](docs/QUESTION_BANK.md)
- [로드맵과 미완료 범위](docs/ROADMAP.md)
- [실제 검증 결과](docs/VERIFICATION.md)

기능 변경은 별도 `feat/*` 또는 `fix/*` 브랜치에서 작업하고 검증 후 push합니다.
