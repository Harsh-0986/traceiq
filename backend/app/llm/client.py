from langchain_nvidia import ChatNVIDIA
from app.config import settings
import os

os.environ["LANGSMITH_TRACING"] = str(settings.langsmith_tracing).lower()
os.environ["LANGSMITH_API_KEY"] = settings.langsmith_api_key.get_secret_value()
os.environ["LANGSMITH_PROJECT"] = settings.langsmith_project

if settings.llm_api_key.get_secret_value().startswith("nvapi-"):
    print("Using NVIDIA LLM")
    os.environ["NVIDIA_API_KEY"] = settings.llm_api_key.get_secret_value()

base_llm = ChatNVIDIA(temperature=0.0, model=settings.model, timeout=180)
llm = base_llm.with_retry(stop_after_attempt=3, wait_exponential_jitter=True)

print(settings.model)


def response_to_text(response) -> str:
    if isinstance(response.content, str):
        return response.content

    return "".join(
        block.get("text", "") for block in response.content if isinstance(block, dict)
    )
