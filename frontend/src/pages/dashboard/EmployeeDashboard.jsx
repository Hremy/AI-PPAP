import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProjects, assignMyProjects, getMyProjects } from '../../lib/api';
import { getEmployeeEvaluations, getEmployeeAverageRatings } from '../../services/evaluationService';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  TrophyIcon, 
  UserIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  StarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const EmployeeDashboard = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [evaluations, setEvaluations] = useState([]);
  const [avgRatings, setAvgRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Project selection widget state
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [projError, setProjError] = useState('');
  const [projSuccess, setProjSuccess] = useState('');

  // Load all projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  // Save selected projects for current user
  const saveProjectsMutation = useMutation({
    mutationFn: (projectIds) => assignMyProjects({
      identifier: currentUser?.email || currentUser?.username,
      projectIds
    }),
    onSuccess: () => {
      setProjSuccess('Projects updated successfully');
      setProjError('');
      setTimeout(() => setProjSuccess(''), 2500);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (e) => {
      setProjSuccess('');
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message;
      setProjError(msg || 'Failed to update projects');
    }
  });

  const toggleProject = (projectId) => {
    setSelectedProjects(prev => prev.includes(projectId)
      ? prev.filter(id => id !== projectId)
      : [...prev, projectId]
    );
  };
  const saveSelectedProjects = () => {
    setProjError('');
    saveProjectsMutation.mutate(selectedProjects);
  };
  const clearSelectedProjects = () => setSelectedProjects([]);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      setLoading(true);
      setError(null);
      try {
        const [evals, averages] = await Promise.all([
          getEmployeeEvaluations(currentUser.id),
          getEmployeeAverageRatings(currentUser.id)
        ]);
        setEvaluations(Array.isArray(evals) ? evals : []);
        setAvgRatings(averages || {});
        // Load and preselect user's projects
        try {
          const myProjects = await getMyProjects({
            identifier: currentUser.email || currentUser.username,
          });
          const ids = Array.isArray(myProjects) ? myProjects.map(p => p.id).filter(Boolean) : [];
          setSelectedProjects(ids);
        } catch (_) {
          // ignore
        }
      } catch (e) {
        console.error('Failed to load employee dashboard data', e);
        setError('Failed to load your dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) {
      load();
    }
  }, [authLoading, currentUser]);

  const computed = useMemo(() => {
    const total = evaluations.length;
    const completed = evaluations.filter(e => e.status === 'REVIEWED').length;
    const pending = evaluations.filter(e => e.status === 'SUBMITTED').length;
    const overallAvg = (() => {
      const values = Object.values(avgRatings || {});
      if (!values.length) return 0;
      const sum = values.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
      return +(sum / values.length).toFixed(1);
    })();
    return { total, completed, pending, overallAvg };
  }, [evaluations, avgRatings]);

  const userData = useMemo(() => ({
    name: currentUser ? (currentUser.firstName ? `${currentUser.firstName}${currentUser.lastName ? ' ' + currentUser.lastName : ''}` : currentUser.username || 'User') : 'User',
    role: currentUser?.position || 'Employee',
    team: currentUser?.department || '',
    performanceScore: computed.overallAvg,
    recentReviews: computed.completed,
    pendingActions: computed.pending,
    goals: 0
  }), [currentUser, computed]);

  const recentActivities = [];

  const quickStats = [
    {
      title: 'Overall Average',
      value: userData.performanceScore,
      suffix: '',
      icon: ChartBarIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Completed Reviews',
      value: userData.recentReviews,
      icon: DocumentTextIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Total Evaluations',
      value: computed.total,
      icon: TrophyIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Pending Reviews',
      value: userData.pendingActions,
      icon: ClockIcon,
      color: 'text-error',
      bgColor: 'bg-error/10'
    }
  ];

  const quickActions = [
    {
      title: 'Start Self Review',
      description: 'Complete your quarterly self-assessment',
      icon: DocumentTextIcon,
      link: '/evaluation',
      color: 'bg-primary'
    },
    {
      title: 'View Performance',
      description: 'Check your performance metrics and trends',
      icon: ChartBarIcon,
      link: '/performance/history',
      color: 'bg-primary'
    },
    {
      title: 'Update Goals',
      description: 'Set and track your professional goals',
      icon: TrophyIcon,
      link: '/performance/goals',
      color: 'bg-primary'
    },
    {
      title: 'AI Insights',
      description: 'Get personalized recommendations',
      icon: ArrowTrendingUpIcon,
      link: '/ai/insights',
      color: 'bg-primary'
    }
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-secondary/70">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
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
                <h1 className="text-2xl font-bold text-secondary">Welcome back, {userData.name}!</h1>
                <p className="text-secondary/70">
                  {userData.role}
                  {userData.team ? ' • ' + userData.team : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/profile" 
                className="flex items-center space-x-2 text-secondary/70 hover:text-secondary transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <Link 
                to="/logout" 
                className="flex items-center space-x-2 text-secondary/70 hover:text-secondary transition-colors"
              >
                <span>Logout</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-error/20 bg-error/5 text-error">
            {error}
          </div>
        )}
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
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-secondary mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {quickActions.map((action, index) => (
                <Link 
                  key={index}
                  to={action.link}
                  className="bg-white rounded-xl shadow-sm border border-primary/10 p-6 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary mb-2">{action.title}</h3>
                      <p className="text-sm text-secondary/70">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right column: Project selection + Recent Activity */}
          <div>
            {/* My Projects */}
            <h2 className="text-xl font-semibold text-secondary mb-6">My Projects</h2>
            <div className="bg-white rounded-xl shadow-sm border border-primary/10 p-6 mb-8">
              {projectsLoading ? (
                <p className="text-secondary/70">Loading projects...</p>
              ) : (
                <>
                  {projSuccess && (
                    <div className="fixed inset-x-0 top-6 flex justify-center z-[60]">
                      <div className="mx-4 w-full max-w-2xl rounded-2xl border border-primary/20 bg-white shadow-xl">
                        <div className="flex items-start gap-4 p-5">
                          <div className="shrink-0 p-2 rounded-full bg-primary/10">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary">
                              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-2.59a.75.75 0 1 0-1.22-.86l-3.87 5.48-2.07-2.07a.75.75 0 0 0-1.06 1.06l2.75 2.75c.32.32.84.27 1.1-.11l4.37-6.25Z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-lg font-semibold text-secondary">Success</p>
                            <p className="text-secondary/80 text-base">{projSuccess}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setProjSuccess('')}
                            className="p-2 rounded-md text-secondary/60 hover:text-secondary hover:bg-background transition-colors"
                            aria-label="Close notification"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {projError && (
                    <div className="mb-3 p-3 rounded-md border border-error/20 bg-error/5 text-error text-sm">
                      {projError}
                    </div>
                  )}
                  <div className="space-y-2 max-h-56 overflow-auto pr-1">
                    {projects.map((p) => (
                      <label key={p.id} className="flex items-center gap-3 text-secondary/90">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selectedProjects.includes(p.id)}
                          onChange={() => toggleProject(p.id)}
                        />
                        <span>{p.name}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      type="button"
                      onClick={saveSelectedProjects}
                      disabled={saveProjectsMutation.isPending}
                      className="px-5 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {saveProjectsMutation.isPending ? 'Saving...' : 'Save Projects'}
                    </button>
                    <button
                      type="button"
                      onClick={clearSelectedProjects}
                      className="px-5 py-2 border border-secondary/20 text-secondary rounded-lg hover:bg-background transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Recent Activity */}
            <h2 className="text-xl font-semibold text-secondary mb-6">Recent Activity</h2>
            <div className="bg-white rounded-xl shadow-sm border border-primary/10 p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {activity.status === 'new' ? (
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      ) : (
                        <div className="w-2 h-2 bg-secondary/30 rounded-full mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-secondary">{activity.title}</p>
                      <p className="text-xs text-secondary/70">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-primary/10">
                <Link 
                  to="/activity" 
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  View all activity →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-primary/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-secondary">Performance Overview</h2>
              <Link 
                to="/performance/history" 
                className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
              >
                View Details →
              </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <StarIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">Overall Rating</h3>
                <p className="text-2xl font-bold text-primary">{userData.performanceScore}</p>
                <p className="text-sm text-secondary/70">Excellent Performance</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <ArrowTrendingUpIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">Growth Trend</h3>
                <p className="text-2xl font-bold text-primary">—</p>
                <p className="text-sm text-secondary/70">vs Last Quarter</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <TrophyIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">Goals Achieved</h3>
                <p className="text-2xl font-bold text-primary">4/5</p>
                <p className="text-sm text-secondary/70">This Quarter</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;


