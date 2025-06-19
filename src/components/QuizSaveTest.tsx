'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';

export default function QuizSaveTest() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testSaveQuiz = async () => {
    setLoading(true);
    setStatus('Starting test...');

    try {
      // 1. Test login
      setStatus('Testing login...');
      const loginResult = await apiClient.login('demo@mcqgen.com', 'demo12345');
      
      if (!loginResult.data) {
        setStatus(`Login failed: ${loginResult.error}`);
        return;
      }
      
      setStatus('Login successful, testing quiz save...');

      // 2. Test quiz save
      const testQuizData = {
        title: 'Test Quiz from Frontend',
        description: 'Test description from frontend',
        subject: 'general',
        difficulty: 'simple',
        source_text: 'This is a test source text that is long enough to be valid for the quiz generation.',
        questions: [
          {
            question: 'What is 2 + 2?',
            options: {
              a: '3',
              b: '4', 
              c: '5',
              d: '6'
            },
            correct_answer: 'b',
            explanation: '2 + 2 equals 4'
          }
        ],
        is_public: false
      };

      const saveResult = await apiClient.createQuizSet(testQuizData);
      
      if (saveResult.data) {
        setStatus(`✅ Success! Quiz saved with ID: ${saveResult.data.id}`);
      } else {
        setStatus(`❌ Save failed: ${saveResult.error}`);
      }

    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Quiz Save Test</h2>
      
      <button
        onClick={testSaveQuiz}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Save Quiz'}
      </button>
      
      {status && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">{status}</p>
        </div>
      )}
    </div>
  );
}
