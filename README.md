# TraceIQ — Agentic Deep Research System

A portfolio-grade demonstration of an **agentic research system** that visibly plans, researches, analyzes, evaluates, and writes evidence-backed reports. Built with a LangGraph workflow and a polished Next.js frontend.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        TraceIQ                              │
├──────────────────┬──────────────────────────────────────────┤
│   Frontend       │   Backend                                │
│   (Next.js 16)   │   (FastAPI + LangGraph)                  │
│   Port 3000      │   Port 8000                              │
└────────┬─────────┴────────────┬─────────────────────────────┘
         │                      │
         │   SSE Stream         │
         │   /research/stream   │
         ◄──────────────────────┤
```

## LangGraph Workflow

```
START
  ↓
Planner ──────► Research Questions
  ↓
Researcher ──► Web Search (Tavily) ──► Sources
  ↓
Analyzer ──► Evidence Extraction (LLM) ──► Evidence + Confidence
  ↓
Critic ──► Evaluation ──► needs_more_research?
  │                    │
  │                    ├─ YES ──► back to Researcher (iteration++)
  │                    │
  │                    └─ NO ──► Writer ──► Final Report
  ↓
END
```

## Features

### Frontend (Next.js 16 + TypeScript + Tailwind CSS v4)

**Design System**
- "Lab paper" light theme with subtle noise texture, warm paper background, ink typography
- Dark mode support via `prefers-color-scheme`
- Deep teal accent (`#0d7a70`), semantic colors for loop (amber), done (green), danger (red)
- Editorial typography: Instrument Sans (UI), Newsreader (report), IBM Plex Mono (telemetry)
- CSS animations: fade-in, slide-up, scale-in, pulse-soft with stagger delays
- Card elevation shadows, smooth transitions, custom scrollbars

**Components**

| Component | Description |
|-----------|-------------|
| `ResearchInput` | Centered landing screen with brand, multiline textarea, iteration selector (1-5), example query chips |
| `ResearchPipeline` | 5-step vertical pipeline (Planning → Researching → Analyzing → Evaluating → Writing) with animated status markers, loop-back indicator when critic requests more research |
| `AgentActivity` | Real-time activity log derived from SSE state transitions, auto-scroll, kind icons (info/success/loop/error), live badge |
| `IterationsList` | Per-iteration cards with step chips, decision badges (↻ more research / ✓ sufficient), evidence/source counts, live in-progress row |
| `SourceList/Card` | Collapsible source explorer with title, preview, domain, search query tag, external link |
| `EvidenceList/Card` | Grid layout with finding text, confidence badges (HIGH/MEDIUM/LOW), source link |
| `CriticPanel` | Parsed critique body, missing information bullets, decision badge (additional research / sufficient) |
| `ResearchReport` | Markdown rendering (react-markdown + remark-gfm), writing spinner + skeleton, empty state |
| `CompletionBanner` | Summary stats (iterations, sources, evidence), Copy / Export Markdown / New Research actions |
| `ErrorBanner` | User-friendly error message with Retry button |
| `ResearchWorkspace` | Split layout (fixed sidebar + main article), mobile drawer toggle, sticky header |

**SSE Client** (`lib/sse.ts`)
- `POST /research/stream` with query + max_iterations
- Proper async streaming via `ReadableStream` + `TextDecoder`
- 5-minute inactivity timeout, clean abort on unmount/new research
- Handles malformed events, connection errors, empty reports

### Backend (FastAPI + LangGraph + ChatNVIDIA + Tavily)

**Endpoints**
- `POST /research` — Non-streaming, returns all snapshots
- `POST /research/stream` — SSE streaming, yields state after each node

**Stream Events**
```json
{ "type": "state", "current_step": "researching", "completed_steps": ["planning"], "research_iterations": 1, "sources": [...], "evidence": [...], "critique": "", "needs_more_research": false, "report": "", "errors": [] }
```
Final: `{ "type": "done" }`

**Nodes**
- **Planner** — Breaks query into 3-7 research questions
- **Researcher** — Generates search queries, calls Tavily, accumulates sources
- **Analyzer** — Extracts evidence with confidence from sources
- **Critic** — Evaluates coverage/quality, decides if more research needed
- **Writer** — Composes final Markdown report from evidence

**CORS** — Enabled for all origins (demo)

## Quick Start

### Prerequisites
- Python 3.12+ with `uv`
- Node.js 20+ with `pnpm`
- NVIDIA API key (ChatNVIDIA)
- Tavily API key

### Backend
```bash
cd backend
cp .env.example .env   # Add NVIDIA_API_KEY, TAVILY_API_KEY
uv sync
uv run app/main.py     # Runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
pnpm install
pnpm dev               # Runs on http://localhost:3000
```

### Environment Variables

**Frontend** (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (`.env`)
```
NVIDIA_API_KEY=...
TAVILY_API_KEY=...
```

## Project Structure

```
traceiq/
├── backend/
│   ├── app/
│   │   ├── graph/
│   │   │   ├── nodes/       # planner, researcher, analyzer, critic, writer
│   │   │   ├── state.py     # ResearchState, ResearchStep
│   │   │   └── graph.py     # LangGraph compilation
│   │   ├── llm/             # ChatNVIDIA client
│   │   ├── tools/           # Tavily search
│   │   ├── config.py
│   │   └── main.py          # FastAPI + SSE endpoint
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router (page, layout, globals.css)
│   │   ├── components/
│   │   │   ├── ui/          # Button, Card, Badge, Textarea, Skeleton, Separator
│   │   │   ├── research-*.tsx   # Feature components
│   │   │   └── traceiq-app.tsx  # Main client component
│   │   └── lib/
│   │       ├── sse.ts       # SSE client
│   │       ├── types.ts     # TypeScript types
│   │       └── utils.ts     # cn(), domainOf(), nowTime()
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Demo Flow

1. Open `http://localhost:3000` — centered TraceIQ brand + research input
2. Enter a question (or click an example chip): *"How does PostgreSQL handle high-volume concurrent workloads?"*
3. Click **Start Research** — transitions to workspace
4. Watch the pipeline animate: Planning → Researching → Analyzing → Evaluating
5. If Critic finds gaps: loop back to Researching (amber indicator shows iteration count)
6. Final: Writing → Completed — polished Markdown report with citations
7. Actions: Copy, Export `.md`, New Research

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (`@theme inline`) |
| UI Primitives | Hand-rolled shadcn-style (cva + clsx + tailwind-merge + Radix Slot) |
| Icons | Lucide React |
| Markdown | react-markdown + remark-gfm |
| Backend Framework | FastAPI |
| Orchestration | LangGraph |
| LLM | ChatNVIDIA |
| Search | Tavily |
| Streaming | SSE (Server-Sent Events) |

## Portfolio Highlights

- **Real agentic loop** — Critic evaluates and routes back to Researcher visibly
- **True streaming** — SSE events drive UI in real-time, no polling/faking
- **Derived observability** — Activity log built from state transitions, not fake logs
- **Evidence traceability** — Every finding links to source URL with confidence
- **Production-grade UI** — Editorial typography, restrained animations, accessible
- **Zero auth/SaaS bloat** — Opens directly to research interface

## License

MIT — Portfolio project for demonstration purposes.