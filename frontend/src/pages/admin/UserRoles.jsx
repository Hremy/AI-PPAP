import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getManagers, createManager } from '../../lib/api';
import { UsersIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function UserRoles() {
  const qc = useQueryClient();
  const { data: managers = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'managers'],
    queryFn: getManagers,
  });

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [formError, setFormError] = useState('');

  const createMutation = useMutation({
    mutationFn: createManager,
    onSuccess: () => {
      setForm({ firstName: '', lastName: '', email: '' });
      qc.invalidateQueries({ queryKey: ['admin', 'managers'] });
    },
    onError: (e) => {
      setFormError(e?.response?.data?.message || 'Failed to create manager');
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

    createMutation.mutate(form);
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
          <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
            <div className="p-6 border-b border-primary/10">
              <h2 className="text-lg font-semibold text-secondary">Managers</h2>
            </div>
            <div className="p-6">
              {isLoading ? (
                <p className="text-secondary/60">Loading...</p>
              ) : error ? (
                <p className="text-error">Failed to load managers.</p>
              ) : managers.length === 0 ? (
                <p className="text-secondary/60">No managers yet. Add one using the form.</p>
              ) : (
                <ul className="divide-y divide-primary/10">
                  {managers.map((m) => (
                    <li key={m.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-secondary">{m.firstName} {m.lastName}</p>
                        <p className="text-sm text-secondary/70">{m.email}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">{m.role?.replace('ROLE_', '') || 'MANAGER'}</span>
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
        </div>
      </div>
    </div>
  );
}
