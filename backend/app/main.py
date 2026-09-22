from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import asyncio

from app.graph.state import ResearchState, ResearchStep
from app.graph.graph import research_graph

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
        "searched_queries": [],
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


@app.post("/research/stream")
async def research_stream(request: ResearchRequest):
    initial_state: ResearchState = {
        "searched_queries": [],
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

    async def event_generator():
        async for state in research_graph.astream(
            initial_state,
            stream_mode="values",
        ):
            event = {
                "type": "state",
                "current_step": state["current_step"],
                "completed_steps": state["completed_steps"],
                "research_iterations": state["research_iterations"],
                "sources": state["sources"],
                "evidence": state["evidence"],
                "critique": state["critique"],
                "needs_more_research": state["needs_more_research"],
                "report": state["report"],
                "errors": state["errors"],
            }

            yield f"data: {json.dumps(event, default=str)}\n\n"

        yield "data: " + json.dumps({"type": "done"}) + "\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
