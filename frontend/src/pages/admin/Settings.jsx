import React, { useEffect, useState } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const LS_KEY = 'ai_ppap_api_base_url';
  const envDefault = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8084');
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const ORG_KEY = 'ai_ppap_org_name';
  const defaultOrg = 'AI-PPPA';
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    setApiBaseUrl(stored || envDefault);
    const storedOrg = localStorage.getItem(ORG_KEY);
    setOrgName(storedOrg || defaultOrg);
  }, []);

  const onSave = () => {
    try {
      const url = new URL(apiBaseUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
      localStorage.setItem(LS_KEY, apiBaseUrl.replace(/\/$/, ''));
      toast.success('API Base URL saved');
    } catch (e) {
      toast.error('Please enter a valid http(s) URL');
    }
  };

  const onReset = () => {
    localStorage.removeItem(LS_KEY);
    setApiBaseUrl(envDefault);
    toast.success('Reset to default');
  };

  const onSaveOrg = () => {
    const value = (orgName || '').trim();
    if (!value) {
      toast.error('Organization name cannot be empty');
      return;
    }
    localStorage.setItem(ORG_KEY, value);
    setOrgName(value);
    toast.success('Organization name saved');
  };

  const onResetOrg = () => {
    localStorage.removeItem(ORG_KEY);
    setOrgName(defaultOrg);
    toast.success('Organization name reset');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white/90 backdrop-blur-md border-b border-primary/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Cog6ToothIcon className="w-6 h-6 text-secondary" />
            <h1 className="text-2xl font-bold text-secondary">System Settings</h1>
          </div>
          <p className="text-secondary/70 mt-1">Configure application-level preferences and integrations.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* General Settings */}
        <section className="bg-white rounded-xl shadow-sm border border-primary/10 p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1">Organization Name</label>
              <input
                type="text"
                className="w-full border border-primary/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Acme Corp"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
              <div className="flex items-center gap-3 mt-3">
                <button onClick={onSaveOrg} className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary/90">Save</button>
                <button onClick={onResetOrg} className="px-4 py-2 rounded-md text-sm border border-primary/20 text-secondary/80 hover:bg-secondary/5">Reset</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1">Default Timezone</label>
              <select className="w-full border border-primary/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option>UTC</option>
                <option>Europe/Paris</option>
                <option>America/Los_Angeles</option>
              </select>
            </div>
          </div>
        </section>

        {/* AI Service Settings */}
        <section className="bg-white rounded-xl shadow-sm border border-primary/10 p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">AI Service</h2>
          <p className="text-sm text-secondary/70 mb-4">
            The frontend uses this base URL to reach the AI endpoints. If unset, it falls back to
            <code className="mx-1">VITE_API_BASE_URL</code> or <code className="mx-1">http://localhost:8084</code>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1">API Base URL</label>
              <input
                type="text"
                className="w-full border border-primary/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="http://localhost:8084"
              />
              <div className="flex items-center gap-3 mt-3">
                <button onClick={onSave} className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary/90">Save</button>
                <button onClick={onReset} className="px-4 py-2 rounded-md text-sm border border-primary/20 text-secondary/80 hover:bg-secondary/5">Reset to Default</button>
              </div>
              <p className="text-xs text-secondary/60 mt-2">Saved in your browser and applied immediately. No restart required.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
