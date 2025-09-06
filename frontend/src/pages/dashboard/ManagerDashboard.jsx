import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EvaluationsTable from '../../components/evaluation/EvaluationsTable';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  TrophyIcon,
  ClockIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  PlusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { evaluate as evalApi, analyzeText as analyzeApi, summarize as summarizeApi, recommendations as recsApi } from '../../services/aiService';

const ManagerDashboard = () => {
  const { currentUser } = useAuth();
  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  const roles = (currentUser?.roles || (currentUser?.role ? [currentUser.role] : []) || []).map(r => String(r).toUpperCase());
  const isAdmin = roles.includes('ADMIN');

  // Mock data - will be replaced with real API calls
  const managerData = {
    name: 'Sarah Johnson',
    role: 'Engineering Manager',
    team: 'Development Team',
    teamSize: 8,
    pendingReviews: 3,
    teamPerformance: 87,
    goalsOnTrack: 12
  };

  const teamMembers = [
    { id: 1, name: 'John Doe', role: 'Senior Developer', performance: 92, status: 'excellent' },
    { id: 2, name: 'Jane Smith', role: 'Frontend Developer', performance: 88, status: 'good' },
    { id: 3, name: 'Mike Wilson', role: 'Backend Developer', performance: 85, status: 'good' },
    { id: 4, name: 'Lisa Chen', role: 'Full Stack Developer', performance: 78, status: 'needs-improvement' }
  ];

  const pendingActions = [
    { id: 1, type: 'review', title: 'Complete John Doe\'s quarterly review', priority: 'high', dueDate: '2 days' },
    { id: 2, type: 'goal', title: 'Set Q2 team objectives', priority: 'medium', dueDate: '1 week' },
    { id: 3, type: 'feedback', title: 'Review peer feedback submissions', priority: 'low', dueDate: '3 days' }
  ];

  const quickStats = [
    {
      title: 'Team Performance',
      value: managerData.teamPerformance,
      suffix: '%',
      icon: ChartBarIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Team Size',
      value: managerData.teamSize,
      icon: UserGroupIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Goals On Track',
      value: managerData.goalsOnTrack,
      icon: TrophyIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Pending Reviews',
      value: managerData.pendingReviews,
      icon: ClockIcon,
      color: 'text-white',
      bgColor: 'bg-[#002035]'
    }
  ];

  const getPerformanceColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-white bg-[#002035]';
      case 'good': return 'text-primary bg-primary/10';
      case 'needs-improvement': return 'text-orange-600 bg-orange-50';
      default: return 'text-secondary/70 bg-secondary/10';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-white bg-[#002035]';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-primary bg-primary/10';
      default: return 'text-secondary/70 bg-secondary/10';
    }
  };

  // Handlers to trigger AI
  const handleEvaluateAi = async (member) => {
    try {
      setAiError(null);
      setAiLoading(true);
      setAiResult(null);
      const payload = {
        employeeName: member?.name || 'Employee',
        role: member?.role || 'Employee',
        competencyRatings: { 'Technical Skills': 4, Communication: 3, Leadership: 4 },
        selfText: 'I delivered features and collaborated effectively.',
        managerText: 'Consistent delivery and good communication with the team.',
        peerTexts: ['Supportive teammate', 'Addresses issues promptly']
      };
      const res = await evalApi(payload);
      setAiResult(res);
    } catch (e) {
      setAiError(e?.response?.data?.message || e?.message || 'AI evaluation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAnalyzeText = async () => {
    try {
      setAiError(null);
      setAiLoading(true);
      setAiResult(null);
      const res = await analyzeApi([
        'Great collaboration and timely delivery',
        'Some delays and quality issues in Q2'
      ]);
      setAiResult(res);
    } catch (e) {
      setAiError(e?.response?.data?.message || e?.message || 'AI analyze failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSummarize = async () => {
    try {
      setAiError(null);
      setAiLoading(true);
      setAiResult(null);
      const res = await summarizeApi('Delivered features on time. Collaboration improved. Some delays occurred due to external dependencies.', 120);
      setAiResult(res);
    } catch (e) {
      setAiError(e?.response?.data?.message || e?.message || 'AI summarize failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleRecommendations = async () => {
    try {
      setAiError(null);
      setAiLoading(true);
      setAiResult(null);
      const res = await recsApi({
        role: 'Engineer',
        competencyRatings: { Communication: 2, 'Technical Skills': 3, Leadership: 4 },
        feedbackText: 'Wants to improve communication.'
      });
      setAiResult(res);
    } catch (e) {
      setAiError(e?.response?.data?.message || e?.message || 'AI recommendations failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-secondary/70 hover:text-secondary transition-colors bg-white/50 px-3 py-2 rounded-lg hover:bg-white/80"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Return</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-secondary">Manager Dashboard</h1>
                <p className="text-secondary/70">{managerData.name} • {managerData.role} • {managerData.team}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/manager/team" 
                className="flex items-center space-x-2 text-secondary/70 hover:text-secondary transition-colors"
              >
                <UserGroupIcon className="w-5 h-5" />
                <span>Team Management</span>
              </Link>
            </div>
          </div>
        </div>
        )}

        {/* AI Insights (Beta) - hidden for Admins (view-only) */}
        {!isAdmin && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-secondary mb-6 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-primary" /> AI Insights (Beta)
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-primary/10 p-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleEvaluateAi(teamMembers[0])}
                disabled={aiLoading}
                className="px-4 py-2 rounded-lg bg-[#002035] text-white hover:bg-[#001a29] disabled:opacity-50"
              >
                Run Composite Evaluate
              </button>
              <button
                onClick={handleAnalyzeText}
                disabled={aiLoading}
                className="px-4 py-2 rounded-lg border border-primary/20 text-secondary hover:bg-primary/5 disabled:opacity-50"
              >
                Analyze Recent Feedback
              </button>
              <button
                onClick={handleSummarize}
                disabled={aiLoading}
                className="px-4 py-2 rounded-lg border border-primary/20 text-secondary hover:bg-primary/5 disabled:opacity-50"
              >
                Summarize Highlights
              </button>
              <button
                onClick={handleRecommendations}
                disabled={aiLoading}
                className="px-4 py-2 rounded-lg border border-primary/20 text-secondary hover:bg-primary/5 disabled:opacity-50"
              >
                Get Recommendations
              </button>
            </div>

            {aiLoading && (
              <div className="mt-4 text-sm text-secondary/70 flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                Generating AI insights…
              </div>
            )}
            {aiError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{aiError}</div>
            )}
            {aiResult && (
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                {/* Performance Score */}
                {typeof aiResult.performanceScore !== 'undefined' && (
                  <div className="p-4 bg-background rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <StarIcon className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-secondary">Performance Score</span>
                    </div>
                    <div className="text-2xl font-bold text-secondary">{aiResult.performanceScore}</div>
                  </div>
                )}

                {/* Summary */}
                {aiResult.summary && (
                  <div className="p-4 bg-background rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <LightBulbIcon className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-secondary">Summary</span>
                    </div>
                    <p className="text-sm text-secondary/80 whitespace-pre-wrap">{aiResult.summary}</p>
                  </div>
                )}

                {/* Strengths / Weaknesses */}
                {(aiResult.strengths || aiResult.weaknesses) && (
                  <div className="p-4 bg-background rounded-lg">
                    <div className="font-semibold text-secondary mb-2">Strengths</div>
                    <ul className="list-disc list-inside text-sm text-secondary/80">
                      {(aiResult.strengths || []).map((s, i) => (<li key={`s-${i}`}>{s}</li>))}
                    </ul>
                    <div className="font-semibold text-secondary mt-4 mb-2">Weaknesses</div>
                    <ul className="list-disc list-inside text-sm text-secondary/80">
                      {(aiResult.weaknesses || []).map((w, i) => (<li key={`w-${i}`}>{w}</li>))}
                    </ul>
                  </div>
                )}

                {/* Growth Areas / Actions */}
                {(aiResult.growthAreas || aiResult.suggestedActions) && (
                  <div className="p-4 bg-background rounded-lg md:col-span-2">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-semibold text-secondary mb-2">Growth Areas</div>
                        <ul className="list-disc list-inside text-sm text-secondary/80">
                          {(aiResult.growthAreas || []).map((g, i) => (<li key={`g-${i}`}>{g}</li>))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-semibold text-secondary mb-2">Suggested Actions</div>
                        <ul className="list-disc list-inside text-sm text-secondary/80">
                          {(aiResult.suggestedActions || []).map((a, i) => (<li key={`a-${i}`}>{a}</li>))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sentiments */}
                {aiResult.sentiments && (
                  <div className="p-4 bg-background rounded-lg md:col-span-2">
                    <div className="font-semibold text-secondary mb-2">Sentiments</div>
                    <div className="grid md:grid-cols-2 gap-2">
                      {aiResult.sentiments.map((s, i) => (
                        <div key={`sen-${i}`} className="flex items-center justify-between p-2 bg-white rounded border border-primary/10">
                          <span className="text-sm text-secondary/80 capitalize">{s.label}</span>
                          <span className="text-sm font-medium text-secondary">{Math.round((s.score || 0) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-primary/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary/70">{stat.title}</p>
                  <p className="text-2xl font-bold text-secondary">
                    {stat.value}{stat.suffix || ''}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Team Overview */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-secondary">Team Overview</h2>
              <Link 
                to="/manager/team" 
                className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
              >
                View All →
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-primary/10 overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-background rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-secondary">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-secondary">{member.name}</h3>
                          <p className="text-sm text-secondary/70">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-secondary">{member.performance}%</p>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(member.status)}`}>
                            {member.status.replace('-', ' ')}
                          </span>
                        </div>
                        <Link 
                          to={`/manager/team/${member.id}`}
                          className="p-2 text-secondary/70 hover:text-secondary transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div>
            <h2 className="text-xl font-semibold text-secondary mb-6">Pending Actions</h2>
            <div className="bg-white rounded-xl shadow-sm border border-primary/10 p-6">
              <div className="space-y-4">
                {pendingActions.map((action) => (
                  <div key={action.id} className="border-l-4 border-primary/20 pl-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-secondary">{action.title}</p>
                        <p className="text-xs text-secondary/70 mt-1">Due in {action.dueDate}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(action.priority)}`}>
                        {action.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-primary/10">
                <Link 
                  to="/manager/tasks" 
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  View all tasks →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-secondary mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link 
              to="/manager/reviews/new"
              className="bg-white rounded-xl shadow-sm border border-primary/10 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-primary group-hover:scale-110 transition-transform">
                  <DocumentTextIcon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary">Conduct Review</h3>
                  <p className="text-sm text-secondary/70">Evaluate team member</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/manager/goals/set"
              className="bg-white rounded-xl shadow-sm border border-primary/10 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-primary group-hover:scale-110 transition-transform">
                  <TrophyIcon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary">Set Goals</h3>
                  <p className="text-sm text-secondary/70">Define team objectives</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/manager/analytics"
              className="bg-white rounded-xl shadow-sm border border-primary/10 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-primary group-hover:scale-110 transition-transform">
                  <ChartBarIcon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary">Team Analytics</h3>
                  <p className="text-sm text-secondary/70">View performance data</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/manager/team/add"
              className="bg-white rounded-xl shadow-sm border border-primary/10 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-primary group-hover:scale-110 transition-transform">
                  <PlusIcon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary">Add Member</h3>
                  <p className="text-sm text-secondary/70">Invite team member</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Submitted Evaluations Table */}
        <div className="mt-8">
          <EvaluationsTable />
        </div>

        {/* Team Performance Summary */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-primary/10 p-6">
            <h2 className="text-xl font-semibold text-secondary mb-6">Team Performance Summary</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <StarIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">Average Rating</h3>
                <p className="text-2xl font-bold text-primary">{managerData.teamPerformance}%</p>
                <p className="text-sm text-secondary/70">Team Performance</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <ArrowTrendingUpIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">Growth Trend</h3>
                <p className="text-2xl font-bold text-primary">+8%</p>
                <p className="text-sm text-secondary/70">vs Last Quarter</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <TrophyIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">Goals Achieved</h3>
                <p className="text-2xl font-bold text-primary">{managerData.goalsOnTrack}/15</p>
                <p className="text-sm text-secondary/70">This Quarter</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;


