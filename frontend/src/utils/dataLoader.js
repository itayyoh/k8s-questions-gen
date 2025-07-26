const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost';

// Fallback data in case API is unavailable
const fallbackData = {
  categoryColors: {
    'Core Concepts': 'bg-blue-100 text-blue-800',
    'Networking': 'bg-indigo-100 text-indigo-800',
    'Configuration': 'bg-teal-100 text-teal-800',
    'Architecture': 'bg-purple-100 text-purple-800',
    'Workloads': 'bg-pink-100 text-pink-800',
    'Storage': 'bg-cyan-100 text-cyan-800',
    'Security': 'bg-red-100 text-red-800',
    'CLI': 'bg-lime-100 text-lime-800'
  },
  difficultyColors: {
    'Easy': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Hard': 'bg-red-100 text-red-800'
  },
  defaultColor: 'bg-gray-100 text-gray-800',
  fallbackCategories: ['Core Concepts', 'Networking', 'Configuration']
};

export const loadUIConfig = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ui-config`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to load UI config from API, using fallback data');
  }
  return fallbackData;
};

export const loadInterviewScenarios = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/interview-scenarios`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to load interview scenarios from API');
  }
  
  // Fallback interview scenarios data
  return {
    phases: {
      personal: {
        title: "Getting to Know You",
        icon: "User",
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
        icon: "Code",
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
        icon: "AlertTriangle",
        color: "red",
        questions: [
          {
            id: 7,
            question: "**Debugging Scenario:**\n\nYour production Kubernetes cluster is experiencing issues. Pods are randomly crashing with the following symptoms:\n\n- CPU usage spikes to 100%\n- Memory usage shows OOMKilled errors\n- Application logs show connection timeouts\n- Some pods are in CrashLoopBackOff state\n\n**Your task:** Walk me through your debugging process. What commands would you run and what would you look for?",
            type: "scenario",
            timeLimit: 600,
            hints: [
              "Think about resource limits and requests",
              "Consider checking node resources",
              "What about network policies or DNS issues?"
            ]
          },
          {
            id: 8,
            question: "**Infrastructure Scaling Scenario:**\n\nYour e-commerce application is experiencing a traffic surge during Black Friday. Current symptoms:\n\n- Response times increased from 200ms to 5+ seconds\n- Database connection pool exhausted\n- CDN hit ratio dropped significantly\n- Auto-scaling isn't keeping up\n\n**Your task:** Design a scaling strategy to handle this traffic surge.",
            type: "scenario",
            timeLimit: 480,
            hints: [
              "Consider horizontal and vertical scaling",
              "Think about database optimization",
              "What about caching strategies?"
            ]
          }
        ]
      }
    }
  };
};

export const loadHomepageData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/homepage-data`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to load homepage data from API');
  }
  
  // Fallback data
  return {
    features: {
      quiz: [
        { icon: "Target", text: "Practice by Category" },
        { icon: "Code", text: "Real K8s Questions" },
        { icon: "Zap", text: "Instant Feedback" }
      ],
      interview: [
        { icon: "Users", text: "Realistic Interview Flow" },
        { icon: "Clock", text: "Timed Questions" },
        { icon: "Code", text: "Debug Scenarios" }
      ]
    },
    stats: [
      { value: "500+", label: "Questions" },
      { value: "15+", label: "Scenarios" },
      { value: "98%", label: "Success Rate" }
    ],
    metadata: {
      title: "DevOps Interview Platform",
      subtitle: "Master DevOps interviews with realistic simulations, Kubernetes practice, and real-world debugging scenarios. Land your dream DevOps role."
    }
  };
};

export const getCategoryColor = (category, config) => {
  return config.categoryColors[category] || config.defaultColor;
};

export const getDifficultyColor = (difficulty, config) => {
  return config.difficultyColors[difficulty] || config.defaultColor;
};