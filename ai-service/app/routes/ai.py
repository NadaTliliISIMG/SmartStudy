from fastapi import APIRouter, HTTPException

from app.schemas.models import (
    QuizRequest,
    QuizResponse,
    SummarizeRequest,
    SummarizeResponse,
)
from app.services import quiz_generator, summarizer
from app.services.ollama import OllamaError

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize(body: SummarizeRequest):
    """Generates a structured summary of the course text."""
    try:
        return SummarizeResponse(summary=await summarizer.summarize(body.courseContent))
    except OllamaError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/generate-quiz", response_model=QuizResponse)
async def generate_quiz(body: QuizRequest):
    """Generates multiple-choice questions (4 options, 1 correct answer) from the course text."""
    try:
        questions = await quiz_generator.generate_quiz(body.courseContent, body.numberOfQuestions)
        return QuizResponse(questions=questions)
    except OllamaError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)