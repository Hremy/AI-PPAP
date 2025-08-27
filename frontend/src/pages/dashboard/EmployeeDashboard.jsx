import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  TrophyIcon, 
  UserIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const EmployeeDashboard = () => {
  // Mock data - will be replaced with real API calls
  const userData = {
    name: 'John Doe',
    role: 'Software Engineer',
    team: 'Development Team',
    performanceScore: 85,
    recentReviews: 3,
    pendingActions: 2,
    goals: 5
  };

  const recentActivities = [
    { id: 1, type: 'review', title: 'Self-review submitted', date: '2 days ago', status: 'completed' },
    { id: 2, type: 'goal', title: 'Q1 Goals updated', date: '1 week ago', status: 'completed' },
    { id: 3, type: 'feedback', title: 'Peer review received', date: '2 weeks ago', status: 'new' }
  ];

  const quickStats = [
    {
      title: 'Performance Score',
      value: userData.performanceScore,
      suffix: '%',
      icon: ChartBarIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Recent Reviews',
      value: userData.recentReviews,
      icon: DocumentTextIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Active Goals',
      value: userData.goals,
      icon: TrophyIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Pending Actions',
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-secondary">Welcome back, {userData.name}!</h1>
              <p className="text-secondary/70">{userData.role} • {userData.team}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/settings/profile" 
                className="flex items-center space-x-2 text-secondary/70 hover:text-secondary transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                <span>Profile</span>
              </Link>
            </div>
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
                <p className="text-2xl font-bold text-primary">{userData.performanceScore}%</p>
                <p className="text-sm text-secondary/70">Excellent Performance</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <ArrowTrendingUpIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">Growth Trend</h3>
                <p className="text-2xl font-bold text-primary">+12%</p>
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
