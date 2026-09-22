from app.graph.state import ResearchState, ResearchStep
from app.llm.client import llm, response_to_text


def writer_node(state: ResearchState) -> dict:
    query = state["query"]
    evidence = state["evidence"]
    critique = state["critique"]

    evidence_text = "\n\n".join(
        f"""
Finding {index}
Question: {item.get("question", "")}
Finding: {item.get("finding", "")}
Confidence: {item.get("confidence", "unknown")}
Source: {item.get("source_url", "")}
"""
        for index, item in enumerate(evidence, start=1)
    )

    prompt = f"""
You are the final report writer for a deep research system.

Original research query:
{query}

Validated evidence:
{evidence_text}

Research evaluation:
{critique}

Write a clear, well-structured research report that answers
the original query.

Requirements:

1. Use only information supported by the evidence.
2. Do not invent facts, statistics, or sources.
3. Clearly distinguish facts from uncertainty.
4. Cite sources using the provided URLs.
5. Organize the report with useful headings.
6. Give a concise conclusion based on the evidence.
7. If evidence is insufficient for a particular claim,
   explicitly say that the available evidence is insufficient.

Return the final report in Markdown.

Do not include any discussion of your role as an AI agent.
"""

    response = llm.invoke(prompt)
    report = response_to_text(response)

    return {
        "report": report,
        "current_step": ResearchStep.COMPLETED,
        "completed_steps": [
            *state["completed_steps"],
            ResearchStep.WRITING,
        ],
    }

