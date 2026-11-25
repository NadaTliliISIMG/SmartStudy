from app.services import ollama
from app.utils.text import truncate

# The prompt forces the model to rely ONLY on the supplied course text.
SYSTEM = (
    "Tu es un assistant pédagogique. Tu résumes des cours pour des étudiants. "
    "Tu t'appuies UNIQUEMENT sur le texte du cours fourni, sans ajouter de connaissances extérieures. "
    "Tu réponds dans la même langue que le cours."
)

PROMPT = """Résume le cours ci-dessous de façon claire et structurée, en texte brut (pas de Markdown, pas de #, pas de **).

Format attendu :
Idée générale : une ou deux phrases.
Points clés :
- point 1
- point 2
(5 à 8 points au maximum)
À retenir : une phrase de conclusion.

COURS :
\"\"\"
{content}
\"\"\"
"""


async def summarize(course_content: str) -> str:
    summary = await ollama.chat(SYSTEM, PROMPT.format(content=truncate(course_content)), temperature=0.2)
    if not summary:
        raise ollama.OllamaError("The model returned an empty summary", 502)
    return summary