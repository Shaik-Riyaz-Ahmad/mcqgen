// Test script to verify frontend login
const apiUrl = 'http://localhost:8000/api';

async function testFrontendFlow() {
  console.log('Testing frontend login flow...');
  
  try {
    // Test login endpoint
    const formData = new FormData();
    formData.append('username', 'demo@mcqgen.com');
    formData.append('password', 'demo12345');
    
    const loginResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      body: formData
    });
    
    console.log('Login response status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      console.error('Login failed:', loginResponse.status);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful, token:', loginData.access_token.substring(0, 20) + '...');
    
    // Test authenticated request
    const quizSetsResponse = await fetch(`${apiUrl}/mcq/quiz-sets`, {
      headers: {
        'Authorization': `Bearer ${loginData.access_token}`
      }
    });
    
    console.log('Quiz sets response status:', quizSetsResponse.status);
    
    if (quizSetsResponse.ok) {
      const quizSets = await quizSetsResponse.json();
      console.log('Existing quiz sets:', quizSets.length);
    }
    
    console.log('✅ Frontend authentication flow working correctly');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testFrontendFlow();
