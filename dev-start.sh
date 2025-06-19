#!/bin/bash
# Development script to start both frontend and backend

echo "🚀 Starting AI Learner MCQ Development Environment"
echo ""

# Check if Python virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Function to start backend
start_backend() {
    echo "🐍 Starting FastAPI Backend..."
    cd backend
    source venv/bin/activate
    python main.py &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "⚛️  Starting Next.js Frontend..."
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend started with PID: $FRONTEND_PID"
}

# Start both services
start_backend
sleep 3  # Give backend time to start
start_frontend

echo ""
echo "✅ Development environment is ready!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
