"""Build reviewable JSON lesson drafts from the Curriculum Agent specifications."""
import json
import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--start", type=int, default=1)
parser.add_argument("--end", type=int, default=20)
args = parser.parse_args()
UNITS = [f"M1-{i:02d}" for i in range(args.start, args.end + 1)]
INTERACTIONS = {
    "M1-01": {"interaction": "integer-number-line", "settings": {"initialA": -3, "initialB": 4}},
    "M1-02": {"interaction": "signed-multiplication", "settings": {"operation": "multiply", "initialA": -6, "initialB": 3}},
    "M1-03": {"interaction": "fraction-sum", "settings": {"initialA": 1, "initialB": 2}},
    "M1-04": {"interaction": "powers", "settings": {"initialA": -2, "initialB": 3, "initialC": 3}},
    "M1-05": {"interaction": "expression-value", "settings": {"initialA": 3, "initialB": 5}},
    "M1-06": {"interaction": "monomial-product", "settings": {"initialA": 2, "initialB": 2, "initialC": 3}},
    "M1-07": {"interaction": "like-terms", "settings": {"initialA": 3, "initialB": 5}},
    "M1-08": {"interaction": "distributive-area", "settings": {"initialA": 3, "initialB": 2, "initialC": 4}},
    "M1-09": {"interaction": "equation-balance", "settings": {"initialA": 3, "initialB": 8, "initialC": 2}},
    "M1-10": {"interaction": "linear-equation", "settings": {"initialA": 3, "initialB": 2, "initialC": 12}},
    "M1-11": {"interaction": "linear-word-problem", "settings": {"initialA": 5, "initialB": 3, "initialC": 4}},
    "M1-12": {"interaction": "inequality", "settings": {"initialA": -2, "initialB": 8}},
    "M1-13": {"interaction": "coordinate-plane", "settings": {"initialA": -3, "initialB": 4}},
    "M1-14": {"interaction": "proportion", "settings": {"initialA": 3, "initialB": 4, "initialC": 2}},
    "M1-15": {"interaction": "parallel-angles", "settings": {"initialA": 60, "initialB": 12}},
    "M1-16": {"interaction": "triangle-congruence", "settings": {"initialA": 5, "initialB": 5, "initialC": 6}},
    "M1-17": {"interaction": "area-model", "settings": {"initialA": 8, "initialB": 5, "initialC": 3}},
    "M1-18": {"interaction": "volume-model", "settings": {"initialA": 3, "initialB": 4, "initialC": 5}},
    "M1-19": {"interaction": "data-summary", "settings": {"initialA": 4, "initialB": 6, "initialC": 8}},
    "M1-20": {"interaction": "expression-table", "settings": {"initialA": 2, "initialB": 3, "initialC": 1}},
}
PHASE_BLOCKS = [
    "goals", "diagnostic", "concept", "concept", "lab", "concept", "example",
    "practice", "practice", "practice", "practice", "feedback", "assessment",
    "review", "review",
]
AVAILABLE = {f"phase-{i:02d}" for i in range(1, 9)} | {"phase-12", "phase-14"}
ASSESSMENT_UNITS = {f"M1-{i:02d}" for i in range(1, 11)}

for unit_id in UNITS:
    spec_path = ROOT / "docs/specifications/NEXT_BATCH" / unit_id / "lesson-spec.json"
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    sections = [
        {"id": s["id"], "title": s["title"], "body": s["explanation"], "activity": s["activity"], "check": s["check"]}
        for s in spec["subunits"]
    ]
    interactive = spec["interactiveComponents"][0]
    lab_title = interactive["features"][0] if "features" in interactive else interactive["description"]
    data = {
        "schemaVersion": "1",
        "unitId": unit_id,
        "version": spec["contentVersion"],
        "reviewStatus": "draft",
        "publicationApproved": False,
        "learningPhases": [
            {"id": p["phaseId"], "title": p["title"], "blockId": PHASE_BLOCKS[i] if unit_id in ASSESSMENT_UNITS or i != 12 else "feedback", "state": "available" if p["phaseId"] in AVAILABLE or (p["phaseId"] == "phase-13" and unit_id in ASSESSMENT_UNITS) else "planned"}
            for i, p in enumerate(spec["learningPhases"])
        ],
        "blocks": [
            {"id": "goals", "type": "ConceptBlock", "title": "오늘의 학습 목표", "body": "\n".join(spec["objectives"])},
            {"id": "diagnostic", "type": "ExplanationBlock", "title": "시작 전 선수학습 확인", "readinessCheck": True, "body": "\n".join(s["description"] for s in spec["prerequisiteSkills"])},
            {"id": "concept", "type": "ExplanationBlock", "title": "핵심 개념 여섯 걸음", "sections": sections, "body": spec["instructionalStrategy"]["sequence"]},
            {"id": "lab", "type": "InteractiveBlock", "title": lab_title, **INTERACTIONS[unit_id]},
            {"id": "example", "type": "WorkedExampleBlock", "title": "풀이 과정을 따라가요", "steps": [spec["subunits"][0]["explanation"], spec["subunits"][0]["activity"], spec["subunits"][0]["check"]]},
            {"id": "practice", "type": "PracticeBlock", "title": "서로 다른 문제 원형 연습", "purpose": "practice", "hint": "조건과 개념을 구분하고, 계산 뒤에는 원래 관계나 정의에 대입해 확인해 보세요."},
            {"id": "feedback", "type": "FeedbackBlock", "title": "오답을 개념으로 되돌리기", "body": " · ".join(spec["misconceptionsToCheck"]) + "에 해당하는지 확인한 다음, 해당 소단원의 설명과 활동으로 돌아가세요. 모든 오답은 학습 기록에 남고 다시 풀기 결과와 첫 응답은 구분됩니다."},
            *([{"id": "assessment", "type": "AssessmentBlock", "title": "독립 형성평가 초안", "purpose": "assessment"}] if unit_id in ASSESSMENT_UNITS else []),
            {"id": "review", "type": "ReviewBlock", "title": "복습과 다음 단원", "body": f"제안 콘텐츠 미리보기입니다. 단계 확인과 풀이 기록은 계정에 저장되지만 정본 진도·공식 숙달 판정은 아닙니다. {'독립 형성평가 초안은 전체 제출 후에만 결과를 보여주며, 검수 대기 상태입니다. ' if unit_id in ASSESSMENT_UNITS else '형성평가는 아직 준비 중입니다. '} {'일·'.join(map(str, spec['reviewPolicy']['intervalDays']))}일 복습 간격은 제안이며 검증 전입니다."},
        ],
    }
    output = spec_path.parent / "content-draft.json"
    output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {output.relative_to(ROOT)}")
