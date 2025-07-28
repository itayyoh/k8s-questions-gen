import React, { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost';

const AddQuestionForm = ({ isOpen, onClose, onQuestionAdded }) => {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    difficulty: 'Easy',
    type: 'open-ended',
    options: ['', '', '', ''] // For multiple choice
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = [
    'Core Concepts', 'Networking', 'Configuration', 'Architecture', 
    'Workloads', 'Storage', 'Security', 'CLI', 'Basics'
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const validateForm = () => {
    if (!formData.question.trim()) {
      setMessage({ type: 'error', text: 'Question is required' });
      return false;
    }
    if (!formData.answer.trim()) {
      setMessage({ type: 'error', text: 'Answer is required' });
      return false;
    }
    if (!formData.category.trim()) {
      setMessage({ type: 'error', text: 'Category is required' });
      return false;
    }
    
    if (formData.type === 'multiple-choice') {
      const validOptions = formData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        setMessage({ type: 'error', text: 'Multiple choice questions need at least 2 options' });
        return false;
      }
      if (!validOptions.includes(formData.answer.trim())) {
        setMessage({ type: 'error', text: 'Answer must be one of the options for multiple choice questions' });
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      const questionData = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category.trim(),
        difficulty: formData.difficulty,
        type: formData.type
      };
      
      // Only include options for multiple choice questions
      if (formData.type === 'multiple-choice') {
        questionData.options = formData.options.filter(opt => opt.trim());
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/questions`, questionData);
      
      setMessage({ type: 'success', text: 'Question added successfully!' });
      
      // Reset form
      setFormData({
        question: '',
        answer: '',
        category: '',
        difficulty: 'Easy',
        type: 'open-ended',
        options: ['', '', '', '']
      });
      
      // Call parent callback
      if (onQuestionAdded) {
        onQuestionAdded(response.data);
      }
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
        setMessage({ type: '', text: '' });
      }, 1500);
      
    } catch (error) {
      console.error('Error adding question:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to add question. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      question: '',
      answer: '',
      category: '',
      difficulty: 'Easy',
      type: 'open-ended',
      options: ['', '', '', '']
    });
    setMessage({ type: '', text: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Plus className="h-6 w-6 text-blue-400" />
            Add New Question
          </h2>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Message */}
          {message.text && (
            <div className={`p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {message.text}
            </div>
          )}

          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-3">
              Question Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="open-ended" className="bg-slate-800">Open-Ended</option>
              <option value="multiple-choice" className="bg-slate-800">Multiple Choice</option>
            </select>
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-3">
              Question *
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              placeholder="Enter your Kubernetes question..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          {/* Answer */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-3">
              {formData.type === 'multiple-choice' ? 'Correct Answer *' : 'Answer *'}
            </label>
            {formData.type === 'multiple-choice' ? (
              <input
                type="text"
                value={formData.answer}
                onChange={(e) => handleInputChange('answer', e.target.value)}
                placeholder="Enter the correct answer (must match one of the options below)"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            ) : (
              <textarea
                value={formData.answer}
                onChange={(e) => handleInputChange('answer', e.target.value)}
                placeholder="Enter the detailed answer..."
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            )}
          </div>

          {/* Options for Multiple Choice */}
          {formData.type === 'multiple-choice' && (
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-3">
                Answer Options
              </label>
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Option
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-3">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" className="bg-slate-800">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-slate-800">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-3">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty} className="bg-slate-800">
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Add Question
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionForm;