#!/bin/bash
# Quick setup script for backend

echo "🔧 Setting up AI Learner MCQ Backend..."

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔗 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing Python dependencies..."
pip install -r requirements.txt

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📋 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your Google API key"
fi

echo "✅ Backend setup complete!"
echo "🚀 To start the backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python main.py"
