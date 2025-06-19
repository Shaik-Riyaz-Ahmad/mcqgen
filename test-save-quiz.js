// Test script to run in browser console to test quiz saving
// This script will simulate the login and quiz saving process

console.log('Starting quiz save test...');

// Test API endpoints directly
async function testQuizSave() {
  try {
    // 1. Test login
    console.log('1. Testing login...');
    const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'username=demo@mcqgen.com&password=demo12345'
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData);
    
    const token = loginData.access_token;
    
    // 2. Test quiz set creation
    console.log('2. Testing quiz set creation...');
    const quizData = {
      title: "Test Quiz from Browser",
      description: "Test description",
      subject: "general",
      difficulty: "simple",
      source_text: "This is a test source text for the quiz that contains enough content to be valid.",
      questions: [
        {
          question: "What is the capital of France?",
          options: {
            "a": "London",
            "b": "Berlin", 
            "c": "Paris",
            "d": "Madrid"
          },
          correct_answer: "c",
          explanation: "Paris is the capital and largest city of France."
        }
      ],
      is_public: false
    };
    
    const createResponse = await fetch('http://localhost:8000/api/mcq/quiz-sets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(quizData)
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Quiz creation failed: ${createResponse.status} - ${errorText}`);
    }
    
    const createData = await createResponse.json();
    console.log('Quiz creation successful:', createData);
    
    // 3. Test getting quiz sets
    console.log('3. Testing getting quiz sets...');
    const getResponse = await fetch('http://localhost:8000/api/mcq/quiz-sets', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!getResponse.ok) {
      throw new Error(`Get quiz sets failed: ${getResponse.status}`);
    }
    
    const quizSets = await getResponse.json();
    console.log('Quiz sets retrieved:', quizSets);
    
    console.log('✅ All tests passed! Quiz save functionality is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test
testQuizSave();
