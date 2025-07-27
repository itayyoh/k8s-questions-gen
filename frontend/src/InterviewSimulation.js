import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, Code, AlertTriangle, ArrowLeft, Play, ArrowRight } from 'lucide-react';
import { loadInterviewScenarios } from './utils/dataLoader';

const InterviewSimulation = () => {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [scenarioData, setScenarioData] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');

  // Load scenario data on component mount
  useEffect(() => {
    const loadData = async () => {
      const data = await loadInterviewScenarios();
      setScenarioData(data);
    };
    loadData();
  }, []);

  const iconMap = {
    User,
    Code,
    AlertTriangle
  };

  // Define getCurrentQuestion with useCallback
  const getCurrentQuestion = useCallback(() => {
    if (!scenarioData) return null;
    const phase = scenarioData.phases[currentPhase];
    return phase?.questions[currentQuestionIndex];
  }, [scenarioData, currentPhase, currentQuestionIndex]);

  // Handle next question logic
  const handleNextQuestion = useCallback(() => {
    if (!scenarioData) return;
    
    // Save current answer before moving to next question
    const question = getCurrentQuestion();
    if (question && currentAnswer) {
      setAnswers(prev => ({
        ...prev,
        [question.id]: currentAnswer
      }));
    }
    
    const phase = scenarioData.phases[currentPhase];
    const nextQuestionIndex = currentQuestionIndex + 1;

    if (nextQuestionIndex < phase.questions.length) {
      // Next question in same phase
      setCurrentQuestionIndex(nextQuestionIndex);
      setTimeRemaining(phase.questions[nextQuestionIndex].timeLimit);
      setCurrentAnswer('');
    } else {
      // Move to next phase
      if (currentPhase === 'personal') {
        setCurrentPhase('technical');
        setCurrentQuestionIndex(0);
        setTimeRemaining(scenarioData.phases.technical.questions[0].timeLimit);
        setCurrentAnswer('');
      } else if (currentPhase === 'technical') {
        setCurrentPhase('scenario');
        setCurrentQuestionIndex(0);
        setTimeRemaining(scenarioData.phases.scenario.questions[0].timeLimit);
        setCurrentAnswer('');
      } else {
        // Interview complete
        setCurrentPhase('results');
      }
    }
  }, [scenarioData, currentPhase, currentQuestionIndex, currentAnswer, getCurrentQuestion]);

  // Timer effect
  useEffect(() => {
    if (!interviewStarted || currentPhase === 'intro' || currentPhase === 'results') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-advance to next question when time runs out
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewStarted, currentPhase, currentQuestionIndex, handleNextQuestion]);

  const handleStartInterview = () => {
    if (!scenarioData || !scenarioData.phases || !scenarioData.phases.personal) {
      console.error('Interview scenarios not loaded properly');
      return;
    }
    setInterviewStarted(true);
    setCurrentPhase('personal');
    setCurrentQuestionIndex(0);
    const firstQuestion = scenarioData.phases.personal.questions[0];
    setTimeRemaining(firstQuestion?.timeLimit || 180);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColorClasses = (phase) => {
    const colorClasses = {
      personal: 'bg-blue-100 text-blue-800 border-blue-200',
      technical: 'bg-green-100 text-green-800 border-green-200',
      scenario: 'bg-red-100 text-red-800 border-red-200'
    };
    return colorClasses[phase] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Loading state
  if (!scenarioData || !scenarioData.phases) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white">Loading interview scenarios...</div>
      </div>
    );
  }

  const phases = scenarioData.phases;

  // Introduction phase
  if (currentPhase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-12">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center text-purple-200 hover:text-white mb-8 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </button>
              
              <h1 className="text-5xl font-bold text-white mb-6">
                DevOps Interview Simulation
              </h1>
              <p className="text-xl text-purple-200 max-w-2xl mx-auto">
                Practice real interview scenarios with timed questions across multiple phases
              </p>
            </div>

            {/* Interview Phases Preview */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {Object.entries(phases).map(([key, phase]) => {
                const IconComponent = iconMap[phase.icon] || User;
                
                return (
                  <div key={key} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        key === 'personal' ? 'bg-blue-500' :
                        key === 'technical' ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{phase.title}</h3>
                      <p className="text-purple-200 mb-4">
                        {phase.questions.length} questions
                      </p>
                      <div className="text-sm text-purple-300">
                        Est. time: {Math.round(phase.questions.reduce((total, q) => total + q.timeLimit, 0) / 60)} minutes
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Ready to Begin?</h2>
                <p className="text-purple-200 mb-6">
                  This simulation will take approximately 30-45 minutes. Make sure you have a quiet environment 
                  and won't be interrupted. Each question is timed, so think carefully but don't overthink.
                </p>
                <ul className="text-left text-purple-200 max-w-md mx-auto mb-6 space-y-2">
                  <li>• Questions are timed - you can't go back</li>
                  <li>• Speak your thoughts out loud (like a real interview)</li>
                  <li>• Take your time to think before answering</li>
                  <li>• Be honest and authentic</li>
                </ul>
              </div>

              <button
                onClick={handleStartInterview}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl text-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-3 mx-auto group"
              >
                <Play className="h-6 w-6" />
                <span>Start Interview</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPhase === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
              <h1 className="text-4xl font-bold text-white mb-6">
                Interview Complete! 🎉
              </h1>
              <p className="text-xl text-purple-200 mb-8">
                Great job completing the interview simulation. In a real interview, 
                this would be followed by technical questions specific to the role and company.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Questions Answered</h3>
                  <p className="text-3xl font-bold text-purple-300">{Object.keys(answers).length}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Time Spent</h3>
                  <p className="text-3xl font-bold text-purple-300">
                    {Math.round((Object.keys(answers).length * 3) / 60)} min
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <button
                  onClick={() => {
                    setCurrentPhase('intro');
                    setCurrentQuestionIndex(0);
                    setAnswers({});
                    setInterviewStarted(false);
                    setCurrentAnswer('');
                  }}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors mr-4"
                >
                  Take Again
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

  // Interview questions phase
  const currentQuestion = getCurrentQuestion();
  const currentPhaseData = phases[currentPhase];
  const IconComponent = iconMap[currentPhaseData.icon] || User;
  const progress = ((currentQuestionIndex + 1) / currentPhaseData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                currentPhase === 'personal' ? 'bg-blue-500' :
                currentPhase === 'technical' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{currentPhaseData.title}</h1>
                <p className="text-purple-200">
                  Question {currentQuestionIndex + 1} of {currentPhaseData.questions.length}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-white font-mono text-2xl mb-1">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-purple-200 text-sm">
                <Clock className="h-4 w-4 inline mr-1" />
                Time remaining
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-8">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                currentPhase === 'personal' ? 'bg-blue-500' :
                currentPhase === 'technical' ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Question */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${getPhaseColorClasses(currentPhase)}`}>
              {currentQuestion?.type}
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-6 leading-relaxed">
              {currentQuestion?.question.split('\n').map((line, index) => (
                <span key={index}>
                  {line.startsWith('**') && line.endsWith('**') ? (
                    <strong>{line.slice(2, -2)}</strong>
                  ) : line.startsWith('- ') ? (
                    <span className="block ml-4">• {line.slice(2)}</span>
                  ) : (
                    line
                  )}
                  {index < currentQuestion.question.split('\n').length - 1 && <br />}
                </span>
              ))}
            </h2>

            {/* Hints for scenario questions */}
            {currentQuestion?.hints && (
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-purple-200 mb-2">Hints:</h3>
                <ul className="text-purple-300 text-sm space-y-1">
                  {currentQuestion.hints.map((hint, index) => (
                    <li key={index}>• {hint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Answer Input */}
            <div className="mb-6">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here... In a real interview, you would speak this out loud."
                className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="text-purple-300 text-sm">
                {currentAnswer.length > 0 ? `${currentAnswer.length} characters` : 'Start typing your response...'}
              </div>
              
              <button
                onClick={handleNextQuestion}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2"
              >
                <span>
                  {currentQuestionIndex + 1 === currentPhaseData.questions.length
                    ? (currentPhase === 'scenario' ? 'Complete Interview' : 'Next Phase')
                    : 'Next Question'
                  }
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Phase Navigation */}
          <div className="flex justify-center space-x-4">
            {Object.entries(phases).map(([key, phase]) => {
              const IconComp = iconMap[phase.icon] || User;
              const isActive = key === currentPhase;
              const isCompleted = Object.keys(phases).indexOf(key) < Object.keys(phases).indexOf(currentPhase);
              
              return (
                <div key={key} className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  isActive ? 'bg-white/20 text-white' :
                  isCompleted ? 'bg-white/10 text-purple-200' : 'text-purple-400'
                }`}>
                  <IconComp className="h-4 w-4" />
                  <span className="text-sm font-medium">{phase.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSimulation;