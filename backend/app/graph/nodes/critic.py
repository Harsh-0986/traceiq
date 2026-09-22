from app.graph.state import ResearchState, ResearchStep
from app.llm import llm, response_to_text


def critic_node(state: ResearchState) -> dict:
    query = state["query"]
    evidence = state["evidence"]
    iteration = state["research_iterations"]
    critique = state["critique"]

    evidence_text = "\n\n".join(
        f"""
Evidence {index}
Question: {item.get("question", "")}
Finding: {item.get("finding", "")}
Confidence: {item.get("confidence", "unknown")}
Source URL: {item.get("source_url", "")}
"""
        for index, item in enumerate(evidence, start=1)
    )

    prompt = f"""
You are the quality-control agent in a deep research system.

This is research iteration {iteration}.

Previous critique:
{critique}

Determine whether the previous research gap has been addressed
by the newly collected evidence.

Do not request more research for information that is already
adequately supported.

Original research query:
{query}

Evidence collected:
{evidence_text}

Evaluate whether the evidence is sufficient to produce a
reliable and useful final report.

Evaluate:

1. Coverage
   Are the important aspects of the query covered?

2. Evidence quality
   Is the evidence specific and supported by sources?

3. Missing information
   What important information is still missing?

4. Contradictions
   Are there conflicting findings that require more research?

5. Confidence
   Are there too many low-confidence findings?

You must make a decision:

- If the evidence is sufficient, recommend writing the report.
- If important information is missing, recommend more research.

Return EXACTLY:

NEEDS_MORE_RESEARCH: true or false
CRITIQUE: <brief explanation of your evaluation>
MISSING_INFORMATION: <specific information that should be researched next, or None>
"""

    response = llm.invoke(prompt)
    content = response_to_text(response)

    needs_more_research = False
    critique = ""
    missing_information = ""

    for line in content.splitlines():
        line = line.strip()

        if line.startswith("NEEDS_MORE_RESEARCH:"):
            value = line.split(":", 1)[1].strip().lower()
            needs_more_research = value == "true"

        elif line.startswith("CRITIQUE:"):
            critique = line.split(":", 1)[1].strip()

        elif line.startswith("MISSING_INFORMATION:"):
            missing_information = line.split(":", 1)[1].strip()

    # Safety limit.
    if state["research_iterations"] >= state["max_iterations"]:
        needs_more_research = False

    critique_text = f"{critique}\n\nMissing information: {missing_information}"

    next_step = (
        ResearchStep.RESEARCHING if needs_more_research else ResearchStep.WRITING
    )

    return {
        "critique": critique_text,
        "needs_more_research": needs_more_research,
        "current_step": next_step,
        "completed_steps": [
            *state["completed_steps"],
            ResearchStep.EVALUATING,
        ],
    }
