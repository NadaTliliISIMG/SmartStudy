import json
import re

from app import config


def truncate(text: str) -> str:
    """Limits the course text sent to the model (context window protection)."""
    return text.strip()[: config.MAX_CONTENT_CHARS]


def extract_json(raw: str):
    """Parses a model answer as JSON, tolerating text around the JSON object."""
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, flags=re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise