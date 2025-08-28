import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submitEvaluation } from '../../lib/api';

const SelfEvaluationForm = () => {
  const queryClient = useQueryClient();
  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Mock competencies - in a real app, these would come from an API
  const competencies = [
    { id: 'communication', name: 'Communication', description: 'Effectively communicates ideas and information' },
    { id: 'teamwork', name: 'Teamwork', description: 'Collaborates well with team members' },
    { id: 'problem_solving', name: 'Problem Solving', description: 'Identifies and resolves issues effectively' },
    { id: 'initiative', name: 'Initiative', description: 'Takes ownership and shows self-motivation' },
    { id: 'quality', name: 'Quality of Work', description: 'Delivers work that meets quality standards' },
  ];

  const handleRatingChange = (competencyId, value) => {
    setRatings(prev => ({
      ...prev,
      [competencyId]: parseInt(value, 10)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const evaluationData = {
      ratings,
      feedback,
      submittedAt: new Date().toISOString()
    };
    
    // In a real app, you would call the API here
    console.log('Submitting evaluation:', evaluationData);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      // Invalidate any related queries to refresh data
      queryClient.invalidateQueries(['evaluations']);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-green-800 mb-2">Evaluation Submitted Successfully!</h3>
        <p className="text-green-700">Your self-evaluation has been submitted for review.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-primary/5">
        <h3 className="text-lg leading-6 font-medium text-secondary">Self-Evaluation Form</h3>
        <p className="mt-1 max-w-2xl text-sm text-secondary/60">
          Rate your performance on each competency and provide additional feedback.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="border-t border-secondary/10 divide-y divide-secondary/10">
        <div className="space-y-6 p-6">
          {competencies.map((competency) => (
            <div key={competency.id} className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor={competency.id} className="block text-sm font-medium text-secondary">
                  {competency.name}
                </label>
                <span className="text-xs text-secondary/50">
                  {ratings[competency.id] ? `${ratings[competency.id]}/5` : '0/5'}
                </span>
              </div>
              <p className="text-xs text-secondary/60 mb-2">{competency.description}</p>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <label key={rating} className="flex items-center">
                    <input
                      type="radio"
                      name={competency.id}
                      value={rating}
                      checked={ratings[competency.id] === rating}
                      onChange={() => handleRatingChange(competency.id, rating)}
                      className="h-4 w-4 text-primary focus:ring-primary border-secondary/30"
                      required
                    />
                    <span className="ml-1 text-sm text-secondary/70">{rating}</span>
                  </label>
                ))}
                <div className="ml-4 text-xs text-secondary/40 flex-1">
                  {ratingDescriptions[ratings[competency.id]] || ''}
                </div>
              </div>
            </div>
          ))}

          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-secondary mb-2">
              Additional Feedback
            </label>
            <textarea
              id="feedback"
              rows={4}
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-secondary/30 rounded-md p-2"
              placeholder="Share any additional comments about your performance, achievements, or areas for improvement..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        </div>
        
        <div className="px-4 py-4 bg-secondary/5 sm:px-6 flex justify-end space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-secondary/20 shadow-sm text-sm font-medium rounded-md text-secondary bg-white hover:bg-secondary/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Submit Evaluation
          </button>
        </div>
      </form>
    </div>
  );
};

// Helper for rating descriptions
const ratingDescriptions = {
  1: 'Needs significant improvement',
  2: 'Needs improvement',
  3: 'Meets expectations',
  4: 'Exceeds expectations',
  5: 'Outstanding performance'
};

export default SelfEvaluationForm;
