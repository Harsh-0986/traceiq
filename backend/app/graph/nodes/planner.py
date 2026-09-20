# Planner node to take in the query, and return a list of research questions

from app.graph.state import ResearchState, ResearchStep


def planner_node(state: ResearchState) -> dict:
    # Fetch query from the state
    query = state["query"]

    # Fetch questions from LLM
    questions = [
        f"What are the key facts about {query}?",
        f"What are the advantages and disadvantages of {query}?",
        f"What are the important recent developments related to {query}?",
    ]

    return {
        "research_questions": questions,
        "current_step": ResearchStep.RESEARCHING,
        "completed_steps": [*state["completed_steps"], ResearchStep.PLANNING],
    }
