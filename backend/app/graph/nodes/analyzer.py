# Analyser node to analyse our research data and provide evidences for critique

from app.llm import llm, response_to_text
from app.graph.state import ResearchState, ResearchStep


def analyser_node(state: ResearchState) -> dict:
    # Fetch sources from the state
    sources = state["sources"]
    query = state["query"]

    sources_text = "\n\n".join(
        f"""
SOURCE {index}
Question: {source.get("question", "")}
Title: {source.get("title", "")}
URL: {source.get("url", "")}
Content:
{source.get("content", "")}
"""
        for index, source in enumerate(sources, start=1)
    )

    prompt = f"""
You are the evidence analysis agent in a deep research system.

Original research query:
{query}

Raw sources:
{sources_text}

Analyze the sources and extract useful evidence that can
be used to answer the original research query.

For each important finding:

- State the research question it addresses.
- Summarize the actual finding.
- Assign a confidence level: high, medium, or low.
- Preserve the source URL when the finding comes from a source.

Do not invent information.
Do not add facts that are not supported by the sources.

Return EXACTLY this format for each finding:

QUESTION: <research question>
FINDING: <supported finding>
CONFIDENCE: high/medium/low
SOURCE_URL: <url>

Repeat for every important finding.
"""

    response = llm.invoke(prompt)
    content = response_to_text(response)

    evidence = parse_evidence(content)

    return {
        "evidence": evidence,
        "current_step": ResearchStep.EVALUATING,
        "completed_steps": [
            *state["completed_steps"],
            ResearchStep.ANALYZING,
        ],
    }


def parse_evidence(content: str) -> list[dict]:
    evidence = []
    current = {}

    for line in content.splitlines():
        line = line.strip()

        if line.startswith("QUESTION:"):
            if current:
                evidence.append(current)

            current = {
                "question": line.split(":", 1)[1].strip(),
            }

        elif line.startswith("FINDING:"):
            current["finding"] = line.split(":", 1)[1].strip()

        elif line.startswith("CONFIDENCE:"):
            current["confidence"] = line.split(":", 1)[1].strip()

        elif line.startswith("SOURCE_URL:"):
            current["source_url"] = line.split(":", 1)[1].strip()

    if current:
        evidence.append(current)

    return evidence
