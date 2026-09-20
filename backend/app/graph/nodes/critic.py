from app.graph.state import ResearchState, ResearchStep


def critic_node(state: ResearchState) -> dict:
    evidence = state["evidence"]
    iteration = state["research_iterations"]
    max_iterations = state["max_iterations"]

    if not evidence:
        critique = "No evidence was collected."
        needs_more_research = True

    elif iteration < max_iterations:
        critique = "More research is required."
        needs_more_research = True

    else:
        critique = "Sufficient research has been completed."
        needs_more_research = False

    next_step = (
        ResearchStep.RESEARCHING if needs_more_research else ResearchStep.WRITING
    )

    return {
        "critique": critique,
        "needs_more_research": needs_more_research,
        "current_step": next_step,
        "completed_steps": [
            *state["completed_steps"],
            ResearchStep.EVALUATING,
        ],
    }
