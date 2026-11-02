"""Generate review-only JSON lesson blocks from M2 curriculum specifications."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
INTERACTIONS = {
    "M2-01": ("system-pair", {"initialA": 3, "initialB": 2}),
    "M2-02": ("system-solve", {"initialA": 4, "initialB": 2}),
    "M2-03": ("system-application", {"initialA": 2, "initialB": 3}),
    "M2-04": ("function-mapping", {"initialA": 2, "initialB": 1, "initialC": 3}),
    "M2-05": ("linear-function-graph", {"initialA": 2, "initialB": -3}),
    "M2-06": ("line-intersection", {"initialA": 2, "initialB": 1, "initialC": 7}),
    "M2-07": ("square-root-area", {"initialA": 50, "initialB": 0}),
    "M2-08": ("radical-simplify", {"initialA": 2, "initialB": 50}),
    "M2-09": ("polynomial-area", {"initialA": 2, "initialB": 3}),
    "M2-10": ("factor-pairs", {"initialA": 2, "initialB": 3}),
    "M2-11": ("quadratic-roots", {"initialA": 2, "initialB": 5}),
    "M2-12": ("quadratic-area", {"initialA": 2, "initialB": 24}),
    "M2-13": ("quadratic-vertex", {"initialA": 2, "initialB": 3}),
    "M2-14": ("quadratic-extrema", {"initialA": 1, "initialB": 8, "initialC": 3}),
    "M2-15": ("similarity-scale", {"initialA": 3, "initialB": 2, "initialC": 4}),
    "M2-11": ("quadratic-roots", {"initialA": 2, "initialB": 5}),
    "M2-12": ("quadratic-area", {"initialA": 2, "initialB": 24}),
    "M2-13": ("quadratic-vertex", {"initialA": 2, "initialB": 3}),
    "M2-14": ("quadratic-extrema", {"initialA": 1, "initialB": 8, "initialC": 3}),
    "M2-15": ("similarity-scale", {"initialA": 3, "initialB": 2, "initialC": 4}),
    "M2-06": ("line-intersection", {"initialA": 2, "initialB": 1, "initialC": 7}),
    "M2-07": ("square-root-area", {"initialA": 50, "initialB": 0}),
    "M2-08": ("radical-simplify", {"initialA": 2, "initialB": 50}),
    "M2-09": ("polynomial-area", {"initialA": 2, "initialB": 3}),
    "M2-10": ("factor-pairs", {"initialA": 2, "initialB": 3}),
    "M2-11": ("quadratic-roots", {"initialA": 2, "initialB": 5}),
    "M2-12": ("quadratic-area", {"initialA": 2, "initialB": 24}),
    "M2-13": ("quadratic-vertex", {"initialA": 2, "initialB": 3}),
    "M2-14": ("quadratic-extrema", {"initialA": 1, "initialB": 8, "initialC": 3}),
    "M2-15": ("similarity-scale", {"initialA": 3, "initialB": 2, "initialC": 4}),
}
PHASE_BLOCKS = ["goals", "diagnostic", "concept", "concept", "lab", "concept", "example", "practice", "practice", "practice", "practice", "feedback", "feedback", "review", "review"]
for unit_id, (interaction, settings) in INTERACTIONS.items():
    path = ROOT / "docs/specifications/NEXT_BATCH" / unit_id / "lesson-spec.json"
    spec = json.loads(path.read_text(encoding="utf-8"))
    sections = [{"id": x["id"], "title": x["title"], "body": x["explanation"], "activity": x["activity"], "check": x["check"]} for x in spec["subunits"]]
    phases = [{"id": p["phaseId"], "title": p["title"], "blockId": PHASE_BLOCKS[i], "state": "available" if i < 8 or i == 11 else "planned"} for i, p in enumerate(spec["learningPhases"])]
    blocks = [
        {"id":"goals","type":"ConceptBlock","title":"오늘의 학습 목표","body":"\n".join(spec["objectives"])},
        {"id":"diagnostic","type":"ExplanationBlock","title":"시작 전 선수학습 확인","readinessCheck":True,"body":"\n".join(x["description"] for x in spec["prerequisiteSkills"])},
        {"id":"concept","type":"ExplanationBlock","title":"핵심 개념 여섯 걸음","sections":sections,"body":spec["instructionalStrategy"]["sequence"]},
        {"id":"lab","type":"InteractiveBlock","title":spec["interactiveComponents"][0]["features"][0],"interaction":interaction,"settings":settings},
        {"id":"example","type":"WorkedExampleBlock","title":"풀이 과정을 따라가요","steps":[spec["subunits"][0]["explanation"],spec["subunits"][0]["activity"],spec["subunits"][0]["check"]]},
        {"id":"practice","type":"PracticeBlock","title":"서로 다른 문제 원형 연습","purpose":"practice","hint":"조건의 의미를 먼저 정하고, 풀이 뒤에는 모든 원래 조건에 대입해 확인해 보세요."},
        {"id":"feedback","type":"FeedbackBlock","title":"오답을 개념으로 되돌리기","body":" · ".join(spec["misconceptionsToCheck"]) + "을 다시 확인하고 관련 소단원으로 돌아가세요. 풀이 기록은 계정별 제안 미리보기 안에서 구분 저장됩니다."},
        {"id":"review","type":"ReviewBlock","title":"복습과 다음 단원","body":"제안 콘텐츠 미리보기입니다. 공식 성취·평가가 아니며 다음 단원은 제안 순서입니다. 복습 간격은 검증 대기입니다."},
    ]
    content={"schemaVersion":"1","unitId":unit_id,"version":spec["contentVersion"],"reviewStatus":"draft","publicationApproved":False,"learningPhases":phases,"blocks":blocks}
    (path.parent/"content-draft.json").write_text(json.dumps(content,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"wrote {path.parent/'content-draft.json'}")
