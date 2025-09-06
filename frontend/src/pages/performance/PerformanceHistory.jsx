import React, { useEffect, useState } from 'react';
import { ChartBarIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { getEvaluations } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import PerformanceLayout from '../../components/layout/PerformanceLayout';

const PerformanceHistory = () => {
  const { currentUser } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        const data = await getEvaluations();
        // Filter evaluations for current user if employee role
        const userEvaluations = currentUser?.roles?.includes('EMPLOYEE') 
          ? data.filter(evaluation => evaluation.employeeEmail === currentUser.email)
          : data;
        setEvaluations(userEvaluations || []);
      } catch (e) {
        setError(e?.message || 'Failed to load performance history');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [currentUser]);

  // Group evaluations by year and quarter
  const yearlyData = evaluations.reduce((acc, evaluation) => {
    const year = new Date(evaluation.createdAt).getFullYear();
    const quarter = Math.ceil((new Date(evaluation.createdAt).getMonth() + 1) / 3);
    
    if (!acc[year]) {
      acc[year] = {
        quarters: {},
        evaluations: [evaluation]
      };
    } else {
      acc[year].evaluations.push(evaluation);
    }
    
    if (!acc[year].quarters[quarter]) {
      acc[year].quarters[quarter] = {
        evaluations: [evaluation]
      };
    } else {
      acc[year].quarters[quarter].evaluations.push(evaluation);
    }
    
    return acc;
  }, {});

  const years = Object.keys(yearlyData).sort((a, b) => b - a);
  const currentYearData = yearlyData[selectedYear] || {};

  const calculateTrend = (currentRating, previousRating) => {
    if (!previousRating) return null;
    const diff = currentRating - previousRating;
    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
      value: Math.abs(diff).toFixed(1)
    };
  };

  const QuarterCard = ({ quarter, evaluations }) => {
    const avgEmployeeRating = evaluations.reduce((sum, evaluation) => sum + (evaluation.overallRating || 0), 0) / evaluations.length;
    const avgManagerRating = evaluations.reduce((sum, evaluation) => sum + (evaluation.managerRating || 0), 0) / evaluations.length;

    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Q{quarter} {selectedYear}</h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Avg Employee Rating</p>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={`text-lg ${star <= avgEmployeeRating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
              ))}
              <span className="ml-2 text-sm font-medium">{avgEmployeeRating.toFixed(1)}</span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Avg Manager Rating</p>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={`text-lg ${star <= avgManagerRating ? 'text-blue-400' : 'text-gray-300'}`}>★</span>
              ))}
              <span className="ml-2 text-sm font-medium">{avgManagerRating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            {evaluations.map(evaluation => (
              <div key={evaluation.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{evaluation.projectName}</span>
                <span className="text-gray-900 font-medium">{new Date(evaluation.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <PerformanceLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Performance History</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Track your performance trends over time</p>
        </div>

        {loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading performance history...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Year Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Select Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quarterly Breakdown */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900">{selectedYear} Quarterly Performance</h2>
                <p className="text-gray-600 mt-1">Performance breakdown by quarter</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(quarter => {
                  const quarterData = currentYearData.quarters?.[quarter];
                  if (!quarterData) {
                    return (
                      <div key={quarter} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                        <h4 className="text-lg font-semibold text-gray-500 mb-3">Q{quarter} {selectedYear}</h4>
                        <p className="text-gray-400 text-sm">No evaluations</p>
                      </div>
                    );
                  }
                  return <QuarterCard key={quarter} quarter={quarter} evaluations={quarterData.evaluations} />;
                })}
              </div>
            </div>

            {/* Performance Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Performance Timeline</h3>
                <p className="text-gray-600 mt-1">Chronological view of your evaluations</p>
              </div>
              
              <div className="space-y-4">
                {evaluations
                  .filter(evaluation => new Date(evaluation.createdAt).getFullYear() === selectedYear)
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((evaluation, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {evaluation.overallRating || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{evaluation.employeeName}</p>
                          <p className="text-sm text-gray-500">{new Date(evaluation.createdAt).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">Project: {evaluation.projectName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm text-gray-600">Employee:</span>
                          <span className="font-medium text-gray-900">{evaluation.overallRating || 'N/A'}/5</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Manager:</span>
                          <span className="font-medium text-gray-900">{evaluation.managerRating || 'N/A'}/5</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        evaluation.status === 'REVIEWED' ? 'bg-green-100 text-green-800' :
                        evaluation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {evaluation.status}
                      </span>
                    </div>
                  ))}
                
                {evaluations.filter(evaluation => new Date(evaluation.createdAt).getFullYear() === selectedYear).length === 0 && (
                  <div className="text-center py-8">
                    <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No evaluations found for {selectedYear}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </PerformanceLayout>
  );
};

export default PerformanceHistory;
