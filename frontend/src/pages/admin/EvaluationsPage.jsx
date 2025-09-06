import React, { useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import ScoreBasedEvaluationTable from '../../components/evaluation/ScoreBasedEvaluationTable';
import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '../../lib/api';

export default function EvaluationsPage() {
  const [selectedIds, setSelectedIds] = useState([]);
  const { data: projects = [] } = useQuery({
    queryKey: ['projects','list'],
    queryFn: fetchProjects,
  });

  const projectOptions = useMemo(() => Array.isArray(projects) ? projects : [], [projects]);

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary">Employee Evaluations</h1>
          <p className="text-secondary/60 mt-1">
            View all employee evaluations. Admin is read-only.
          </p>
        </div>

        {/* Project Filter */}
        <div className="bg-white rounded-lg shadow-sm border mb-4 p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm font-medium text-secondary/80">Filter by Project:</label>
            <select
              className="px-3 py-2 border rounded-md text-sm min-w-[240px]"
              value={selectedIds[0] || ''}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedIds(val ? [Number(val)] : []);
              }}
            >
              <option value="">All Projects</option>
              {projectOptions.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <ScoreBasedEvaluationTable selectedProjectIds={selectedIds} showOnlyReviewed={true} />
        </div>
      </div>
    </AdminLayout>
  );
}
