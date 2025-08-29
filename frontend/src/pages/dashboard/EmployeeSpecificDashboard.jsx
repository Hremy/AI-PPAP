import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  UserIcon,
  HomeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const EmployeeSpecificDashboard = () => {
  const { currentUser } = useAuth();

  // Fetch employee's evaluations
  const { data: evaluations = [], isLoading: evaluationsLoading } = useQuery({
    queryKey: ['employeeEvaluations', currentUser?.id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:8084/api/v1/evaluations/employee/${currentUser?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ai_ppap_auth_token')}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error('Failed to fetch evaluations');
      }
      
      return response.json();
    },
    enabled: !!currentUser?.id
  });

  // Fetch employee's average ratings
  const { data: averageRatings = {}, isLoading: ratingsLoading } = useQuery({
    queryKey: ['employeeAverageRatings', currentUser?.id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:8084/api/v1/evaluations/employee/${currentUser?.id}/averages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ai_ppap_auth_token')}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) return {};
        throw new Error('Failed to fetch average ratings');
      }
      
      return response.json();
    },
    enabled: !!currentUser?.id
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case 'REVIEWED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'DRAFT':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'REVIEWED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateOverallAverage = () => {
    if (!averageRatings || Object.keys(averageRatings).length === 0) return 0;
    const values = Object.values(averageRatings);
    return values.reduce((sum, rating) => sum + rating, 0) / values.length;
  };

  const renderStars = (rating) => {
    if (rating === null || rating === undefined || rating === 0) {
      return <span className="text-gray-400 text-sm">Not rated</span>;
    }
    const value = Number(rating);
    const percent = Math.max(0, Math.min(100, (value / 5) * 100));
    const rounded = Math.max(1, Math.min(5, Math.round(value)));
    const colorMap = {
      1: { fg: 'text-red-500', bg: 'text-red-200' },
      2: { fg: 'text-orange-500', bg: 'text-orange-200' },
      3: { fg: 'text-yellow-400', bg: 'text-yellow-200' },
      4: { fg: 'text-sky-400', bg: 'text-sky-200' },
      5: { fg: 'text-green-500', bg: 'text-green-200' },
    };
    const { fg, bg } = colorMap[rounded] || colorMap[3];
    return (
      <div className="flex items-center">
        <div className="relative inline-block align-middle" style={{ width: '80px', height: '16px' }}>
          <div className="flex" style={{ lineHeight: 0 }}>
            {[...Array(5)].map((_, i) => (
              <StarIconSolid key={`bg-${i}`} className={`w-4 h-4 ${bg} block`} />
            ))}
          </div>
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${percent}%` }}>
            <div className="flex" style={{ lineHeight: 0 }}>
              {[...Array(5)].map((_, i) => (
                <StarIconSolid key={`fg-${i}`} className={`w-4 h-4 ${fg} block`} />
              ))}
            </div>
          </div>
        </div>
        <span className="ml-1 text-xs font-medium text-gray-700">{value.toFixed(1)}</span>
      </div>
    );
  };

  const stats = [
    {
      name: 'Total Evaluations',
      value: evaluations.length,
      icon: DocumentTextIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Completed Reviews',
      value: evaluations.filter(e => e.status === 'REVIEWED').length,
      icon: CheckCircleIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Pending Reviews',
      value: evaluations.filter(e => e.status === 'SUBMITTED').length,
      icon: ClockIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Overall Average',
      value: calculateOverallAverage().toFixed(1),
      icon: StarIcon,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {currentUser?.firstName || 'Employee'}!
                </h1>
                <p className="text-sm text-gray-500">Here's your performance overview</p>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Evaluations */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Your Evaluations</h2>
                  <Link
                    to="/evaluation"
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
                  >
                    Submit New Evaluation
                    <ArrowRightIcon className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {evaluationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : evaluations.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No evaluations submitted yet</p>
                    <Link
                      to="/evaluation"
                      className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Submit Your First Evaluation
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {evaluations.slice(0, 5).map((evaluation) => (
                      <div key={evaluation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          {getStatusIcon(evaluation.status)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              Evaluation #{evaluation.id}
                            </p>
                            <p className="text-xs text-gray-500">
                              Submitted: {new Date(evaluation.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {evaluation.overallRating && (
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900 mr-1">
                                {evaluation.overallRating.toFixed(1)}
                              </span>
                              <div className="flex">
                                {renderStars(evaluation.overallRating)}
                              </div>
                            </div>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                            {evaluation.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {evaluations.length > 5 && (
                      <div className="text-center pt-4">
                        <p className="text-sm text-gray-500">
                          Showing 5 of {evaluations.length} evaluations
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="space-y-6">
            {/* Average Ratings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Performance Ratings</h2>
              </div>
              <div className="p-6">
                {ratingsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : Object.keys(averageRatings).length === 0 ? (
                  <p className="text-gray-500 text-sm">No ratings available yet</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(averageRatings).map(([competency, rating]) => (
                      <div key={competency}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {competency.replace('_', ' ')}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {rating.toFixed(1)}/5.0
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(rating / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  to="/evaluation"
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Submit Evaluation
                </Link>
                <Link
                  to="/profile"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Update Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSpecificDashboard;

