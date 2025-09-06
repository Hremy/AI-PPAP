import React, { useState, useEffect } from 'react';
import { UserGroupIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { api } from '../lib/api';

const PeerReviewSummary = ({ evaluationId }) => {
  const [summary, setSummary] = useState('');
  const [peerReviews, setPeerReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (evaluationId) {
      fetchPeerReviews();
      fetchSummary();
    }
  }, [evaluationId]);

  const fetchPeerReviews = async () => {
    try {
      const response = await api.get(`/peer-reviews/evaluation/${evaluationId}`);
      setPeerReviews(response.data);
    } catch (error) {
      setError('Failed to load peer reviews');
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get(`/peer-reviews/evaluation/${evaluationId}/summary`);
      setSummary(response.data.summary);
    } catch (error) {
      setSummary('No peer review summary available.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <UserGroupIcon className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">360° Peer Feedback</h3>
          <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {peerReviews.length} reviews
          </span>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {peerReviews.length === 0 ? (
          <div className="text-center py-8">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No peer reviews yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Peer reviews will appear here once colleagues submit their feedback.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* AI Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">AI-Generated Summary</h4>
              <p className="text-sm text-blue-800 whitespace-pre-line">{summary}</p>
            </div>

            {/* Individual Reviews */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Individual Reviews</h4>
              <div className="space-y-4">
                {peerReviews.map((review, index) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Review #{index + 1}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {review.overallRating && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {review.overallRating}/5
                        </span>
                      )}
                    </div>

                    {/* Ratings */}
                    {(review.collaborationRating || review.communicationRating || 
                      review.technicalRating || review.leadershipRating) && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        {review.collaborationRating && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Collaboration</p>
                            <p className="text-sm font-medium">{review.collaborationRating}/5</p>
                          </div>
                        )}
                        {review.communicationRating && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Communication</p>
                            <p className="text-sm font-medium">{review.communicationRating}/5</p>
                          </div>
                        )}
                        {review.technicalRating && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Technical</p>
                            <p className="text-sm font-medium">{review.technicalRating}/5</p>
                          </div>
                        )}
                        {review.leadershipRating && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Leadership</p>
                            <p className="text-sm font-medium">{review.leadershipRating}/5</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Written Feedback */}
                    <div className="space-y-2 text-sm">
                      {review.strengths && (
                        <div>
                          <p className="font-medium text-green-700">Strengths:</p>
                          <p className="text-gray-700">{review.strengths}</p>
                        </div>
                      )}
                      {review.weaknesses && (
                        <div>
                          <p className="font-medium text-orange-700">Areas for Improvement:</p>
                          <p className="text-gray-700">{review.weaknesses}</p>
                        </div>
                      )}
                      {review.suggestions && (
                        <div>
                          <p className="font-medium text-blue-700">Suggestions:</p>
                          <p className="text-gray-700">{review.suggestions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeerReviewSummary;
