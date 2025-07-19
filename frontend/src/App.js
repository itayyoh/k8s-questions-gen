import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronRight, RefreshCw, BookOpen, Target } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost';

function App() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/categories`);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories(['Core Concepts', 'Networking', 'Configuration']);
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const url = selectedCategory === 'all' 
        ? `${API_BASE_URL}/api/questions/random/${questionCount}`
        : `${API_BASE_URL}/api/questions/category/${selectedCategory}`;
      
      const response = await axios.get(url);
      setQuestions(response.data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
    setLoading(false);
  };

  const toggleAnswer = (questionId) => {
    setShowAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Kubernetes Interview Prep
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Master Kubernetes concepts with curated interview questions
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadQuestions}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    <span>Generate Questions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {question.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {question.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  {question.question}
                </h3>

                {question.type === 'multiple-choice' && question.options && (
                  <div className="space-y-3 mb-6">
                    {question.options.map((option, optIndex) => (
                      <label key={optIndex} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'open-ended' && (
                  <textarea
                    placeholder="Type your answer here..."
                    rows={4}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-6"
                  />
                )}

                <button
                  onClick={() => toggleAnswer(question.id)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showAnswers[question.id] ? (
                    <>
                      <ChevronDown className="h-5 w-5" />
                      <span>Hide Answer</span>
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-5 w-5" />
                      <span>Show Answer</span>
                    </>
                  )}
                </button>

                {showAnswers[question.id] && (
                  <div className="mt-6 p-6 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-800 mb-2">Answer:</h4>
                    <p className="text-green-700">{question.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {questions.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Ready to start your interview prep?
            </h3>
            <p className="text-gray-500 mb-6">
              Click "Generate Questions" to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;