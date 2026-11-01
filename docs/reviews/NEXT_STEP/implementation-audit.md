# 다음 단계 구현 감사: 단원 정체성과 마스터 학습 경로 분리

작성 역할: Developer & QA · 범위: 읽기 전용 구조 조사 · 상태: 구현 제안, 승인 아님

## 현재 계약에서 확인한 사실

- 운영 `Unit`은 `id`, `level`, `order`를 가진다. ID 패턴은 `M[0-8]-NN`이고 `validateCurriculum`는 ID의 숫자와 `unit.level` 일치, 전체 `order` 연속성, 등록 manifest와 순서 일치를 요구한다.
- `curriculumProposal`는 운영 교육과정을 복사해 170단원 검토 데이터를 구성한다. 신규 ID의 `level`은 ID 첫 숫자에서 나오며 `order`는 기존 전체 목록 순서다. `validateProposal`는 LEVEL별 수를 `unit.level`로 세고 ID의 LEVEL 내 순번도 검증한다.
- 따라서 같은 단원의 `level/order`를 새 기준으로 덮어쓰면 기존 ID 정체성, 제안 순서, 제안 검증 규칙이 한 필드에 서로 다른 뜻을 요구한다. ID·진도 키·문항 참조는 안정적으로 유지해야 한다.
- 제안 화면은 현재 `proposal.levels`로 필터를 만들지만 실제 필터는 `unit.level`을 사용한다. JSON 내려받기는 제안 객체 전체를 내보낸다. 새 경로를 추가하면 표시와 필터가 모두 경로 항목을 참조하도록 바뀌어야 한다.
- 실서비스 `curriculum`에는 12개만 등록되어 있고 제안은 `coverage: partial`, `canonicalManifest: []`, `status: proposed`다. 새 배치안이 실서비스 registry나 정본 게이트를 바꾸어서는 안 된다.
- 진도는 unitId를 키로 하고 기존 진도는 `M0-01` 루트 필드에 호환된다. 정적 제안 경로만 추가한다면 DB 스키마나 계정 데이터 이관은 필요하지 않다.

## 최소 데이터 모델 제안

기존 `Unit.level/order`와 기존 제안 순서를 수정하지 않고, 제안 객체에 별도 `learningPath`를 추가한다.

```ts
type ProposedLearningPath = {
  id: string;
  version: string;
  status: "proposed";
  levels: { level: number; title: string; count: number }[];
  entries: { unitId: string; pathLevel: number; pathOrder: number }[];
};
```

`entries`는 170개 기존 `unitId`를 각각 한 번씩 참조한다. `pathOrder`는 새 경로 전체 순서 1~170을 뜻하며 기존 `Unit.order`와 혼용하지 않는다. LEVEL 내 순서는 LEVEL 단위로 정렬한 `pathOrder`로부터 계산할 수 있으므로 중복 저장을 피한다. 기존 top-level proposal `levels`는 v0.1.0의 역사적 분류로 이름과 의미를 유지한다. 새 요청 배분은 `learningPath.levels`에만 둔다.

## 필수 검증

1. Zod 계약에서 path level을 0~8, path order를 양의 정수로 제한하고 경로 상태를 제안으로만 허용한다.
2. 경로 항목 수가 170이고, 각 `unitId`가 제안 curriculum의 ID 집합과 정확히 일치하는지 양방향 집합 비교한다. 누락·중복·외부 ID를 각각 검출한다.
3. `pathOrder`가 중복 없이 정확히 1~170인지 검사한다.
4. 각 path level의 수량이 최신 기준 `[12,14,18,22,24,20,22,18,20]`과 맞는지 검사한다. 현재 제안 `unit.level` 분포는 이 검증에 사용하지 않는다.
5. 모든 필수 선수 개념의 소유 단원을 찾고, 같은 제안 경로 안에 있으면 선수 단원의 `pathOrder`가 후행 단원보다 앞서는지 확인한다. 이 순서 규칙이 교육적으로 의도한 선수 관계인지 Curriculum 검토가 필요하다.
6. `Unit.id/level/order`, 기존 12개 unit의 모든 필드, `registeredManifest`, 기존 proposal 버전/본문이 변경되지 않는 회귀 검사를 둔다.
7. 미검증 공식 성취기준은 기존처럼 빈 배열을 유지한다. 경로를 배치했다는 이유로 공식 코드나 정본 상태를 추론하지 않는다.
8. `canonicalManifest`는 계속 비어 있어야 하고 `curriculum:canonical`은 이 제안 경로만으로 통과할 수 없어야 한다.

## 화면·내보내기 영향

- 계획 화면의 LEVEL 필터와 수량 카드는 `learningPath.levels`/`entries`를 기준으로 계산한다.
- 단원 카드에는 안정 식별 정보(`unitId`, 기존 분류/순서)와 제안 경로 정보(`pathLevel`, 경로 내 순번)를 구분해 표시한다. ID의 숫자가 새 학습 LEVEL과 같다고 암시하지 않는다.
- 다운로드 JSON에는 기존 curriculum/proposal과 별도 `learningPath` 객체를 함께 담고, 버전·제안 상태·수량 기준을 포함한다. 활성 학습/채점 API에는 이 제안 데이터를 가져오지 않는다.
- UI 필터가 경로 기준으로 바뀌어도 미구현 단원 링크는 계속 준비 상태로 둔다. 승인 또는 콘텐츠 구현으로 표시하지 않는다.

## 회귀 및 인수 테스트 계획

- 단위: 170 ID 전체의 일대일 매핑, 9개 LEVEL 수량, 1~170 순서, 중복/누락/미지정 unitId, 잘못된 level, 선수 경로 역전, 기존 필드 보존, 정본 상태 유지.
- UI/E2E: 새 경로 LEVEL 필터의 실제 결과 수, 카드에서 ID 정체성과 경로 구분, JSON 다운로드에 같은 경로 포함, 경로 제안만으로 미구현 단원이 학습 라우트에 등록되지 않음.
- 경로 JSON에 콘텐츠 원문·문항 정답이 포함되지 않는지 확인하고, 현재 읽기 전용 페이지가 DB/진도 상태를 쓰지 않는 성질을 유지한다.
- canonical release 검사는 의도적으로 실패해야 한다. 경로 제안 검사 통과와 정본 승인/콘텐츠 완성 검사를 별도 결과로 보고한다.

## 결론

새 마스터 LEVEL을 현재 `Unit.level`에 대입하지 않는 것이 최소 위험 경로다. `learningPath` 제안 레이어 하나와 그 검증/표시만 추가하면 ID·학습 기록·기존 순서·운영 12개 등록 경계·정본 게이트를 보존하면서 새 분배를 평가할 수 있다. 단원별 실제 재배치와 필수 선수 순서가 교육적으로 타당한지는 Curriculum/Research 검토 전까지 승인하지 않는다.
