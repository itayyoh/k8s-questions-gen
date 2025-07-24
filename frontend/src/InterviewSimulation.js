import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, Code, AlertTriangle, ArrowLeft, Play, ArrowRight } from 'lucide-react';

const InterviewSimulation = () => {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState('intro'); // intro, personal, technical, scenario, results
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes per question
  const [interviewStarted, setInterviewStarted] = useState(false);

  const phases = {
    personal: {
      title: "Getting to Know You",
      icon: User,
      color: "blue",
      questions: [
        {
          id: 1,
          question: "Tell me about yourself and your background in technology.",
          type: "personal",
          timeLimit: 180
        },
        {
          id: 2,
          question: "What got you interested in DevOps specifically?",
          type: "personal", 
          timeLimit: 120
        },
        {
          id: 3,
          question: "Describe a challenging project you've worked on recently.",
          type: "personal",
          timeLimit: 180
        }
      ]
    },
    technical: {
      title: "Technical Knowledge",
      icon: Code,
      color: "green",
      questions: [
        {
          id: 4,
          question: "Explain the difference between Docker containers and virtual machines.",
          type: "technical",
          timeLimit: 300
        },
        {
          id: 5,
          question: "How would you implement a CI/CD pipeline for a microservices application?",
          type: "technical",
          timeLimit: 360
        },
        {
          id: 6,
          question: "What are the key components of Kubernetes architecture?",
          type: "technical",
          timeLimit: 240
        }
      ]
    },
    scenario: {
      title: "Problem Solving",
      icon: AlertTriangle,
      color: "red",
      questions: [
        {
          id: 7,
          question: `**Debugging Scenario:**
          
Your production Kubernetes cluster is experiencing issues. Pods are randomly crashing with the following symptoms:

- CPU usage spikes to 100%
- Memory usage shows OOMKilled errors
- Application logs show connection timeouts
- Some pods are in CrashLoopBackOff state

**Your task:** Walk me through your debugging process. What commands would you run and what would you look for?`,
          type: "scenario",
          timeLimit: 600, // 10 minutes
          hints: [
            "Think about resource limits and requests",
            "Consider checking node resources",
            "What about network policies or DNS issues?"
          ]
        }
      ]
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    setCurrentPhase('personal');
    setTimeRemaining(phases.personal.questions[0].timeLimit);
  };

  const getCurrentQuestions = () => {
    if (currentPhase === 'intro' || currentPhase === 'results') return [];
    return phases[currentPhase].questions;
  };

  const getCurrentQuestion = () => {
    const questions = getCurrentQuestions();
    return questions[currentQuestionIndex] || null;
  };

  const nextQuestion = () => {
    const questions = getCurrentQuestions();
    
    if (currentQuestionIndex < questions.length - 1) {
      // Next question in same phase
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeRemaining(questions[nextIndex].timeLimit);
    } else {
      // Move to next phase
      if (currentPhase === 'personal') {
        setCurrentPhase('technical');
        setCurrentQuestionIndex(0);
        setTimeRemaining(phases.technical.questions[0].timeLimit);
      } else if (currentPhase === 'technical') {
        setCurrentPhase('scenario');
        setCurrentQuestionIndex(0);
        setTimeRemaining(phases.scenario.questions[0].timeLimit);
      } else {
        setCurrentPhase('results');
      }
    }
  };

  const handleAnswer = (answer) => {
    const question = getCurrentQuestion();
    setAnswers(prev => ({
      ...prev,
      [question.id]: {
        question: question.question,
        answer: answer,
        timeSpent: question.timeLimit - timeRemaining,
        phase: currentPhase
      }
    }));
  };

  // Timer effect
  useEffect(() => {
    if (interviewStarted && timeRemaining > 0 && currentPhase !== 'results') {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      // Auto advance when time runs out
      nextQuestion();
    }
  }, [timeRemaining, interviewStarted, currentPhase]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = (phase) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600', 
      red: 'from-red-500 to-red-600'
    };
    return colors[phase] || colors.blue;
  };

  if (currentPhase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900">
        <div className="container mx-auto px-4 py-12">
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-8"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </button>

          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl p-12 shadow-2xl">
              
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <users className="h-10 w-10 text-purple-600" />
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                DevOps Interview Simulation
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                Experience a realistic DevOps interview with three phases:
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="text-center p-4">
                  <User className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900">Personal Questions</h3>
                  <p className="text-sm text-gray-600">Background & motivation</p>
                </div>
                <div className="text-center p-4">
                  <Code className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900">Technical Questions</h3>
                  <p className="text-sm text-gray-600">DevOps concepts & tools</p>
                </div>
                <div className="text-center p-4">
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900">Problem Scenarios</h3>
                  <p className="text-sm text-gray-600">Real-world debugging</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                <p className="text-yellow-800">
                  <strong>Note:</strong> Each question is timed. Take your time to think, but be concise and clear in your responses.
                </p>
              </div>

              <button
                onClick={startInterview}
                className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition duration-200 flex items-center space-x-3 mx-auto text-lg font-semibold"
              >
                <Play className="h-6 w-6" />
                <span>Start Interview</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const phaseInfo = phases[currentPhase];

  if (currentPhase === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-12 shadow-2xl text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Interview Complete! 🎉
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Great job completing the DevOps interview simulation!
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Back to Home
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Exit Interview</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className={`bg-gradient-to-r ${getPhaseColor(phaseInfo.color)} text-white px-4 py-2 rounded-lg flex items-center space-x-2`}>
              <phaseInfo.icon className="h-5 w-5" />
              <span>{phaseInfo.title}</span>
            </div>
            
            <div className="bg-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Question {currentQuestionIndex + 1}
                </h2>
                <div className="text-sm text-gray-500">
                  Phase {currentPhase === 'personal' ? '1' : currentPhase === 'technical' ? '2' : '3'} of 3
                </div>
              </div>
              
              <div className="prose max-w-none">
                <div className="text-lg text-gray-800 whitespace-pre-line">
                  {currentQuestion?.question}
                </div>
              </div>
            </div>

            {/* Answer Area */}
            <div className="mb-6">
              <textarea
                placeholder="Type your answer here... Be specific and provide examples where possible."
                rows={8}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onChange={(e) => handleAnswer(e.target.value)}
              />
            </div>

            {/* Hints for scenario questions */}
            {currentQuestion?.hints && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Hints:</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  {currentQuestion.hints.map((hint, index) => (
                    <li key={index}>• {hint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Button */}
            <div className="flex justify-end">
              <button
                onClick={nextQuestion}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-200 flex items-center space-x-2"
              >
                <span>Next Question</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSimulation;