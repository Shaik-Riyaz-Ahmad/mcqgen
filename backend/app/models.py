from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    quiz_sets = relationship("QuizSet", back_populates="creator")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")

class QuizSet(Base):
    __tablename__ = "quiz_sets"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    subject = Column(String)
    difficulty = Column(String)  # simple, moderate, complex
    source_text = Column(Text, nullable=False)
    questions = Column(JSON)  # Store MCQ questions as JSON
    total_questions = Column(Integer)
    creator_id = Column(Integer, ForeignKey("users.id"))
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", back_populates="quiz_sets")
    attempts = relationship("QuizAttempt", back_populates="quiz_set")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    quiz_set_id = Column(Integer, ForeignKey("quiz_sets.id"))
    answers = Column(JSON)  # Store user answers
    score = Column(Integer)
    total_questions = Column(Integer)
    time_taken = Column(Integer)  # in seconds
    completed_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="quiz_attempts")
    quiz_set = relationship("QuizSet", back_populates="attempts")
