from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User, QuizSet, QuizAttempt
from ..schemas import (
    MCQGenerateRequest, 
    MCQGenerateResponse, 
    QuizSetCreate, 
    QuizSet as QuizSetSchema,
    QuizSetDetail,
    QuizAttemptCreate,
    QuizResult,
    MCQQuestion
)
from ..services.mcq_service import MCQService
from ..utils.auth import get_current_user
import json

router = APIRouter()
security = HTTPBearer()
mcq_service = MCQService()

@router.post("/generate", response_model=MCQGenerateResponse)
async def generate_mcq(
    request: MCQGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate MCQs from text using Gemini AI"""
    try:
        result = await mcq_service.generate_mcq(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate MCQs: {str(e)}"
        )

@router.post("/quiz-sets", response_model=QuizSetSchema)
async def create_quiz_set(
    quiz_set: QuizSetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new quiz set"""
    db_quiz_set = QuizSet(
        title=quiz_set.title,
        description=quiz_set.description,
        subject=quiz_set.subject,
        difficulty=quiz_set.difficulty,
        source_text=quiz_set.source_text,
        questions=[q.dict() for q in quiz_set.questions],
        total_questions=len(quiz_set.questions),
        creator_id=current_user.id,
        is_public=quiz_set.is_public
    )
    
    db.add(db_quiz_set)
    db.commit()
    db.refresh(db_quiz_set)
    
    return db_quiz_set

@router.get("/quiz-sets", response_model=List[QuizSetSchema])
async def get_quiz_sets(
    skip: int = 0,
    limit: int = 10,
    subject: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's quiz sets"""
    query = db.query(QuizSet).filter(QuizSet.creator_id == current_user.id)
    
    if subject:
        query = query.filter(QuizSet.subject.ilike(f"%{subject}%"))
    
    quiz_sets = query.offset(skip).limit(limit).all()
    return quiz_sets

@router.get("/quiz-sets/{quiz_set_id}", response_model=QuizSetDetail)
async def get_quiz_set(
    quiz_set_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific quiz set details"""
    quiz_set = db.query(QuizSet).filter(
        QuizSet.id == quiz_set_id,
        QuizSet.creator_id == current_user.id
    ).first()
    
    if not quiz_set:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz set not found"
        )
    
    return quiz_set

@router.post("/quiz-sets/{quiz_set_id}/attempt", response_model=QuizResult)
async def submit_quiz_attempt(
    quiz_set_id: int,
    attempt: QuizAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit quiz attempt and get results"""
    quiz_set = db.query(QuizSet).filter(QuizSet.id == quiz_set_id).first()
    
    if not quiz_set:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz set not found"
        )
    
    # Calculate score
    questions = [MCQQuestion(**q) for q in quiz_set.questions]
    score_result = mcq_service.calculate_score(questions, attempt.answers)
    
    # Save attempt
    db_attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_set_id=quiz_set_id,
        answers=attempt.answers,
        score=score_result["score"],
        total_questions=score_result["total"],
        time_taken=0  # TODO: Add time tracking
    )
    
    db.add(db_attempt)
    db.commit()
    db.refresh(db_attempt)
    
    # Prepare result
    correct_answers = {str(i+1): q.correct_answer for i, q in enumerate(questions)}
    explanations = {str(i+1): q.explanation for i, q in enumerate(questions)}
    
    return QuizResult(
        attempt=db_attempt,
        correct_answers=correct_answers,
        explanations=explanations,
        percentage=score_result["percentage"]
    )

@router.get("/quiz-sets/{quiz_set_id}/attempts")
async def get_quiz_attempts(
    quiz_set_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all attempts for a quiz set"""
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.quiz_set_id == quiz_set_id,
        QuizAttempt.user_id == current_user.id
    ).all()
    
    return attempts
