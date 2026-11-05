# M4-14·M4-15 문항 및 수업 초안 독립 검토

- 검토 역할: Curriculum Architect 독립 검토
- 범위: 두 단원의 `problem-blueprint.json`, 출처/권리 기록, renderer 초안, 대응 lesson-spec
- 검토 방법: 12개 문항의 조건·계산을 독립 재계산해 answer key, 선택지, rationale를 대조; family 추론 구조, 기술 참조, 콘텐츠 상태를 확인
- 판정: **현재 12개 정답 키와 해설은 일치하며, 고쳐야 할 문항 오류를 찾지 못함. 명세-렌더러 명칭 1건은 Curriculum 편집 수정 필요.**
- 사람 검수/게시 승인: 미수행

## 독립 정답 재계산

| 단원 | 문항 | 독립 계산·판정 | 키 |
|---|---|---|---|
| M4-14 | m14p01 | 모든 실수에서 `x²≥0`; `x²=0`은 `x=0`일 때뿐이다. 유일하게 B | B |
| M4-14 | m14p02 | 실수 제곱이 0이려면 `x=0`이다. 유일하게 A | A |
| M4-14 | m14p03 | `(x−y)²=x²−2xy+y²≥0`이므로 `x²+y²≥2xy`. 유일하게 C | C |
| M4-14 | m14p04 | `3²+(−2)²−2·3·(−2)=9+4+12=25`; 또는 `(3−(−2))²=25`. 유일하게 B | B |
| M4-14 | m14p05 | `(4+16)/2=10`, `√(4·16)=8`; `10>8`이고 등호가 아니다. 조건 `a,b≥0`도 충족한다. 유일하게 A | A |
| M4-14 | m14p06 | `ab≤((a+b)/2)²=36`; `a=b=6`이 허용되고 등호를 달성하므로 최대값은 36. 유일하게 C | C |
| M4-15 | m15p01 | 입력 1에 a,b 두 출력이 대응하므로 함수가 아니다. 유일하게 B | B |
| M4-15 | m15p02 | A의 세 입력 각각에 정확히 하나의 출력이 있다. 두 입력이 a에 대응해도 함수다. 유일하게 A | A |
| M4-15 | m15p03 | `f(−1)=1`, `f(0)=0`, `f(1)=1`; 치역은 `{0,1}`이다. 유일하게 C | C |
| M4-15 | m15p04 | 표의 실제 출력 원소는 2와 0이므로 치역 `{0,2}`. 유일하게 A | A |
| M4-15 | m15p05 | 순서쌍 `(x,y)`에서 `y=f(x)`이며 x=0인 점은 `(0,1)`이다. `f(0)=1`; 유일하게 B | B |
| M4-15 | m15p06 | 각 `x↦y`를 `(x,y)`로 옮기면 `{(−1,3),(0,2),(1,3)}`이다. 유일하게 A | A |

각 문항은 선택지 세 개 중 답 키와 일치하는 보기가 하나뿐이다. 정답·해설 수정 요청은 없다.

## 문제 원형과 기술 참조

- **M4-14:** family 1은 실수 제곱의 부호·영점 판별(개념 이해), family 2는 제곱 항등식 전개와 수치 대입(단계별 풀이), family 3은 AM-GM의 비음수 조건·등호 및 달성 가능한 최적값 판단(응용)이다. 세 구조는 핵심 근거가 구별되며, family/item의 skill 참조는 `m4-14-skill-1/2`에 연결된다.
- **M4-15:** family 1은 입력별 출력 개수로 함수 여부 판별(개념 이해), family 2는 정의역을 대입해 치역을 계산(단계별 풀이), family 3은 함수값 읽기 및 표·순서쌍 표현 변환(표현 변환)이다. 사고 구조가 구별되며 skill 참조는 `m4-15-skill-1/2`에 연결된다.
- 두 단원 모두 family 3개, 각 2문항, 총 6개로 고유 ID 및 prompt 중복이 없다. 모든 item skill label이 해당 spec의 target skill 중 하나다.

## 수업 초안 정합성 및 메타데이터

두 lesson draft 모두 JSON과 기존 content schema를 통과하는 형태이며, 6개 소단원 ID가 spec과 대응하고 15개 phase가 실제 block을 참조한다. 각 worked example의 문제·단계는 spec의 `workedExample`과 일치한다. 실제 `AssessmentBlock` 및 평가 문항은 없다. readiness 진단은 단원 진입/완료 점수를 자동 차단하지 않는다고 renderer에 표시한다.

상태·권리 검사 결과:

- blueprint와 lesson draft는 `draft`, `publicationApproved:false`; 각 문항은 `purpose:practice-draft`, `humanVerified:false`, `autoGrade:supported`다.
- 전체 counts는 단원마다 3 families, 6 draft items, human-approved 0, assessment 0이다.
- 각 문항 provenance는 `original-author-created`, `original-draft-no-third-party-reproduction`다. 공식 기출/교재를 복제하지 않았다고 표시한다.
- source manifest와 research report는 교육부 2022 고시의 수학과 별책 8 위치, 2026 일부개정 대상 범위, 2028 통합형 수능 안내 페이지를 확인했다고 기록한다. 별책 원문·성취수준 첨부는 직접 대조되지 않아 개별 공식 성취기준/단원 매핑은 미검증으로 남겼다. 교수 효과·오개념 빈도 또한 실증 근거로 주장하지 않고 설계 가설로 구분했다. 문항 재사용 권리는 주장하지 않는다.
- 이 독립 검토는 사람 검수나 게시 승인이 아니다.

## 수정 요청 / 상태 갱신

1. **Curriculum 소유 명세 편집:** M4-14 spec `m4-14-u4`의 제목은 “양수의 산술·기하평균 관계”이나 본문/목표는 `a,b≥0`을 사용하고 0을 포함한다. Research renderer는 이를 “비음수 두 수의 산술·기하평균 관계”로 표기한다. Curriculum spec 제목도 비음수로 맞춰 명세와 renderer를 일치시키는 편집 수정이 필요하다. 이는 정답 오류는 아니다.
2. **Research 상태 표기:** 현재 12개 item의 `verification.result`는 “independent curriculum review pending”이다. 이 보고서의 독립 답안 재계산이 완료되면 Research가 verification.result를 “작성자 자체 확인 + Curriculum AI 독립 재검토 완료; 사람 검수 대기”에 해당하는 문구로 동기화할 수 있다. `humanVerified:false`, `status:draft`, 게시 미승인 상태는 유지해야 한다.

명세 제목과 verification 상태가 갱신되면 이 보고서에서 확인한 답·풀이 결과는 그대로 유효하다. 공식 기준 매핑, 사람 검수, 운영 게시 승인은 별도 단계다.
