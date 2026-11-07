# M5-14~M5-18 교육과정 명세 검토

- 기준 경로: `feat/m5-batch-08`, 2026-11-07
- 범위: `docs/specifications/NEXT_BATCH/M5-14..M5-18/{lesson-spec.json,content-draft.json}` 및 `src/data/proposals/units.json`의 해당 메타데이터
- 작성 역할: Curriculum Architect; 초안 작성자 자체 검토 + 별도 Curriculum AI 독립 검토
- 독립 검토자: `curriculum_independent_m5_09_13` (AI 역할; 사람 승인자 아님)
- 검토 성격: 개발 프리뷰 구현 인계 판단이며 사람의 콘텐츠 게시 승인이 아님

## 검토 결과

| 단원 | 검토 초점 | 상태 |
|---|---|---|
| M5-14 | 단위원 값/기본 그래프, a·b와 h·k 변환 분리, 상수함수 예외 | 구현 인계 가능; 게시 승인 아님 |
| M5-15 | 구간 내 교점, 일반해·주기 반복, 그래프 부등식·정의역 | 구현 인계 가능; 게시 승인 아님 |
| M5-16 | 대응쌍/외접원 관계 표현, 비례 계산, SSA 경우 분기 | 구현 인계 가능; 세 원형 구분 확인 |
| M5-17 | 투영 유도·교차항, 끼인각에서 변 계산, 세 변에서 각 분류 | 구현 인계 가능; 세 원형 구분 확인 |
| M5-18 | 높이·넓이 계산, 단일 법칙 선택, 법칙 연결 활용 | 구현 인계 가능; 단위 모호성 수정 확인 |

## 자체 검증

- 다섯 단원의 title, concepts, prerequisiteUnits, visualization은 제안 데이터와 정확히 일치한다. 단원 ID 및 순서를 변경하지 않았다.
- 단원별 6개 소단원, 15개 학습 단계, 2개 target skills, 3개의 질적으로 구분된 문제 원형 기준, 6개의 서로 다른 연습 목표를 확인했다. assessment 인스턴스는 각 0개다.
- 각 소단원은 설명·활동·확인 질문을 연결하며 renderer 초안은 공통 8개 블록과 15개 단계 연결을 사용한다.
- 공식 성취기준과 개별 수능 출제 매핑은 모두 비어 있다. 문항 초안과 lesson content는 draft, `publicationApproved:false`, `approvedContent:null`이다. 별도 AI 검토를 기록했지만 사람 검수·게시 승인으로 기록하지 않았다.
- 선수 진단은 안내 전용임을 명시했다. 해당 항목을 신규 prerequisite skill로 등록하거나 숙달도·완료 점수 게이트로 사용하지 않는다.
- Worked example과 30개 문항의 수치·정답·정답키·semanticAnswer·해설을 독립 재계산했다. 30/30의 수학 계산 및 키가 맞고 선택지 ID/라벨은 유일하며 정답 라벨과 semanticAnswer가 일치한다. Research 수정본에서 M5-17 family 1의 #01은 높이 투영식에서 코사인법칙을 기호로 도출하고 #02는 교차항을 분리해 묻고, M5-18 #01은 두 길이를 cm로 명시하고 cm²를 정답 단위로 써 모호성을 제거했으며, M5-16 family 1은 표기/대응 및 c=2R sin C 관계를 묻고 family 2는 비례식 수치 계산을 하도록 분리됐다. M5-16 SSA 두 해 문항도 각도 합 검산상 두 삼각형이 가능하다. 세 가족이 각 단원 학습 목표와 서로 다른 주된 사고과정에 연결됨을 확인했다. M5-14의 비상수 조건과 a=0/b=0 상수함수 예외는 lesson-spec 및 renderer content-draft에 함께 명시했다.
- 현재 배치가 제안 메타데이터의 선수 ID를 정확히 보존하는지 검사했다. 다만 연결 대상 전체가 공식 승인된 정본 경로인지는 검증하지 않았다.

## Research 교차 검토 및 결정

Research의 5개 조사 보고서와 출처 기록을 확인했다. 교육부 별책 8과 2028 예시문항 PDF 본문은 직접 열지 않았으므로 공식 세부 매핑·출제 연계는 미검증으로 남겼다. 외국 표본 자료를 국내 학생의 오개념 빈도로 일반화하지 않았으며, 외부 문항 재사용을 주장하지 않았다. 문항 독립 재계산 중 발견한 family/단위 모호성 세 항목의 수정본을 다시 읽어 확인했다. 각 blueprint는 3 families × 2 practice drafts, 서로 다른 가족 기준과 curriculum skill 연결을 갖추며 수정 후 계산·선택지 매핑 문제가 없다.

- Research 출처/권리 보고서 검토: 확인 완료 (공식 세부 매핑·문항 근거 미검증임을 유지)
- Research 원형·문항 초안 독립 수학/교육 검토: 완료 (30/30 재계산·key mapping, 수정 요청 3건 재검토 완료)
- 교육 명세/문항 구조 구현 인계: `implementation-ready` (preview 구현 근거)
- Developer 자동·단위·스키마·lint·typecheck·build QA: 완료 (각 단원 보고서 기준: 전체 25 files / 192 tests, content validation 4 files / 30 tests, lint/typecheck/build 통과)
- E2E 브라우저 QA: 차단 — 테스트 서버가 `127.0.0.1:54329` bind에서 `EPERM: operation not permitted`를 반환해 테스트 시작 전 중단됨; 브라우저 흐름은 미검증
- 사람 게시 승인: 없음 (`publicationApproved:false`, `approvedContent:null`)
- 공개 상태: production publication gate 유지, 미승인 초안 공개 불가

독립 AI 검토는 연구/문항 초안의 수학적 일관성과 개발 프리뷰 준비도를 확인한 것이다. 사람의 교육적·수학적 승인이나 게시 승인을 대체하지 않는다. 공식 매핑은 원문 직접 확인 전까지 비어 있어야 한다. Research 소유 파일은 수정하지 않았다.

## 계약 차이와 제한

M5-04~13의 proposal lesson spec 형식(숫자 `schemaVersion: 1`, 문자열 `levelId`, proposal metadata)은 레거시 M0-01 handoff schema와 다르며, 해당 레거시 스키마에 억지로 맞추지 않는다. 이 작업은 계약이나 validator 코드를 수정하지 않았다. 기본 JSON/메타데이터 수량 검사를 수행했다. `src/contracts/index.ts`의 InteractiveBlock enum에서 `m5-14-visual`~`m5-18-visual` 식별자도 확인했다. 제안 lesson-spec 전용 parser와 Developer 구현의 실제 동작 검증은 별도 결과에 맡긴다. 이번 review는 JSON·제안 메타데이터·개수·원형/문항 매핑을 확인했으며 코드 테스트나 화면 QA를 뜻하지 않는다.
