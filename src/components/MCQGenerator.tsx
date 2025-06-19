'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Upload, 
  Settings, 
  Sparkles, 
  Download,
  Save,
  Eye
} from 'lucide-react';
import apiClient from '@/lib/api';
import { MCQGenerateRequest, MCQGenerateResponse, MCQQuestion } from '@/types';

interface MCQGeneratorProps {
  onQuizCreated?: () => void;
}

export default function MCQGenerator({ onQuizCreated }: MCQGeneratorProps) {
  const [step, setStep] = useState(1); // 1: Input, 2: Generate, 3: Review
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    num_questions: 5,
    subject: 'general',
    difficulty: 'simple' as 'simple' | 'moderate' | 'complex',
    title: '',
    description: ''
  });
  const [generatedQuiz, setGeneratedQuiz] = useState<MCQGenerateResponse | null>(null);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'num_questions' ? parseInt(value) || 5 : value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setFormData(prev => ({ ...prev, text }));
      };
      reader.readAsText(file);
    }
  };

  const generateMCQ = async () => {
    if (!formData.text.trim() || formData.text.length < 50) {
      setError('Please provide at least 50 characters of text');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const request: MCQGenerateRequest = {
        text: formData.text,
        num_questions: formData.num_questions,
        subject: formData.subject,
        difficulty: formData.difficulty
      };

      const response = await apiClient.generateMCQ(request);
      
      if (response.data) {
        setGeneratedQuiz(response.data);
        setStep(3);
      } else {
        setError(response.error || 'Failed to generate MCQs');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveQuizSet = async () => {
    console.log('🔍 saveQuizSet called');
    console.log('🔍 generatedQuiz:', generatedQuiz);
    console.log('🔍 formData.title:', formData.title);
    
    if (!generatedQuiz || !formData.title.trim()) {
      setError('Please provide a title for your quiz');
      console.log('❌ Validation failed - missing quiz or title');
      return;
    }

    setLoading(true);
    console.log('🔍 Starting save process...');
    
    try {
      const quizData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        difficulty: formData.difficulty,
        source_text: formData.text,
        questions: generatedQuiz.questions,
        is_public: false
      };
      
      console.log('🔍 Quiz data to save:', quizData);
      
      const response = await apiClient.createQuizSet(quizData);
      
      console.log('🔍 Save response:', response);

      if (response.data) {
        console.log('✅ Quiz saved successfully:', response.data);
        // Reset form
        setFormData({
          text: '',
          num_questions: 5,
          subject: 'general',
          difficulty: 'simple',
          title: '',
          description: ''
        });
        setGeneratedQuiz(null);
        setStep(1);
        onQuizCreated?.();
        setError('');
      } else {
        console.log('❌ Save failed:', response.error);
        setError(response.error || 'Failed to save quiz');
      }
    } catch (err) {
      console.error('❌ Save error:', err);
      setError('Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!generatedQuiz) return;

    const csvContent = [
      ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Explanation'],
      ...generatedQuiz.questions.map(q => [
        q.question,
        q.options.a || '',
        q.options.b || '',
        q.options.c || '',
        q.options.d || '',
        q.correct_answer,
        q.explanation
      ])
    ].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.title || 'mcq_quiz'}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (step === 3 && generatedQuiz) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Generated MCQs</h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={downloadCSV}
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
              <Button
                onClick={() => setStep(1)}
                variant="outline"
              >
                Generate New
              </Button>
            </div>
          </div>

          {/* Quiz Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter quiz title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter quiz description"
              />
            </div>
          </div>

          {/* Review Section */}
          {generatedQuiz.review && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">AI Review</h4>
              <p className="text-blue-800 text-sm">{generatedQuiz.review}</p>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-6">
            {generatedQuiz.questions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Question {index + 1}: {question.question}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  {Object.entries(question.options).map(([key, value]) => (
                    <div
                      key={key}
                      className={`p-2 rounded border ${
                        key.toLowerCase() === question.correct_answer.toLowerCase()
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <span className="font-medium">{key.toUpperCase()}:</span> {value}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Correct:</strong> {question.correct_answer.toUpperCase()} |{' '}
                  <strong>Explanation:</strong> {question.explanation}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
              {error}
            </div>
          )}

          <div className="flex justify-center mt-6">
            <Button
              onClick={() => {
                console.log('🔥 Save Quiz Set button clicked!');
                console.log('🔥 Current formData:', formData);
                console.log('🔥 Current generatedQuiz:', generatedQuiz);
                console.log('🔥 Current loading state:', loading);
                saveQuizSet();
              }}
              disabled={loading || !formData.title.trim()}
              className="flex items-center px-6 py-3"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Quiz Set
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-6">Input Text & Settings</h3>
        
        <div className="space-y-6">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Text *
            </label>
            <div className="space-y-3">
              <textarea
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Paste your text content here... (minimum 50 characters)"
                required
              />
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload .txt file
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-gray-500">
                  {formData.text.length} characters
                </span>
              </div>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                name="num_questions"
                value={formData.num_questions}
                onChange={handleInputChange}
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., science, history, math"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="simple">Simple</option>
                <option value="moderate">Moderate</option>
                <option value="complex">Complex</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6">
            {error}
          </div>
        )}

        <div className="flex justify-center mt-6">
          <Button
            onClick={generateMCQ}
            disabled={loading || !formData.text.trim() || formData.text.length < 50}
            className="flex items-center px-6 py-3"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Generating...' : 'Generate MCQs'}
          </Button>
        </div>
      </div>
    </div>
  );
}
