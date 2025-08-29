import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getManagers, createManager } from '../../lib/api';
import { UsersIcon, PlusIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function UserRoles() {
  const qc = useQueryClient();
  const { data: managers = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'managers'],
    queryFn: getManagers,
  });

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [formError, setFormError] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);

  const createMutation = useMutation({
    mutationFn: createManager,
    onSuccess: (data) => {
      setForm({ firstName: '', lastName: '', email: '' });
      setFormError('');
      // Show the generated password
      if (data.generatedPassword) {
        setGeneratedPassword(data.generatedPassword);
      }
      qc.invalidateQueries({ queryKey: ['admin', 'managers'] });
    },
    onError: (e) => {
      setFormError(e?.response?.data?.message || 'Failed to create manager');
      setGeneratedPassword('');
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
                <div className="text-center py-8">
                  <UsersIcon className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
                  <p className="text-secondary/60 text-lg font-medium mb-2">No managers added yet</p>
                  <p className="text-secondary/50 text-sm">Use the form below to add your first manager.</p>
                </div>
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

          {/* Generated Password Modal */}
          {generatedPassword && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Modal Header */}
                <div className="bg-primary px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-secondary">Manager Created Successfully!</h3>
                    <button
                      onClick={dismissPassword}
                      className="text-secondary/70 hover:text-secondary transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-secondary/80 text-sm mt-2">
                    A random password has been generated for the new manager. Please share this password securely.
                  </p>
                </div>
                
                {/* Modal Body */}
                <div className="p-6">
                  <div className="bg-background border border-primary/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-secondary mb-2">Generated Password</label>
                        <code className="text-lg font-mono text-secondary bg-white px-4 py-3 rounded-lg border border-primary/20 block w-full">
                          {generatedPassword}
                        </code>
                      </div>
                      <button
                        onClick={copyPassword}
                        className="ml-4 flex items-center space-x-2 px-4 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors shadow-md"
                      >
                        {passwordCopied ? (
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
                    <button
                      onClick={dismissPassword}
                      className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
