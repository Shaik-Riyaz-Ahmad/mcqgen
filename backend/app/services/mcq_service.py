import os
import json
import re
from typing import List, Dict, Any

class MCQService:
    def __init__(self):
        self.model = None
        self.MCQQuestion = None
        self.MCQGenerateRequest = None
        self.MCQGenerateResponse = None
        
        try:
            import google.generativeai as genai
            from dotenv import load_dotenv
            from app.schemas import MCQQuestion, MCQGenerateRequest, MCQGenerateResponse
            
            load_dotenv()
            
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("GOOGLE_API_KEY environment variable is required")
            
            genai.configure(api_key=api_key)
            # Use the updated model name
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            
            self.MCQQuestion = MCQQuestion
            self.MCQGenerateRequest = MCQGenerateRequest
            self.MCQGenerateResponse = MCQGenerateResponse
            
            print("MCQService initialized successfully with Gemini 1.5 Flash")
            
        except Exception as e:
            print(f"MCQService initialization warning: {e}")
    
    async def generate_mcq(self, request):
        if self.model is None:
            print("Model not available, using fallback")
            return self._generate_fallback_questions(request)
        
        try:
            print(f"Generating {request.num_questions} questions using Gemini AI...")
            prompt = self._create_prompt(request)
            response = self.model.generate_content(prompt)
            questions = self._parse_gemini_response(response.text, request)
            
            print(f"Successfully generated {len(questions)} questions")
            
            return self.MCQGenerateResponse(
                questions=questions,
                subject=request.subject,
                difficulty=request.difficulty,
                total_questions=len(questions)
            )
            
        except Exception as e:
            print(f"Error with Gemini generation: {e}")
            return self._generate_fallback_questions(request)
    
    def _create_prompt(self, request) -> str:
        return f"""
Create {request.num_questions} multiple choice questions based on the following text.

Text: {request.text}

Subject: {request.subject}
Difficulty Level: {request.difficulty}

Requirements:
1. Generate exactly {request.num_questions} questions
2. Each question should have 4 options (a, b, c, d)
3. Only one option should be correct
4. Include clear explanations for the correct answers
5. Questions should be relevant to the given text and subject
6. Difficulty should match the "{request.difficulty}" level

Format your response as JSON with this exact structure:
{{
    "questions": [
        {{
            "question": "Your question here?",
            "options": {{
                "a": "Option A text",
                "b": "Option B text", 
                "c": "Option C text",
                "d": "Option D text"
            }},
            "correct_answer": "a",
            "explanation": "Explanation of why this is correct"
        }}
    ]
}}

Make sure to return valid JSON only, no additional text.
"""
    
    def _parse_gemini_response(self, response_text: str, request) -> List:
        try:
            print(f"Parsing Gemini response: {response_text[:200]}...")
            json_text = self._extract_json_from_text(response_text)
            data = json.loads(json_text)
            
            questions = []
            for item in data.get("questions", []):
                if self.MCQQuestion:
                    question = self.MCQQuestion(
                        question=item.get("question", ""),
                        options=item.get("options", {}),
                        correct_answer=item.get("correct_answer", "a"),
                        explanation=item.get("explanation", "")
                    )
                else:
                    question = {
                        "question": item.get("question", ""),
                        "options": item.get("options", {}),
                        "correct_answer": item.get("correct_answer", "a"),
                        "explanation": item.get("explanation", "")
                    }
                questions.append(question)
            
            return questions[:request.num_questions]
            
        except Exception as e:
            print(f"Error parsing response: {e}")
            return self._generate_fallback_questions(request).questions
    
    def _extract_json_from_text(self, text: str) -> str:
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json_match.group()
        
        code_block_match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', text, re.DOTALL)
        if code_block_match:
            return code_block_match.group(1)
        
        return text
    
    def _generate_fallback_questions(self, request):
        print("Generating fallback questions...")
        fallback_questions = []
        for i in range(request.num_questions):
            question_data = {
                "question": f"Based on the {request.subject} content, which is most accurate? (Q{i+1})",
                "options": {
                    "a": f"Primary concept in {request.subject}",
                    "b": f"Secondary aspect of {request.subject}",
                    "c": f"Contradicts {request.subject} content",
                    "d": f"Not mentioned in {request.subject}"
                },
                "correct_answer": "a",
                "explanation": f"Option A represents core {request.subject} concepts at {request.difficulty} level."
            }
            
            if self.MCQQuestion:
                question = self.MCQQuestion(**question_data)
            else:
                question = question_data
            
            fallback_questions.append(question)
        
        if self.MCQGenerateResponse:
            return self.MCQGenerateResponse(
                questions=fallback_questions,
                subject=request.subject,
                difficulty=request.difficulty,
                total_questions=len(fallback_questions)
            )
        else:
            return {
                "questions": fallback_questions,
                "subject": request.subject,
                "difficulty": request.difficulty,
                "total_questions": len(fallback_questions)
            }
