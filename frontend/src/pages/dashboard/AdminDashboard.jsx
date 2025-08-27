import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BuildingOfficeIcon,
  UserGroupIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  CogIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  // Mock data - will be replaced with real API calls
  const adminData = {
    name: 'Admin User',
    role: 'System Administrator',
    totalEmployees: 247,
    totalManagers: 23,
    totalReviews: 156,
    systemHealth: 98,
    pendingApprovals: 8,
    activeGoals: 89
  };

  const systemStats = [
    {
      title: 'Total Employees',
      value: adminData.totalEmployees,
      icon: UsersIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+12 this month'
    },
    {
      title: 'Active Managers',
      value: adminData.totalManagers,
      icon: UserGroupIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+3 this month'
    },
    {
      title: 'System Health',
      value: adminData.systemHealth,
      suffix: '%',
      icon: ShieldCheckIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: 'All systems operational'
    },
    {
      title: 'Pending Approvals',
      value: adminData.pendingApprovals,
      icon: ClockIcon,
      color: 'text-error',
      bgColor: 'bg-error/10',
      change: 'Requires attention'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'user', title: 'New manager registered: John Smith', time: '2 hours ago', status: 'info' },
    { id: 2, type: 'system', title: 'System backup completed successfully', time: '4 hours ago', status: 'success' },
    { id: 3, type: 'review', title: '15 quarterly reviews submitted', time: '6 hours ago', status: 'info' },
    { id: 4, type: 'alert', title: 'High server load detected', time: '8 hours ago', status: 'warning' }
  ];

  const departmentStats = [
    { name: 'Engineering', employees: 89, performance: 92, managers: 8 },
    { name: 'Marketing', employees: 34, performance: 88, managers: 3 },
    { name: 'Sales', employees: 56, performance: 85, managers: 5 },
    { name: 'HR', employees: 12, performance: 94, managers: 2 },
    { name: 'Finance', employees: 23, performance: 90, managers: 2 }
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Add, edit, or remove users and roles',
      icon: UsersIcon,
      link: '/admin/users',
      color: 'bg-primary'
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: CogIcon,
      link: '/admin/settings',
      color: 'bg-primary'
    },
    {
      title: 'KPI Configuration',
      description: 'Manage performance indicators',
      icon: ChartBarIcon,
      link: '/admin/kpis',
      color: 'bg-primary'
    },
    {
      title: 'Company Reports',
      description: 'Generate organization-wide reports',
      icon: DocumentTextIcon,
      link: '/admin/reports',
      color: 'bg-primary'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'error': return 'text-error';
      case 'info':
      default: return 'text-primary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-secondary">Admin Dashboard</h1>
              <p className="text-secondary/70">{adminData.name} • {adminData.role}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/admin/settings" 
                className="flex items-center space-x-2 text-secondary/70 hover:text-secondary transition-colors"
              >
                <CogIcon className="w-5 h-5" />
                <span>System Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-primary/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-secondary">
                    {stat.value}{stat.suffix || ''}
                  </p>
                  <p className="text-sm font-medium text-secondary/70">{stat.title}</p>
                </div>
              </div>
              <p className="text-xs text-secondary/60">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Department Overview */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-secondary">Department Overview</h2>
              <Link 
                to="/admin/departments" 
                className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
              >
                View All →
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-primary/10 overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  {departmentStats.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <BuildingOfficeIcon className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-secondary">{dept.name}</h3>
                          <p className="text-sm text-secondary/70">{dept.employees} employees • {dept.managers} managers</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-secondary">{dept.performance}%</p>
                        <p className="text-xs text-secondary/70">Performance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <h2 className="text-xl font-semibold text-secondary mb-6">Recent Activities</h2>
            <div className="bg-white rounded-xl shadow-sm border border-primary/10 p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)} bg-current`}></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-secondary">{activity.title}</p>
                      <p className="text-xs text-secondary/70">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-primary/10">
                <Link 
                  to="/admin/activity" 
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  View all activity →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-secondary mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* System Overview */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-primary/10 p-6">
            <h2 className="text-xl font-semibold text-secondary mb-6">System Overview</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <UsersIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">Total Users</h3>
                <p className="text-2xl font-bold text-primary">{adminData.totalEmployees + adminData.totalManagers}</p>
                <p className="text-sm text-secondary/70">Active Accounts</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">Reviews</h3>
                <p className="text-2xl font-bold text-primary">{adminData.totalReviews}</p>
                <p className="text-sm text-secondary/70">This Quarter</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <ArrowTrendingUpIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">Growth</h3>
                <p className="text-2xl font-bold text-primary">+15%</p>
                <p className="text-sm text-secondary/70">User Growth</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">Uptime</h3>
                <p className="text-2xl font-bold text-green-600">99.9%</p>
                <p className="text-sm text-secondary/70">Last 30 Days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        {adminData.pendingApprovals > 0 && (
          <div className="mt-8">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-800">Pending Approvals</h3>
                  <p className="text-orange-700">
                    You have {adminData.pendingApprovals} items requiring your approval.
                  </p>
                </div>
                <Link 
                  to="/admin/approvals" 
                  className="ml-auto bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Review
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
