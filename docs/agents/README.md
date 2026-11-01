# 프로젝트 에이전트 설정 템플릿

실제 CLI: `codex-cli 0.166.0`. `codex features list`의 multi_agent는 stable/true이고 앞선 협업 세션에서 curriculum/research/developer 서브에이전트 3개를 실제 실행했다. 사용자가 아래 템플릿을 `.codex/`에 복사했고 현재 세 역할 파일과 공통 설정이 템플릿과 일치한다. 현재 채팅 세션이 이 파일들을 이미 읽었다고 주장하지 않는다.

[OpenAI 공식 Subagents 문서](https://learn.chatgpt.com/docs/agent-configuration/subagents)의 standalone 형식(name, description, developer_instructions)을 사용했다. 별도 모델·추론 강도·권한 우회를 지정하지 않고 상위 세션을 따른다. `docs/agents`는 검토 가능한 원본 템플릿이며 프로젝트 설정은 `.codex/`에 설치한다.

설치 대상:

| 제공 파일       | 설치 경로                               |
| --------------- | --------------------------------------- |
| curriculum.toml | .codex/agents/curriculum.toml           |
| research.toml   | .codex/agents/research.toml             |
| developer.toml  | .codex/agents/developer.toml            |
| config.toml     | .codex/config.toml의 agents 설정에 병합 |

설치 상태 확인: 세 역할 TOML과 `config.toml`이 템플릿과 일치하고 TOML 구문 검사를 통과했다. Codex CLI의 실제 에이전트 호출은 현재 실행기에서 in-process app-server 초기화가 `Operation not permitted`로 실패해 아직 검증하지 못했다. 이 설치 뒤 시작한 Codex 세션에서 역할을 호출해 최종 확인한다. 기존 설정을 갱신할 때는 먼저 병합하고 통째로 덮어쓰지 않는다. CLI 호출이 불가능하면 각 역할 TOML의 developer_instructions와 [협업 워크플로](../MULTI_AGENT.md)의 입력·출력을 한 역할씩 실행한다.

`codex --strict-config ... features list`는 이 CLI에서 미지원이다. Python tomllib와 `agents:validate`는 TOML 문법·템플릿 일치 검사를 수행한다. 역할별 파일 소유권은 행동 규칙이며 별도의 OS 샌드박스 권한이 아니다.
