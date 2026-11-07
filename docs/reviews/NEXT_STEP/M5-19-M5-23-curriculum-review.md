# M5-19~M5-23 교육과정 명세 검토

- 브랜치: `feat/m5-batch-09`
- 범위: 5개 lesson spec, curriculum renderer 초안, Research source/rights report와 30개 practice draft
- 작성 역할: Curriculum Architect 작성자 점검 및 별도 AI 교차 검토
- 독립 검토자: `curriculum_independent_m5_09_13` (AI 역할; 사람 승인자가 아님)
- 결론: 개발 프리뷰 구현 인계 `implementation-ready`; 사람 게시 승인 아님

## 단원별 검토 및 독립 재계산 근거

| 단원 | 수학·교육 정합성 및 문항 재계산 | 원형 구분 |
|---|---|---|
| M5-19 | #01 a₄=14, #02 4·6−3=21, #03 차 3에 따른 다음 항 14, #04 점화 결과 1,3,7,15, #05 반례식 두 개가 n=1,2,3에서 1,2,3으로 일치하고 n=4에서 4/10, #06 2n 반례식은 처음 세 항 2,4,6으로 같고 b₄=14. 정답·키·풀이 모두 맞다. | 표/일반항 읽기, 패턴·점화 예측, 유한 자료의 비유일성은 서로 다른 추론이다. |
| M5-20 | #01 차 −5, #02 공차 0, #03 a₁₀=4+9·3=31, #04 d=(31−11)/5=4 및 a₁=11−2·4=3, #05 S₅=20, #06 S₆=3(2+22)=72. 키·풀이 일치. | 공차 판정, 일반항 복원, 앞뒤 짝짓기 합은 구분된다. |
| M5-21 | #01 q=−2, a₅=48, #02 q=0에서 a₄=0, #03 합 2+6+18+54=80, #04 5+5/2+5/4+5/8=75/8, #05 q=1에서 S₆=24, #06 q=0 항 2,0,0,0의 합 2. q 분기와 키가 맞다. | 일반항·공비, q≠1 유한합, q=1/0 경계 처리는 구별된다. |
| M5-22 | #01 2+3+4+5=14, #02 j=0..3→k=1..4, #03 1+3+5+7=16, #04 14+3·2=20, #05 제곱합=55, #06 세제곱합 100에서 1³을 빼 99. 끝점·첨자·공식 적용 및 키가 맞다. | 범위/첨자 변환, 선형성 계산, 기본 거듭제곱 합 적용은 구분된다. |
| M5-23 | #01 시작값 n=1에서 P(1) 참, #02 목표 P(k+1) 식 선택, #03 가정을 더해 (k+1)(k+2)/2, #04 7^{k+1}−1=6(7m+1), #05 유한 사례에서 귀납 단계 누락, #06 P(k+1)을 가정하는 순환 논리. 정답·키·논리 설명이 일치한다. | 증명 골격 식별, 귀납 가정으로 다음 단계 유도, 잘못된 증명 진단은 구별된다. |

## 교육 설계와 상태 확인

- 각 단원의 제목, concepts, visualization, prerequisiteUnits는 `src/data/proposals/units.json`과 정확히 일치한다. 기존 단원 ID와 선수 ID를 바꾸지 않았다.
- 다섯 단원 모두 6 subunits, 15 learning phases, 2 target skills, 3 families × 2 items, 6 distinct practice goals를 갖는다. 문항은 D1/D2/D3 단계로 분포한다. 각 family skill은 해당 단원의 target skill을 참조한다.
- 선택지 ID/라벨은 문항마다 고유하고, correct key와 semanticAnswer가 정답 선택지와 일치한다. A/B/C key 분포는 단원마다 2개씩이다. assessment 인스턴스는 0이다.
- renderer content-draft는 8개 공통 블록·15개 phase이고 Research 문서의 `content` 및 현재 runtime draft 복사본과 일치한다. 모두 draft, `humanVerified:false`, `publicationApproved:false`, `approvedContent:null`이다.
- M5-19 반례식 `n+(n−1)(n−2)`가 n=3에서 5를 내는 오류를 최초 자체 점검에서 발견했다. spec과 renderer 초안을 `n+(n−1)(n−2)(n−3)`으로 수정했다. 대입하면 n=1,2,3에서 1,2,3으로 기존 규칙과 일치하고 n=4에서 10이다.
- 같은 재계산에서 M5-22 소단원 확인식 `Σ_{k=1}^{3}(2k+1)`의 결과를 12가 아닌 15로 고쳤고 renderer에도 동기화했다. 현재 worked examples와 모든 subunit check를 다시 계산해 일치함을 확인했다.
- 독립 교차 검토에서 subunit-to-targetSkill 배정 4곳의 경계를 바로잡았다: M5-19 u3→skill-2, u4→skill-1; M5-20 u3→skill-2; M5-22 u4→skill-1. M5-19 u3은 규칙 후보, u4는 주어진 일반항 계산; M5-20 u3부터는 일반항; M5-22 u4는 인덱스 치환으로 각각 단원 기술 목표에 맞췄다. Research 문항 family/skill 연결은 영향 없이 일치한다.
- 선수 skill 진단은 안내 전용이며 기존 prerequisite 그래프, 숙달도, 완료 점수를 수정하지 않는다.

## Research 출처·권리 교차 검토

다섯 Research 보고서는 공식 교육과정 별책 및 2028 예시문항 원문을 직접 확인하지 않았다고 밝히며, 해당 단원의 공식 성취기준 코드와 개별 수능 출제 매핑은 미검증으로 남겼다. 외국 표본이나 대학생 연구를 국내 학생 오류의 발생률로 일반화하지 않는다. 원문 문항을 복제하지 않는 자체 문항 계획과 권리 한계를 명시했다. 따라서 공식 매핑은 계속 비워 둔다.

## 인계 결정과 남은 게이트

- Research source/rights 및 30개 draft 문항 교차 검토: 완료; 30/30 정답·semantic answer·풀이 계산 재확인
- 교육 명세 및 콘텐츠 구조: `implementation-ready` (개발 프리뷰 범위; spec-to-family/item 기술 정합성 재확인 완료)
- 사람 교육·수학 검수와 게시 승인: 미완료; 없음
- 공식 교육과정/수능 매핑: 미검증; 추가하지 않음
- Developer 동작·접근성·모바일·학습 흐름 QA: pending
- 개발 인계는 운영 공개 허가가 아니다. production 게시 게이트를 유지한다.

Research validation reports의 `independentRecalculationComplete` 값은 Research 작성 단계의 미완료 표기로 남아 있을 수 있다. 이번 문서의 독립 재계산은 curriculum reviewer의 별도 근거이며 Research 파일을 수정하지 않았다. 사람 승인이나 자동 publication 상태로 승격하지 않는다.
