import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import EvaluationsTable from '../../components/evaluation/EvaluationsTable';
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
  const { currentUser } = useAuth();

  // Dev headers similar to other components to support backend DevHeaderAuthFilter
  const devHeaders = useMemo(() => {
    if (!currentUser) return {};
    const roles = (currentUser.roles || []).map(r => r.startsWith('ROLE_') ? r.slice(5) : r).join(',');
    const hdr = {};
    if (currentUser.username || currentUser.email) hdr['X-User'] = currentUser.username || currentUser.email;
    if (roles) hdr['X-Roles'] = roles;
    return hdr;
  }, [currentUser]);

  // Fetch managers
  const { data: managers = [], isLoading: managersLoading } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8084/api/v1/users/managers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ai_ppap_auth_token')}`,
          ...devHeaders
        }
      });
      if (!res.ok) throw new Error('Failed to load managers');
      return res.json();
    }
  });

  // Fetch evaluations
  const { data: evaluations = [], isLoading: evalsLoading } = useQuery({
    queryKey: ['evaluations', 'admin-view'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8084/api/v1/evaluations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ai_ppap_auth_token')}`,
          ...devHeaders
        }
      });
      if (!res.ok) throw new Error('Failed to load evaluations');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Derive dynamic stats from live data
  const totalManagers = managers?.length || 0;
  // We may not have a total employees endpoint; estimate unique employees from evaluations for now
  const uniqueEmployees = useMemo(() => {
    const set = new Set();
    (evaluations || []).forEach(e => {
      if (e.employeeEmail) set.add(e.employeeEmail);
      else if (e.employeeId) set.add(`id:${e.employeeId}`);
    });
    return set.size;
  }, [evaluations]);
  const totalReviews = evaluations?.length || 0;
  const pendingApprovals = (evaluations || []).filter(e => e.status === 'SUBMITTED').length;
  const systemHealth = 99; // Placeholder; could be wired to a health endpoint

  const adminData = {
    name: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Admin',
    role: 'System Administrator',
    totalEmployees: uniqueEmployees,
    totalManagers: totalManagers,
    totalReviews: totalReviews,
    systemHealth: systemHealth,
    pendingApprovals: pendingApprovals,
    activeGoals: 0
  };

  const systemStats = [
    {
      title: 'Total Employees',
      value: adminData.totalEmployees,
      icon: UsersIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: ''
    },
    {
      title: 'Active Managers',
      value: adminData.totalManagers,
      icon: UserGroupIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: ''
    },
    {
      title: 'System Health',
      value: adminData.systemHealth,
      suffix: '%',
      icon: ShieldCheckIcon,
      color: 'text-white',
      bgColor: 'bg-[#002035]',
      change: 'All systems operational'
    },
    {
      title: 'Pending Approvals',
      value: adminData.pendingApprovals,
      icon: ClockIcon,
      color: 'text-white',
      bgColor: 'bg-[#002035]',
      change: 'Requires attention'
    }
  ];

  const recentActivities = useMemo(() => {
    const items = (evaluations || [])
      .slice()
      .sort((a, b) => new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0))
      .slice(0, 10)
      .map((e, idx) => ({
        id: e.id || idx,
        type: 'review',
        title: `${e.employeeName || 'Employee'} submitted a ${e.status?.toLowerCase() || 'submitted'} evaluation (${e.projectName || 'No Project'})`,
        time: new Date(e.submittedAt || e.createdAt || Date.now()).toLocaleString(),
        status: e.status === 'REVIEWED' ? 'success' : (e.status === 'SUBMITTED' ? 'info' : 'info')
      }));
    return items;
  }, [evaluations]);

  // Derive a project overview from evaluations: count employees and avg rating per project
  const departmentStats = useMemo(() => {
    const byProject = new Map();
    (evaluations || []).forEach(e => {
      const key = e.projectName || 'Unassigned';
      if (!byProject.has(key)) byProject.set(key, { name: key, employeeSet: new Set(), ratings: [] });
      const rec = byProject.get(key);
      if (e.employeeEmail) rec.employeeSet.add(e.employeeEmail);
      else if (e.employeeId) rec.employeeSet.add(`id:${e.employeeId}`);
      const overall = typeof e.overallRating === 'number' ? e.overallRating : null;
      if (overall != null) rec.ratings.push(overall);
    });
    const result = Array.from(byProject.values()).map(r => ({
      name: r.name,
      employees: r.employeeSet.size,
      performance: r.ratings.length ? Math.round(r.ratings.reduce((a,b)=>a+b,0) / r.ratings.length * 20) : 0, // scale 1-5 to percentage
      managers: null
    }));
    return result.slice(0, 5);
  }, [evaluations]);

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
      case 'success': return 'text-[#002035]';
      case 'warning': return 'text-orange-600';
      case 'error': return 'text-[#002035]';
      case 'info':
      default: return 'text-primary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <p className="text-2xl font-bold text-secondary">Admin Dashboard</p>
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
          {(managersLoading || evalsLoading) ? (
            <div className="md:col-span-2 lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-primary/10 p-6 animate-pulse h-28" />
            </div>
          ) : null}
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
                          <p className="text-sm text-secondary/70">{dept.employees} employees</p>
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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#002035]/10 rounded-full mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-[#002035]" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">Uptime</h3>
                <p className="text-2xl font-bold text-[#002035]">99.9%</p>
                <p className="text-sm text-secondary/70">Last 30 Days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submitted Evaluations Table */}
        <div className="mt-8">
          <EvaluationsTable />
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;


