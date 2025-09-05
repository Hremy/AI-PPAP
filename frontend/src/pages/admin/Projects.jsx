import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProjects, createProject, getManagers } from '../../lib/api';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Projects() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', 'list'],
    queryFn: fetchProjects,
  });

  // Fetch managers to compute per-project manager info
  const { data: managers = [], isLoading: managersLoading } = useQuery({
    queryKey: ['admin','managers'],
    queryFn: getManagers,
  });

  const createMutation = useMutation({
    mutationFn: ({ name }) => createProject({ name }),
    onSuccess: () => {
      setName('');
      setError('');
      setIsOpen(false);
      qc.invalidateQueries({ queryKey: ['projects', 'list'] });
    },
    onError: (e) => {
      setError(e?.response?.data?.message || 'Failed to create project');
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return (projects || []).filter((p) => p.name?.toLowerCase().includes(q));
  }, [projects, search]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    createMutation.mutate({ name: name.trim() });
  };

  // Build map: projectId -> array of managers managing it
  const projectManagersMap = useMemo(() => {
    const map = new Map();
    (managers || []).forEach((m) => {
      (m.managedProjects || []).forEach((p) => {
        if (!map.has(p.id)) map.set(p.id, []);
        map.get(p.id).push(m);
      });
    });
    return map;
  }, [managers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Projects</h1>
          <p className="text-secondary/70 text-sm">Manage projects. These power access control and scoping.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
        >
          <PlusIcon className="w-5 h-5" />
          Add Project
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-primary/10 p-4">
        <div className="relative max-w-sm">
          <MagnifyingGlassIcon className="w-5 h-5 text-secondary/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-secondary/30 focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
        <div className="p-4 border-b border-primary/10 flex items-center justify-between">
          <p className="text-sm text-secondary/70">{filtered.length} project(s)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary/10">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary/70 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary/70 uppercase tracking-wider">Managers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary/70 uppercase tracking-wider"># of Employees</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-primary/10">
              {isLoading || managersLoading ? (
                <tr><td className="px-6 py-4 text-secondary/60" colSpan={3}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="px-6 py-10 text-secondary/60" colSpan={3}>No projects found</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 text-secondary">{p.name}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const ms = projectManagersMap.get(p.id) || [];
                        if (ms.length === 0) return <span className="text-secondary/60">—</span>;
                        const names = ms.map((m) => `${m.firstName || ''} ${m.lastName || ''}`.trim()).filter(Boolean);
                        return (
                          <div className="text-secondary">
                            <div className="text-sm font-medium">{ms.length} manager{ms.length>1?'s':''}</div>
                            <div className="text-xs text-secondary/70 truncate max-w-xs" title={names.join(', ')}>
                              {names.join(', ')}
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-secondary/60">—</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Project Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-primary/10 bg-primary">
              <h3 className="text-lg font-semibold text-secondary">Add Project</h3>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleCreate}>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Project name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-secondary/30 focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g. UniCredit"
                  required
                />
              </div>
              {error && <p className="text-sm text-error">{error}</p>}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); setName(''); setError(''); }}
                  className="px-4 py-2 rounded-lg border border-secondary/30 text-secondary hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
