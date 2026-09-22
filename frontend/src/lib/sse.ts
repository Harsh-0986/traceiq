import {
  emptyResearchState,
  toResearchState,
  type ResearchState,
  type StreamEvent,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

export type StreamCallbacks = {
  onState: (state: ResearchState) => void;
  onDone: (state: ResearchState) => void;
  onError: (message: string) => void;
};

export type StreamHandle = {
  abort: () => void;
};

export function streamResearch(
  params: { query: string; maxIterations: number },
  callbacks: StreamCallbacks,
): StreamHandle {
  const controller = new AbortController();
  let cancelled = false;
  let finished = false;
  let latest = emptyResearchState();
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const armTimeout = () => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      controller.abort();
      callbacks.onError(
        "Research timed out — the backend stopped sending updates. Check that the TraceIQ API is still running, then retry.",
      );
    }, INACTIVITY_TIMEOUT_MS);
  };

  const abort = () => {
    cancelled = true;
    if (timeout) clearTimeout(timeout);
    controller.abort();
  };

  void (async () => {
    armTimeout();

    let response: Response;
    try {
      response = await fetch(`${API_URL}/research/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: params.query,
          max_iterations: params.maxIterations,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      if (cancelled) return;
      if (error instanceof DOMException && error.name === "AbortError") return;
      callbacks.onError(
        `TraceIQ could not reach the research backend at ${API_URL}. Make sure the API is running, then retry.`,
      );
      return;
    }

    if (!response.ok || !response.body) {
      if (cancelled) return;
      callbacks.onError(
        response.status === 422
          ? "The research request was rejected by the backend. Try rephrasing your question."
          : `The research backend returned an error (HTTP ${response.status}). Check the API server, then retry.`,
      );
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const dispatch = (frame: string) => {
      const line = frame.trim();
      if (!line.startsWith("data:")) return;

      let event: StreamEvent;
      try {
        event = JSON.parse(line.slice(5).trim()) as StreamEvent;
      } catch {
        console.warn("TraceIQ: skipping malformed SSE event", line);
        return;
      }

      if (event.type === "done") {
        if (timeout) clearTimeout(timeout);
        finished = true;
        if (latest.report) {
          callbacks.onDone(latest);
        } else if (!cancelled) {
          callbacks.onError(
            "Research finished without producing a report. Try again or adjust your question.",
          );
        }
        return;
      }

      latest = toResearchState(event);
      if (timeout) clearTimeout(timeout);
      armTimeout();
      callbacks.onState(latest);
    };

    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let separator = buffer.indexOf("\n\n");
        while (separator !== -1) {
          dispatch(buffer.slice(0, separator));
          buffer = buffer.slice(separator + 2);
          separator = buffer.indexOf("\n\n");
        }
      }

      if (buffer.trim()) dispatch(buffer);
    } catch (error) {
      if (cancelled) return;
      if (error instanceof DOMException && error.name === "AbortError") return;
      callbacks.onError(
        "Research interrupted — TraceIQ lost connection to the research backend. Any progress so far is kept below.",
      );
      return;
    }

    if (timeout) clearTimeout(timeout);
    if (!cancelled && !finished && latest.report) callbacks.onDone(latest);
  })();

  return { abort };
}
