import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronRight, RefreshCw, BookOpen, Target, CheckCircle, XCircle, ArrowLeft, Settings, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loadUIConfig, getCategoryColor, getDifficultyColor } from './utils/dataLoader';

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

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-12">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center text-blue-200 hover:text-white mb-8 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </button>
              
              <div className="flex items-center justify-center mb-6">
                <div className="bg-blue-600 p-4 rounded-full mr-4">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-5xl font-bold text-white">
                  Kubernetes Quiz
                </h1>
              </div>
              <p className="text-xl text-blue-200 max-w-2xl mx-auto">
                Test your Kubernetes knowledge with curated questions organized by difficulty and category. 
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
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span>Loading Questions...</span>
                    </>
                  ) : (
                    <>
                      <Target className="h-6 w-6" />
                      <span>Start Quiz</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center mb-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
                <div className="flex items-center justify-center mb-6">
                  <Award className="h-16 w-16 text-yellow-400 mr-4" />
                  <h1 className="text-4xl font-bold text-white">Quiz Complete!</h1>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
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
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Loading questions...</div>
      </div>
    );
  }

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
                Home
              </button>
              <div className="bg-blue-600 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Kubernetes Quiz</h1>
                <p className="text-blue-200">Question Mode</p>
              </div>
            </div>
            
            <button
              onClick={resetQuiz}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>New Quiz</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-8">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getQuestionCategoryColor(currentQuestion.category)}`}>
                {currentQuestion.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getQuestionDifficultyColor(currentQuestion.difficulty)}`}>
                {currentQuestion.difficulty}
              </span>
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-6 leading-relaxed">
              {currentQuestion.question}
            </h2>

            {/* Multiple Choice Options */}
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={selectedAnswers[currentQuestion.id] === option}
                      onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                      className="text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Submit Button */}
            {selectedAnswers[currentQuestion.id] && !submissions[currentQuestion.id] && (
              <button
                onClick={() => submitAnswer(currentQuestion.id, selectedAnswers[currentQuestion.id], currentQuestion.type)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mb-6"
              >
                Submit Answer
              </button>
            )}

            {/* Show Result */}
            {submissions[currentQuestion.id] && (
              <div className={`p-4 rounded-lg mb-6 ${
                submissions[currentQuestion.id].correct 
                  ? 'bg-green-500/20 border border-green-500/50' 
                  : 'bg-red-500/20 border border-red-500/50'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {submissions[currentQuestion.id].correct ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className={`font-semibold ${
                    submissions[currentQuestion.id].correct ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {submissions[currentQuestion.id].correct ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                {!submissions[currentQuestion.id].correct && (
                  <p className="text-red-200">
                    Correct answer: {currentQuestion.correct_answer}
                  </p>
                )}
              </div>
            )}

            {/* Show Answer Button */}
            <button
              onClick={() => toggleAnswer(currentQuestion.id)}
              className="flex items-center space-x-2 text-blue-300 hover:text-blue-100 transition-colors mb-6"
            >
              {showAnswers[currentQuestion.id] ? (
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
            {showAnswers[currentQuestion.id] && (
              <div className="p-6 bg-green-500/20 rounded-lg border border-green-500/50 mb-6">
                <h4 className="font-semibold text-green-400 mb-2">Answer:</h4>
                <p className="text-green-200">{currentQuestion.answer}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
                <span>Previous</span>
              </button>
              
              <span className="text-blue-200">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
              
              <button
                onClick={nextQuestion}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <span>
                  {currentQuestionIndex + 1 === questions.length ? 'Finish Quiz' : 'Next'}
                </span>
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KubernetesQuiz;