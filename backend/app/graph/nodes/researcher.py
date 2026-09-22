# Researcher node to take in the research questions, and return a list of answers
from app.llm import llm, response_to_text
from app.tools import search_web
from app.graph.state import ResearchState, ResearchStep


def researcher_node(state: ResearchState) -> dict:
    query = state["query"]
    questions = state["research_questions"]
    critique = state["critique"]
    iteration = state["research_iterations"]
    searched_queries = state["searched_queries"]

    # First iteration: research the planner's questions.
    # Later iterations: research what the critic says is missing.
    if iteration == 0:
        research_context = "\n".join(f"- {question}" for question in questions)

        instruction = f"""
Research the following questions:

{research_context}
"""

    else:
        instruction = f"""
This is research iteration {iteration + 1}.

Previous critic feedback:
{critique}

Use the critic's feedback to identify what is still missing
from the research.

Do NOT simply repeat the original research questions.
Already searched queries: {searched_queries}
Create searches specifically targeted at the missing information.
"""

    prompt = f"""
You are the research search strategist for a deep research agent.

Original user query:
{query}

{instruction}

Generate 1-3 precise web search queries.

Search for factual, reliable information.
Prefer authoritative and primary sources when appropriate.

Return ONLY the search queries, one per line.
"""
    response = llm.invoke(prompt)
    content = response_to_text(response)

    previous_queries = set(state["searched_queries"])

    search_queries = [
        line.strip("- ").strip() for line in content.splitlines() if line.strip()
    ]

    search_queries = [q for q in search_queries if q not in previous_queries]

    sources = []

    for search_query in search_queries:
        results = search_web(search_query)

        for result in results:
            sources.append(
                {
                    "question": search_query,
                    "title": result.get("title", ""),
                    "url": result.get("url", ""),
                    "content": result.get("content", ""),
                }
            )

    return {
        "sources": [*state["sources"], *sources],
        "searched_queries": [
            *state["searched_queries"],
            *search_queries,
        ],
        "current_question": "",
        "current_step": ResearchStep.ANALYZING,
        "completed_steps": [
            *state["completed_steps"],
            ResearchStep.RESEARCHING,
        ],
        "research_iterations": state["research_iterations"] + 1,
    }
