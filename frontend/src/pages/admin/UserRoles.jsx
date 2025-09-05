import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getManagers, createManager, fetchProjects, assignManagedProjects } from '../../lib/api';
import { UsersIcon, PlusIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function UserRoles() {
  const qc = useQueryClient();
  const { data: managers = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'managers'],
    queryFn: getManagers,
  });

  const assignMutation = useMutation({
    mutationFn: ({ userId, projectIds }) => assignManagedProjects({ userId, projectIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'managers'] });
      setAssignOpen(false);
      setSelectedManager(null);
      setSelectedProjectIds([]);
      setOpenAssignForId(null);
      setAssignError('');
    },
    onError: (e) => {
      setAssignError(e?.response?.data?.message || 'Failed to save project assignments');
    }
  });

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [formError, setFormError] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [pendingManagerPassword, setPendingManagerPassword] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Assign projects state (modal kept, but we'll add inline dropdown)
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [openAssignForId, setOpenAssignForId] = useState(null);
  const [assignError, setAssignError] = useState('');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects','list'],
    queryFn: fetchProjects,
  });

  const sortedProjects = useMemo(() => (projects || []).slice().sort((a,b)=>a.name.localeCompare(b.name)), [projects]);

  const createMutation = useMutation({
    mutationFn: createManager,
    onSuccess: () => {
      setForm({ firstName: '', lastName: '', email: '' });
      setFormError('');
      // Show the password we generated client-side
      if (pendingManagerPassword) setGeneratedPassword(pendingManagerPassword);
      setPendingManagerPassword('');
      qc.invalidateQueries({ queryKey: ['admin', 'managers'] });
    },
    onError: (e) => {
      setFormError(e?.response?.data?.message || 'Failed to create manager');
      setGeneratedPassword('');
      setPendingManagerPassword('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.email || !form.email.includes('@')) {
      setFormError('Valid email is required');
      return;
    }

    // Prevent creating admin via this form in dev
    if (/(admin)@/i.test(form.email)) {
      setFormError('Admin accounts cannot be created here.');
      return;
    }

    // Build required params for backend
    const baseUsername = form.email?.split('@')[0] || `${(form.firstName||'').toLowerCase()}.${(form.lastName||'').toLowerCase()}`.replace(/\s+/g,'');
    const username = baseUsername || `manager${Math.floor(Math.random()*10000)}`;
    const password = Array.from(crypto.getRandomValues(new Uint32Array(4)))
      .map(n => n.toString(36)).join('').slice(0, 12) + 'A1!';
    const department = 'General';

    setPendingManagerPassword(password);
    createMutation.mutate({ username, email: form.email, password, firstName: form.firstName, lastName: form.lastName, department });
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const dismissPassword = () => {
    setGeneratedPassword('');
    setPasswordCopied(false);
  };

  const GeneratedPasswordModal = ({ open, password, onCopy, copied, onClose }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          <div className="bg-primary px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-secondary">Manager Created Successfully!</h3>
              <button onClick={onClose} className="text-secondary/70 hover:text-secondary transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-secondary/80 text-sm mt-2">
              A random password has been generated for the new manager. Please share this password securely.
            </p>
          </div>
          <div className="p-6">
            <div className="bg-background border border-primary/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-secondary mb-2">Generated Password</label>
                  <code className="text-lg font-mono text-secondary bg-white px-4 py-3 rounded-lg border border-primary/20 block w-full">{password}</code>
                </div>
                <button onClick={onCopy} className="ml-4 flex items-center space-x-2 px-4 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors shadow-md">
                  {copied ? (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      <span className="font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-5 h-5" />
                      <span className="font-medium">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Make sure to save this password securely. It won't be shown again.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={onClose} className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-medium">Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AssignProjectsModal = ({ open, manager, projects, selectedIds, onToggle, onCancel, onSave, saving }) => {
    if (!open || !manager) return null;
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
          <div className="px-6 py-4 border-b border-primary/10 bg-primary">
            <h3 className="text-lg font-semibold text-secondary">Assign Projects to {manager.firstName} {manager.lastName}</h3>
            <p className="text-xs text-secondary/80 mt-1">Select the projects this manager is allowed to manage.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="max-h-64 overflow-auto border border-primary/10 rounded-xl p-3 space-y-2">
              {projects.length === 0 ? (
                <p className="text-sm text-secondary/60">No projects available.</p>
              ) : (
                projects.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm text-secondary">
                    <input type="checkbox" className="rounded border-secondary/40" checked={selectedIds.includes(p.id)} onChange={() => onToggle(p.id)} />
                    <span>{p.name}</span>
                  </label>
                ))
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-secondary/30 text-secondary hover:bg-gray-50">Cancel</button>
              <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary flex items-center gap-2">
              <UsersIcon className="w-6 h-6" /> User Roles
            </h1>
            <p className="text-secondary/70 text-sm">Admins can add managers. Employees self-register from the signup page.</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-8">
        {/* Managers list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-primary/10">
            <div className="p-6 border-b border-primary/10">
              <h2 className="text-lg font-semibold text-secondary">Managers</h2>
            </div>
            <div className="p-6">
              {isLoading ? (
                <p className="text-secondary/60">Loading...</p>
              ) : error ? (
                <p className="text-error">Failed to load managers.</p>
              ) : managers.length === 0 ? (
                <div className="text-center py-8">
                  <UsersIcon className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
                  <p className="text-secondary/60 text-lg font-medium mb-2">No managers added yet</p>
                  <p className="text-secondary/50 text-sm">Use the form below to add your first manager.</p>
                </div>
              ) : (
                <ul className="divide-y divide-primary/10">
                  {managers.map((m) => (
                    <li key={m.id} className="py-3">
                      <div className="flex items-center justify-between relative">
                        <div>
                          <p className="font-medium text-secondary">{m.firstName} {m.lastName}</p>
                          <p className="text-sm text-secondary/70">{m.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedManager(m);
                              setSelectedProjectIds(m.managedProjects?.map(p=>p.id) || []);
                              setAssignError('');
                              setOpenAssignForId((prev) => prev === m.id ? null : m.id);
                            }}
                            className="text-xs px-3 py-1 rounded bg-secondary text-white hover:bg-secondary/90"
                          >
                            Assign Projects
                          </button>
                          <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">{m.role?.replace('ROLE_', '') || 'MANAGER'}</span>
                        </div>
                        {openAssignForId === m.id && (
                          <div className="absolute right-0 top-10 z-40 w-64 bg-white border border-primary/10 rounded-lg shadow-xl p-3">
                            <div className="mb-2">
                              <p className="text-xs text-secondary/60">Select projects to assign</p>
                            </div>
                            <div className="max-h-48 overflow-auto space-y-2 pr-1">
                              {sortedProjects.length === 0 ? (
                                <p className="text-xs text-secondary/60">No projects available.</p>
                              ) : (
                                sortedProjects.map((p) => (
                                  <label key={p.id} className="flex items-center gap-2 text-sm text-secondary">
                                    <input
                                      type="checkbox"
                                      className="rounded border-secondary/40"
                                      checked={selectedProjectIds.includes(p.id)}
                                      onChange={() => setSelectedProjectIds((prev) => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                                    />
                                    <span>{p.name}</span>
                                  </label>
                                ))
                              )}
                            </div>
                            {assignError && (
                              <div className="mt-2 text-xs text-error">{assignError}</div>
                            )}
                            <div className="mt-3 flex justify-end gap-2">
                              <button
                                onClick={() => { setOpenAssignForId(null); setSelectedManager(null); setSelectedProjectIds([]); setAssignError(''); }}
                                className="px-3 py-1 text-xs rounded border border-secondary/30 text-secondary hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => assignMutation.mutate({ userId: m.id, projectIds: selectedProjectIds })}
                                disabled={assignMutation.isPending}
                                className="px-3 py-1 text-xs rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                              >
                                {assignMutation.isPending ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Create manager */}
        <div>
          <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
            <div className="p-6 border-b border-primary/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary">Add Manager</h2>
              <PlusIcon className="w-5 h-5 text-secondary/60" />
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">First name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg border-secondary/30 focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Jane"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Last name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg border-secondary/30 focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg border-secondary/30 focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="jane.manager@corp.com"
                  required
                />
                <p className="text-xs text-secondary/60 mt-1">Tip: include "manager" in the email for dev role detection.</p>
              </div>

              {formError && <p className="text-sm text-error">{formError}</p>}

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Manager'}
              </button>
            </form>
          </div>

          {/* Generated Password Modal */}
          <GeneratedPasswordModal
            open={!!generatedPassword}
            password={generatedPassword}
            onCopy={copyPassword}
            copied={passwordCopied}
            onClose={dismissPassword}
          />
        
        {/* Assign Projects Modal */}
        <AssignProjectsModal
          open={assignOpen}
          manager={selectedManager}
          projects={sortedProjects}
          selectedIds={selectedProjectIds}
          onToggle={(id) => setSelectedProjectIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
          onCancel={() => { setAssignOpen(false); setSelectedManager(null); setSelectedProjectIds([]); }}
          onSave={() => assignMutation.mutate({ userId: selectedManager.id, projectIds: selectedProjectIds })}
          saving={assignMutation.isPending}
        />
      </div>
      </div>
    </div>
  );
}
