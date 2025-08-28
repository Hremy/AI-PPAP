import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

const EvaluationsTable = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch evaluations from backend
  const fetchEvaluations = async () => {
    try {
      const response = await fetch('http://localhost:8084/api/evaluations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Failed to fetch evaluations');
      }
    } catch (error) {
      throw new Error('Error fetching evaluations: ' + error.message);
    }
  };

  const { data: evaluationsData, isLoading, error: queryError } = useQuery({
    queryKey: ['evaluations'],
    queryFn: fetchEvaluations,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (evaluationsData) {
      setEvaluations(evaluationsData);
      setLoading(false);
    }
    if (queryError) {
      setError(queryError.message);
      setLoading(false);
    }
  }, [evaluationsData, queryError]);

  const getStatusBadge = (status) => {
    const statusColors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      REVIEWED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const calculateAverageRating = (ratings) => {
    if (!ratings || Object.keys(ratings).length === 0) return 'N/A';
    
    const values = Object.values(ratings);
    const average = values.reduce((sum, rating) => sum + rating, 0) / values.length;
    return average.toFixed(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Evaluations</h3>
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-primary text-secondary px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-secondary">Submitted Evaluations</h2>
            <p className="text-secondary/80 mt-1">
              {evaluations.length} evaluation{evaluations.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-white/20 text-secondary px-3 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {evaluations.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Evaluations Yet</h3>
          <p className="text-gray-500">Submitted evaluations will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {evaluations.map((evaluation) => (
                <tr key={evaluation.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-secondary">
                            {evaluation.employeeName ? evaluation.employeeName.charAt(0) : 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {evaluation.employeeName || 'Unknown Employee'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {evaluation.employeeId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-secondary mr-2">
                        {calculateAverageRating(evaluation.ratings)}
                      </span>
                      <span className="text-sm text-gray-500">/5.0</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(evaluation.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(evaluation.submittedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {evaluation.feedback || 'No feedback provided'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-primary hover:text-primary/80 transition-colors">
                        View Details
                      </button>
                      <button className="text-green-600 hover:text-green-500 transition-colors">
                        Review
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EvaluationsTable;