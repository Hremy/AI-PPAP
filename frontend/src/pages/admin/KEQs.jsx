import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getKEQs, createKEQ, updateKEQ, deleteKEQ } from '../../lib/api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function KEQs() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ text: '', category: '', orderIndex: 0, effectiveFromYear: new Date().getFullYear(), effectiveFromQuarter: Math.floor(new Date().getMonth() / 3) + 1, isActive: true });
  const [error, setError] = useState('');

  const { data: keqs = [], isLoading } = useQuery({
    queryKey: ['keqs'],
    queryFn: async () => {
      try {
        return await getKEQs();
      } catch (_) {
        // Backend not ready yet; return empty list gracefully
        return [];
      }
    }
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return keqs;
    return (keqs || []).filter(k => (k.text || '').toLowerCase().includes(q) || (k.category || '').toLowerCase().includes(q));
  }, [keqs, search]);

  const resetModal = () => {
    setEditId(null);
    setForm({ text: '', category: '', orderIndex: 0, effectiveFromYear: new Date().getFullYear(), effectiveFromQuarter: Math.floor(new Date().getMonth() / 3) + 1, isActive: true });
    setError('');
    setIsOpen(false);
  };

  const openCreate = () => {
    setEditId(null);
    setForm({ text: '', category: '', orderIndex: 0, effectiveFromYear: new Date().getFullYear(), effectiveFromQuarter: Math.floor(new Date().getMonth() / 3) + 1, isActive: true });
    setError('');
    setIsOpen(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({
      text: item.text || '',
      category: item.category || '',
      orderIndex: item.orderIndex ?? 0,
      effectiveFromYear: item.effectiveFromYear ?? new Date().getFullYear(),
      effectiveFromQuarter: item.effectiveFromQuarter ?? 1,
      isActive: item.isActive ?? true,
    });
    setError('');
    setIsOpen(true);
  };

  const createMut = useMutation({
    mutationFn: (payload) => createKEQ(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['keqs'] }); resetModal(); },
    onError: (e) => setError(e?.response?.data?.message || 'Failed to create KEQ')
  });
  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateKEQ(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['keqs'] }); resetModal(); },
    onError: (e) => setError(e?.response?.data?.message || 'Failed to update KEQ')
  });
  const deleteMut = useMutation({
    mutationFn: (id) => deleteKEQ(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['keqs'] })
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.text.trim()) {
      setError('Question text is required');
      return;
    }
    const payload = {
      text: form.text.trim(),
      category: form.category || null,
      orderIndex: Number(form.orderIndex) || 0,
      effectiveFromYear: Number(form.effectiveFromYear),
      effectiveFromQuarter: Number(form.effectiveFromQuarter),
      isActive: !!form.isActive,
    };
    if (editId) {
      updateMut.mutate({ id: editId, payload });
    } else {
      createMut.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">KEQs</h1>
          <p className="text-secondary/70 text-sm">Manage Key Evaluation Questions used for future evaluations.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90">
          <PlusIcon className="w-5 h-5" />
          New KEQ
        </button>
      </div>

      <div className="bg-white rounded-xl border border-primary/10 p-4">
        <input
          className="w-full max-w-sm px-3 py-2 rounded-lg border border-secondary/30 focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Search KEQs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
        <div className="p-4 border-b border-primary/10 flex items-center justify-between">
          <p className="text-sm text-secondary/70">{filtered.length} item(s)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary/10">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary/70 uppercase tracking-wider">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary/70 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary/70 uppercase tracking-wider">Effective From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary/70 uppercase tracking-wider">Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary/70 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary/70 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-primary/10">
              {isLoading ? (
                <tr><td className="px-6 py-4 text-secondary/60" colSpan={6}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="px-6 py-10 text-secondary/60" colSpan={6}>No KEQs found</td></tr>
              ) : (
                filtered.map((k) => (
                  <tr key={k.id}>
                    <td className="px-6 py-4 text-secondary">{k.text}</td>
                    <td className="px-6 py-4 text-secondary/80">{k.category || '-'}</td>
                    <td className="px-6 py-4 text-secondary/80">{`Q${k.effectiveFromQuarter || '-'} ${k.effectiveFromYear || '-'}`}</td>
                    <td className="px-6 py-4">{k.isActive ? <span className="text-green-700 text-sm">Active</span> : <span className="text-secondary/60 text-sm">Inactive</span>}</td>
                    <td className="px-6 py-4 text-secondary/80">{k.orderIndex ?? 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEdit(k)} className="text-secondary hover:text-secondary/80">
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => deleteMut.mutate(k.id)} className="text-red-600 hover:text-red-700">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-primary/10 bg-primary">
              <h3 className="text-lg font-semibold text-secondary">{editId ? 'Edit KEQ' : 'New KEQ'}</h3>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Question Text</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg border-secondary/30 focus:ring-2 focus:ring-primary focus:border-primary"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Category (optional)</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-secondary/30 focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.orderIndex}
                    onChange={(e) => setForm({ ...form, orderIndex: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-secondary/30 focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Effective Year</label>
                  <input
                    type="number"
                    value={form.effectiveFromYear}
                    onChange={(e) => setForm({ ...form, effectiveFromYear: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-secondary/30 focus:ring-2 focus:ring-primary focus:border-primary"
                    min={2000}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Effective Quarter</label>
                  <select
                    value={form.effectiveFromQuarter}
                    onChange={(e) => setForm({ ...form, effectiveFromQuarter: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-secondary/30 focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value={1}>Q1</option>
                    <option value={2}>Q2</option>
                    <option value={3}>Q3</option>
                    <option value={4}>Q4</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    id="active"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="active" className="text-sm text-secondary">Active</label>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetModal} className="px-4 py-2 rounded-lg border border-secondary/30 text-secondary hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50">
                  {editId ? (updateMut.isPending ? 'Saving...' : 'Save') : (createMut.isPending ? 'Creating...' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
