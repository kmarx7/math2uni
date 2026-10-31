# 블록 기반 콘텐츠

ContentDocument {unitId,version,blocks: Block[]}의 Block은 id, type, title과 유형별 필드로 판별된다. 공통 렌더러는 데이터의 type으로 화면을 선택하며 단원별 페이지 코드를 만들지 않는다. `/learn/[unitId]` 한 라우트가 승인된 문서를 렌더한다. 미등록/초안 단원은 404이다.

| type | 전용 필드 | 용도 |
|---|---|---|
| ConceptBlock | body | 목표·용어 정의 |
| ExplanationBlock | body | 선수 진단·개념·오개념 |
| WorkedExampleBlock | steps[] | 단계별 모범 풀이 |
| InteractiveBlock | interaction:place-value | 천/백/십/일 직접 조작 및 시각화 |
| PracticeBlock | purpose:practice | 독립 연습과 기본/변형/응용 원형 선택 |
| FeedbackBlock | body | 오답 교정 안내 |
| AssessmentBlock | purpose:assessment | 연습과 분리된 전체 제출 평가 |
| ReviewBlock | body | 지연 복습과 다음 단원 조건 |

문항 참조는 단원/목적을 사용하고 정답은 블록 데이터에 넣지 않는다. WorkedExample의 학습용 예제는 평가 문항과 다른 수를 사용한다. 렌더러는 HTML 문자열을 실행하지 않는다. 내용은 React 텍스트로 렌더하고 향후 수식 포맷 역시 안전한 파서만 추가한다.

문서 버전과 문항 버전은 별개이며 모든 학습 기록에 문항 버전을 보관한다. 시각화의 색 구분에 텍스트 자리 이름을 함께 제공하고 슬라이더는 키보드와 레이블을 지원한다. 현재 임의 블록 편집 UI는 없으며 저장소의 데이터 파일을 편집 후 검증한다.
