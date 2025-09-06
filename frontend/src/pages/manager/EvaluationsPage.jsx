import React, { useEffect, useState } from 'react';
import ManagerLayout from './ManagerLayout';
import ScoreBasedEvaluationTable from '../../components/evaluation/ScoreBasedEvaluationTable';
import { DocumentTextIcon, UsersIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { getManagerDashboard, getEvaluations } from '../../lib/api';

export default function ManagerEvaluationsPage() {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null); // null means "All"
  const [dashboardStats, setDashboardStats] = useState({
    pendingReviews: 0,
    completedReviews: 0,
    teamMembers: 0
  });
  const [allEvaluations, setAllEvaluations] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Dev auth headers for backend's DevHeaderAuthFilter
        const roles = (currentUser?.roles || []).map(r => r.startsWith('ROLE_') ? r.slice(5) : r).join(',');
        const devHeaders = {};
        if (currentUser?.username || currentUser?.email) devHeaders['X-User'] = currentUser.username || currentUser.email;
        if (roles) devHeaders['X-Roles'] = roles;

        const res = await fetch('http://localhost:8084/api/v1/manager/projects', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ai_ppap_auth_token')}`,
            ...devHeaders,
          },
        });
        const data = res.ok ? await res.json() : [];
        setProjects(Array.isArray(data) ? data : []);
      } catch (_) {
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };
    
    const fetchDashboardStats = async () => {
      try {
        const stats = await getManagerDashboard();
        setDashboardStats(stats || {});
      } catch (_) {
        // Keep default values on error
      }
    };

    const fetchEvaluations = async () => {
      try {
        const evaluations = await getEvaluations();
        setAllEvaluations(evaluations || []);
      } catch (_) {
        setAllEvaluations([]);
      }
    };
    
    fetchProjects();
    fetchDashboardStats();
    fetchEvaluations();
  }, [currentUser]);

  // Calculate filtered stats based on selected project
  const filteredStats = React.useMemo(() => {
    if (selectedProjectId === null) {
      // Show all evaluations when "All" is selected
      return dashboardStats;
    }

    // Filter evaluations by selected project ID
    const filteredEvaluations = allEvaluations.filter(evaluation => 
      evaluation.projectId === selectedProjectId
    );

    const pending = filteredEvaluations.filter(e => 
      e.status === 'PENDING'
    ).length;

    const completed = filteredEvaluations.filter(e => 
      e.status === 'COMPLETED' || e.status === 'REVIEWED'
    ).length;

    const teamMembers = new Set(
      filteredEvaluations.map(e => e.employeeName).filter(name => name)
    ).size;

    return {
      pendingReviews: pending,
      completedReviews: completed,
      teamMembers: teamMembers
    };
  }, [selectedProjectId, dashboardStats, allEvaluations]);
  
  const selectProject = (id) => {
    setSelectedProjectId(id);
  };
  const selectAll = () => setSelectedProjectId(null);

  return (
    <ManagerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Evaluations</h1>
          <p className="mt-1 text-sm text-gray-500">Review and manage evaluations from your team members</p>
        </div>

        {/* Managed Projects & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Your Projects</p>
              <p className="text-xs text-gray-500">Evaluations below are auto-filtered to employees in these projects</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{projects.length}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {loadingProjects ? (
              <span className="text-sm text-gray-500">Loading projects…</span>
            ) : projects.length === 0 ? (
              <span className="text-sm text-gray-500">No assigned projects</span>
            ) : (
              <>
                <button
                  onClick={selectAll}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    selectedProjectId === null
                      ? 'bg-[#002035] text-white border-[#002035]'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                {projects.map((p) => {
                  const active = selectedProjectId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => selectProject(p.id)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        active
                          ? 'bg-[#002035] text-white border-[#002035]'
                          : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                      title={`Filter by ${p.name} project`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Evaluations</p>
                <p className="text-2xl font-bold text-gray-900">{(filteredStats.pendingReviews || 0) + (filteredStats.completedReviews || 0)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{filteredStats.pendingReviews || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-50">
                <UsersIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">{filteredStats.teamMembers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ScoreBasedEvaluationTable selectedProjectIds={selectedProjectId ? [selectedProjectId] : []} />
        </div>
      </div>
    </ManagerLayout>
  );
}
