import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StarIcon, PencilIcon, CheckIcon, XMarkIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { getKEQs } from '../../lib/api';

const ScoreBasedEvaluationTable = ({ selectedProjectIds = [], showOnlyReviewed = false }) => {
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
  const isAdmin = hasRole('ADMIN');

  // Load KEQs and derive competencies dynamically (use KEQ text as title key)
  const { data: keqs = [] } = useQuery({
    queryKey: ['keqs','all'],
    queryFn: async () => {
      try { return await getKEQs(); } catch { return []; }
    }
  });

  const snake = (s) => s?.toString()?.trim()?.toLowerCase()?.replace(/[^a-z0-9]+/g, '_')?.replace(/^_+|_+$/g, '') || '';
  const competencies = useMemo(() => {
    if (!Array.isArray(keqs)) return [];
    // For table views, we do not filter by effective date; we show current KEQs as columns
    return keqs
      .filter(k => k && k.category)
      .sort((a,b)=> (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
      .map(k => ({ id: snake(k.category), name: k.category }));
  }, [keqs]);

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
      // Silent refresh without popup
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
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

  // Get available years from project-filtered evaluations
  const availableYears = useMemo(() => {
    const years = new Set();
    projectFilteredEvaluations.forEach(evaluation => {
      const yy = evaluation?.evaluationYear;
      if (yy) { years.add(String(yy)); return; }
      if (evaluation.submittedAt) {
        const date = new Date(evaluation.submittedAt);
        years.add(String(date.getFullYear()));
      }
    });
    return Array.from(years).sort().reverse();
  }, [projectFilteredEvaluations]);

  // Filter evaluations by selected year
  const filteredEvaluations = useMemo(() => {
    let base = projectFilteredEvaluations;
    if (selectedMonth === 'all') return base;
    const targetYear = parseInt(selectedMonth, 10);
    base = base.filter(evaluation => {
      const yy = evaluation?.evaluationYear;
      if (yy && yy === targetYear) return true;
      if (!evaluation.submittedAt) return false;
      const date = new Date(evaluation.submittedAt);
      return date.getFullYear() === targetYear;
    });
    // When requested, only show items that have been graded by manager
    if (showOnlyReviewed) {
      base = base.filter(e => {
        const hasMgrOverall = e.managerRating != null;
        const mgrCompCount = e.managerCompetencyRatings ? Object.keys(e.managerCompetencyRatings).length : 0;
        return e.status === 'REVIEWED' || hasMgrOverall || mgrCompCount > 0;
      });
    }
    return base;
  }, [projectFilteredEvaluations, selectedMonth]);

  // Helper: get quarter-year label
  const getQuarterYearLabel = (evaluation) => {
    const ym = evaluation?.evaluationMonth;
    const yy = evaluation?.evaluationYear;
    if (yy && ym) {
      const q = Math.floor((Number(ym) - 1) / 3) + 1;
      return `Q${q} ${yy}`;
    }
    // Fallback from submittedAt
    if (evaluation?.submittedAt) {
      const d = new Date(evaluation.submittedAt);
      const q = Math.floor(d.getMonth() / 3) + 1;
      return `Q${q} ${d.getFullYear()}`;
    }
    return 'No Timeline';
  };

  // Group evaluations by quarter
  const groupedEvaluations = useMemo(() => {
    if (!groupByMonth) return { 'All Evaluations': filteredEvaluations };

    const groups = {};
    filteredEvaluations.forEach(evaluation => {
      const key = getQuarterYearLabel(evaluation);
      if (!groups[key]) groups[key] = [];
      groups[key].push(evaluation);
    });

    // Sort groups like 'Q4 2025', 'Q3 2025', ...
    const parseKey = (k) => {
      const m = /^Q(\d)\s+(\d{4})$/.exec(k);
      if (!m) return { y: -Infinity, q: -Infinity };
      return { y: Number(m[2]), q: Number(m[1]) };
    };
    const sortedGroups = {};
    Object.keys(groups)
      .sort((a, b) => {
        const pa = parseKey(a), pb = parseKey(b);
        if (pa.y !== pb.y) return pb.y - pa.y;
        return pb.q - pa.q;
      })
      .forEach(key => { sortedGroups[key] = groups[key]; });
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

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Compute average of manager competency scores (1-5), excluding 'overall'. Returns number (one decimal) or null
  const computeManagerAverage = (managerRatings) => {
    if (!managerRatings) return null;
    
    // Get all valid rating values regardless of key matching
    const values = Object.entries(managerRatings)
      .filter(([key]) => key !== 'overall')
      .map(([, v]) => (typeof v === 'string' ? parseFloat(v) : v))
      .filter(v => Number.isFinite(v) && v >= 1 && v <= 5 && v !== 0);
    
    if (!values.length) return null;
    const rawAvg = values.reduce((a, b) => a + b, 0) / values.length;
    const oneDecimal = Math.round(rawAvg * 10) / 10;
    return Math.min(5, Math.max(1, oneDecimal));
  };

  // Compute average of employee competency scores (1-5), excluding 'overall'. Returns number (one decimal) or null
  const computeEmployeeAverage = (employeeRatings) => {
    if (!employeeRatings) return null;
    
    // Get all valid rating values regardless of key matching
    const values = Object.entries(employeeRatings)
      .filter(([key]) => key !== 'overall')
      .map(([, v]) => (typeof v === 'string' ? parseFloat(v) : v))
      .filter(v => Number.isFinite(v) && v >= 1 && v <= 5 && v !== 0);
    
    if (!values.length) return null;
    const rawAvg = values.reduce((a, b) => a + b, 0) / values.length;
    const oneDecimal = Math.round(rawAvg * 10) / 10;
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
    const key = `${evaluation.id}-${competency.name}`;
    const isEditing = editingScores[key];
    // KEQ ratings are stored using the actual KEQ category names
    // Convert KEQ category to title case to match stored employee ratings
    const toTitleCase = (str) => {
      return str.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };
    
    const titleCaseKey = toTitleCase(competency.name);
    
    // Try multiple formats to match stored employee ratings
    // Special handling for common variations
    const getEmployeeScore = () => {
      const ratingsObj = evaluation.competencyRatings || evaluation.ratings || {};
      
      // Direct matches
      if (ratingsObj[titleCaseKey]) return ratingsObj[titleCaseKey];
      if (ratingsObj[competency.name]) return ratingsObj[competency.name];
      
      // Special cases for known variations
      if (competency.name === 'QUALITY' && ratingsObj['Quality Focus']) return ratingsObj['Quality Focus'];
      if (competency.name === 'TECHNICAL SKILLS' && ratingsObj['Technical Skills']) return ratingsObj['Technical Skills'];
      
      // Fallback to case variations
      const keys = Object.keys(ratingsObj);
      const normalizedCompetency = competency.name.toLowerCase().replace(/\s+/g, '');
      
      for (const key of keys) {
        const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
        if (normalizedKey.includes(normalizedCompetency) || normalizedCompetency.includes(normalizedKey)) {
          return ratingsObj[key];
        }
      }
      
      return null;
    };
    
    const employeeScore = getEmployeeScore();
    // Manager score lookup with same smart matching as employee scores
    const getManagerScore = () => {
      const ratingsObj = evaluation.managerCompetencyRatings || {};
      
      // Direct matches
      if (ratingsObj[titleCaseKey]) return ratingsObj[titleCaseKey];
      if (ratingsObj[competency.name]) return ratingsObj[competency.name];
      
      // Special cases for known variations
      if (competency.name === 'QUALITY' && ratingsObj['Quality Focus']) return ratingsObj['Quality Focus'];
      if (competency.name === 'TECHNICAL SKILLS' && ratingsObj['Technical Skills']) return ratingsObj['Technical Skills'];
      
      // Fallback to case variations
      const keys = Object.keys(ratingsObj);
      const normalizedCompetency = competency.name.toLowerCase().replace(/\s+/g, '');
      
      for (const key of keys) {
        const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
        if (normalizedKey.includes(normalizedCompetency) || normalizedCompetency.includes(normalizedKey)) {
          return ratingsObj[key];
        }
      }
      
      return null;
    };
    
    const managerScore = getManagerScore();
    
    return (
      <td key={competency.id} className="px-4 py-4 border-r border-gray-200">
        <div className="space-y-2">
          {/* Employee Score */}
          <div className="bg-blue-50 rounded-lg p-2">
            <div className="text-xs font-medium text-blue-700 mb-1">Employee</div>
            {employeeScore ? renderStars(employeeScore) : <span className="text-gray-400 text-sm">Not rated</span>}
          </div>
          
          {/* Manager Score */}
          <div className="rounded-lg p-2" style={{backgroundColor: 'rgb(0 32 53 / 0.1)'}}>
            <div className="text-xs font-medium mb-1 flex items-center justify-between" style={{color: 'rgb(0 32 53)'}}>
              <span>Manager</span>
              {!isEditing && hasRole('MANAGER') && (
                <button
                  onClick={() => handleEditScore(evaluation.id, competency.name)}
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
                  onChange={(e) => handleScoreChange(evaluation.id, competency.name, e.target.value)}
                  className="text-xs border border-gray-300 rounded px-1 py-1 w-12"
                >
                  <option value={0}>-</option>
                  {[1, 2, 3, 4, 5].map(score => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleSaveScore(evaluation.id, competency.name)}
                  className="transition-colors"
                  style={{color: 'rgb(0 32 53)'}}
                  disabled={submitManagerScoreMutation.isLoading}
                >
                  <CheckIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleCancelEdit(evaluation.id, competency.name)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ) : (
              managerScore ? renderStars(managerScore) : <span className="text-gray-400 text-sm">Not rated</span>
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
              <label className="text-sm font-medium text-gray-700">Filter by Year:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Group by Quarter:</label>
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
          <table className="min-w-full table-fixed divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr className="divide-x divide-gray-300">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300 w-[12rem] min-w-[12rem]">
                  Overall Rating
                </th>
                {competencies.map((competency) => (
                  <th key={competency.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300 w-[12rem] min-w-[12rem]">
                    <div className="text-center">
                      {competency.name}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                  Submitted Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                {!isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              {Object.entries(groupedEvaluations).map(([monthName, monthEvaluations]) => (
                <React.Fragment key={monthName}>
                  {groupByMonth && (
                    <tr className="bg-gray-100">
                      <td colSpan={competencies.length + (isAdmin ? 5 : 6)} className="px-6 py-3 text-sm font-semibold text-gray-800 border-b border-gray-300">
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
                  <td className="px-6 py-4 border-r border-gray-200 w-[12rem] min-w-[12rem]">
                    <div className="space-y-2">
                      {/* Employee Overall Rating */}
                      <div className="bg-blue-50 rounded-lg p-2">
                        <div className="text-xs font-medium text-blue-700 mb-1">Employee</div>
                        {(() => {
                          // Only show computed average if there are actual ratings, not as fallback
                          const hasActualRatings = evaluation.competencyRatings && Object.keys(evaluation.competencyRatings).length > 0;
                          if (evaluation.overallRating) {
                            return renderStars(evaluation.overallRating);
                          } else if (hasActualRatings) {
                            const computed = computeEmployeeAverage(evaluation.competencyRatings);
                            return computed ? renderStars(computed) : <span className="text-gray-400 text-sm">Not rated</span>;
                          } else {
                            return <span className="text-gray-400 text-sm">Not rated</span>;
                          }
                        })()}
                      </div>
                      
                      {/* Manager Overall Rating (read-only, auto-computed) */}
                      <div className="rounded-lg p-2" style={{backgroundColor: 'rgb(0 32 53 / 0.1)'}}>
                        <div className="text-xs font-medium mb-1 flex items-center justify-between" style={{color: 'rgb(0 32 53)'}}>
                          <span>Manager</span>
                        </div>
                        {(() => {
                          // Always prioritize computed average over stored managerRating
                          const hasActualRatings = evaluation.managerCompetencyRatings && Object.keys(evaluation.managerCompetencyRatings).length > 0;
                          if (hasActualRatings) {
                            const computed = computeManagerAverage(evaluation.managerCompetencyRatings);
                            return computed ? renderStars(computed) : <span className="text-gray-400 text-sm">Not rated</span>;
                          } else if (evaluation.managerRating) {
                            return renderStars(evaluation.managerRating);
                          } else {
                            return <span className="text-gray-400 text-sm">Not rated</span>;
                          }
                        })()}
                      </div>
                    </div>
                  </td>
                  {competencies.map((competency) => renderScoreCell(evaluation, competency))}
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    {getStatusBadge(evaluation.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                    {evaluation.reviewerName || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                    <div className="leading-tight">
                      <div>{formatDate(evaluation.submittedAt)}</div>
                      <div className="text-xs text-gray-500">{formatTime(evaluation.submittedAt)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {getQuarterYearLabel(evaluation)}
                  </td>
                  {!isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleDeleteClick(evaluation)}
                        className="text-[#002035] hover:text-[#002035]/80 transition-colors flex items-center"
                        title="Delete evaluation"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  )}
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

