# Planner node to take in the query, and return a list of research questions

from app.graph.state import ResearchState, ResearchStep
from app.llm import llm
from app.llm.client import response_to_text


def planner_node(state: ResearchState) -> dict:
    # Fetch query from the state
    query = state["query"]

    prompt = f"""You are an expert researcher planning agent. 

    Your task is to take the user's query, and break it down into 3-7 specific reseach questions to be answered.

    Here is the user query: {query}

    Return only the research questions one per line.
    """

    # Fetch questions from LLM
    response = llm.invoke(prompt)

    content = response_to_text(response)

    questions = [
        line.strip("- ").strip() for line in content.splitlines() if line.strip()
    ]

    return {
        "research_questions": questions,
        "current_step": ResearchStep.RESEARCHING,
        "completed_steps": [*state["completed_steps"], ResearchStep.PLANNING],
    }
