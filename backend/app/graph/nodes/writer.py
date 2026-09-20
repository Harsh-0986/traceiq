from app.graph.state import ResearchState, ResearchStep


def writer_node(state: ResearchState) -> dict:
    query = state["query"]
    evidence = state["evidence"]
    critique = state["critique"]

    report = f"# Research Report\n\n"
    report += f"## Topic\n\n{query}\n\n"

    report += "## Findings\n\n"

    for index, item in enumerate(evidence, start=1):
        report += f"### Finding {index}\n\n"
        report += f"{item['finding']}\n\n"

    report += "## Critique\n\n"
    report += f"{critique}\n"

    return {
        "report": report,
        "current_step": ResearchStep.COMPLETED,
        "completed_steps": [
            *state["completed_steps"],
            ResearchStep.WRITING,
        ],
    }
