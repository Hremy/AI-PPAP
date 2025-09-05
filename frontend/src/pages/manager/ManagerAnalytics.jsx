import React from 'react';
import { ChartBarIcon, UserGroupIcon, TrophyIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

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

const PlaceholderChart = ({ title }) => (
  <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">demo</span>
    </div>
    <div className="h-64 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
      Chart coming soon
    </div>
  </div>
);

const ManagerAnalytics = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Analytics</h1>
          <p className="text-gray-500 mt-1">Insights across evaluations, performance and trends</p>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={ChartBarIcon} title="Average Team Rating" value="4.2 / 5" subtitle="Last 30 days" />
        <StatCard icon={UserGroupIcon} title="Active Team Members" value="12" subtitle="Contributed in this period" />
        <StatCard icon={ArrowTrendingUpIcon} title="On-track Goals" value="68%" subtitle="Quarter to date" />
        <StatCard icon={TrophyIcon} title="Top Performers" value="3" subtitle=": rated 4.5+" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlaceholderChart title="Ratings Distribution" />
        <PlaceholderChart title="Competency Heatmap" />
      </div>

      {/* Table placeholder */}
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Team Activity</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">demo</span>
        </div>
        <div className="h-40 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
          Activity list coming soon
        </div>
      </div>
    </div>
  );
};

export default ManagerAnalytics;
