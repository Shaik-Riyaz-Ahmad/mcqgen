#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

print("Testing imports...")

try:
    from app.schemas import MCQQuestion, MCQGenerateRequest, MCQGenerateResponse
    print("✓ Schema imports successful")
except Exception as e:
    print(f"✗ Schema import failed: {e}")
    import traceback
    traceback.print_exc()

print("\nTesting MCQService import...")
try:
    # First, let's try to import the module
    import app.services.mcq_service as mcq_module
    print("✓ Module imported")
    print(f"Module attributes: {[attr for attr in dir(mcq_module) if not attr.startswith('_')]}")
    
    # Now try to get the class
    if hasattr(mcq_module, 'MCQService'):
        MCQService = mcq_module.MCQService
        print("✓ MCQService class found")
        
        # Try to instantiate
        service = MCQService()
        print("✓ MCQService instantiated")
    else:
        print("✗ MCQService class not found in module")
        
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
