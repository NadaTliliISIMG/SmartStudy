"""Minimal client for the Ollama chat API (/api/chat)."""
import re

import httpx

from app import config


class OllamaError(Exception):
    """Error raised when the model cannot answer; carries the HTTP status to return."""

    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


async def chat(system: str, user: str, json_mode: bool = False, temperature: float = 0.3) -> str:
    payload = {
        "model": config.OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "stream": False,
        "options": {"temperature": temperature, "num_ctx": 8192},
    }
    if json_mode:
        payload["format"] = "json"
    # qwen3* models have a "thinking" mode that we disable
    if config.OLLAMA_MODEL.startswith("qwen3"):
        payload["think"] = False

    try:
        async with httpx.AsyncClient(timeout=config.OLLAMA_TIMEOUT) as client:
            response = await client.post(f"{config.OLLAMA_BASE_URL}/api/chat", json=payload)
            response.raise_for_status()
    except httpx.TimeoutException:
        raise OllamaError("The model took too long to answer", 504)
    except httpx.HTTPStatusError as e:
        raise OllamaError(f"Ollama error ({e.response.status_code})", 502)
    except httpx.HTTPError:
        raise OllamaError("Ollama is unreachable", 502)

    content = response.json().get("message", {}).get("content", "")
    # Remove any <think>...</think> block
    return re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()