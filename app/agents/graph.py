from langgraph.graph import StateGraph, END
from app.agents.state import VishwakarmaState
from app.agents.resume_parser import parse_resume
from app.agents.skill_gap import analyze_skill_gaps
from app.agents.roadmap import build_roadmap


def resume_parser_node(state: VishwakarmaState) -> VishwakarmaState:
    try:
        parsed = parse_resume(state["resume_raw"])
        return {**state, "parsed_resume": parsed}
    except Exception as e:
        return {**state, "error": str(e)}


def skill_gap_node(state: VishwakarmaState) -> VishwakarmaState:
    try:
        from app.models.analysis import SkillGap
        report = analyze_skill_gaps(
            parsed_resume=state["parsed_resume"],
            market_skill_freq=state["market_skill_freq"],
            target_role=state["target_role"],
            target_location=state["target_location"],
            total_jds=len(state["live_jds"]),
        )
        return {**state, "skill_gaps": [g.model_dump() for g in report.missing_skills]}
    except Exception as e:
        return {**state, "error": str(e)}


def roadmap_node(state: VishwakarmaState) -> VishwakarmaState:
    try:
        from app.models.analysis import SkillGap
        gaps = [SkillGap(**g) for g in state["skill_gaps"]]
        roadmap = build_roadmap(
            skill_gaps=gaps,
            target_role=state["target_role"],
            target_location=state["target_location"],
            existing_skills=state["parsed_resume"].skills,
        )
        return {**state, "roadmap": roadmap.model_dump()}
    except Exception as e:
        return {**state, "error": str(e)}


def build_graph():
    graph = StateGraph(VishwakarmaState)
    graph.add_node("resume_parser", resume_parser_node)
    graph.add_node("skill_gap", skill_gap_node)
    graph.add_node("roadmap", roadmap_node)
    graph.set_entry_point("resume_parser")
    graph.add_edge("resume_parser", "skill_gap")
    graph.add_edge("skill_gap", "roadmap")
    graph.add_edge("roadmap", END)
    return graph.compile()


pipeline = build_graph()
