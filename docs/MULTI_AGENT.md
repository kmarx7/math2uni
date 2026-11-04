# Math 90 협업과 인계

## 2026-11-03 현재 진행 상태

Math 90 제안 경로 v0.3.0의 내부 배분 결정은 완료했다. LEVEL 수량은 `12/14/18/22/24/20/22/18/20`이며 기존 ID와 역사적 `Unit.level/order`를 보존한다. 기존 LEVEL 0 12개 외에 M1-01~20, M2-01~20, M3-01~22, M4-01~13의 제안 단원 75개가 개발 프리뷰에 연결됐다. 다음 묶음은 M4-14~18이다. 경로는 여전히 proposed이며 공식 성취기준 검증·전문가 검수·사람 게시 승인은 완료되지 않았다. 최신 배치 QA는 `docs/reviews/NEXT_STEP/M4-09-M4-13-batch-qa.md`에서 확인한다. 전체 E2E는 테스트 서버가 `127.0.0.1:54329`에 bind하는 단계에서 `EPERM`으로 시작하지 못해 미검증이다.

## 현재 구조와 실행 상태

기존 Next.js 16.3/React/TypeScript 앱, Zod 계약, 서버 전용 문제은행, Vitest/Playwright, Supabase 계정 기록을 보존한다. monorepo 이동·새 AI API·Python 서버·DB 변경·새 외부 의존성은 이번 작업에 없다. 한 단원은 초보 학습자에게 읽기 쉬운 텍스트·자리표와 안전한 정수 입력으로 구현한다. KaTeX/MathLive/JSXGraph가 설치·구현되었다고 주장하지 않는다.

| 역할                 | 실제 작업                                                                              | 파일 소유권                                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Curriculum Architect | 6소단원/15단계, 10원형 명세, 신규 문항과 화면의 교육적 교차 검토, LEVEL 배분 충돌 분석 | docs/specifications/M0-01/lesson-spec.json, problem-blueprint.json, curriculum-review.md, ADR-007                                  |
| Research & Content   | 확인 가능한 공식·교수 자료, 오개념·권리 기록, 자체 초안 30개와 계산 입력               | docs/research/M0-01, src/data/m001-expansion.json, research-review.md                                                              |
| Developer & QA       | 은행 opt-in collection, fail-closed 수학 검사, 독립 기준 모델·E2E·구현 보고            | m001-expansion.ts, bank/server.ts, tests/m001-expansion.test.ts, tests/e2e/m001-expansion.spec.ts, implementation-report/qa-report |
| Orchestrator         | 계약·설정·인계 검사·API/UI·진도 호환·통합·최종 검증/push                               | 나머지 통합 변경                                                                                                                   |

앞선 세션의 협업 도구로 세 역할을 실제 실행했다. CLI 0.166.0의 multi_agent 기능은 stable/true이다. 사용자가 세 역할과 공통 설정을 `.codex/`에 복사했고 현재 설치 파일은 템플릿과 일치한다. 자동화 실행기에서의 CLI 시도는 in-process app-server 초기화 `Operation not permitted`로 막혔으나, 이후 사용자가 프로젝트 루트에서 새 로컬 Codex 세션을 열어 curriculum/research/developer custom agent 세 개를 모두 실행했다고 확인했다. 세 agent 모두 발견·완료됐고 파일을 수정하지 않았다고 사용자가 보고했다. 역할별 수정 범위는 지침으로 통제하며 별도 OS 권한을 만든 것이 아니다.

## 인계 순서

1. Orchestrator가 작업·입력 버전·수정 파일을 배정한다. 소유 파일은 한 작업자만 수정한다.
2. Curriculum이 학습 목표·선수·단계·평가·문제 원형의 명세를 작성한다.
3. Research가 실제 출처 확인 상태·권리·자체 초안과 독립 계산 입력을 작성한다. 두 역할의 독립 조사는 병렬 가능하다.
4. Curriculum이 Research 결과를 교차 검토한다. 오류·난도·설명 충돌은 근거와 수정 요청으로 남긴다.
5. designReview.decision=implementation-ready는 개발 검토 모드 구현 준비이다. actorType=agent이고 humanPublicationApproval=false이다.
6. Developer는 검토된 명세·초안 버전에 맞춰 구현한다. 수학 검증 실패 초안은 개발 preview에서도 제공하지 않는다.
7. Orchestrator는 계약·실제 데이터·은행·API·저장·화면의 전체 흐름을 검사한다. Curriculum은 교육 의미를 다시 확인한다.
8. 사람 관리자 검수 전 approved-content.json은 pending/null이다. 코드 구현/테스트 완료와 문항 게시 승인은 별개다.

상태 경로는 draft→researched→reviewed→approved→implemented→tested→published이다. 운영 승인은 실제 사람·동일 콘텐츠 버전·해시·수학/권리 검토 근거를 요구한다. 개발 검토 작업은 content=draft/reviewed, implementation=implemented/tested, publication=pending의 별도 축으로 기록한다. 테스트하려고 approved를 위조하지 않는다. UI는 검토용임을 표시하고 production 게시 게이트는 그대로 차단한다.

## 단원별 8개 인계 산출물

| 산출물                   | 위치                      | 해석                                             |
| ------------------------ | ------------------------- | ------------------------------------------------ |
| lesson-spec.json         | docs/specifications/M0-01 | 교수 명세와 AI 설계 검토                         |
| research-report.md       | docs/research/M0-01       | 출처·확인/미확인·권리·오개념                     |
| problem-blueprint.json   | docs/specifications/M0-01 | 10원형·30초안·필수량/은행량 분리                 |
| content-draft.json       | docs/specifications/M0-01 | 공개 학습 내용과 비공개 문항 원본 참조·버전/해시 |
| validation-report.json   | docs/reviews/M0-01        | 자동 검사의 실제 결과와 한계                     |
| approved-content.json    | docs/reviews/M0-01        | pending/null, 사람 승인 0                        |
| implementation-report.md | docs/reviews/M0-01        | 구현·미구현·호환성                               |
| qa-report.md             | docs/reviews/M0-01        | 실제 실행·실패·차단 결과                         |

공유 계약은 src/contracts/index.ts, handoff.ts이다. src/modules/content-quality는 소단원·15단계·블록 연결·원형/문항 수·기술/난도·버전 일치를 검사한다. 사람 승인 증거는 동일 버전/해시에 묶고 작성자 자기 승인을 허용하지 않는다. JSON의 human 문자열만으로 실제 사람을 인증하는 시스템은 아니며 승인 파일은 실제 관리자가 확인하는 신뢰 경계다.

## 학습/문제은행 호환성

- 기존 M0-01 9개 블록 ID·세 기술·문항 ID·3문항 평가·schemaVersion 1 학습 기록을 보존한다.
- 15교수단계는 기존 9블록에 연결한다. 6소단원은 개념 블록 안에 표시한다. 현재 14단계 안내/활동을 제공하고 D4~D5 심화는 작성·검수 예정이다. 조건 카드 전용 조작 UI도 남아 있다.
- core/extended 컬렉션을 분리한다. 확장은 신규 20연습+10평가이고 기본 평가 집합을 늘리지 않는다. 결과는 계정에 기록하되 기존 점수·기본 숙달 판정에 섞지 않는다.
- ProblemInstance의 평가 정답·해설·검증 메타데이터는 서버 전용이다. PublicProblem과 원형 제목/전략만 GET으로 보낸다. 평가 응답은 정확한 전체 집합을 요구한다.
- 신규 설명·조작·단계와 확장 묶음 선택은 content/server.ts의 개발 검토 전용 전달 게이트를 적용한다. 운영은 보존한 M0-01 v1.0.0 학습 문서를 전달한다. 클라이언트의 완료 판정은 텍스트 없는 content-index만 읽고 신규 초안 설명을 직접 import하지 않는다.
- 신규 문항은 D1~D3 초안이다. 숫자만 바꾼 변형은 새 원형이 아니다. 기존 place-value 템플릿은 유한 범위 전수 검사하며 다른 생성기는 고정 초안을 충분히 검토한 뒤 확장한다.
- 기존 인증 요구는 사용자의 앞선 요청으로 추가한 기능이다. 이를 제거하지 않는다. 계산·엔진·로컬 저장 계약은 DB/외부 AI 없이 테스트 가능하지만 현재 웹 학습 화면은 Supabase 계정 연결을 요구한다.

## M1-01~M1-05 1차 제안 콘텐츠

Curriculum Architect 소유 명세는 `docs/specifications/NEXT_BATCH/M1-xx/lesson-spec.json`, Research 소유 자료/원형/30문항 draft는 `docs/research/NEXT_BATCH/`, Orchestrator가 배정한 renderer용 JSON은 각 단원의 `content-draft.json`이다. Developer & QA preview 경계 검토는 `docs/reviews/NEXT_BATCH/developer-preview-audit.md`; 통합·교차 검토와 구현 결과는 `M1-batch-report.md` 및 단원별 validation/approval 기록에 남긴다. 이 콘텐츠는 proposal ID allowlist, `MATH90_CONTENT_PREVIEW=1`, development 세 조건으로만 제공한다. 평가/공식 완료는 구현하지 않았고, 연습만 `unitProgress[M1-xx]`와 attempts에 기록한다. 이 작업은 active curriculum, canonical manifest, production bank, M0-01 루트 진도를 바꾸지 않는다.

## 정리된 결정과 남은 검증

[ADR-007](decisions/007-level-allocation.md)과 [ADR-009](decisions/009-learning-path-proposal.md): 사용자 수량과 LEVEL 1·2 표시명 결정을 제안 경로에 반영했다. M7-19·M7-20은 LEVEL 8 첫 교수 후보로 분류한다. 기존 제안 메타데이터의 `Unit.level/order`와 ID는 그대로 보존한다. 남은 것은 공식 성취기준/원본 목록 대조, 사람 콘텐츠 검수, canonical 등록 및 운영 게시 승인이다.

필수 검사: lint, typecheck, 전체 단위 검사, content:validate, agents:validate, test:e2e(환경 차단 시 동일 Playwright 별칭 결과 구분), build. 새로운 결함이 있으면 수정·회귀 검사 후 보고한다. 수학적 해설의 의미 전체·실물 모바일·스크린리더·실제 성적 효과는 자동 검사만으로 보증하지 않는다.

## 순차 실행 대안

`python3 scripts/validate-agent-config.py --prompt curriculum` 등으로 각 역할 지침을 출력할 수 있다. 위 인계 순서를 한 역할씩 실행하고 파일·검증 근거를 다음 역할에 제공하면 같은 계약을 사용한다. 이 명령은 프롬프트 출력만 하며 외부 AI 호출이나 에이전트 실행을 가장하지 않는다.


## 2026-11-04 · M4-09~M4-13 개발 프리뷰 인계 완료

Curriculum review가 다섯 단원의 수업/청사진 정합성 및 문항 검토를 거쳐 `implementation-ready`를 판정했다. Research는 30개 문항 초안과 verification 상태를 인계했고, Developer & QA는 전용 labs·서버 전용 문제 변환·preview manifest·lesson registry·단원 진도 격리와 테스트를 구현했다. M4-10과 M4-13의 수정 이력은 독립 검토 기록에 남아 있으며, 현재 모든 문항은 draft / `humanVerified:false`; 평가 0개, 게시 0개다. 전체 unit tests 154개와 content validate 19개, lint/typecheck/build 통과. E2E는 환경의 54329 bind EPERM으로 실행 전 차단이다. 이 검토는 사람 게시 승인이 아니며 `approved-content.json`은 null이다.
