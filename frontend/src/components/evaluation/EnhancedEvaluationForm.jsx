import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BookmarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ChartBarIcon,
  LightBulbIcon,
  HeartIcon,
  RocketLaunchIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  StarIcon as StarIconSolid 
} from '@heroicons/react/24/solid';
import { draftEvaluation as draftEvaluationApi } from '../../services/aiService';

const EnhancedEvaluationForm = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    overallRating: 0,
    competencies: {},
    goals: {
      achievements: '',
      challenges: '',
      learnings: '',
      nextPeriodGoals: ''
    },
    feedback: '',
    managerFeedback: ''
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [savedDraft, setSavedDraft] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiSummary, setAiSummary] = useState('');

  // Standardized competencies (submitted by employee)
  const competencies = [
    { id: 'technical_skills', name: 'Technical Skills', description: 'Demonstrates solid technical abilities and applies them effectively to tasks.', icon: <ChartBarIcon className="w-6 h-6" />, color: 'blue', category: 'Core' },
    { id: 'communication', name: 'Communication', description: 'Clearly conveys ideas and listens actively to others.', icon: <HeartIcon className="w-6 h-6" />, color: 'purple', category: 'Core' },
    { id: 'problem_solving', name: 'Problem Solving', description: 'Identifies issues and develops effective solutions.', icon: <LightBulbIcon className="w-6 h-6" />, color: 'yellow', category: 'Core' },
    { id: 'teamwork', name: 'Teamwork', description: 'Collaborates effectively and contributes to team objectives.', icon: <HeartIcon className="w-6 h-6" />, color: 'indigo', category: 'Core' },
    { id: 'leadership', name: 'Leadership', description: 'Takes initiative, guides others, and drives positive outcomes.', icon: <RocketLaunchIcon className="w-6 h-6" />, color: 'green', category: 'Core' },
    { id: 'adaptability', name: 'Adaptability', description: 'Adjusts to changing priorities and learns quickly.', icon: <SparklesIcon className="w-6 h-6" />, color: 'indigo', category: 'Core' },
    { id: 'time_management', name: 'Time Management', description: 'Prioritizes tasks and meets deadlines consistently.', icon: <ShieldCheckIcon className="w-6 h-6" />, color: 'emerald', category: 'Core' },
    { id: 'quality_focus', name: 'Quality Focus', description: 'Delivers high-quality work with attention to detail.', icon: <ShieldCheckIcon className="w-6 h-6" />, color: 'emerald', category: 'Core' }
  ];

  const steps = [
    { id: 'overview', title: 'Overview', description: 'Overall performance rating' },
    { id: 'competencies', title: 'Competencies', description: 'Rate specific skills' },
    { id: 'goals', title: 'Goals & Growth', description: 'Achievements and future goals' },
    { id: 'feedback', title: 'Feedback', description: 'Additional insights' },
    { id: 'review', title: 'Review', description: 'Final review and submit' }
  ];

  const ratingLabels = {
    1: { label: 'Needs Improvement', description: 'Below expectations, requires significant development', color: 'red' },
    2: { label: 'Developing', description: 'Approaching expectations, showing progress', color: 'orange' },
    3: { label: 'Proficient', description: 'Meets expectations consistently', color: 'yellow' },
    4: { label: 'Advanced', description: 'Exceeds expectations regularly', color: 'blue' },
    5: { label: 'Expert', description: 'Outstanding performance, role model for others', color: 'green' }
  };

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(formData.competencies).length > 0 || formData.feedback) {
        localStorage.setItem('evaluation_draft', JSON.stringify(formData));
        setSavedDraft(true);
        setTimeout(() => setSavedDraft(false), 2000);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('evaluation_draft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setFormData(parsedDraft);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit evaluation');
      }

      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      localStorage.removeItem('evaluation_draft');
      queryClient.invalidateQueries(['evaluations']);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    }
  });

  const computeOverallFromCompetencies = (compMap) => {
    const values = Object.values(compMap || {}).filter(v => typeof v === 'number');
    if (!values.length) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(avg);
  };

  const handleCompetencyRating = (competencyId, rating) => {
    setFormData(prev => {
      const updatedCompetencies = { ...prev.competencies, [competencyId]: rating };
      return {
        ...prev,
        competencies: updatedCompetencies,
        // Overall is auto-generated (read-only for employee)
        overallRating: computeOverallFromCompetencies(updatedCompetencies)
      };
    });
    setErrors(prev => ({ ...prev, [competencyId]: null }));
  };

  const handleGoalChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        [field]: value
      }
    }));
  };

  // AI: Generate draft summary from current ratings
  const handleGenerateAIDraft = async () => {
    try {
      setAiError(null);
      setAiLoading(true);

      // Map internal IDs to standardized display names
      const competencyRatings = Object.entries(formData.competencies).reduce((acc, [id, rating]) => {
        const comp = competencies.find(c => c.id === id);
        if (comp) acc[comp.name] = rating;
        return acc;
      }, {});

      const context = [
        formData.goals.achievements && `Achievements: ${formData.goals.achievements}`,
        formData.goals.challenges && `Challenges: ${formData.goals.challenges}`,
        formData.goals.learnings && `Learnings: ${formData.goals.learnings}`,
        formData.goals.nextPeriodGoals && `Next Goals: ${formData.goals.nextPeriodGoals}`
      ].filter(Boolean).join('\n');

      const data = await draftEvaluationApi({
        employeeName: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Employee',
        role: currentUser?.role || currentUser?.title || 'Employee',
        competencyRatings,
        context
      });

      const summary = data?.summary || 'AI generated a draft summary, but no content was returned.';
      setAiSummary(summary);
      // Insert into feedback if empty; otherwise keep separate for user to insert manually
      setFormData(prev => ({
        ...prev,
        feedback: prev.feedback?.trim() ? prev.feedback : summary
      }));
    } catch (e) {
      setAiError(e?.message || 'Failed to generate AI draft');
    } finally {
      setAiLoading(false);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Overview (read-only, no validation)
        break;
      case 1: // Competencies
        competencies.forEach(comp => {
          if (!formData.competencies[comp.id]) {
            newErrors[comp.id] = 'Rating required';
          }
        });
        break;
      case 2: // Goals
        if (!formData.goals.achievements.trim()) {
          newErrors.achievements = 'Please describe your key achievements';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Transform competencies to be keyed by the display names
      const competencyRatings = Object.entries(formData.competencies).reduce((acc, [id, rating]) => {
        const comp = competencies.find(c => c.id === id);
        if (comp) acc[comp.name] = rating;
        return acc;
      }, {});

      const evaluationData = {
        employeeId: currentUser?.id,
        employeeName: `${currentUser?.firstName} ${currentUser?.lastName}`,
        employeeEmail: currentUser?.email,
        overallRating: formData.overallRating,
        competencyRatings,
        achievements: formData.goals.achievements,
        challenges: formData.goals.challenges,
        learnings: formData.goals.learnings,
        nextPeriodGoals: formData.goals.nextPeriodGoals,
        additionalFeedback: formData.feedback,
        managerFeedbackRequest: formData.managerFeedback,
        submittedAt: new Date().toISOString(),
        status: 'SUBMITTED'
      };

      submitMutation.mutate(evaluationData);
    }
  };

  const getColorClasses = (color, variant = 'default') => {
    const colorMap = {
      blue: {
        default: 'text-blue-600 bg-blue-50 border-blue-200',
        selected: 'text-blue-700 bg-blue-100 border-blue-300',
        button: 'bg-blue-600 hover:bg-blue-700 text-white'
      },
      purple: {
        default: 'text-purple-600 bg-purple-50 border-purple-200',
        selected: 'text-purple-700 bg-purple-100 border-purple-300',
        button: 'bg-purple-600 hover:bg-purple-700 text-white'
      },
      yellow: {
        default: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        selected: 'text-yellow-700 bg-yellow-100 border-yellow-300',
        button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
      },
      green: {
        default: 'text-green-600 bg-green-50 border-green-200',
        selected: 'text-green-700 bg-green-100 border-green-300',
        button: 'bg-green-600 hover:bg-green-700 text-white'
      },
      indigo: {
        default: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        selected: 'text-indigo-700 bg-indigo-100 border-indigo-300',
        button: 'bg-indigo-600 hover:bg-indigo-700 text-white'
      },
      emerald: {
        default: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        selected: 'text-emerald-700 bg-emerald-100 border-emerald-300',
        button: 'bg-emerald-600 hover:bg-emerald-700 text-white'
      },
      red: {
        default: 'text-red-600 bg-red-50 border-red-200',
        selected: 'text-red-700 bg-red-100 border-red-300'
      },
      orange: {
        default: 'text-orange-600 bg-orange-50 border-orange-200',
        selected: 'text-orange-700 bg-orange-100 border-orange-300'
      }
    };
    
    return colorMap[color]?.[variant] || colorMap.blue[variant];
  };

  const getProgressPercentage = () => {
    let completed = 0;
    let total = 4; // 4 main sections
    
    // Overall is computed; consider completed when all competencies rated
    if (Object.keys(formData.competencies).length === competencies.length) {
      completed += 2; // counts for both overall and competencies
    }
    if (formData.goals.achievements.trim()) completed++;
    if (formData.feedback.trim()) completed++;
    
    return Math.round((completed / total) * 100);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircleIconSolid className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Evaluation Submitted Successfully!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for completing your self-evaluation. Your responses have been submitted for review by your manager.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-primary text-secondary px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setCurrentStep(0);
                setFormData({
                  overallRating: 0,
                  competencies: {},
                  goals: { achievements: '', challenges: '', learnings: '', nextPeriodGoals: '' },
                  feedback: '',
                  managerFeedback: ''
                });
              }}
              className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Submit Another Evaluation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-secondary font-bold text-sm">AI</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Performance Evaluation</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {savedDraft && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <BookmarkIcon className="w-4 h-4" />
                  <span>Draft saved</span>
                </div>
              )}
              <div className="text-sm text-gray-500">
                {getProgressPercentage()}% Complete
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="pb-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-secondary rounded-full h-2 transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4" aria-label="Tabs">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                  currentStep === index
                    ? 'bg-primary/10 text-primary'
                    : currentStep > index
                    ? 'text-green-600 hover:text-green-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {currentStep > index ? (
                    <CheckCircleIconSolid className="w-5 h-5" />
                  ) : (
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                      currentStep === index ? 'border-primary bg-primary text-white' : 'border-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                  )}
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
                <span className="text-xs text-gray-500">{step.description}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          
          {/* Step 0: Overview */}
          {currentStep === 0 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Overall Rating</h2>
                <p className="text-gray-600">Auto-generated as the average of all competency ratings.</p>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className={`p-6 rounded-2xl border-2 ${getColorClasses(ratingLabels[formData.overallRating || 0]?.color || 'blue', 'selected')}`}>
                  <div className="flex items-center justify-center space-x-3">
                    <StarIconSolid className="w-8 h-8" />
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">{formData.overallRating || 0}</div>
                      <div className="text-sm font-semibold mb-1">{ratingLabels[formData.overallRating || 1]?.label || 'N/A'}</div>
                      <div className="text-xs text-gray-600">This value updates automatically as you rate each competency.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Competencies */}
          {currentStep === 1 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Competency Assessment</h2>
                <p className="text-gray-600">Rate yourself on each competency area</p>
              </div>

              <div className="space-y-8">
                {competencies.map((competency) => (
                  <div key={competency.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className={`p-3 rounded-xl ${getColorClasses(competency.color)}`}>
                        {competency.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{competency.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{competency.description}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getColorClasses(competency.color)}`}>
                          {competency.category}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleCompetencyRating(competency.id, rating)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                            formData.competencies[competency.id] === rating
                              ? getColorClasses(ratingLabels[rating].color, 'selected') + ' shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl font-bold mb-1">{rating}</div>
                            <div className="text-xs font-medium">{ratingLabels[rating].label}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {errors[competency.id] && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                        <span className="text-red-700 text-sm">{errors[competency.id]}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Goals & Growth */}
          {currentStep === 2 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Goals & Growth</h2>
                <p className="text-gray-600">Reflect on your achievements and set goals for the future</p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    🏆 Key Achievements
                  </label>
                  <p className="text-gray-600 text-sm mb-4">
                    What are your most significant accomplishments during this evaluation period?
                  </p>
                  <textarea
                    value={formData.goals.achievements}
                    onChange={(e) => handleGoalChange('achievements', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                    placeholder="• Successfully led the project that increased efficiency by 25%&#10;• Mentored 3 junior developers and helped them grow their skills&#10;• Implemented new processes that reduced bugs by 40%"
                  />
                  {errors.achievements && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                      <span className="text-red-700 text-sm">{errors.achievements}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    🎯 Challenges Overcome
                  </label>
                  <p className="text-gray-600 text-sm mb-4">
                    What challenges did you face and how did you overcome them?
                  </p>
                  <textarea
                    value={formData.goals.challenges}
                    onChange={(e) => handleGoalChange('challenges', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                    placeholder="• Overcame technical debt in legacy system by refactoring core modules&#10;• Managed competing priorities by improving time management skills&#10;• Resolved team conflicts through better communication"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    📚 Key Learnings
                  </label>
                  <p className="text-gray-600 text-sm mb-4">
                    What new skills or knowledge did you acquire?
                  </p>
                  <textarea
                    value={formData.goals.learnings}
                    onChange={(e) => handleGoalChange('learnings', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                    placeholder="• Learned React and modern frontend development practices&#10;• Improved leadership skills through management training&#10;• Gained expertise in cloud architecture and DevOps"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    🚀 Goals for Next Period
                  </label>
                  <p className="text-gray-600 text-sm mb-4">
                    What do you want to achieve in the next evaluation period?
                  </p>
                  <textarea
                    value={formData.goals.nextPeriodGoals}
                    onChange={(e) => handleGoalChange('nextPeriodGoals', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                    placeholder="• Lead a major project from conception to delivery&#10;• Mentor more team members and contribute to their growth&#10;• Obtain certification in cloud technologies"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Feedback */}
          {currentStep === 3 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Additional Feedback</h2>
                <p className="text-gray-600">Share any additional thoughts or feedback</p>
              </div>

              <div className="space-y-8">
                {/* AI Draft Summary */}
                <div className="rounded-2xl border border-gray-200 p-6 bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">AI Draft Summary</h3>
                      <p className="text-sm text-gray-600">Use your current ratings to generate a concise self-review draft.</p>
                    </div>
                    <button
                      onClick={handleGenerateAIDraft}
                      disabled={aiLoading}
                      className="px-4 py-2 rounded-lg bg-[#0c2a40] text-white hover:bg-[#0a2234] disabled:opacity-50"
                    >
                      {aiLoading ? 'Generating…' : 'Generate from Ratings'}
                    </button>
                  </div>
                  {aiError && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{aiError}</div>
                  )}
                  {aiSummary && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
                      <textarea
                        readOnly
                        value={aiSummary}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, feedback: aiSummary }))}
                          className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          Insert into comments
                        </button>
                        <button
                          onClick={() => setAiSummary('')}
                          className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          Clear preview
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    💭 Additional Comments
                  </label>
                  <p className="text-gray-600 text-sm mb-4">
                    Is there anything else you'd like to share about your performance or experience?
                  </p>
                  <textarea
                    value={formData.feedback}
                    onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                    placeholder="Share any additional insights, suggestions for improvement, or feedback about your role, team, or the organization..."
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    🤝 Manager Feedback Request
                  </label>
                  <p className="text-gray-600 text-sm mb-4">
                    What specific feedback would you like from your manager?
                  </p>
                  <textarea
                    value={formData.managerFeedback}
                    onChange={(e) => setFormData(prev => ({ ...prev, managerFeedback: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                    placeholder="• How can I improve my leadership skills?&#10;• What opportunities do you see for my career growth?&#10;• How can I better contribute to team goals?"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Review & Submit</h2>
                <p className="text-gray-600">Please review your evaluation before submitting</p>
              </div>

              <div className="space-y-6">
                {/* Overall Rating Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Rating</h3>
                  <div className={`inline-flex items-center space-x-3 px-4 py-2 rounded-xl ${getColorClasses(ratingLabels[formData.overallRating]?.color || 'blue')}`}>
                    <StarIconSolid className="w-6 h-6" />
                    <span className="font-semibold">{formData.overallRating}/5 - {ratingLabels[formData.overallRating]?.label}</span>
                  </div>
                </div>

                {/* Competencies Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Competency Ratings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {competencies.map((comp) => (
                      <div key={comp.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm font-medium">{comp.name}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getColorClasses(ratingLabels[formData.competencies[comp.id]]?.color || 'gray')}`}>
                          {formData.competencies[comp.id]}/5
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goals Summary */}
                {formData.goals.achievements && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Achievements</h3>
                    <p className="text-gray-700 text-sm">{formData.goals.achievements.substring(0, 200)}...</p>
                  </div>
                )}

                {errors.submit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    <span className="text-red-700">{errors.submit}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="border-t border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-4">
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center space-x-2 px-8 py-3 bg-primary text-secondary rounded-xl font-medium hover:bg-primary/90 transition-colors"
                  >
                    <span>Next</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                    <span>{submitMutation.isPending ? 'Submitting...' : 'Submit Evaluation'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEvaluationForm;
