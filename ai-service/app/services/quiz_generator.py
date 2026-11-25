import json
import logging
from typing import List

from app.schemas.models import QuizQuestion
from app.services import ollama
from app.utils.text import extract_json, truncate

logger = logging.getLogger(__name__)

MAX_ATTEMPTS = 3

SYSTEM = (
    "Tu es un générateur de QCM pédagogiques. Tu t'appuies UNIQUEMENT sur le texte du cours fourni, "
    "sans utiliser de connaissances extérieures. Tu réponds dans la même langue que le cours. "
    "Tu réponds uniquement avec du JSON valide."
)

PROMPT = """Génère exactement {n} questions à choix multiples à partir du cours ci-dessous.

Règles :
- chaque question a exactement 4 options différentes ;
- une seule option est correcte, et "correctAnswer" doit être recopiée à l'identique parmi les options ;
- les mauvaises options doivent être plausibles ;
- varie la position de la bonne réponse.

Format JSON strict :
{{"questions": [{{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "..."}}]}}

COURS :
\"\"\"
{content}
\"\"\"
"""


def validate_questions(raw_questions) -> List[QuizQuestion]:
    """Keeps only valid questions: 4 distinct options and a correct answer among them."""
    valid: List[QuizQuestion] = []
    for item in raw_questions or []:
        try:
            q = QuizQuestion(**item)
        except Exception:
            continue
        options = [o.strip() for o in q.options]
        answer = q.correctAnswer.strip()
        if len(set(options)) != 4 or answer not in options or not q.question.strip():
            continue
        valid.append(QuizQuestion(question=q.question.strip(), options=options, correctAnswer=answer))
    return valid


async def generate_quiz(course_content: str, number_of_questions: int) -> List[QuizQuestion]:
    prompt = PROMPT.format(n=number_of_questions, content=truncate(course_content))
    best: List[QuizQuestion] = []

    for attempt in range(1, MAX_ATTEMPTS + 1):
        raw = await ollama.chat(SYSTEM, prompt, json_mode=True, temperature=0.4)
        try:
            data = extract_json(raw)
            questions = validate_questions(data.get("questions") if isinstance(data, dict) else None)
        except (json.JSONDecodeError, AttributeError, TypeError):
            logger.warning("Attempt %s: invalid JSON from the model", attempt)
            continue
        if len(questions) > len(best):
            best = questions
        if len(best) >= number_of_questions:
            break

    if not best:
        raise ollama.OllamaError("Unable to generate a valid quiz", 502)
    return best[:number_of_questions]