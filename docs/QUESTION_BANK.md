# 다유형 문제은행

## 세 계층

ProblemFamily는 풀이 전략을 나타낸다. MVP는 자릿값 식별, 분해·합성, 조건 역추론 세 원형이다. 수치가 다른 인스턴스를 새로운 원형으로 세지 않는다. ProblemTemplate는 familyId, 매개변수 범위와 generator를 가진 검증된 생성 규칙이다. ProblemInstance는 고유 ID, unitId, skillId, familyId, templateId?, reasoning, difficulty D1~D5, input 방식, prompt, choices?, answerRule, answerDisplay, explanation, steps, misconceptions, status, version, provenance, reviewHistory, purpose를 갖는다.

## 공개 규칙

AI 보조로 작성한 고정 샘플 6문항(연습 3 + 평가 3), 검증된 자리값 템플릿 1개를 제공한다. 정수 범위/0이 아닌 목표 숫자/안전 정수 제약을 만족한 생성 인스턴스만 연습에 쓴다. 템플릿 버전에 실제 사람 승인 이력이 추가되면 그 이력을 상속하고 출처에 생성 매개변수를 보관한다. D1~D3만 공개되어 있고 D4~D5는 미래 계약이다. AI 생성·미승인·권리 미확인·다른 버전 승인 이력은 publication gate에서 차단한다. 관리자 대시보드는 범위 밖이며 데이터+자동 검수 게이트가 MVP의 Content Administration이다.

검수 상태 draft→reviewed→approved, 버전마다 승인자·시각·수학 검증 여부를 기록한다. 초기 문항은 reviewed 상태이며 자동 정합성 검사만 기록했다. 사람의 관리자 승인은 없고 `approvals.json`은 비어 있다. 로컬 개발의 명시적 검토 모드에서만 샘플을 제공하며 운영에서는 canPublish를 통과하지 못해 문항이 표시되지 않는다. 이것은 외부 교육과정 공인이나 독립 전문가 검증을 의미하지 않는다. 저작자는 Math 90 프로젝트, 권리는 project-original이다. 외부 기출은 포함하지 않는다.

## DTO / 채점

공개 DTO는 id,unitId,skillId,familyId,reasoning,difficulty,input,prompt,choices,purpose,version만 포함한다. 서버만 정답, 규칙, 해설, 검수 이력에 접근한다. 연습 POST는 문제 하나를 채점하고 피드백을 반환한다. 평가 POST는 정확한 평가 문항 집합과 각 응답을 검증한 후 모든 결과를 반환한다. GET/오류 응답에는 정답이 없다. localStorage에는 제출 후 결과만 기록한다.

객관식은 option ID, 정수는 부호 있는 정수, 소수는 유한 소수, 분수는 a/b로 파싱한다. 길이 64, 숫자부 최대 12자리, 분모 0 금지, 지수/함수/변수/연산식 금지. BigInt 교차곱으로 동치 유리수를 비교한다. expression 입력은 unsupported라서 정답으로 처리하지 않는다. D2 문항은 소수·분수 답안도 수치 동치면 허용하는 정수 규칙과 분리한다. 채점 invalid/unsupported는 숙달 증거로 저장하지 않는다.

## QA

스키마, ID와 본문 정규화 중복, 단원/개념/원형/용도 참조, choices의 유일성, 정답 자기 채점, 템플릿 모든 유한 조합 정답, independent reference model, 해설 단계에 정답 표기, 승인 필터, 평가 비노출을 검사한다. 해설의 의미적 완전성은 자동 검사만으로 보증할 수 없으므로 전문 교육 검토는 후속 과제다.
