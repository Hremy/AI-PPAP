import React from 'react';
import AdminLayout from './AdminLayout';
import EvaluationsTable from '../../components/evaluation/EvaluationsTable';

export default function EvaluationsPage() {
  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary">Employee Evaluations</h1>
          <p className="text-secondary/60 mt-1">
            View and manage all employee evaluations
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border">
          <EvaluationsTable />
        </div>
      </div>
    </AdminLayout>
  );
}
