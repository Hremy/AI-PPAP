import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function ManagerTeam() {
  const { currentUser, hasRole } = useAuth();
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const devHeaders = useMemo(() => {
    // Dev header auth: X-User and X-Roles must match backend DevHeaderAuthFilter expectations
    const usernameOrEmail = currentUser?.username || currentUser?.email || 'manager@example.com';
    // roles are stored without ROLE_ prefix in frontend; ensure MANAGER is present
    const roles = currentUser?.roles?.length ? currentUser.roles : ['MANAGER'];
    return {
      'X-User': usernameOrEmail,
      'X-Roles': roles.join(',')
    };
  }, [currentUser]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [projRes, teamRes] = await Promise.all([
          fetch('/api/v1/manager/projects', { headers: devHeaders }),
          fetch('/api/v1/manager/team', { headers: devHeaders }),
        ]);

        if (!projRes.ok) throw new Error(`Projects request failed: ${projRes.status}`);
        if (!teamRes.ok) throw new Error(`Team request failed: ${teamRes.status}`);

        const [projData, teamData] = await Promise.all([projRes.json(), teamRes.json()]);
        if (!cancelled) {
          setProjects(Array.isArray(projData) ? projData : []);
          setTeam(Array.isArray(teamData) ? teamData : []);
          setSelectedProjectId('ALL');
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load team data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [devHeaders]);

  // Handler: when selecting a project, fetch members for that project
  const handleSelectProject = async (pid) => {
    setSelectedProjectId(pid);
    setLoading(true);
    setError(null);
    try {
      if (pid === 'ALL') {
        const res = await fetch('/api/v1/manager/team', { headers: devHeaders });
        if (!res.ok) throw new Error(`Team request failed: ${res.status}`);
        const data = await res.json();
        setTeam(Array.isArray(data) ? data : []);
      } else {
        const res = await fetch(`/api/v1/manager/team/${pid}`, { headers: devHeaders });
        if (!res.ok) throw new Error(`Team by project failed: ${res.status}`);
        const data = await res.json();
        setTeam(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load team by project');
    } finally {
      setLoading(false);
    }
  };

  if (!hasRole('MANAGER') && !hasRole('ADMIN')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-secondary">Not authorized</h1>
          <p className="text-secondary/70">You need Manager or Admin role to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary">Your Team</h1>
          <p className="text-secondary/70">Projects you manage and employees assigned to them.</p>
        </div>

        {loading && (
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">Loading…</div>
        )}

        {error && (
          <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 mb-4">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Managed Projects</h2>
                {projects.length === 0 ? (
                  <p className="text-sm text-gray-500">No projects assigned.</p>
                ) : (
                  <>
                    <div className="mb-2">
                      <button
                        onClick={() => handleSelectProject('ALL')}
                        className={`w-full text-left px-3 py-2 rounded border transition ${selectedProjectId === 'ALL' ? 'border-primary/30 bg-primary/10 text-primary' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
                      >
                        All
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {projects.map((p) => (
                        <li key={p.id}>
                          <button
                            onClick={() => handleSelectProject(p.id)}
                            className={`w-full text-left px-3 py-2 rounded border transition ${selectedProjectId === p.id ? 'border-primary/30 bg-primary/10 text-primary' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
                          >
                            {p.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Employees</h2>
                {team.length === 0 ? (
                  <p className="text-sm text-gray-500">No employees found for your managed projects.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="py-2 pr-4">Name</th>
                          <th className="py-2 pr-4">Username</th>
                          <th className="py-2 pr-4">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.map((u) => (
                          <tr key={u.id} className="border-t border-gray-100">
                            <td className="py-2 pr-4">{u.fullName || '-'}</td>
                            <td className="py-2 pr-4">{u.username}</td>
                            <td className="py-2 pr-4">{u.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagerTeam;
