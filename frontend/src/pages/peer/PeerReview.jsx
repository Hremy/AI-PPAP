import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

const PeerReview = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [evaluation, setEvaluation] = useState(null);
  const [peerReview, setPeerReview] = useState({
    strengths: '',
    weaknesses: '',
    suggestions: '',
    collaborationRating: 0,
    communicationRating: 0,
    technicalRating: 0,
    leadershipRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvaluation();
    checkExistingReview();
  }, [evaluationId]);

  const fetchEvaluation = async () => {
    try {
      const response = await api.get(`/evaluations/${evaluationId}`);
      setEvaluation(response.data);
    } catch (error) {
      setError('Failed to load evaluation details');
    }
  };

  const checkExistingReview = async () => {
    try {
      const response = await api.get(`/peer-reviews/evaluation/${evaluationId}/reviewer/${user.id}`);
      if (response.data) {
        setPeerReview(response.data);
      }
    } catch (error) {
      // No existing review found, which is fine
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (category, rating) => {
    setPeerReview(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handleTextChange = (field, value) => {
    setPeerReview(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const reviewData = {
        ...peerReview,
        evaluationId: parseInt(evaluationId),
        reviewerId: user.id,
        reviewerName: user.name,
        reviewerEmail: user.email
      };

      if (peerReview.id) {
        await api.put(`/peer-reviews/${peerReview.id}`, reviewData);
      } else {
        await api.post('/peer-reviews', reviewData);
      }

      navigate('/dashboard', { 
        state: { message: 'Peer review submitted successfully!' }
      });
    } catch (error) {
      setError('Failed to submit peer review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, label }) => {
    return (
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className="focus:outline-none"
            >
              {star <= rating ? (
                <StarIcon className="h-6 w-6 text-yellow-400" />
              ) : (
                <StarOutlineIcon className="h-6 w-6 text-gray-300" />
              )}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500">{rating}/5</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Peer Review</h1>
            {evaluation && (
              <p className="mt-2 text-gray-600">
                Reviewing: <span className="font-medium">{evaluation.employeeName}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Rating Section */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Performance Ratings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StarRating
                  rating={peerReview.collaborationRating}
                  onRatingChange={(rating) => handleRatingChange('collaborationRating', rating)}
                  label="Collaboration & Teamwork"
                />
                <StarRating
                  rating={peerReview.communicationRating}
                  onRatingChange={(rating) => handleRatingChange('communicationRating', rating)}
                  label="Communication Skills"
                />
                <StarRating
                  rating={peerReview.technicalRating}
                  onRatingChange={(rating) => handleRatingChange('technicalRating', rating)}
                  label="Technical Competency"
                />
                <StarRating
                  rating={peerReview.leadershipRating}
                  onRatingChange={(rating) => handleRatingChange('leadershipRating', rating)}
                  label="Leadership & Initiative"
                />
              </div>
            </div>

            {/* Feedback Section */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Written Feedback</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strengths
                </label>
                <textarea
                  rows={4}
                  value={peerReview.strengths}
                  onChange={(e) => handleTextChange('strengths', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="What does this person do well? What are their key strengths?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Areas for Improvement
                </label>
                <textarea
                  rows={4}
                  value={peerReview.weaknesses}
                  onChange={(e) => handleTextChange('weaknesses', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="What areas could this person improve in? Be constructive and specific."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suggestions & Recommendations
                </label>
                <textarea
                  rows={4}
                  value={peerReview.suggestions}
                  onChange={(e) => handleTextChange('suggestions', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="What specific suggestions do you have for their professional development?"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : (peerReview.id ? 'Update Review' : 'Submit Review')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PeerReview;
