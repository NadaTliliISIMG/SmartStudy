from typing import List
from pydantic import BaseModel, Field, field_validator


class SummarizeRequest(BaseModel):
    courseContent: str = Field(..., min_length=50)


class SummarizeResponse(BaseModel):
    summary: str


class QuizRequest(BaseModel):
    courseContent: str = Field(..., min_length=50)
    numberOfQuestions: int = Field(5, ge=1, le=20)


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correctAnswer: str

    @field_validator("options")
    @classmethod
    def four_options(cls, v):
        if len(v) != 4:
            raise ValueError("Une question doit avoir exactement 4 options")
        return v


class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
