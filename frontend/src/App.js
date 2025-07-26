import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import InterviewSimulation from './InterviewSimulation';
import KubernetesQuiz from './KubernetesQuiz'; // We'll rename your current App component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/kubernetes-quiz" element={<KubernetesQuiz />} />
        <Route path="/interview-simulation" element={<InterviewSimulation />} />
      </Routes>
    </Router>
  );
}

export default App;