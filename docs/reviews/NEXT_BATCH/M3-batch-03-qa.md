# M3-11~M3-15 개발 미리보기 QA

2026-11-03 기준. Curriculum 독립 리뷰는 설계를 implementation-ready로 판단했으나, 이는 사람의 문항 게시 승인과 별개다. 다섯 단원 콘텐츠와 문항은 계속 draft이며 승인 수 0, assessment 문항 0이다.

## 구현 범위

- M3-11~15 콘텐츠 JSON을 공통 lesson renderer에 등록하고 개발 preview manifest만 확장했다.
- 다섯 Zod interaction ID와 키보드 조작 가능한 슬라이더/토글 실험실을 추가했다.
- 자리값이 아닌 근·계수, 포물선 교점(그래프/교점 표시), 닫힌 구간 최적화, 인수분해 및 t=x² 치환, 연립 교점 좌표를 계산하는 제한된 순수 함수를 추가했다.
- 문항 초안 30개(15개 원형, 단원별 6개)를 server-only proposal adapter에 등록했다. 정답·해설은 공개 DTO에 포함하지 않는다.
- 진도 저장은 기존 단원별 unitProgress 경계를 유지한다. production preview는 차단된다.

## 검증 결과

- `npm run lint`: 통과
- `npm run typecheck`: 통과
- `npm test`: 16개 파일, 125개 테스트 통과. 기존의 10,000개 조합 전수 검사는 기본 5초 제한을 두 번 넘겨 해당 테스트에만 15초 제한을 적용했다. 검사 범위와 단언은 유지했다.
- `npm run build`: 통과 (Next.js 16.3.6 production build)
- `npm run test:e2e`: 차단. Playwright 웹 서버가 `127.0.0.1:54329`에 bind 시 `EPERM`을 반환해 브라우저 플로우가 시작되지 못함

추가 테스트는 콘텐츠 파싱, 다섯 interaction 등록/접근성, 닫힌 구간 경계·실근 없음/중근/두 근, t=x²의 음수 해 배제, 문항 ID·family·skill·정답 매핑, 답안 은닉, production 차단, 단원별 진도 격리를 다룬다.

## 검수 상태

자동 구조·계산 검사만 수행했다. 사람의 독립 교육·수학 검수와 게시 승인은 남아 있다. 단원별 상세 결과는 M3-11~M3-15 폴더의 보고서를 확인한다.
