# Researcher node to take in the research questions, and return a list of answers
from app.graph.state import ResearchState, ResearchStep


def researcher_node(state: ResearchState) -> dict:
    questions = state["research_questions"]

    sources = [
        {
            "question": question,
            "content": f"Research performed for: {question}",
        }
        for question in questions
    ]

    return {
        "sources": sources,
        "current_question": "",
        "current_step": ResearchStep.ANALYZING,
        "completed_steps": [
            *state["completed_steps"],
            ResearchStep.RESEARCHING,
        ],
        "research_iterations": state["research_iterations"] + 1,
    }
