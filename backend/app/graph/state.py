from typing import TypedDict
from enum import Enum


class ResearchStep(str, Enum):
    PLANNING = "planning"
    RESEARCHING = "researching"
    ANALYZING = "analyzing"
    EVALUATING = "evaluating"
    WRITING = "writing"
    COMPLETED = "completed"
    FAILED = "failed"


class ResearchState(TypedDict):
    # User input
    query: str

    # Planning
    research_questions: list[str]

    # Research
    current_question: str
    sources: list[dict]
    evidence: list[dict]
    searched_queries: list[str]

    # Evaluation
    critique: str
    needs_more_research: bool

    # Final output
    report: str

    # Execution tracking
    current_step: ResearchStep
    completed_steps: list[ResearchStep]
    errors: list[str]

    # Safety / limits
    research_iterations: int
    max_iterations: int
