"""Validate staged role TOML and emit a sequential role prompt without calling an AI API."""
import argparse
import json
from pathlib import Path
import tomllib

ROOT = Path(__file__).resolve().parents[1]
ROLES = ("curriculum", "research", "developer")
parser = argparse.ArgumentParser()
parser.add_argument("--prompt", choices=ROLES)
args = parser.parse_args()
configs = {}
for role in ROLES:
    path = ROOT / "docs" / "agents" / f"{role}.toml"
    data = tomllib.loads(path.read_text())
    assert data["name"] == role, f"role name mismatch: {path}"
    assert set(data) == {"name", "description", "developer_instructions"}, f"unsupported staged keys: {path}"
    assert all(isinstance(value, str) and value.strip() for value in data.values())
    configs[role] = data
project = tomllib.loads((ROOT / "docs/agents/config.toml").read_text())
assert project == {"agents": {"enabled": True, "max_concurrent_threads_per_session": 3}}
if args.prompt:
    print(configs[args.prompt]["developer_instructions"])
else:
    print(json.dumps({"tomlSyntax": "pass", "stagedRoles": list(ROLES), "installed": False,
                      "reason": ".codex write blocked; staged templates only", "runtimeRoleDiscovery": "not-tested"}))
