from fastapi import FastAPI
from pydantic import BaseModel

from app.graph.state import ResearchState, ResearchStep
from app.graph.graph import research_graph

app = FastAPI()


class ResearchRequest(BaseModel):
    query: str
    max_iterations: int = 3


@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.post("/research")
def research(request: ResearchRequest):
    initial_state: ResearchState = {
        "query": request.query,
        "research_questions": [],
        "current_question": "",
        "sources": [],
        "evidence": [],
        "critique": "",
        "needs_more_research": False,
        "report": "",
        "current_step": ResearchStep.PLANNING,
        "completed_steps": [],
        "errors": [],
        "research_iterations": 0,
        "max_iterations": request.max_iterations,
    }

    snapshots = []

    for state in research_graph.stream(
        initial_state,
        stream_mode="values",
    ):
        snapshots.append(state)

    return {
        "query": request.query,
        "steps": snapshots,
        "final_state": snapshots[-1] if snapshots else initial_state,
    }
