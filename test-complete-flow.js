// Complete end-to-end test for the quiz save functionality
const API_BASE_URL = 'http://localhost:8000/api';

class TestApiClient {
  constructor() {
    this.token = null;
  }

  async login(email, password) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    this.token = data.access_token;
    return data;
  }

  async generateMCQ(data) {
    const response = await fetch(`${API_BASE_URL}/mcq/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MCQ generation failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  async createQuizSet(quizData) {
    const response = await fetch(`${API_BASE_URL}/mcq/quiz-sets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Quiz set creation failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }
}

async function testCompleteFlow() {
  console.log('🧪 Testing complete MCQ generation and save flow...');
  
  try {
    const client = new TestApiClient();
    
    // Step 1: Login
    console.log('1️⃣ Testing login...');
    await client.login('demo@mcqgen.com', 'demo12345');
    console.log('✅ Login successful');
    
    // Step 2: Generate MCQs
    console.log('2️⃣ Testing MCQ generation...');
    const mcqRequest = {
      text: `
        Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines 
        that can simulate human thinking capability and behavior. Machine learning is a subset of AI that uses 
        statistical techniques to give computer systems the ability to learn from data without being explicitly 
        programmed. Deep learning, in turn, is a subset of machine learning that uses neural networks with 
        multiple layers to model and understand complex patterns in data. Natural Language Processing (NLP) 
        is another important area of AI that focuses on the interaction between computers and human language.
      `,
      num_questions: 3,
      subject: 'artificial_intelligence',
      difficulty: 'simple'
    };
    
    const mcqResponse = await client.generateMCQ(mcqRequest);
    console.log('✅ MCQ generation successful, generated', mcqResponse.questions.length, 'questions');
    
    // Step 3: Save quiz set
    console.log('3️⃣ Testing quiz set save...');
    const quizSetData = {
      title: 'AI Fundamentals Quiz',
      description: 'A quiz covering basic concepts in Artificial Intelligence',
      subject: 'artificial_intelligence',
      difficulty: 'simple',
      source_text: mcqRequest.text,
      questions: mcqResponse.questions,
      is_public: false
    };
    
    const savedQuiz = await client.createQuizSet(quizSetData);
    console.log('✅ Quiz set saved successfully with ID:', savedQuiz.id);
    
    console.log('🎉 Complete flow test PASSED!');
    console.log('📊 Summary:');
    console.log(`   - Quiz Title: ${savedQuiz.title}`);
    console.log(`   - Questions: ${savedQuiz.total_questions}`);
    console.log(`   - Subject: ${savedQuiz.subject}`);
    console.log(`   - Difficulty: ${savedQuiz.difficulty}`);
    console.log(`   - Created: ${savedQuiz.created_at}`);
    
  } catch (error) {
    console.error('❌ Complete flow test FAILED:', error.message);
  }
}

testCompleteFlow();
