from langgraph.graph import END, START, StateGraph

from app.graph.nodes import (
    planner_node,
    critic_node,
    analyser_node,
    researcher_node,
    writer_node,
)
from app.graph.state import ResearchState


def route_after_critic(state: ResearchState) -> str:
    if state["needs_more_research"]:
        return "researcher"

    return "writer"


def build_graph():
    builder = StateGraph(ResearchState)

    # Add nodes
    builder.add_node("planner", planner_node)
    builder.add_node("critic", critic_node)
    builder.add_node("writer", writer_node)
    builder.add_node("analyzer", analyser_node)
    builder.add_node("researcher", researcher_node)

    # Add edges
    builder.add_edge(START, "planner")
    builder.add_edge("planner", "researcher")
    builder.add_edge("researcher", "analyzer")
    builder.add_edge("analyzer", "critic")

    # Conditional flow
    builder.add_conditional_edges(
        "critic",
        route_after_critic,
        {
            "researcher": "researcher",
            "writer": "writer",
        },
    )

    # End
    builder.add_edge("writer", END)

    return builder.compile()


research_graph = build_graph()
