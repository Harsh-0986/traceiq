# Analyser node to analyse our research data and provide evidences for critique

from app.graph.state import ResearchState, ResearchStep


def analyser_node(state: ResearchState) -> dict:
    # Fetch sources from the state
    sources = state["sources"]

    # Find evidences
    evidence = [
        {
            "question": source["question"],
            "finding": source["content"],
        }
        for source in sources
    ]

    return {
        "evidence": evidence,
        "current_step": ResearchStep.EVALUATING,
        "completed_steps": [
            *state["completed_steps"],
            ResearchStep.ANALYZING,
        ],
    }
