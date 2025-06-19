from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# MCQ schemas
class MCQQuestion(BaseModel):
    question: str
    options: Dict[str, str]  # {"a": "option1", "b": "option2", etc.}
    correct_answer: str
    explanation: str

class MCQGenerateRequest(BaseModel):
    text: str = Field(..., min_length=50)
    num_questions: int = Field(default=5, ge=1, le=20)
    subject: str = Field(default="general")
    difficulty: str = Field(default="simple", pattern="^(simple|moderate|complex)$")

class MCQGenerateResponse(BaseModel):
    questions: List[MCQQuestion]
    subject: str
    difficulty: str
    total_questions: int

# Quiz Set schemas
class QuizSetBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: str
    difficulty: str
    is_public: bool = False

class QuizSetCreate(QuizSetBase):
    source_text: str
    questions: List[MCQQuestion]

class QuizSet(QuizSetBase):
    id: int
    total_questions: int
    creator_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class QuizSetDetail(QuizSet):
    questions: List[MCQQuestion]
    source_text: str

# Quiz Attempt schemas
class QuizAttemptCreate(BaseModel):
    quiz_set_id: int
    answers: Dict[str, str]  # {"1": "a", "2": "b", etc.}

class QuizAttempt(BaseModel):
    id: int
    score: int
    total_questions: int
    time_taken: int
    completed_at: datetime
    
    class Config:
        from_attributes = True

class QuizResult(BaseModel):
    attempt: QuizAttempt
    correct_answers: Dict[str, str]
    explanations: Dict[str, str]
    percentage: float

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
