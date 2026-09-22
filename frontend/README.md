# TraceIQ Frontend

Next.js 16 frontend for the TraceIQ agentic research system. Opens directly to a research interface — no authentication, no landing page funnel.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (`@theme inline`) |
| UI Primitives | Hand-rolled shadcn-style (cva, clsx, tailwind-merge, @radix-ui/react-slot) |
| Icons | Lucide React |
| Markdown | react-markdown + remark-gfm |
| Streaming | Native `fetch` + `ReadableStream` SSE client |

## Design System

**Light Theme (default)**
- Background: `#fdfcf8` (warm paper)
- Foreground: `#151513` (ink)
- Accent: `#0d7a70` (deep teal)
- Semantic: loop (amber), done (green), danger (red)
- Subtle noise texture via CSS radial-gradient

**Dark Theme** (`prefers-color-scheme: dark`)
- Background: `#0f0f0f`
- Foreground: `#ebeae6`
- Accent: `#2ec4b0`

**Typography**
- UI: Instrument Sans (`--font-sans`)
- Report: Newsreader (`--font-serif`)
- Telemetry: IBM Plex Mono (`--font-mono`)

**Animations** (CSS @keyframes)
- `fade-in` — 0.4s ease-out
- `slide-up` — 0.5s ease-out, 8px Y offset
- `scale-in` — 0.3s ease-out, 0.96 scale
- `pulse-soft` — 2s ease-in-out infinite
- Stagger delays: `.delay-1` through `.delay-5` (60ms increments)

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Fonts, metadata, global styles
│   │   ├── page.tsx         # Client entry → <TraceIQApp />
│   │   └── globals.css      # Design tokens, animations, report typography
│   ├── components/
│   │   ├── ui/              # Button, Card, Badge, Textarea, Skeleton, Separator
│   │   ├── research-input.tsx
│   │   ├── research-pipeline.tsx
│   │   ├── agent-activity.tsx
│   │   ├── iterations-list.tsx
│   │   ├── source-list.tsx / source-card.tsx
│   │   ├── evidence-list.tsx / evidence-card.tsx
│   │   ├── critic-panel.tsx
│   │   ├── research-report.tsx
│   │   ├── completion-banner.tsx
│   │   ├── error-banner.tsx
│   │   ├── research-workspace.tsx
│   │   └── traceiq-app.tsx  # State machine + SSE orchestration
│   └── lib/
│       ├── sse.ts           # streamResearch() — SSE client
│       ├── types.ts         # ResearchState, Source, Evidence, ActivityEntry, IterationRecord
│       └── utils.ts         # cn(), domainOf(), nowTime()
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Key Components

### `TraceIQApp` — Main Orchestrator
- Manages phase: `idle` → `running` → `completed` | `failed`
- SSE connection lifecycle (start/abort/retry)
- Derives `ActivityEntry[]` from state transitions (`deriveActivity`)
- Records `IterationRecord[]` at critic decision points (`recordIteration`)

### `ResearchWorkspace` — Split Layout
- **Sidebar** (desktop: fixed 320px, `overflow-y-auto` with top/bottom padding)
  - Pipeline, Agent Activity, Iterations, Sources (all collapsible)
- **Main** (flex-1, max-w-3xl, centered)
  - Query header, CriticPanel, EvidenceList, ResearchReport
- **Mobile**: Sidebar as slide-in drawer with sticky header

### `streamResearch()` — SSE Client (`lib/sse.ts`)
```typescript
streamResearch(
  { query, maxIterations },
  { onState, onDone, onError }
) → { abort: () => void }
```
- POST to `${NEXT_PUBLIC_API_URL}/research/stream`
- Parses `data: {...}\n\n` frames, handles `type: "done"`
- 5-minute inactivity timeout → abort + friendly error
- `AbortController` for clean cleanup

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

## Scripts

```bash
pnpm dev       # Development server (Turbopack)
pnpm build     # Production build
pnpm start     # Production server
pnpm lint      # ESLint
pnpm tsc --noEmit  # Type check
```

## Adding UI Primitives

New components follow the shadcn pattern in `components/ui/`:
```tsx
// button.tsx
import { cva } from "class-variance-authority";
const buttonVariants = cva("base-classes", { variants: { variant: {...}, size: {...} } });
```

No external component library — all primitives are source-available in the repo.

## Accessibility

- Semantic HTML (`<nav>`, `<article>`, `<header>`, `<ol>`)
- `aria-live="polite"` on activity log
- `aria-expanded` on collapsible sections
- Focus-visible rings (2px ring, 2px offset)
- Keyboard navigation: Enter to submit, Shift+Enter for newline
- `role="status"` on live indicators

## Performance

- Static generation for `/` (prerendered)
- Client-side only for `TraceIQApp` (`"use client"`)
- No hydration mismatch — initial screen is static
- Skeleton loading for report while writing
- Staggered entrance animations (60ms per item)

## Browser Support

Modern browsers with `ReadableStream` + `TextDecoder` (all evergreen).