import React, { useEffect, useState } from 'react';
import { ChartBarIcon, UserGroupIcon, TrophyIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { getManagerAnalytics } from '../../lib/api';

const StatCard = ({ icon: Icon, title, value, subtitle }) => (
  <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </div>
  </div>
);

const BarChart = ({ title, data }) => {
  const total = (data || []).reduce((sum, d) => sum + (d.count || 0), 0);
  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-3">
        {(data || []).map((d, idx) => {
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>{d.label}</span>
                <span>{d.count} ({pct}%)</span>
              </div>
              <div className="h-3 bg-gray-100 rounded">
                <div className="h-3 bg-primary/60 rounded" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
        {(!data || data.length === 0) && (
          <div className="h-64 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
            No data
          </div>
        )}
      </div>
    </div>
  );
};

const Heatmap = ({ title, data }) => {
  const max = Math.max(1, ...((data || []).map(d => d.average || 0)));
  const color = (v) => {
    const ratio = Math.min(1, (v || 0) / max);
    const alpha = 0.15 + ratio * 0.6; // 0.15..0.75
    return `rgba(37, 99, 235, ${alpha})`;
  };
  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {(data || []).map((row, i) => (
          <div key={i} className="rounded-lg p-3 border border-gray-100" style={{ background: color(row.average) }}>
            <div className="text-sm font-medium text-gray-900">{row.competency}</div>
            <div className="text-xs text-gray-700">Avg {Number(row.average || 0).toFixed(1)} / 5</div>
          </div>
        ))}
        {(!data || data.length === 0) && (
          <div className="col-span-full h-64 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
            No data
          </div>
        )}
      </div>
    </div>
  );
};

const ManagerAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    averageTeamRating: 0,
    activeTeamMembers: 0,
    topPerformers: 0,
    onTrackGoals: 0,
    totalEvaluations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getManagerAnalytics();
        if (mounted) setAnalytics(data || {});
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load analytics');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Analytics</h1>
          <p className="text-gray-500 mt-1">Insights across evaluations, performance and trends</p>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-600">Loading analytics…</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={ChartBarIcon} 
          title="Average Team Rating" 
          value={analytics.averageTeamRating > 0 ? `${analytics.averageTeamRating.toFixed(1)} / 5` : "No data"} 
          subtitle="Combined employee & manager ratings" 
        />
        <StatCard 
          icon={UserGroupIcon} 
          title="Active Team Members" 
          value={String(analytics.activeTeamMembers)} 
          subtitle="With evaluations" 
        />
        <StatCard 
          icon={ArrowTrendingUpIcon} 
          title="On-track Goals" 
          value={analytics.onTrackGoals > 0 ? `${analytics.onTrackGoals}%` : "0%"} 
          subtitle="Combined rating ≥ 3.0" 
        />
        <StatCard 
          icon={TrophyIcon} 
          title="Top Performers" 
          value={String(analytics.topPerformers)} 
          subtitle="Combined rating 4.5+" 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart title="Ratings Distribution" data={analytics.ratingsDistribution} />
        <Heatmap title="Competency Heatmap" data={analytics.competencyAverages} />
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Team Activity</h3>
          <span className="text-xs text-gray-500">last 10</span>
        </div>
        {(analytics.recentActivity && analytics.recentActivity.length > 0) ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4">Project</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentActivity.map((a, i) => {
                  const ts = a.updatedAt || a.reviewedAt || a.submittedAt || null;
                  const tsStr = ts ? new Date(ts).toLocaleString() : '';
                  return (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="py-2 pr-4">{a.employeeName || '-'}</td>
                      <td className="py-2 pr-4">{a.projectName || '-'}</td>
                      <td className="py-2 pr-4">{a.status || '-'}</td>
                      <td className="py-2 pr-4">{tsStr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-40 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerAnalytics;
