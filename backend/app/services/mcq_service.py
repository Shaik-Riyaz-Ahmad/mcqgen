print("mcq_service.py is being executed")

class MCQService:
    def __init__(self):
        print("MCQService __init__ called")
    
    def test(self):
        return "MCQService is working"

print("MCQService class defined")

# Test the class
if __name__ == "__main__":
    print("Running as main")
    service = MCQService()
    print("Service created:", service.test())
