import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submitEvaluation, getMyProjects, getKEQs, checkSelfEvaluationExists } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  ChatBubbleLeftRightIcon,
  UsersIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  SparklesIcon,
  ArrowsRightLeftIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

const SelfEvaluationForm = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  // Projects state
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  // Timeline state (Year/Quarter)
  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultQuarter = Math.floor(now.getMonth() / 3) + 1; // 1..4
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedQuarter, setSelectedQuarter] = useState(defaultQuarter);
  const [dupCheck, setDupCheck] = useState({ loading: false, exists: false, info: null });
  const { data: myProjects = [], isLoading: myProjectsLoading } = useQuery({
    queryKey: ['my-projects', currentUser?.email || currentUser?.username],
    queryFn: async () => {
      if (!currentUser) return [];
      return await getMyProjects({ identifier: currentUser.email || currentUser.username });
    },
    enabled: !!currentUser,
  });

  // Fetch KEQs for dynamic competencies
  const { data: keqs = [] } = useQuery({
    queryKey: ['keqs'],
    queryFn: async () => {
      try { return await getKEQs(); } catch { return []; }
    }
  });
  useEffect(() => {
    if (Array.isArray(myProjects) && myProjects.length === 1) {
      setSelectedProjectId(String(myProjects[0].id));
    }
  }, [myProjects]);

  // Duplicate pre-check whenever project/year/quarter changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setDupCheck(prev => ({ ...prev, loading: true }));
        if (!selectedProjectId || !selectedYear || !selectedQuarter) {
          if (!cancelled) setDupCheck({ loading: false, exists: false, info: null });
          return;
        }
        const data = await checkSelfEvaluationExists({
          projectId: Number(selectedProjectId),
          evaluationYear: selectedYear,
          evaluationQuarter: selectedQuarter,
        });
        if (!cancelled) setDupCheck({ loading: false, exists: !!data?.exists, info: data || null });
      } catch (e) {
        if (!cancelled) setDupCheck({ loading: false, exists: false, info: null });
      }
    })();
    return () => { cancelled = true; };
  }, [selectedProjectId, selectedYear, selectedQuarter]);

  // Helper functions for KEQ processing
  const isEffective = (k, year, quarter) => {
    if (!k.effectiveFromYear || !k.effectiveFromQuarter) return true;
    if (k.effectiveFromYear < year) return true;
    if (k.effectiveFromYear === year && k.effectiveFromQuarter <= quarter) return true;
    return false;
  };

  const snake = (s) => s?.toString()?.trim()?.toLowerCase()?.replace(/[^a-z0-9]+/g, '_')?.replace(/^_+|_+$/g, '') || '';

  // Dynamic competencies from KEQs
  const competencies = useMemo(() => {
    console.log('KEQs data:', keqs);
    console.log('Selected year/quarter:', selectedYear, selectedQuarter);
    
    if (!Array.isArray(keqs) || keqs.length === 0) {
      console.log('No KEQs available - returning empty array');
      return [];
    }

    const filteredKeqs = keqs.filter(k => {
      const effective = k && k.category && isEffective(k, selectedYear, selectedQuarter);
      console.log(`KEQ "${k?.category}" effective:`, effective, 'effectiveFrom:', k?.effectiveFromYear, 'Q' + k?.effectiveFromQuarter);
      return effective;
    });
    console.log('Filtered KEQs:', filteredKeqs);
    
    const mapped = filteredKeqs
      .sort((a,b)=> (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
      .map(k => ({
        id: snake(k.category),
        name: k.category,
        description: k.description || 'Rate your performance in this area',
        icon: PencilSquareIcon,
        category: 'KEQ'
      }));
    
    console.log('Final competencies:', mapped);
    return mapped;
  }, [keqs, selectedYear, selectedQuarter]);

  const handleRatingChange = (competencyId, value) => {
    // Find the competency to get its name (original KEQ category)
    const competency = competencies.find(c => c.id === competencyId);
    const ratingKey = competency ? competency.name : competencyId;
    
    setRatings(prev => ({
      ...prev,
      [ratingKey]: parseInt(value, 10)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Require project selection
      if (!selectedProjectId) {
        setAttemptedSubmit(true);
        alert('Please select a project before submitting your evaluation.');
        return;
      }
      if (dupCheck.exists) {
        toast((t) => (
          <span>
            Self-evaluation already submitted for this Project and Quarter/Year.
          </span>
        ));
        return;
      }
      const evaluationData = {
        ratings,
        feedback,
        submittedAt: new Date().toISOString(),
        projectId: Number(selectedProjectId),
        evaluationYear: selectedYear,
        evaluationQuarter: selectedQuarter,
      };
      
      console.log('Submitting evaluation:', evaluationData);
      
      // Submit to backend API via axios instance (adds dev headers)
      const result = await submitEvaluation(evaluationData);
      console.log('Evaluation submitted successfully:', result);
      setSubmitted(true);
      queryClient.invalidateQueries(['evaluations']);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      if (error?.response?.status === 409) {
        toast('Self-evaluation already submitted for this Project and Quarter/Year.');
        setSubmitted(true);
        return;
      }
      const msg = (error?.response?.data?.message || error?.message || 'Failed to submit evaluation');
      toast.error(msg);
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
        {/* Project & Timeline Selection */}
        <div className="bg-white border-2 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-secondary mb-3">Project</h3>
          <p className="text-secondary/70 text-sm mb-4">Select the project this self-evaluation is for. This is required.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Project</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                disabled={myProjectsLoading}
                required
              >
                <option value="">{myProjectsLoading ? 'Loading your projects...' : 'Select a project'}</option>
                {Array.isArray(myProjects) && myProjects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {attemptedSubmit && !selectedProjectId && (
                <p className="text-xs text-red-600 mt-2">Project is required.</p>
              )}
            </div>
            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Year</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              >
                {Array.from({ length: 6 }).map((_, i) => {
                  const year = defaultYear - 2 + i; // two years back to three ahead
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
            {/* Quarter */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Quarter</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white"
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(parseInt(e.target.value, 10))}
              >
                <option value={1}>Q1 (Jan - Mar)</option>
                <option value={2}>Q2 (Apr - Jun)</option>
                <option value={3}>Q3 (Jul - Sep)</option>
                <option value={4}>Q4 (Oct - Dec)</option>
              </select>
            </div>
          </div>
          {dupCheck.exists && (
            <div className="mt-4 p-3 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-800 text-sm">
              Self-evaluation already submitted for the selected Project and Quarter/Year.
            </div>
          )}
        </div>
        {/* Competencies Grid */}
        <div className="grid gap-8 mb-12">
          {competencies.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <div className="text-yellow-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">No Evaluation Questions Available</h3>
              <p className="text-yellow-700 text-sm">
                No Key Evaluation Questions (KEQs) are configured for the selected time period. 
                Please contact your administrator to set up evaluation questions.
              </p>
            </div>
          ) : (
            competencies.map((competency) => (
              <div key={competency.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center">
                      <competency.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-secondary">{competency.name}</h4>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                        {competency.category}
                      </span>
                    </div>
                    <p className="text-secondary/70 text-sm mb-4">
                      {competency.description}
                    </p>

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
                              checked={ratings[competency.name] === ratingValue}
                              onChange={() => handleRatingChange(competency.id, ratingValue)}
                              className="sr-only"
                              required
                            />
                            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all duration-200 ${
                              ratings[competency.name] === ratingValue
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
                </div>
              </div>
            ))
          )}
        </div>

        {/* Additional Feedback Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-secondary mb-3 flex items-center gap-2">
            <PencilSquareIcon className="w-5 h-5" />
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
            disabled={competencies.some(c => !ratings[c.name]) || dupCheck.exists}
            className="px-8 py-3 bg-secondary text-white rounded-xl font-medium hover:bg-secondary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Submit Evaluation
            {competencies.some(c => !ratings[c.name]) && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded">
                {competencies.filter(c => !ratings[c.name]).length} remaining
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