import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StarIcon, PencilIcon, CheckIcon, XMarkIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const ScoreBasedEvaluationTable = ({ selectedProjectIds = [] }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingScores, setEditingScores] = useState({});
  const [managerScores, setManagerScores] = useState({});
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, evaluationId: null, employeeName: '' });
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [groupByMonth, setGroupByMonth] = useState(true);
  
  const queryClient = useQueryClient();
  const { hasRole, currentUser } = useAuth();

  // Competencies that should be displayed as columns
  const competencies = [
    { id: 'technical_skills', name: 'Technical Skills' },
    { id: 'communication', name: 'Communication' },
    { id: 'problem_solving', name: 'Problem Solving' },
    { id: 'teamwork', name: 'Teamwork' },
    { id: 'leadership', name: 'Leadership' },
    { id: 'adaptability', name: 'Adaptability' },
    { id: 'time_management', name: 'Time Management' },
    { id: 'quality_focus', name: 'Quality Focus' }
  ];

  // Fetch evaluations
  const { data: evaluationsData, isLoading, error: queryError } = useQuery({
    queryKey: ['evaluations'],
    queryFn: async () => {
      // Dev auth headers for backend's DevHeaderAuthFilter so manager filtering applies
      const devHeaders = (() => {
        if (!currentUser) return {};
        const roles = (currentUser.roles || []).map(r => r.startsWith('ROLE_') ? r.slice(5) : r).join(',');
        const hdr = {};
        if (currentUser.username || currentUser.email) hdr['X-User'] = currentUser.username || currentUser.email;
        if (roles) hdr['X-Roles'] = roles;
        return hdr;
      })();

      const response = await fetch('http://localhost:8084/api/v1/evaluations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ai_ppap_auth_token')}`,
          ...devHeaders
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error('Failed to fetch evaluations');
      }
      
      return response.json();
    }
  });

  // Submit manager score mutation
  const submitManagerScoreMutation = useMutation({
    mutationFn: async ({ evaluationId, competency, score }) => {
      // Dev auth headers for backend's DevHeaderAuthFilter
      const devHeaders = (() => {
        if (!currentUser) return {};
        const roles = (currentUser.roles || []).map(r => r.startsWith('ROLE_') ? r.slice(5) : r).join(',');
        const hdr = {};
        if (currentUser.username || currentUser.email) hdr['X-User'] = currentUser.username || currentUser.email;
        if (roles) hdr['X-Roles'] = roles;
        return hdr;
      })();

      const response = await fetch(`http://localhost:8084/api/v1/evaluations/${evaluationId}/manager-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ai_ppap_auth_token')}`,
          ...devHeaders
        },
        body: JSON.stringify({ competency, score })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit manager score');
      }
      
      return response.json();
    },
    onSuccess: async (data, variables) => {
      // Update local state immediately for instant feedback
      let updatedForEval = null;
      setEvaluations(prev => prev.map(evaluation => {
        if (evaluation.id === variables.evaluationId) {
          const updated = {
            ...evaluation,
            managerCompetencyRatings: {
              ...evaluation.managerCompetencyRatings,
              [variables.competency]: variables.score
            }
          };
          updatedForEval = updated;
          return updated;
        }
        return evaluation;
      }));
      
      // Also invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      queryClient.refetchQueries({ queryKey: ['evaluations'] });

      // Auto-update overall when any competency (not 'overall') changes
      try {
        if (variables.competency !== 'overall') {
          const target = updatedForEval || evaluations.find(e => e.id === variables.evaluationId);
          const avg = computeManagerAverage(target?.managerCompetencyRatings);
          if (avg && Number.isFinite(avg)) {
            // Persist computed overall via the same endpoint
            // Include dev headers here as well
            await fetch(`http://localhost:8084/api/v1/evaluations/${variables.evaluationId}/manager-score`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('ai_ppap_auth_token')}`,
                ...(currentUser ? {
                  'X-User': (currentUser.username || currentUser.email || ''),
                  'X-Roles': (currentUser.roles || []).map(r => r.startsWith('ROLE_') ? r.slice(5) : r).join(',')
                } : {})
              },
              body: JSON.stringify({ competency: 'overall', score: Math.round(avg) })
            }).catch(() => {});
          }
        }
      } catch (_) {
        // Non-fatal; overall will still be recomputed client-side as fallback
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update manager score');
    }
  });

  // Delete evaluation mutation
  const deleteEvaluationMutation = useMutation({
    mutationFn: async (evaluationId) => {
      const response = await fetch(`http://localhost:8084/api/v1/evaluations/${evaluationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete evaluation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      toast.success('Evaluation deleted successfully');
      setDeleteConfirmation({ isOpen: false, evaluationId: null, employeeName: '' });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete evaluation');
    }
  });

  const handleDeleteClick = (evaluation) => {
    setDeleteConfirmation({
      isOpen: true,
      evaluationId: evaluation.id,
      employeeName: evaluation.employeeName || 'Unknown Employee'
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmation.evaluationId) {
      deleteEvaluationMutation.mutate(deleteConfirmation.evaluationId);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ isOpen: false, evaluationId: null, employeeName: '' });
  };

  // First filter by project selection
  const projectFilteredEvaluations = useMemo(() => {
    if (!Array.isArray(evaluations) || selectedProjectIds.length === 0) return evaluations;
    const set = new Set(selectedProjectIds);
    return evaluations.filter((e) => {
      const pid = e.projectId || e.project?.id;
      return pid && set.has(pid);
    });
  }, [evaluations, selectedProjectIds]);

  // Get available months from project-filtered evaluations
  const availableMonths = useMemo(() => {
    const months = new Set();
    projectFilteredEvaluations.forEach(evaluation => {
      if (evaluation.submittedAt) {
        const date = new Date(evaluation.submittedAt);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthYear);
      }
    });
    return Array.from(months).sort().reverse();
  }, [projectFilteredEvaluations]);

  // Filter evaluations by selected month
  const filteredEvaluations = useMemo(() => {
    const base = projectFilteredEvaluations;
    if (selectedMonth === 'all') return base;
    return base.filter(evaluation => {
      if (!evaluation.submittedAt) return false;
      const date = new Date(evaluation.submittedAt);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthYear === selectedMonth;
    });
  }, [projectFilteredEvaluations, selectedMonth]);

  // Group evaluations by month
  const groupedEvaluations = useMemo(() => {
    if (!groupByMonth) return { 'All Evaluations': filteredEvaluations };
    
    const groups = {};
    filteredEvaluations.forEach(evaluation => {
      if (!evaluation.submittedAt) {
        if (!groups['No Date']) groups['No Date'] = [];
        groups['No Date'].push(evaluation);
        return;
      }
      
      const date = new Date(evaluation.submittedAt);
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!groups[monthName]) groups[monthName] = [];
      groups[monthName].push(evaluation);
    });
    
    // Sort groups by date (newest first)
    const sortedGroups = {};
    Object.keys(groups).sort((a, b) => {
      if (a === 'No Date') return 1;
      if (b === 'No Date') return -1;
      return new Date(b) - new Date(a);
    }).forEach(key => {
      sortedGroups[key] = groups[key];
    });
    
    return sortedGroups;
  }, [filteredEvaluations, groupByMonth]);

  const formatMonthYear = (monthYear) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Compute average of manager competency scores (1-5), excluding 'overall'. Returns number (one decimal) or null
  const computeManagerAverage = (managerRatings) => {
    if (!managerRatings) return null;
    const competencyIds = new Set(competencies.map(c => c.id));
    const values = Object.entries(managerRatings)
      .filter(([key]) => competencyIds.has(key))
      .map(([, v]) => (typeof v === 'string' ? parseInt(v, 10) : v))
      .filter(v => Number.isFinite(v) && v >= 1 && v <= 5);
    if (!values.length) return null;
    const rawAvg = values.reduce((a, b) => a + b, 0) / values.length;
    const oneDecimal = Math.round(rawAvg * 10) / 10; // keep one decimal for display
    return Math.min(5, Math.max(1, oneDecimal));
  };

  const renderStars = (rating) => {
    if (rating === null || rating === undefined || rating === 0) {
      return <span className="text-gray-400 text-sm">Not rated</span>;
    }
    const value = Number(rating);
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
        {/* Per-star clipping avoids any overlay misalignment */}
        <div className="inline-flex align-middle" style={{ height: '16px' }}>
          {[...Array(5)].map((_, i) => {
            const starIndex = i + 1;
            const fillPercent = Math.max(0, Math.min(100, (value - (starIndex - 1)) * 100));
            return (
              <div key={`star-${i}`} className="relative" style={{ width: '16px', height: '16px' }}>
                <StarIconSolid className={`w-4 h-4 ${bg} block`} />
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
                  <StarIconSolid className={`w-4 h-4 ${fg} block`} />
                </div>
              </div>
            );
          })}
        </div>
        <span className="ml-2 text-sm font-medium text-gray-700">{value.toFixed(1)}</span>
      </div>
    );
  };

  const handleEditScore = (evaluationId, competency) => {
    const key = `${evaluationId}-${competency}`;
    setEditingScores(prev => ({ ...prev, [key]: true }));
    
    // Initialize with existing manager score if available
    const evaluation = evaluations.find(e => e.id === evaluationId);
    const existingScore = evaluation?.managerCompetencyRatings?.[competency] || 0;
    setManagerScores(prev => ({ ...prev, [key]: existingScore }));
  };

  const handleScoreChange = (evaluationId, competency, score) => {
    const key = `${evaluationId}-${competency}`;
    setManagerScores(prev => ({ ...prev, [key]: parseInt(score) }));
  };

  const handleSaveScore = (evaluationId, competency) => {
    const key = `${evaluationId}-${competency}`;
    const score = managerScores[key];
    
    if (score < 1 || score > 5) {
      toast.error('Score must be between 1 and 5');
      return;
    }
    
    submitManagerScoreMutation.mutate({ evaluationId, competency, score });
    setEditingScores(prev => ({ ...prev, [key]: false }));
  };

  const handleCancelEdit = (evaluationId, competency) => {
    const key = `${evaluationId}-${competency}`;
    setEditingScores(prev => ({ ...prev, [key]: false }));
    setManagerScores(prev => ({ ...prev, [key]: undefined }));
  };

  const renderScoreCell = (evaluation, competency) => {
    const key = `${evaluation.id}-${competency.id}`;
    const isEditing = editingScores[key];
    const employeeScore = evaluation.competencyRatings?.[competency.id];
    const managerScore = evaluation.managerCompetencyRatings?.[competency.id];
    
    return (
      <td key={competency.id} className="px-4 py-4 border-r border-gray-200">
        <div className="space-y-2">
          {/* Employee Score */}
          <div className="bg-blue-50 rounded-lg p-2">
            <div className="text-xs font-medium text-blue-700 mb-1">Employee</div>
            {renderStars(employeeScore)}
          </div>
          
          {/* Manager Score */}
          <div className="rounded-lg p-2" style={{backgroundColor: 'rgb(0 32 53 / 0.1)'}}>
            <div className="text-xs font-medium mb-1 flex items-center justify-between" style={{color: 'rgb(0 32 53)'}}>
              <span>Manager</span>
              {!isEditing && hasRole('MANAGER') && !hasRole('ADMIN') && (
                <button
                  onClick={() => handleEditScore(evaluation.id, competency.id)}
                  className="transition-colors"
                  style={{color: 'rgb(0 32 53)'}}
                >
                  <PencilIcon className="w-3 h-3" />
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <select
                  value={managerScores[key] || 0}
                  onChange={(e) => handleScoreChange(evaluation.id, competency.id, e.target.value)}
                  className="text-xs border border-gray-300 rounded px-1 py-1 w-12"
                >
                  <option value={0}>-</option>
                  {[1, 2, 3, 4, 5].map(score => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleSaveScore(evaluation.id, competency.id)}
                  className="transition-colors"
                  style={{color: 'rgb(0 32 53)'}}
                  disabled={submitManagerScoreMutation.isLoading}
                >
                  <CheckIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleCancelEdit(evaluation.id, competency.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ) : (
              renderStars(managerScore)
            )}
          </div>
        </div>
      </td>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center text-red-600">
          <p>Error loading evaluations: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Filter Controls */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Filter by Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Months</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>
                    {formatMonthYear(month)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Group by Month:</label>
            <input
              type="checkbox"
              checked={groupByMonth}
              onChange={(e) => setGroupByMonth(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {Object.keys(groupedEvaluations).length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-gray-500">
            <StarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No evaluations submitted yet</p>
            <p className="text-sm">Evaluations will appear here once employees submit them.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr className="divide-x divide-gray-300">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                  Overall Rating
                </th>
                {competencies.map((competency) => (
                  <th key={competency.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                    <div className="text-center">
                      {competency.name}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                  Submitted Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              {Object.entries(groupedEvaluations).map(([monthName, monthEvaluations]) => (
                <React.Fragment key={monthName}>
                  {groupByMonth && (
                    <tr className="bg-gray-100">
                      <td colSpan={competencies.length + 5} className="px-6 py-3 text-sm font-semibold text-gray-800 border-b border-gray-300">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{monthName}</span>
                          <span className="text-xs text-gray-600">({monthEvaluations.length} evaluations)</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {monthEvaluations.map((evaluation) => (
                <tr key={evaluation.id} className="hover:bg-gray-50 transition-colors divide-x divide-gray-200">
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {evaluation.employeeName || 'Unknown Employee'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {evaluation.employeeEmail || 'No email'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <div className="space-y-2">
                      {/* Employee Overall Rating */}
                      <div className="bg-blue-50 rounded-lg p-2">
                        <div className="text-xs font-medium text-blue-700 mb-1">Employee</div>
                        {renderStars(evaluation.overallRating)}
                      </div>
                      
                      {/* Manager Overall Rating (read-only, auto-computed) */}
                      <div className="rounded-lg p-2" style={{backgroundColor: 'rgb(0 32 53 / 0.1)'}}>
                        <div className="text-xs font-medium mb-1 flex items-center justify-between" style={{color: 'rgb(0 32 53)'}}>
                          <span>Manager</span>
                        </div>
                        {(() => {
                          const fallback = computeManagerAverage(evaluation.managerCompetencyRatings);
                          return renderStars(evaluation.managerRating || fallback);
                        })()}
                      </div>
                    </div>
                  </td>
                  {competencies.map((competency) => renderScoreCell(evaluation, competency))}
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    {getStatusBadge(evaluation.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                    {formatDate(evaluation.submittedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleDeleteClick(evaluation)}
                      className="text-[#002035] hover:text-[#002035]/80 transition-colors flex items-center"
                      title="Delete evaluation"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <TrashIcon className="h-6 w-6 text-[#002035]" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Evaluation
                </h3>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete the evaluation for{' '}
                <span className="font-medium text-gray-900">{deleteConfirmation.employeeName}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                onClick={handleDeleteCancel}
                disabled={deleteEvaluationMutation.isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                style={{backgroundColor: '#002035'}}
                onClick={handleDeleteConfirm}
                disabled={deleteEvaluationMutation.isLoading}
              >
                {deleteEvaluationMutation.isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreBasedEvaluationTable;

