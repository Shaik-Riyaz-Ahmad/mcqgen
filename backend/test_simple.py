import os
import json
import re
from typing import List, Dict, Any

# Test without google.generativeai first
print("Creating simple MCQService...")

class MCQService:
    def __init__(self):
        print("MCQService initialized successfully")
        self.test = "working"
    
    def test_method(self):
        return "MCQService is working"

print("Class defined, creating instance...")
service = MCQService()
print("Instance created:", service.test_method())
