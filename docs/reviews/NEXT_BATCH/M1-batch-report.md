# M1-01~M1-05 공동 검토 및 구현 기록

## 산출물과 상태

| 단원 | 교육 명세 | 콘텐츠 초안 | 연습 문항 초안 | 인터랙션 |
|---|---|---|---:|---|
| M1-01 | `docs/specifications/NEXT_BATCH/M1-01/lesson-spec.json` | `content-draft.json` | 6 | 정수 수직선·절댓값·거리 |
| M1-02 | `docs/specifications/NEXT_BATCH/M1-02/lesson-spec.json` | `content-draft.json` | 6 | 부호 있는 정수 곱셈 |
| M1-03 | `docs/specifications/NEXT_BATCH/M1-03/lesson-spec.json` | `content-draft.json` | 6 | 같은 단위 분수 조각 |
| M1-04 | `docs/specifications/NEXT_BATCH/M1-04/lesson-spec.json` | `content-draft.json` | 6 | 반복 인수·자연수 지수 |
| M1-05 | `docs/specifications/NEXT_BATCH/M1-05/lesson-spec.json` | `content-draft.json` | 6 | 대입과 식의 값 |

Curriculum 역할은 단원당 6개 소단원과 15단계 교수 흐름을 명세했다. Research 역할은 자체 제작 draft 30개와 10개 사고 원형을 작성했으며 외부 문항 복제는 없다고 기록했다. Developer 역할은 제안/운영 경계를 검토했다. Orchestrator 통합은 이 보고서와 자동 검사로 남겼다.

## 통합 검토 사항

- 선수 개념 ID는 제안 로컬 ID이며 운영 기술 레지스트리로 승격하지 않았다.
- `|4|`와 `|-4|` 문제의 초안 문구를 “어떤 관계인가요?”로 명확하게 고쳤다. 앞선 “더 큰 값은?”은 값과 비교 관계를 혼합할 여지가 있었다.
- 30개 응답은 choice/integer/fraction 범위 안으로 바꾸고, 표현식 자동 채점은 넣지 않았다. 각 정답은 정의·유한 산술로 다시 계산했으며 tests는 스키마/정답 규칙/해설 표시/서버 채점 일치를 검사한다. 이는 독립적인 사람 검수나 교육 적합성 검토가 아니다.
- 공개 practice DTO에는 정답·해설·풀이 단계·채점 규칙이 없다. M1 평가 문항은 아직 없고 `AssessmentBlock`도 초안 화면에 표시하지 않는다. 13단계 평가와 10·11단계 응용/심화는 준비 중으로 남긴다.
- M1 콘텐츠는 제안 커리큘럼과 `getLesson()` 밖에 둔다. 개발 preview 환경과 정확한 ID allowlist를 모두 만족해야 화면·진도 endpoint가 허용된다. `unitProgress[M1-xx]` 기록만 갱신하고 M0-01 루트 기록/점수는 유지한다.
- production에서는 환경 변수로 preview를 켤 수 없으며 draft 경로/문항은 거부된다. 앱의 기존 인증도 유지한다.

## 승인·검수

콘텐츠 상태는 `draft`, 사람 교육 검수 0, 사람 게시 승인 0, 공개 상태 pending이다. 단원별 `approved-content.json`은 `approvedContent: null`로 고정했다. 공식 성취기준 코드와 M1 제안 배치는 미검증이다. 사람 승인을 자동 검사 결과로 대체하지 않는다.

## 검증 범위

첫 Playwright 실행은 proxy가 미등록 단원을 사전 차단하는 문제를 발견했다. 개발 전용 ID allowlist로 고친 뒤 전체 데스크톱·모바일 `npm run test:smoke` 56/56 통과했다. `npm run test:e2e`는 테스트 서버의 `127.0.0.1:54329` bind EPERM으로 시작하지 못했으므로 별도 BLOCKED로 보고한다. 두 명령은 동일한 `playwright test`를 실행한다. 자세한 실제 결과는 [QA 보고서](qa-report.md)에 기록했다.

미완료: 사람 교육 검수, 사람 게시 승인, 독립 형성평가·M1-06 이후 구현, 공식 범위 매핑, 배포 공개.
