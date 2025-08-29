import React from 'react';
import { Link } from 'react-router-dom';
import EvaluationsTable from '../../components/evaluation/EvaluationsTable';
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

const ManagerDashboard = () => {
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


