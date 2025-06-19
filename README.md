# AI Learner MCQ - Professional MCQ Generator

A modern, full-stack application for generating high-quality Multiple Choice Questions (MCQs) from any text using Google Gemini AI and LangChain.

## 🚀 Features

- **AI-Powered Generation**: Generate MCQs from any text using Google Gemini AI
- **Professional UI**: Modern, responsive design with Tailwind CSS and shadcn/ui
- **User Authentication**: Secure login/register system with JWT
- **Quiz Management**: Create, save, and manage quiz sets
- **Multiple Difficulty Levels**: Simple, Moderate, and Complex questions
- **Export Options**: Download quizzes as CSV files
- **Real-time Analytics**: Track quiz performance and statistics
- **Responsive Design**: Works perfectly on desktop and mobile

## 🛠 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Lucide React** icons

### Backend
- **FastAPI** for API development
- **SQLAlchemy** ORM
- **PostgreSQL/SQLite** database
- **JWT Authentication**
- **Google Gemini AI** integration
- **LangChain** for AI workflows

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Google Gemini API key

### 1. Clone and Setup
```bash
git clone <repository-url>
cd AI_Learner_MCQ
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your settings
```

### 3. Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your Google API key and settings
```

### 4. Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Backend (.env):**
```env
GOOGLE_API_KEY=your-google-gemini-api-key-here
SECRET_KEY=your-super-secret-jwt-key-here
DATABASE_URL=sqlite:///./mcq_generator.db
```

## 🚦 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Visit http://localhost:3000 to access the application.

### Production Mode

**Backend:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
npm run build
npm start
```

## 📖 Usage

1. **Register/Login**: Create an account or sign in
2. **Generate MCQs**: 
   - Paste your text or upload a .txt file
   - Configure number of questions, subject, and difficulty
   - Click "Generate MCQs" 
3. **Review Results**: Review generated questions and AI feedback
4. **Save Quiz**: Add title/description and save to your library
5. **Manage Quizzes**: View, edit, or export your saved quizzes
6. **Analytics**: Track your quiz creation statistics

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### MCQ Generation
- `POST /api/mcq/generate` - Generate MCQs from text
- `POST /api/mcq/quiz-sets` - Create quiz set
- `GET /api/mcq/quiz-sets` - Get user's quiz sets
- `GET /api/mcq/quiz-sets/{id}` - Get specific quiz set

### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile

## 🐳 Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🎯 Features Roadmap

- [ ] Quiz taking interface with timer
- [ ] Advanced analytics and reporting
- [ ] Question types beyond MCQ (True/False, Fill-in-blank)
- [ ] Collaborative quiz sharing
- [ ] Integration with learning management systems
- [ ] Mobile app development
- [ ] Bulk quiz generation from documents
- [ ] AI-powered question difficulty assessment

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powerful AI capabilities
- [LangChain](https://github.com/langchain-ai/langchain) for AI workflow management
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent API framework
- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components

## 📞 Support

For support, email support@example.com or create an issue on GitHub.

---

Made with ❤️ by the AI Learner MCQ Team
