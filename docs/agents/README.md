# 프로젝트 에이전트 설정 템플릿

실제 CLI: `codex-cli 0.166.0`. `codex features list`의 multi_agent는 stable/true이고 현재 협업 세션은 curriculum/research/developer 서브에이전트 3개를 실제 실행한다. 이 세션의 `collaboration.spawn_agent`에 역할과 파일 소유권을 명시해 배정했다. TOML 파일이 현재 세션에 로드되었다고 주장하지 않는다.

[OpenAI 공식 Subagents 문서](https://learn.chatgpt.com/docs/agent-configuration/subagents)의 standalone 형식(name, description, developer_instructions)을 사용했다. 별도 모델·추론 강도·권한 우회를 지정하지 않고 상위 세션을 따른다. 각 TOML은 현재 수정 가능한 docs/agents에 보관한다.

설치 대상:

| 제공 파일       | 설치 경로                               |
| --------------- | --------------------------------------- |
| curriculum.toml | .codex/agents/curriculum.toml           |
| research.toml   | .codex/agents/research.toml             |
| developer.toml  | .codex/agents/developer.toml            |
| config.toml     | .codex/config.toml의 agents 설정에 병합 |

현재 환경에서 `.codex` 쓰기 시도는 보호 경로 정책에 의해 거부되어 설치하지 못했다. 다른 방법으로 보호 경로에 쓰지 않았다. 관리 권한을 가진 사용자가 기존 파일을 확인하고 병합해야 한다. 기존 설정을 통째로 덮어쓰지 않는다. 순차 대안은 각 역할 TOML의 developer_instructions와 [협업 워크플로](../MULTI_AGENT.md)의 입력·출력을 한 역할씩 실행하는 것이다.

`codex --strict-config ... features list`는 이 CLI에서 미지원이므로 TOML 로더 실행 검증으로 보고하지 않는다. 구문 검사는 Python tomllib로 수행한다. 설치 후 실제 standalone 역할 발견/실행은 별도로 확인해야 한다. 역할별 파일 소유권은 행동 규칙이며 별도의 OS 샌드박스 권한이 아니다.
