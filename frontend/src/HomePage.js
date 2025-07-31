import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Code, Zap, ArrowRight, Clock, Target, FileText, TrendingUp, Award } from 'lucide-react';
import { loadHomepageData } from './utils/dataLoader';

const HomePage = () => {
  const navigate = useNavigate();
  const [homepageData, setHomepageData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await loadHomepageData();
      setHomepageData(data);
    };
    loadData();
  }, []);

  const iconMap = {
    Target,
    Code,
    Zap,
    Users,
    Clock,
    BookOpen,
    FileText,
    TrendingUp,
    Award
  };

  if (!homepageData) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full mr-4">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white">
              {homepageData.metadata.title}
            </h1>
          </div>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            {homepageData.metadata.subtitle}
          </p>
        </div>

        {/* Main Options - Updated to 3 columns */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* Kubernetes Quiz Box */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-8 shadow-2xl transform group-hover:scale-105 transition duration-300">
              
              <div className="text-center mb-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Kubernetes Quiz
                </h2>
                <p className="text-gray-600">
                  Practice with curated K8s questions organized by difficulty and category
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {homepageData.features.quiz.map((feature, index) => {
                  const IconComponent = iconMap[feature.icon] || Target;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-700">{feature.text}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => navigate('/kubernetes-quiz')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-2 group"
              >
                <span>Start Practicing</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Interview Simulation Box */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-8 shadow-2xl transform group-hover:scale-105 transition duration-300">
              
              <div className="text-center mb-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Interview Simulation
                </h2>
                <p className="text-gray-600">
                  Experience realistic DevOps interviews with personal questions and debugging scenarios
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {homepageData.features.interview.map((feature, index) => {
                  const IconComponent = iconMap[feature.icon] || Users;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5 text-purple-600" />
                      <span className="text-gray-700">{feature.text}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => navigate('/interview-simulation')}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition duration-200 flex items-center justify-center space-x-2 group"
              >
                <span>Start Interview</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Job Application Manager Box - NEW */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-8 shadow-2xl transform group-hover:scale-105 transition duration-300">
              
              <div className="text-center mb-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Manage Applications
                </h2>
                <p className="text-gray-600">
                  Track your job applications, interviews, and follow-ups in one sophisticated dashboard
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Application Tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Progress Analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Status Management</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/job-applications')}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center space-x-2 group"
              >
                <span>Manage Applications</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {homepageData.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-blue-200">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;