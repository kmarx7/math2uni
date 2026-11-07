# M5-24, M6-01~M6-04 교육과정 명세 검토

- 브랜치: feat/m6-batch-01
- 작성자: Curriculum Architect 최초 작성 및 자체 점검
- 독립 검토자: m6_batch_01_independent_review (별도 AI Curriculum reviewer; 사람 승인자 아님)
- 범위: 5개 lesson spec, curriculum renderer draft, Research source/rights와 30개 practice draft
- 상태: 교육 명세 개발 프리뷰 인계 implementation-ready; 사람 게시 승인 아님

## 단원별 설계 초점

| 단원 | 초점 | 상태 |
|---|---|---|
| M5-24 대수 연결 점검 | 정의역·식 변환, 함수 증감, 수열·귀납 조건의 짧은 연결. 전체 단원 종합시험으로 확장하지 않음 | 명세·6문항 독립 검토 완료 |
| M6-01 함수의 극한의 뜻 | 좌극한/우극한, 양쪽 극한 존재 조건, f(a)와 극한 구분 | 명세·6문항 독립 검토 완료 |
| M6-02 극한의 성질과 계산 | 법칙의 전제, 0/0 변형, 약분 후 원래 정의역/제외점 유지 | 명세·6문항 독립 검토 완료 |
| M6-03 극한의 대소 관계 | 근방 부등식, 극한 대소, 샌드위치의 양쪽 경계와 공통 극한 | 명세·6문항 독립 검토 완료 |
| M6-04 함수의 연속 | 점에서 세 조건, 끝점 한쪽 연속, 닫힌구간 정리와 중간값 정리의 전제·결론 | 명세·6문항 독립 검토 완료 |

## 메타데이터와 구조 자체 점검

각 단원의 title, concepts, prerequisiteUnits, visualization은 src/data/proposals/units.json과 정확히 일치한다. 기존 ID와 선수 연결은 변경하지 않았다. 각 단원은 6 subunits, 15 phases, 2 target skills, 3 family criteria, 6 practice goals를 가진다. assessment 인스턴스는 0이며 officialStandards는 빈 배열이다. renderer 초안은 공통 8개 블록·15 phases이고 draft, publicationApproved:false, approvedContent:null이다. 선수 진단은 안내용이며 prerequisite graph나 mastery/progress gate를 바꾸지 않는다.

## 작성자 예제·확인 계산 및 수정 이력

- M5-24: (x²−1)/(x−1)=x+1은 x≠1에서만 성립하고 x>1이면 x+1>2다. 짧은 조건 연결로 제한하고 전 범위 종합시험으로 부풀리지 않았다.
- M6-01: 예시의 좌극한은 1, 우극한은 2이므로 양쪽 극한은 존재하지 않는다. f(0)=2는 이를 바꾸지 않는다.
- M6-02: 약분한 식의 극한은 2지만 원래 분수식은 x=1에서 정의되지 않는다. 몫 법칙은 분모 극한 비영 조건을 확인한다.
- M6-03: −x² ≤ x²sin(1/x) ≤ x² (x≠0)이며 양 끝이 0으로 가므로 가운데 극한은 0이다. 부등식 곱셈의 x²≥0 조건을 표시했다.
- M6-04: f(x)=x³−x는 [−2,2]에서 연속이고 끝값은 −6, 6이다. 0은 끝값 사이이므로 IVT가 적어도 하나의 근을 보장한다. 인수분해하면 −1, 0, 1의 세 근이므로 유일성은 보장하지 않는다. u6 check와 worked example을 이 조건에 맞춰 일치시켰다.

## 독립 교차검토와 readiness

별도 Curriculum reviewer는 Research의 source/rights 보고와 전체 30개 연습 draft를 검토했다. 독립 재계산에서 30/30 정답·키·semantic answer·rationale가 일치했고, 세 가족의 사고 구분, skill 연결, 선택지 ID, draft 상태, assessment 0을 확인했다고 보고했다. 단원별 계산 근거는 docs/reviews/NEXT_STEP/M5-24-M6-01-M6-04-independent-review.md에 기록돼 있다.

- Research source/rights 및 30개 문항 독립 검토: 완료
- Curriculum 명세·문항 구조: implementation-ready (개발 프리뷰 인계 범위만)
- Developer schema/runtime 검증 및 기능·접근성·모바일·학습 흐름 QA: pending
- 사람 교육·수학 검수와 게시 승인: 없음
- 공식 성취기준 및 2028 수능 단원별 매핑: 미검증; 추가하지 않음

Orchestrator가 m5-24-visual, m6-01-visual~m6-04-visual interaction ID를 공통 enum에 등록했다. 별도 reviewer는 등록 사실을 확인했으나 Developer의 제안 스키마 parse/runtime 검증은 남아 있다. Curriculum은 계약 코드를 수정하지 않았다.

모든 콘텐츠와 문항은 draft이며 publicationReady:false, humanPublicationApproval:false, approvedContent:null을 유지한다. implementation-ready는 개발 프리뷰 인계만 뜻하며 사람 게시 승인이나 운영 공개 허가가 아니다. Human content approval과 Developer QA는 pending이고 production 공개는 승인 전 차단한다.
