"""Validate role TOML and emit a sequential role prompt without calling an AI API."""
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
template_project = tomllib.loads((ROOT / "docs/agents/config.toml").read_text())
assert template_project == {"agents": {"enabled": True, "max_concurrent_threads_per_session": 3}}
installed_roles = {}
for role in ROLES:
    installed_path = ROOT / ".codex" / "agents" / f"{role}.toml"
    if installed_path.exists():
        installed = tomllib.loads(installed_path.read_text())
        assert installed == configs[role], f"installed role differs from template: {installed_path}"
        installed_roles[role] = installed
installed_config_path = ROOT / ".codex" / "config.toml"
installed_project = tomllib.loads(installed_config_path.read_text()) if installed_config_path.exists() else None
if installed_project is not None:
    assert installed_project == template_project, "installed config differs from template"
if args.prompt:
    print(configs[args.prompt]["developer_instructions"])
else:
    print(json.dumps({"tomlSyntax": "pass", "templateRoles": list(ROLES),
                      "installedRoles": list(installed_roles),
                      "configInstalled": installed_project is not None,
                      "filesMatchTemplates": len(installed_roles) == len(ROLES) and installed_project == template_project,
                      "runtimeRoleDiscovery": "not-tested"}))
