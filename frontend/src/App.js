import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import InterviewSimulation from './InterviewSimulation';
import KubernetesQuiz from './KubernetesQuiz';
import JobApplicationManager from './JobApplicationManager';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/kubernetes-quiz" element={<KubernetesQuiz />} />
        <Route path="/interview-simulation" element={<InterviewSimulation />} />
        <Route path="/job-applications" element={<JobApplicationManager />} />
      </Routes>
    </Router>
  );
}

export default App;