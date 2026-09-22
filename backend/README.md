# TraceIQ Backend

FastAPI + LangGraph backend for the TraceIQ agentic research system. Exposes a streaming SSE endpoint that yields state after each LangGraph node execution.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | FastAPI |
| Orchestration | LangGraph |
| LLM | ChatNVIDIA (NVIDIA Nemotron) |
| Search | Tavily |
| Streaming | SSE (Server-Sent Events) via `StreamingResponse` |
| Language | Python 3.12+ |
| Package Manager | `uv` |

## Project Structure

```
backend/
├── app/
│   ├── graph/
│   │   ├── nodes/
│   │   │   ├── __init__.py
│   │   │   ├── planner.py      # Generates research questions
│   │   │   ├── researcher.py   # Searches web via Tavily
│   │   │   ├── analyzer.py     # Extracts evidence with confidence
│   │   │   ├── critic.py       # Evaluates coverage, decides loop
│   │   │   └── writer.py       # Composes final Markdown report
│   │   ├── state.py            # ResearchState (TypedDict), ResearchStep (Enum)
│   │   └── graph.py            # StateGraph compilation + routing
│   ├── llm/
│   │   ├── __init__.py
│   │   └── client.py           # ChatNVIDIA wrapper + response_to_text
│   ├── tools/
│   │   ├── __init__.py
│   │   └── search.py           # Tavily search wrapper
│   ├── config.py               # Settings (API keys from env)
│   └── main.py                 # FastAPI app + /research/stream endpoint
├── pyproject.toml
├── uv.lock
├── .env.example
└── .env
```

## LangGraph Workflow

```python
# app/graph/graph.py
def route_after_critic(state: ResearchState) -> str:
    if state["needs_more_research"]:
        return "researcher"
    return "writer"

def build_graph():
    builder = StateGraph(ResearchState)
    builder.add_node("planner", planner_node)
    builder.add_node("researcher", researcher_node)
    builder.add_node("analyzer", analyser_node)
    builder.add_node("critic", critic_node)
    builder.add_node("writer", writer_node)

    builder.add_edge(START, "planner")
    builder.add_edge("planner", "researcher")
    builder.add_edge("researcher", "analyzer")
    builder.add_edge("analyzer", "critic")
    builder.add_conditional_edges("critic", route_after_critic, {
        "researcher": "researcher",
        "writer": "writer",
    })
    builder.add_edge("writer", END)
    return builder.compile()
```

**Flow:**
```
START → Planner → Researcher → Analyzer → Critic
                              ↑              │
                              │              ↓
                              └──────────────┘ (if needs_more_research)
                                                      ↓
                                                   Writer → END
```

## Endpoints

### `POST /research/stream` — SSE Streaming (Primary)

**Request:**
```json
{
  "query": "How does PostgreSQL handle high-volume concurrent workloads?",
  "max_iterations": 2
}
```

**Response (text/event-stream):**
```
data: {"type":"state","current_step":"planning","completed_steps":[],"research_iterations":0,"sources":[],"evidence":[],"critique":"","needs_more_research":false,"report":"","errors":[],"research_questions":[]}

data: {"type":"state","current_step":"researching","completed_steps":["planning"],"research_iterations":0,"sources":[],"evidence":[],"critique":"","needs_more_research":false,"report":"","errors":[],"research_questions":["How does PostgreSQL handle concurrency?","What is MVCC?"]}

data: {"type":"state","current_step":"analyzing","completed_steps":["planning","researching"],"research_iterations":1,"sources":[...],"evidence":[],"critique":"","needs_more_research":false,"report":"","errors":[]}

data: {"type":"state","current_step":"evaluating","completed_steps":["planning","researching","analyzing"],"research_iterations":1,"sources":[...],"evidence":[...],"critique":"...","needs_more_research":true,"report":"","errors":[]}

data: {"type":"state","current_step":"researching","completed_steps":[...],"research_iterations":1,"sources":[...],"evidence":[...],"critique":"...","needs_more_research":true,"report":"","errors":[]}

... (loop continues)

data: {"type":"state","current_step":"writing","completed_steps":[...],"research_iterations":2,"sources":[...],"evidence":[...],"critique":"...","needs_more_research":false,"report":"","errors":[]}

data: {"type":"state","current_step":"completed","completed_steps":[...],"research_iterations":2,"sources":[...],"evidence":[...],"critique":"...","needs_more_research":false,"report":"# PostgreSQL...\n\n## Executive Summary\n...","errors":[]}

data: {"type":"done"}
```

**Event Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `type` | `"state" \| "done"` | Event type |
| `current_step` | string | Current LangGraph node (planning/researching/analyzing/evaluating/writing/completed/failed) |
| `completed_steps` | string[] | Steps completed so far |
| `research_iterations` | int | Number of Researcher executions |
| `sources` | Source[] | Accumulated web sources |
| `evidence` | Evidence[] | Extracted findings with confidence |
| `critique` | string | Critic evaluation text |
| `needs_more_research` | bool | Whether Critic requested another iteration |
| `report` | string | Final Markdown report (empty until Writer completes) |
| `errors` | string[] | Accumulated error messages |
| `research_questions` | string[] | Questions from Planner |

### `POST /research` — Non-Streaming (Debug)

Returns all snapshots at once:
```json
{
  "query": "...",
  "steps": [ {state1}, {state2}, ... ],
  "final_state": {stateN}
}
```

## State Schema (`app/graph/state.py`)

```python
class ResearchStep(str, Enum):
    PLANNING = "planning"
    RESEARCHING = "researching"
    ANALYZING = "analyzing"
    EVALUATING = "evaluating"
    WRITING = "writing"
    COMPLETED = "completed"
    FAILED = "failed"

class ResearchState(TypedDict):
    query: str
    research_questions: list[str]
    current_question: str
    sources: list[dict]          # {question, title, url, content}
    evidence: list[dict]         # {question, finding, confidence, source_url}
    searched_queries: list[str]
    critique: str
    needs_more_research: bool
    report: str
    current_step: ResearchStep
    completed_steps: list[ResearchStep]
    errors: list[str]
    research_iterations: int
    max_iterations: int
```

## Node Details

### Planner (`planner_node`)
- Input: `query`
- Output: `research_questions`, `current_step=RESEARCHING`, `completed_steps+=PLANNING`
- Prompts LLM for 3-7 specific research questions

### Researcher (`researcher_node`)
- Input: `research_questions` (iteration 0) or `critique` (iteration > 0)
- Generates 1-3 search queries via LLM
- Calls Tavily for each query
- Output: `sources` (accumulated), `searched_queries`, `current_step=ANALYZING`, `completed_steps+=RESEARCHING`, `research_iterations++`

### Analyzer (`analyser_node`)
- Input: `sources`
- Prompts LLM to extract evidence in structured format:
  ```
  QUESTION: ...
  FINDING: ...
  CONFIDENCE: high/medium/low
  SOURCE_URL: ...
  ```
- Parses response into `evidence[]`
- Output: `evidence`, `current_step=EVALUATING`, `completed_steps+=ANALYZING`

### Critic (`critic_node`)
- Input: `evidence`, `critique` (previous), `research_iterations`
- Evaluates: coverage, quality, missing info, contradictions, confidence
- Returns structured:
  ```
  NEEDS_MORE_RESEARCH: true/false
  CRITIQUE: ...
  MISSING_INFORMATION: ...
  ```
- Safety: forces `needs_more_research=false` if `research_iterations >= max_iterations`
- Output: `critique`, `needs_more_research`, `current_step=RESEARCHING|WRITING`, `completed_steps+=EVALUATING`

### Writer (`writer_node`)
- Input: `evidence`, `critique`, `query`
- Composes final Markdown report
- Output: `report`, `current_step=COMPLETED`, `completed_steps+=WRITING`

## Streaming Implementation

```python
@app.post("/research/stream")
async def research_stream(request: ResearchRequest):
    initial_state = {...}
    
    async def event_generator():
        async for state in research_graph.astream(initial_state, stream_mode="values"):
            event = { "type": "state", **state }
            yield f"data: {json.dumps(event, default=str)}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
    
    return StreamingResponse(event_generator(), media_type="text/event-stream", ...)
```

**Key:** Uses `astream()` (async iterator) — yields after each node completes, enabling real-time UI updates.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NVIDIA_API_KEY` | Yes | NVIDIA API key for ChatNVIDIA |
| `TAVILY_API_KEY` | Yes | Tavily search API key |

Create `.env` from `.env.example`:
```bash
cp .env.example .env
# Edit with your keys
```

## CORS

Enabled for all origins (`allow_origins=["*"]`) — demo configuration.

## Scripts

```bash
uv sync              # Install dependencies
uv run app/main.py   # Run server on :8000
uv run pytest        # Run tests (if added)
```

## Dependencies (pyproject.toml)

Key packages:
- `fastapi`, `uvicorn` — API server
- `langgraph` — Orchestration
- `langchain-nvidia-ai-endpoints` — ChatNVIDIA
- `tavily-python` — Web search
- `pydantic` — Validation
- `python-dotenv` — Env loading

## Extending

**Add a new node:**
1. Create `app/graph/nodes/new_node.py` with `new_node(state) -> dict`
2. Add to `app/graph/nodes/__init__.py`
3. Add node + edges in `app/graph/graph.py`

**Change LLM:** Modify `app/llm/client.py` — swap ChatNVIDIA for any LangChain-compatible model.

**Add search provider:** Extend `app/tools/search.py` with new provider class.

## Error Handling

- LangGraph exceptions propagate → SSE connection closes → frontend shows "Research interrupted"
- `research_iterations >= max_iterations` forces Critic to proceed to Writer
- Missing API keys → FastAPI startup failure (validate in `config.py`)

## Observability

Each SSE event is a full state snapshot — frontend derives:
- Pipeline progress from `current_step` + `completed_steps`
- Activity log from state transitions
- Iteration records from Critic decisions
- Source/evidence counts from arrays