# M3-11~M3-15 교육과정·Research 교차 검토

- 입력 명세: `docs/specifications/NEXT_BATCH/M3-11`부터 `M3-15/lesson-spec.json`
- 입력 수업 초안: `src/data/proposal-lessons/drafts/M3-11.json`부터 `M3-15.json`
- 입력 조사·문제 청사진: 각 `docs/research/NEXT_BATCH/M3-xx/` 및 `M3-11-15-*` 종합 자료
- 검토 역할: Curriculum Architect
- 독립성 한계: 이 보고서 작성자는 해당 명세 초안을 작성한 Curriculum 역할과 동일하다. Research 결과를 명세와 대조해 수학·교육 관점에서 재검토했으나, 별도 작성자/사람의 독립 승인을 대체하지 않는다.
- 판정: **수정 요청 전까지 구현 인계 보류**. 아래 C1~C3는 경로/명세 불일치다.
- 공개/사람 승인: 없음. 문항·수업은 draft, assessment 0, publication approval false다.

## 구조·교육 검토

- 각 단원은 6개 설명 섹션과 15개 학습 단계를 갖고, 콘텐츠 ID는 해당 명세의 여섯 소단원 ID와 일치한다.
- 문제 청사진은 단원별 3개 원형·원형당 2개, 총 15개 원형과 30개 연습 문항이다. 질문 기술 ID 30개 모두 해당 명세의 두 `targetSkills` 중 하나를 가리킨다. 숫자만 바꾼 복제 여부도 아래 원형 단위로 확인했다.
- 개념 설명이 원형에서 요구하는 핵심 정의·절차보다 앞에 놓여 있다. M3-14는 `t=x²`일 때 `t≥0`, 양수 t에서 `x=±√t`임을 명시하고, 일반 삼차·사차 공식이 있다고 가르치지 않는다. M3-13은 닫힌 구간 양 끝점과 구간 안의 꼭짓점을 후보로 비교한다.
- 문항과 예제의 정답을 독립적으로 다시 계산했다. 산술·대수 오류는 찾지 못했다.
- 시각 활동 사양에는 키보드 제어와 텍스트 결과/대체 설명이 포함된다. 실제 renderer 지원은 개발 검증 전이다.
- `reviewStatus=draft`, `publicationApproved=false`, 연습 블록만 있고 AssessmentBlock은 없다. 문항은 모두 draft, `humanVerified=false`; 사람 승인·게시 승인 0이다.

## 독립 계산 결과

| 단원 | 독립 재계산 결과 |
|---|---|
| M3-11 | p01~p06: `7/2`, `−3`, `13`, `9`, `−12`, `8` |
| M3-12 | p01~p06: `2`, `5`, `2`, `1`, `−3`, `4` |
| M3-13 | p01~p06: `1`, `4`, `4`, `−4`, `9`, `16` |
| M3-14 | p01~p06: 최대근 `3`, 서로 다른 실근 수 `3`, `4`, 합 `0`, 최대근 `2`, 서로 다른 실근 수 `2` |
| M3-15 | p01~p06: x근 합 `1`, 교점 수 `2`, x값 `3`, 순서쌍 수 `1`, 곱 `12`, 곱 `3` |

worked example도 재검산했다. 명세 예제 M3-11은 근 2,3으로 합 5·곱 6·제곱합 13이고, M3-12는 (1,0),(3,0) 및 D=4다. 명세의 M3-13 예제 `f(x)=−(x−1)²+4`, [−1,2]에서는 최댓값 4가 x=1에서, 최솟값 0이 x=−1에서 나온다. 수업 초안은 다른 예제 `f(x)=(x−1)²+2`, [−1,3]을 사용하며 최댓값 6은 양 끝점에서, 최솟값 2는 x=1에서 나온다. 두 예제는 포물선의 열림 방향에 따라 꼭짓점과 양 끝값을 비교하는 같은 학습 절차에 정렬되어 있다. M3-14의 치환 예제는 실근 −2,−1,1,2다. M3-15는 순서쌍 (2,3),(−1,0)이다.

## 차단 수정 사항

### C1 — 새 상호작용 ID가 명세와 콘텐츠에서 다름 (blocking)

- `docs/specifications/NEXT_BATCH/M3-11/lesson-spec.json`의 `interactiveComponents[0].interaction`은 `root-coefficient`지만 `src/data/proposal-lessons/drafts/M3-11.json`의 InteractiveBlock은 `root-coefficient-links`다.
- 같은 불일치가 M3-12 `quadratic-intersection` / `parabola-line-intersection`, M3-13 `quadratic-interval-optimization` / `interval-optimization`, M3-14 `polynomial-root-factory` / `higher-degree-roots`, M3-15 `system-intersections` / `expanded-systems`에도 있다.
- 영향: Developer가 단일 계약을 기준으로 enum, renderer, 테스트를 구현할 수 없다. 기존 상호작용 이름도 아닌 새 ID들이다.
- 수정 요청: 콘텐츠 작성자가 다섯 draft block의 interaction ID를 대응 명세 ID에 맞추고 research handoff에 동일한 값을 기록한 뒤, Zod 계약에 등록될 이름을 Developer에게 전달한다. 명세·콘텐츠 간 불일치가 남으면 인계 보류.

### C2 — M3-15 선수 진단 설명이 선수 단원과 엇갈림 (blocking)

- 위치: `docs/specifications/NEXT_BATCH/M3-15/lesson-spec.json`, `.prerequisiteSkills`.
- `M3-14` readiness 항목은 “연립방정식에서 한 문자를 다른 문자로 나타내고 대입”이라고 한다. M3-14는 삼차·사차방정식이며 이 기능은 제공 제안 메타데이터상 M2-02 연립일차방정식의 선수 기능이다.
- `M2-02` readiness 항목은 “이차방정식의 근을 구하고 두 함수의 교점을 실근으로 해석”이라고 한다. 이는 M2-02의 대입법·가감법 개념과 맞지 않는다.
- 실제 lesson readiness text는 선형 대입·이차방정식 근·순서쌍을 자기 점검하게 하며 대칭형의 합·곱 방법을 사전 능력으로 요구하지 않는다. **따라서 M3-15 진단이 아직 가르치지 않은 대칭형 합·곱 개념을 전제하지는 않는다.** 문제는 진단 기술을 붙인 선수 단원 ID가 뒤바뀌고 부정확하다는 점이다.
- 수정 요청: 명세 작성자가 기존 prerequisiteUnits를 유지하면서 M3-14 항목은 고차식 인수분해/영곱 풀이, M2-02 항목은 연립방정식 대입·순서쌍 해석으로 고친다. 대칭형 합·곱을 선수 진단에 넣지 않는다.

### C3 — M3-11의 M3-02 선수 기능 설명이 메타데이터와 다름 (blocking)

- 위치: `docs/specifications/NEXT_BATCH/M3-11/lesson-spec.json`, `.prerequisiteSkills[1]`.
- 선수 ID M3-02의 제안 개념은 “세 항의 전개”, “대칭식의 전개”인데 진단 문구는 “이차방정식의 두 근을 구하고 다항식을 인수의 곱으로 나타낸다”로 되어 있다. 이는 M3-02 개념과 일치하지 않으며 다른 단원에서 배울 내용에 가깝다.
- 수정 요청: 이 선수 항목을 두 괄호의 곱 전개와 항별 계수 비교 같은 M3-02의 실제 기능으로 바꾼다. 이 기능은 새 근·계수 관계를 이미 알고 있다고 요구하지 않는다.

## 출처·권리 상태

- 자체 문항의 출처와 권리를 `original-draft-no-third-party-reproduction`으로 기록했다. 기출/교재 복제를 주장하지 않는다.
- 교육부 발표 페이지는 교육과정 맥락 자료로 직접 확인됐으나, M3-11~15와 개별 성취기준 매핑 근거로 사용하지 않았다. 매핑은 unverified다.
- NCIC URL은 현재 조사 수정본에서 공식 검색 결과 단서로만 기록하고, 직접 요청은 이 환경에서 404였음을 적었다. 따라서 page-verified 자료로 사용하지 않으며, 별책 8 주장을 검증된 단원 매핑으로 확대하지 않는다.
- 오개념 빈도와 교수법 효과에 대한 독립 연구 근거는 확보되지 않았고 작성자 가설로 표시했다.

## 질문 원형 구분 검토

- M3-11: 계수 공식 계산 / 합·곱으로 대칭식 계산 / 근 관계에서 계수 복원.
- M3-12: x축 교점 / 수평선 교점 개수 판정 / 접하는 수평선 높이 결정.
- M3-13: 꼭짓점이 구간 안 / 꼭짓점 바깥의 끝점 비교 / 상황의 정의역을 모델링한 최적화.
- M3-14: 인수분해된 식의 영곱 / `t=x²` 치환 / 공통인수·차의 제곱 구조.
- M3-15: 일차·이차 교점 / 합·곱으로 두 수 결정 / 합과 제곱합에서 곱 복원.

각 그룹 안의 두 문항은 수치만 다르고 추론 구조가 동일하므로 15개 원형/30문항 집계가 일관된다.

## 다음 단계

C1~C3 해소 후 수정된 spec 및 Research 산출물을 다시 대조한다. 그 뒤 Developer는 새 상호작용 계약을 구현하고 답안 공개 경계, 저장, 접근성, unitProgress 격리를 테스트한다. 사람 검수, 공식 매핑 검증, 콘텐츠 승인과 게시 승인 상태는 계속 별도로 둔다.

## 수정 후 재확인 추가 기록

- Research가 다섯 lesson draft의 새 InteractiveBlock ID를 명세와 일치시켰다: `root-coefficient`, `quadratic-intersection`, `quadratic-interval-optimization`, `polynomial-root-factory`, `system-intersections`. 각 쌍의 unit ID·block·명세를 다시 비교해 일치함을 확인했다. 다만 Zod enum/renderer 구현 지원 여부는 Developer 확인 대상이다.
- C2 해결: M3-15의 `M3-14` readiness는 인수분해된 다항방정식의 각 인수에서 후보 근을 찾고 원식에 대입하도록 수정했다. `M2-02` readiness는 연립일차방정식 대입과 (x,y) 순서쌍 기록을 확인하도록 수정했다. 선수 unit ID와 prerequisiteSkills 항목 ID는 그대로다. 대칭형 합·곱 풀이를 사전 선수 기능으로 넣지 않았다.
- C3 해결: M3-11의 M3-02 readiness를 이차식 두 괄호의 곱 전개 및 x²·x·상수항 계수 비교로 바꾸었다. 이는 M3-02 제안 개념과 일치하고 근·계수 관계를 이미 안다고 요구하지 않는다.
- 두 수정 명세 JSON을 다시 파싱하고 6개 소단원, 15단계, 제안 메타데이터·기술 ID·초안/미승인 상태 불변을 확인했다. 예제 계산과 문제 30개 답은 이전 재계산 결과와 동일하게 맞다.
- NCIC 자료 기록은 직접 URL 요청이 404였고 검색 결과만 찾았다고 정정되어 있다. 이를 페이지 검증으로 취급하지 않으며 공식 성취기준 매핑은 계속 미검증이다.
- 이 교차 검토를 수행한 agent는 lesson-spec 작성 agent와 동일하므로 작성자/검토자 완전 분리는 이 보고서에서 성립하지 않는다. C1~C3 내용 수정은 확인했지만 별도 Curriculum reviewer 확인 전에는 `implementation-ready`를 새로 선언하지 않는다. 게시 승인·사람 승인 상태는 계속 false다.
