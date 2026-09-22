from tavily import TavilyClient

from app.config import settings


# tavily = TavilyClient()
tavily = TavilyClient(api_key=settings.tavily_api_key.get_secret_value())


def search_web(query: str, max_results: int = 5) -> list[dict]:
    response = tavily.search(
        query=query,
        search_depth="advanced",
        max_results=max_results,
    )

    return response["results"]
