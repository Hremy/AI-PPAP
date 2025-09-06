import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { draftEvaluation as draftEval } from '../../services/aiService';
import { getMyProjects } from '../../lib/api';
import { 
  CheckCircleIcon,
  PaperAirplaneIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  StarIcon as StarIconSolid 
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const SimplifiedEvaluationForm = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Form state - only ratings
  const [formData, setFormData] = useState({
    overallRating: 0,
    competencies: {}
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDraft, setAiDraft] = useState('');
  // Project selection (required)
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const { data: myProjects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['my-projects', currentUser?.email || currentUser?.username],
    queryFn: async () => {
      if (!currentUser) return [];
      return await getMyProjects({ identifier: currentUser.email || currentUser.username });
    },
    enabled: !!currentUser,
  });
  // Timeline selections
  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultQuarter = Math.floor(now.getMonth() / 3) + 1; // 1..4
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedQuarter, setSelectedQuarter] = useState(defaultQuarter);

  // Competencies for rating
  const competencies = [
    {
      id: 'technical_skills',
      name: 'Technical Skills',
      description: 'Proficiency in job-related technical competencies'
    },
    {
      id: 'communication',
      name: 'Communication',
      description: 'Ability to communicate effectively with team and stakeholders'
    },
    {
      id: 'problem_solving',
      name: 'Problem Solving',
      description: 'Capability to analyze and solve complex problems'
    },
    {
      id: 'teamwork',
      name: 'Teamwork',
      description: 'Collaboration and working effectively with others'
    },
    {
      id: 'leadership',
      name: 'Leadership',
      description: 'Leading initiatives and guiding team members'
    },
    {
      id: 'adaptability',
      name: 'Adaptability',
      description: 'Flexibility and ability to adapt to changes'
    },
    {
      id: 'time_management',
      name: 'Time Management',
      description: 'Efficiently managing time and meeting deadlines'
    },
    {
      id: 'quality_focus',
      name: 'Quality Focus',
      description: 'Commitment to delivering high-quality work'
    }
  ];

  // Submit evaluation mutation
  const submitMutation = useMutation({
    mutationFn: async (evaluationData) => {
      const response = await fetch('http://localhost:8084/api/v1/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ai_ppap_auth_token')}`
        },
        body: JSON.stringify(evaluationData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit evaluation');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setSubmitted(true);
      queryClient.invalidateQueries(['evaluations']);
    },
    onError: async (error) => {
      const msg = (error?.message || '').toLowerCase();
      if (msg.includes('already submitted') || (msg.includes('already') && msg.includes('quarter'))) {
        toast((t) => (
          <span>
            You have already submitted for this Project and Quarter/Year.<br />
            We’ve kept your existing submission.
          </span>
        ));
        setSubmitted(true);
        queryClient.invalidateQueries(['evaluations']);
        return;
      }
      toast.error(error.message || 'Failed to submit evaluation');
    }
  });

  const handleRatingChange = (type, id, rating) => {
    if (type === 'overall') {
      setFormData(prev => ({ ...prev, overallRating: rating }));
    } else if (type === 'competency') {
      setFormData(prev => ({
        ...prev,
        competencies: { ...prev.competencies, [id]: rating }
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!selectedProjectId) {
      setAttemptedSubmit(true);
      return toast.error('Please select a project');
    }
    if (formData.overallRating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }
    
    if (Object.keys(formData.competencies).length === 0) {
      toast.error('Please rate at least one competency');
      return;
    }
    
    // Prepare submission data
    const submissionData = {
      employeeName: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Employee',
      employeeEmail: currentUser?.email || 'employee@company.com',
      overallRating: formData.overallRating,
      competencyRatings: formData.competencies,
      projectId: Number(selectedProjectId),
      evaluationYear: selectedYear,
      evaluationQuarter: selectedQuarter,
      // Remove all text fields - only ratings
      achievements: '',
      challenges: '',
      learnings: '',
      nextPeriodGoals: '',
      additionalFeedback: '',
      managerFeedbackRequest: ''
    };
    
    setIsSubmitting(true);
    submitMutation.mutate(submissionData);
  };

  const handleAiDraft = async () => {
    try {
      setAiLoading(true);
      setAiDraft('');
      const employeeName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Employee';
      const role = currentUser?.role || currentUser?.roles?.[0] || 'Employee';
      const res = await draftEval({
        employeeName,
        role,
        competencyRatings: formData.competencies,
        context: ''
      });
      setAiDraft(res?.summary || '');
      if (!res?.summary) toast('AI returned no summary', { icon: 'ℹ️' });
    } catch (err) {
      console.error('AI draft failed', err);
      toast.error(err?.response?.data?.message || 'Failed to get AI draft');
    } finally {
      setAiLoading(false);
    }
  };

  const renderStarRating = (currentRating, onChange, size = 'w-8 h-8') => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            {star <= currentRating ? (
              <StarIconSolid className={`${size} text-yellow-400`} />
            ) : (
              <StarIcon className={`${size} text-gray-300 hover:text-yellow-400 transition-colors`} />
            )}
          </button>
        ))}
        <span className="ml-3 text-sm font-medium text-gray-600">
          {currentRating > 0 ? `${currentRating}/5` : 'Not rated'}
        </span>
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircleIconSolid className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Evaluation Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for completing your performance evaluation. Your responses have been submitted successfully.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Evaluation</h1>
            <p className="text-gray-600">Rate your performance across different competencies</p>
          </div>
        </div>

        {/* Evaluation Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Timeline (Year & Quarter) */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Timeline</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Array.from({ length: 6 }).map((_, i) => {
                    const year = defaultYear - 2 + i; // two years back to three ahead
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(parseInt(e.target.value, 10))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={1}>Q1 (Jan - Mar)</option>
                  <option value={2}>Q2 (Apr - Jun)</option>
                  <option value={3}>Q3 (Jul - Sep)</option>
                  <option value={4}>Q4 (Oct - Dec)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Project & Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Project & Timeline</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Project */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  required
                  disabled={projectsLoading}
                >
                  <option value="">{projectsLoading ? 'Loading your projects...' : 'Select a project'}</option>
                  {Array.isArray(myProjects) && myProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {attemptedSubmit && !selectedProjectId && (
                  <p className="text-xs text-red-600 mt-1">Project is required</p>
                )}
              </div>
              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Array.from({ length: 6 }).map((_, i) => {
                    const year = defaultYear - 2 + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
              {/* Quarter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(parseInt(e.target.value, 10))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={1}>Q1 (Jan - Mar)</option>
                  <option value={2}>Q2 (Apr - Jun)</option>
                  <option value={3}>Q3 (Jul - Sep)</option>
                  <option value={4}>Q4 (Oct - Dec)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <StarIcon className="w-6 h-6 mr-2 text-primary" />
              Overall Performance Rating
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 mb-4">
                How would you rate your overall performance during this evaluation period?
              </p>
              {renderStarRating(
                formData.overallRating,
                (rating) => handleRatingChange('overall', null, rating),
                'w-10 h-10'
              )}
            </div>
          </div>

          {/* Competency Ratings */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CheckCircleIcon className="w-6 h-6 mr-2 text-primary" />
              Competency Ratings
            </h2>
            <div className="space-y-6">
              {competencies.map((competency) => (
                <div key={competency.id} className="bg-gray-50 rounded-xl p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {competency.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {competency.description}
                    </p>
                  </div>
                  {renderStarRating(
                    formData.competencies[competency.id] || 0,
                    (rating) => handleRatingChange('competency', competency.id, rating)
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Draft Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">AI Draft Summary</h2>
              <button
                type="button"
                onClick={handleAiDraft}
                disabled={aiLoading}
                className="bg-secondary text-white px-4 py-2 rounded-lg font-medium hover:bg-secondary/90 disabled:opacity-50"
              >
                {aiLoading ? 'Generating…' : 'Generate from Ratings'}
              </button>
            </div>
            {aiDraft ? (
              <div className="bg-gray-50 rounded-xl p-4 text-gray-800 whitespace-pre-wrap">
                {aiDraft}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Use your current ratings to generate a concise self-review draft.</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting || submitMutation.isLoading}
                className="bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all transform hover:scale-105"
              >
                {isSubmitting || submitMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5 mr-3" />
                    Submit Evaluation
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimplifiedEvaluationForm;

