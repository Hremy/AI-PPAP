import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submitEvaluation } from '../../lib/api';

const SelfEvaluationForm = () => {
  const queryClient = useQueryClient();
  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Enhanced competencies with better descriptions and categories
  const competencies = [
    { 
      id: 'communication', 
      name: 'Communication', 
      description: 'Effectively communicates ideas, listens actively, and provides clear feedback',
      icon: '💬',
      category: 'Interpersonal'
    },
    { 
      id: 'teamwork', 
      name: 'Collaboration & Teamwork', 
      description: 'Works well with others, supports team goals, and contributes to a positive environment',
      icon: '🤝',
      category: 'Interpersonal'
    },
    { 
      id: 'problem_solving', 
      name: 'Problem Solving', 
      description: 'Identifies issues quickly, thinks critically, and develops effective solutions',
      icon: '🧩',
      category: 'Technical'
    },
    { 
      id: 'initiative', 
      name: 'Initiative & Leadership', 
      description: 'Takes ownership, shows self-motivation, and leads by example',
      icon: '🚀',
      category: 'Leadership'
    },
    { 
      id: 'quality', 
      name: 'Quality & Excellence', 
      description: 'Consistently delivers high-quality work that exceeds expectations',
      icon: '⭐',
      category: 'Performance'
    },
    { 
      id: 'adaptability', 
      name: 'Adaptability', 
      description: 'Embraces change, learns quickly, and thrives in dynamic environments',
      icon: '🔄',
      category: 'Growth'
    }
  ];

  const handleRatingChange = (competencyId, value) => {
    setRatings(prev => ({
      ...prev,
      [competencyId]: parseInt(value, 10)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const evaluationData = {
        ratings,
        feedback,
        submittedAt: new Date().toISOString()
      };
      
      console.log('Submitting evaluation:', evaluationData);
      
      // Submit to backend API
      const response = await fetch('http://localhost:8084/api/evaluations/self', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluationData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Evaluation submitted successfully:', result);
        setSubmitted(true);
        queryClient.invalidateQueries(['evaluations']);
      } else {
        console.error('Failed to submit evaluation:', response.statusText);
        // You could add error handling here
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      // You could add error handling here
    }
  };

  const getRatingColor = (rating) => {
    const colors = {
      1: 'text-red-500 bg-red-50 border-red-200',
      2: 'text-orange-500 bg-orange-50 border-orange-200',
      3: 'text-yellow-500 bg-yellow-50 border-yellow-200',
      4: 'text-blue-500 bg-blue-50 border-blue-200',
      5: 'text-green-500 bg-green-50 border-green-200'
    };
    return colors[rating] || 'text-gray-400 bg-gray-50 border-gray-200';
  };

  const getProgressPercentage = () => {
    const totalCompetencies = competencies.length;
    const ratedCompetencies = Object.keys(ratings).length;
    return Math.round((ratedCompetencies / totalCompetencies) * 100);
  };

  if (submitted) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center max-w-md mx-auto shadow-lg">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6 animate-pulse">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-3">Evaluation Submitted!</h3>
          <p className="text-green-700 mb-6">Your self-evaluation has been successfully submitted for review. Thank you for your thoughtful responses.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Submit Another Evaluation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Header with Progress */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-8 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-secondary mb-2">Self-Evaluation Assessment</h2>
          <p className="text-secondary/80 text-lg mb-6">
            Rate your performance across key competencies and provide insights for growth
          </p>
          
          {/* Progress Bar */}
          <div className="bg-white/20 rounded-full h-3 mb-2">
            <div 
              className="bg-secondary rounded-full h-3 transition-all duration-500 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <p className="text-secondary/70 text-sm">
            {getProgressPercentage()}% Complete ({Object.keys(ratings).length}/{competencies.length} competencies rated)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 sm:p-8">
        {/* Competencies Grid */}
        <div className="grid gap-8 mb-12">
          {competencies.map((competency, index) => {
            const isRated = ratings[competency.id];
            const rating = ratings[competency.id];
            
            return (
              <div 
                key={competency.id} 
                className={`bg-white border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${
                  isRated ? 'border-primary/30 shadow-md' : 'border-gray-200 hover:border-primary/20'
                }`}
              >
                {/* Competency Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{competency.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-secondary flex items-center gap-2">
                        {competency.name}
                        <span className="text-xs bg-primary/20 text-secondary px-2 py-1 rounded-full">
                          {competency.category}
                        </span>
                      </h3>
                      <p className="text-secondary/70 text-sm mt-1">{competency.description}</p>
                    </div>
                  </div>
                  {isRated && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRatingColor(rating)}`}>
                      {rating}/5
                    </div>
                  )}
                </div>

                {/* Rating Scale */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-secondary/80">
                    Rate your performance (1 = Needs Improvement, 5 = Outstanding)
                  </label>
                  
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                    {[1, 2, 3, 4, 5].map((ratingValue) => (
                      <label 
                        key={ratingValue} 
                        className="flex flex-col items-center cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name={competency.id}
                          value={ratingValue}
                          checked={ratings[competency.id] === ratingValue}
                          onChange={() => handleRatingChange(competency.id, ratingValue)}
                          className="sr-only"
                          required
                        />
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all duration-200 ${
                          ratings[competency.id] === ratingValue
                            ? getRatingColor(ratingValue)
                            : 'border-gray-300 text-gray-400 hover:border-primary hover:text-primary'
                        } group-hover:scale-110`}>
                          {ratingValue}
                        </div>
                        <span className="text-xs text-secondary/60 mt-1 text-center leading-tight">
                          {ratingDescriptions[ratingValue]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Feedback Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-secondary mb-3 flex items-center gap-2">
            <span>📝</span>
            Additional Insights & Feedback
          </h3>
          <p className="text-secondary/70 text-sm mb-4">
            Share any additional thoughts about your performance, achievements, challenges, or areas where you'd like to grow.
          </p>
          <textarea
            id="feedback"
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
            placeholder="Examples:
• Key achievements this period...
• Challenges I've overcome...
• Areas where I'd like additional support...
• Goals for the next evaluation period..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            className="px-6 py-3 border border-secondary/20 text-secondary bg-white hover:bg-gray-50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Save Draft
          </button>
          <button
            type="submit"
            disabled={Object.keys(ratings).length < competencies.length}
            className="px-8 py-3 bg-secondary text-white rounded-xl font-medium hover:bg-secondary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Submit Evaluation
            {Object.keys(ratings).length < competencies.length && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded">
                {competencies.length - Object.keys(ratings).length} remaining
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Enhanced rating descriptions
const ratingDescriptions = {
  1: 'Needs Significant Improvement',
  2: 'Below Expectations',
  3: 'Meets Expectations',
  4: 'Exceeds Expectations',
  5: 'Outstanding Performance'
};

export default SelfEvaluationForm;