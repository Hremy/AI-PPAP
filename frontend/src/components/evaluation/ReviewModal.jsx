import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  XMarkIcon, 
  StarIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const ReviewModal = ({ evaluation, isOpen, onClose }) => {
  const [reviewData, setReviewData] = useState({
    managerRating: 0,
    managerFeedback: '',
    recommendations: '',
    status: 'REVIEWED'
  });

  const queryClient = useQueryClient();

  const submitReviewMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`http://localhost:8084/api/v1/evaluations/${evaluation.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ai_ppap_auth_token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit review');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['evaluations']);
      onClose();
      // Reset form
      setReviewData({
        managerRating: 0,
        managerFeedback: '',
        recommendations: '',
        status: 'REVIEWED'
      });
    },
    onError: (error) => {
      console.error('Review submission error:', error);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reviewData.managerRating === 0) {
      alert('Please provide a manager rating');
      return;
    }
    submitReviewMutation.mutate(reviewData);
  };

  const handleRatingClick = (rating) => {
    setReviewData(prev => ({ ...prev, managerRating: rating }));
  };

  if (!isOpen || !evaluation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Review Evaluation</h2>
            <p className="text-sm text-gray-500">
              Employee: {evaluation.employeeName} • Submitted: {new Date(evaluation.submittedAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee Evaluation Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Employee Self-Evaluation
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Overall Rating</label>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-bold text-primary mr-2">
                    {evaluation.overallRating || 'N/A'}
                  </span>
                  <span className="text-sm text-gray-500">/5.0</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Competency Average</label>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-bold text-secondary mr-2">
                    {evaluation.competencyRatings ? 
                      (Object.values(evaluation.competencyRatings).reduce((sum, rating) => sum + rating, 0) / 
                       Object.values(evaluation.competencyRatings).length).toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-sm text-gray-500">/5.0</span>
                </div>
              </div>
            </div>

            {/* Key Information */}
            <div className="space-y-3">
              {evaluation.achievements && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Key Achievements</label>
                  <p className="mt-1 text-sm text-gray-600">{evaluation.achievements}</p>
                </div>
              )}
              
              {evaluation.challenges && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Challenges</label>
                  <p className="mt-1 text-sm text-gray-600">{evaluation.challenges}</p>
                </div>
              )}
              
              {evaluation.nextPeriodGoals && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Next Period Goals</label>
                  <p className="mt-1 text-sm text-gray-600">{evaluation.nextPeriodGoals}</p>
                </div>
              )}
            </div>
          </div>

          {/* Manager Review Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Manager Review
              </h3>

              {/* Manager Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager Rating *
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className="focus:outline-none"
                    >
                      {star <= reviewData.managerRating ? (
                        <StarIconSolid className="w-8 h-8 text-yellow-400" />
                      ) : (
                        <StarIcon className="w-8 h-8 text-gray-300 hover:text-yellow-400 transition-colors" />
                      )}
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-gray-600">
                    {reviewData.managerRating > 0 ? `${reviewData.managerRating}/5` : 'Select rating'}
                  </span>
                </div>
              </div>

              {/* Manager Feedback */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager Feedback *
                </label>
                <textarea
                  value={reviewData.managerFeedback}
                  onChange={(e) => setReviewData(prev => ({ ...prev, managerFeedback: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Provide detailed feedback on the employee's performance, achievements, and areas for improvement..."
                  required
                />
              </div>

              {/* Recommendations */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Development Recommendations
                </label>
                <textarea
                  value={reviewData.recommendations}
                  onChange={(e) => setReviewData(prev => ({ ...prev, recommendations: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Suggest specific areas for development, training opportunities, or career advancement..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitReviewMutation.isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitReviewMutation.isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

