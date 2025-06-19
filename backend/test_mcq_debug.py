#!/usr/bin/env python3

import os
import json
import re
from typing import List, Dict, Any
import traceback

print("Starting debug test...")

try:
    import google.generativeai as genai
    print("✓ Google Generative AI imported")
except Exception as e:
    print("✗ Error importing Google Generative AI:", e)
    exit(1)

try:
    from dotenv import load_dotenv
    print("✓ dotenv imported")
except Exception as e:
    print("✗ Error importing dotenv:", e)
    exit(1)

try:
    from app.schemas import MCQQuestion, MCQGenerateRequest, MCQGenerateResponse
    print("✓ Schemas imported")
except Exception as e:
    print("✗ Error importing schemas:", e)
    traceback.print_exc()
    exit(1)

print("Loading environment...")
load_dotenv()

print("Creating MCQService class...")

class MCQService:
    def __init__(self):
        print("Initializing MCQService...")
        # Configure Google Gemini AI
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        print(f"API key found: {len(api_key)} characters")
        genai.configure(api_key=api_key)
        print("Gemini configured")
        self.model = genai.GenerativeModel('gemini-pro')
        print("Model created")

print("Creating instance...")
try:
    service = MCQService()
    print("✓ MCQService created successfully!")
except Exception as e:
    print("✗ Error creating MCQService:", e)
    traceback.print_exc()
