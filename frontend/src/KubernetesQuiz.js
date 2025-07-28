import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronRight, RefreshCw, BookOpen, Target, CheckCircle, XCircle, ArrowLeft, Settings, Award, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loadUIConfig, getCategoryColor, getDifficultyColor } from './utils/dataLoader';
import AddQuestionForm from './AddQuestionForm'; // Import the new component

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost';

function KubernetesQuiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [uiConfig, setUiConfig] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false); // New state for modal

  const loadUIConfiguration = useCallback(async () => {
    const config = await loadUIConfig();
    setUiConfig(config);
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/categories`);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      if (uiConfig?.fallbackCategories) {
        setCategories(uiConfig.fallbackCategories);
      } else {
        setCategories(['Core Concepts', 'Networking', 'Configuration']);
      }
    }
  }, [uiConfig]);

  useEffect(() => {
    loadCategories();
    loadUIConfiguration();
  }, [loadCategories, loadUIConfiguration]);

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
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setShowResults(false);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
    setLoading(false);
  };

  // Handle when a new question is added
  const handleQuestionAdded = (newQuestion) => {
    console.log('New question added:', newQuestion);
    // Reload categories in case a new one was added
    loadCategories();
    // Show success message or update UI as needed
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
      
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setSelectedAnswers({});
    setSubmissions({});
    setShowAnswers({});
    setShowResults(false);
  };

  const getQuestionDifficultyColor = (difficulty) => {
    if (!uiConfig) return 'bg-gray-100 text-gray-800';
    return getDifficultyColor(difficulty, uiConfig);
  };

  const getQuestionCategoryColor = (category) => {
    if (!uiConfig) return 'bg-gray-100 text-gray-800';
    return getCategoryColor(category, uiConfig);
  };

  const calculateScore = () => {
    const totalQuestions = questions.length;
    const correctAnswers = Object.values(submissions).filter(sub => sub.correct).length;
    return {
      correct: correctAnswers,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    };
  };

  // Show results page if quiz is completed
  if (showResults) {
    const score = calculateScore();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <div className="mb-8">
                <Award className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <h1 className="text-4xl font-bold text-white mb-4">Quiz Complete!</h1>
                <p className="text-blue-200 text-lg">Here's how you performed:</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 rounded-xl p-6">
                  <div className="text-3xl font-bold text-green-400 mb-2">{score.correct}</div>
                  <div className="text-white">Correct</div>
                </div>
                <div className="bg-white/5 rounded-xl p-6">
                  <div className="text-3xl font-bold text-red-400 mb-2">{score.total - score.correct}</div>
                  <div className="text-white">Incorrect</div>
                </div>
                <div className="bg-white/5 rounded-xl p-6">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{score.percentage}%</div>
                  <div className="text-white">Score</div>
                </div>
              </div>

              <div className="space-x-4">
                <button
                  onClick={resetQuiz}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Take Another Quiz
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show individual question if quiz is started
  if (quizStarted && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center text-blue-200 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Home
                </button>
              </div>
              <div className="text-blue-200">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getQuestionCategoryColor(currentQuestion.category)}`}>
                      {currentQuestion.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getQuestionDifficultyColor(currentQuestion.difficulty)}`}>
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    {currentQuestion.question}
                  </h2>
                </div>
              </div>

              {/* Answer Options for Multiple Choice */}
              {currentQuestion.type === 'multiple-choice' && (
                <div className="space-y-3 mb-6">
                  {currentQuestion.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedAnswers[currentQuestion.id] === option
                          ? 'bg-blue-600/50 border-blue-400 text-white'
                          : 'bg-white/5 border-white/20 text-blue-100 hover:bg-white/10'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* Text Area for Open-ended Questions */}
              {currentQuestion.type === 'open-ended' && (
                <div className="mb-6">
                  <textarea
                    value={selectedAnswers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              )}

              {/* Submit Answer Button */}
              {selectedAnswers[currentQuestion.id] && !submissions[currentQuestion.id] && (
                <button
                  onClick={() => submitAnswer(currentQuestion.id, selectedAnswers[currentQuestion.id], currentQuestion.type)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors mb-4"
                >
                  Submit Answer
                </button>
              )}

              {/* Show Answer Button */}
              {submissions[currentQuestion.id] && (
                <button
                  onClick={() => toggleAnswer(currentQuestion.id)}
                  className="flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-4"
                >
                  {showAnswers[currentQuestion.id] ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                  {showAnswers[currentQuestion.id] ? 'Hide' : 'Show'} Correct Answer
                </button>
              )}

              {/* Answer Display */}
              {showAnswers[currentQuestion.id] && submissions[currentQuestion.id] && (
                <div className="bg-white/5 rounded-lg p-6 mb-4">
                  <div className="flex items-center mb-3">
                    {submissions[currentQuestion.id].correct ? (
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 mr-2" />
                    )}
                    <span className={`font-medium ${submissions[currentQuestion.id].correct ? 'text-green-400' : 'text-red-400'}`}>
                      {submissions[currentQuestion.id].correct ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="text-white mb-2">
                    <strong>Correct Answer:</strong> {submissions[currentQuestion.id].correct_answer}
                  </p>
                  {submissions[currentQuestion.id].explanation && (
                    <p className="text-blue-200 text-sm">
                      {submissions[currentQuestion.id].explanation}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
              
              <button
                onClick={nextQuestion}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <span>
                  {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
                </span>
                <ChevronDown className="h-4 w-4 ml-2 -rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz setup page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-blue-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </button>
            
            {/* Add Questions Button */}
            <button
              onClick={() => setShowAddQuestion(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              Add Questions!
            </button>
          </div>

          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <BookOpen className="h-8 w-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Kubernetes Quiz</h1>
            </div>
            <p className="text-blue-200 text-lg max-w-2xl mx-auto">
              Test your Kubernetes knowledge with our comprehensive quiz system. 
              Choose from different categories and difficulty levels to enhance your skills. 
              Perfect for interview preparation and skill assessment.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="h-6 w-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Quiz Configuration</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-slate-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3">
                  Number of Questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5} className="bg-slate-800">5 Questions</option>
                  <option value={10} className="bg-slate-800">10 Questions</option>
                  <option value={15} className="bg-slate-800">15 Questions</option>
                  <option value={20} className="bg-slate-800">20 Questions</option>
                </select>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={loadQuestions}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3 mx-auto group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Loading Questions...</span>
                  </>
                ) : (
                  <>
                    <Target className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span>Start Quiz</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {questions.length === 0 && loading && (
            <div className="text-center">
              <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-blue-200">Loading your questions...</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Question Modal */}
      <AddQuestionForm
        isOpen={showAddQuestion}
        onClose={() => setShowAddQuestion(false)}
        onQuestionAdded={handleQuestionAdded}
      />
    </div>
  );
}

export default KubernetesQuiz;