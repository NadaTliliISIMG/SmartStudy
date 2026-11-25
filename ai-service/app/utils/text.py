from app import config


def truncate(text: str) -> str:
    """Limits the course text sent to the model (context window protection)."""
    return text.strip()[: config.MAX_CONTENT_CHARS]