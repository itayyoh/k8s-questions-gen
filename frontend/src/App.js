import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronRight, RefreshCw, BookOpen, Target, CheckCircle, XCircle } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost';

function App() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [showResults, setShowResults] = useState({});

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
      setSelectedAnswers({});
      setSubmissions({});
      setShowAnswers({});
      setShowResults({});
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

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitAnswer = async (questionId, answer, type) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/submit`, {
        question_id: questionId,
        answer: answer,
        type: type
      });
      
      setSubmissions(prev => ({
        ...prev,
        [questionId]: response.data
      }));
      
      setShowResults(prev => ({
        ...prev,
        [questionId]: true
      }));
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Core Concepts': 'bg-blue-100 text-blue-800',
      'Networking': 'bg-indigo-100 text-indigo-800',
      'Configuration': 'bg-teal-100 text-teal-800',
      'Architecture': 'bg-purple-100 text-purple-800',
      'Scaling': 'bg-orange-100 text-orange-800',
      'Workloads': 'bg-pink-100 text-pink-800',
      'Storage': 'bg-cyan-100 text-cyan-800',
      'Commands': 'bg-lime-100 text-lime-800',
      'Security': 'bg-red-100 text-red-800',
      'Basics': 'bg-blue-100 text-blue-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadQuestions}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
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

        {/* Questions */}
        {questions.length > 0 && (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(question.category)}`}>
                          {question.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Target className="h-5 w-5" />
                      <span className="text-sm capitalize">{question.type?.replace('-', ' ')}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    {question.question}
                  </h3>

                  {/* Multiple Choice Options */}
                  {question.type === 'multiple-choice' && question.options && (
                    <div className="space-y-3 mb-6">
                      {question.options.map((option, optIndex) => (
                        <label 
                          key={optIndex} 
                          className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            submissions[question.id] 
                              ? (option === question.answer 
                                ? 'border-green-500 bg-green-50' 
                                : (selectedAnswers[question.id] === option && !submissions[question.id]?.correct)
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200 bg-gray-50'
                                )
                              : selectedAnswers[question.id] === option
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={selectedAnswers[question.id] === option}
                            onChange={() => handleAnswerSelect(question.id, option)}
                            disabled={!!submissions[question.id]}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                          {submissions[question.id] && option === question.answer && (
                            <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                          )}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Open-ended question textarea */}
                  {(question.type === 'open-ended' || question.type === 'short-answer') && (
                    <textarea
                      placeholder="Type your answer here..."
                      rows={question.type === 'short-answer' ? 2 : 4}
                      value={selectedAnswers[question.id] || ''}
                      onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                      disabled={!!submissions[question.id]}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6 disabled:bg-gray-100"
                    />
                  )}

                  {/* Submit Button */}
                  {!submissions[question.id] && selectedAnswers[question.id] && (
                    <button
                      onClick={() => submitAnswer(question.id, selectedAnswers[question.id], question.type)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-4"
                    >
                      Submit Answer
                    </button>
                  )}

                  {/* Results */}
                  {submissions[question.id] && (
                    <div className={`p-4 rounded-lg border-l-4 mb-4 ${
                      submissions[question.id].correct 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-red-500 bg-red-50'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {submissions[question.id].correct ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`font-semibold ${
                          submissions[question.id].correct ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {submissions[question.id].correct ? 'Correct!' : 'Incorrect'}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        submissions[question.id].correct ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {submissions[question.id].explanation}
                      </p>
                      {!submissions[question.id].correct && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Correct answer:</strong> {submissions[question.id].correct_answer}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Show Answer Button */}
                  <button
                    onClick={() => toggleAnswer(question.id)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
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

                  {/* Answer */}
                  {showAnswers[question.id] && (
                    <div className="mt-6 p-6 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-2">Answer:</h4>
                      <p className="text-green-700">{question.answer}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {questions.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Ready to start your interview prep?
            </h3>
            <p className="text-gray-500 mb-6">
              Click "Generate Questions" to get started with curated Kubernetes interview questions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
