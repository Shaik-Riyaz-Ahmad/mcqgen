'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Clock, 
  BookOpen, 
  Eye, 
  Trash2, 
  Calendar,
  MoreVertical
} from 'lucide-react';
import { QuizSet } from '@/types';

interface QuizListProps {
  quizSets: QuizSet[];
  loading: boolean;
  onRefresh: () => void;
}

export default function QuizList({ quizSets, loading, onRefresh }: QuizListProps) {
  const [selectedQuiz, setSelectedQuiz] = useState<QuizSet | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (quizSets.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
        <p className="text-gray-600 mb-6">Create your first quiz to get started</p>
        <Button onClick={onRefresh}>
          Refresh
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'simple':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'complex':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Quizzes</p>
              <p className="text-xl font-bold">{quizSets.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-xl font-bold">
                {quizSets.reduce((sum, quiz) => sum + quiz.total_questions, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-xl font-bold">
                {quizSets.filter(quiz => {
                  const createdDate = new Date(quiz.created_at);
                  const currentMonth = new Date().getMonth();
                  return createdDate.getMonth() === currentMonth;
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Public Quizzes</p>
              <p className="text-xl font-bold">
                {quizSets.filter(quiz => quiz.is_public).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizSets.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {quiz.subject}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                  {quiz.difficulty}
                </span>
                {quiz.is_public && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Public
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {quiz.total_questions} questions
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(quiz.created_at)}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedQuiz(quiz)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Detail Modal would go here */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedQuiz.title}</h2>
                  {selectedQuiz.description && (
                    <p className="text-gray-600 mt-2">{selectedQuiz.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedQuiz(null)}
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Questions</p>
                  <p className="text-lg font-bold">{selectedQuiz.total_questions}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Subject</p>
                  <p className="text-lg font-bold">{selectedQuiz.subject}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className="text-lg font-bold capitalize">{selectedQuiz.difficulty}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-lg font-bold">{formatDate(selectedQuiz.created_at)}</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button className="flex-1">
                  Take Quiz
                </Button>
                <Button variant="outline">
                  Edit
                </Button>
                <Button variant="outline">
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
