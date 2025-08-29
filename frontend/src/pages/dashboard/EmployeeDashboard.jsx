import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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

  const [evaluations, setEvaluations] = useState([]);
  const [avgRatings, setAvgRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    team: currentUser?.department || '—',
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
      link: '/reviews/self',
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
                <p className="text-secondary/70">{userData.role} • {userData.team}</p>
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

          {/* Recent Activity */}
          <div>
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


