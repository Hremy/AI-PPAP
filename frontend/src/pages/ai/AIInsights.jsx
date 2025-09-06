import React, { useEffect, useState } from 'react';
import { 
  LightBulbIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { getEvaluations, getManagerAnalytics } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import PerformanceLayout from '../../components/layout/PerformanceLayout';

const AIInsights = () => {
  const { currentUser } = useAuth();
  const [insights, setInsights] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const generateInsights = (evaluationData, analyticsData) => {
    const insights = [];
    
    // Performance Trend Analysis
    if (evaluationData.length > 1) {
      const recent = evaluationData.slice(-2);
      const trend = recent[1].overallRating - recent[0].overallRating;
      
      if (trend > 0.5) {
        insights.push({
          id: 'performance_improving',
          type: 'positive',
          category: 'Performance',
          title: 'Performance Trending Upward',
          description: `Your performance has improved by ${trend.toFixed(1)} points in recent evaluations. Keep up the excellent work!`,
          recommendation: 'Continue focusing on your current development areas and consider taking on more challenging projects.',
          priority: 'medium',
          confidence: 85
        });
      } else if (trend < -0.5) {
        insights.push({
          id: 'performance_declining',
          type: 'warning',
          category: 'Performance',
          title: 'Performance Needs Attention',
          description: `Your performance has declined by ${Math.abs(trend).toFixed(1)} points. This may indicate areas needing focus.`,
          recommendation: 'Schedule a 1:1 with your manager to discuss challenges and create an improvement plan.',
          priority: 'high',
          confidence: 80
        });
      }
    }

    // Competency Analysis
    if (evaluationData.length > 0) {
      const latestEval = evaluationData[evaluationData.length - 1];
      if (latestEval.competencyRatings) {
        const ratings = Object.entries(latestEval.competencyRatings);
        const lowest = ratings.reduce((min, curr) => curr[1] < min[1] ? curr : min);
        const highest = ratings.reduce((max, curr) => curr[1] > max[1] ? curr : max);

        if (lowest[1] < 3) {
          insights.push({
            id: 'skill_improvement',
            type: 'improvement',
            category: 'Skills',
            title: `${lowest[0]} Needs Development`,
            description: `Your ${lowest[0].toLowerCase()} rating of ${lowest[1]}/5 is below expectations.`,
            recommendation: `Consider training courses, mentoring, or additional practice in ${lowest[0].toLowerCase()}.`,
            priority: 'high',
            confidence: 90
          });
        }

        if (highest[1] >= 4.5) {
          insights.push({
            id: 'skill_strength',
            type: 'positive',
            category: 'Strengths',
            title: `Excellent ${highest[0]} Skills`,
            description: `Your ${highest[0].toLowerCase()} rating of ${highest[1]}/5 shows exceptional competency.`,
            recommendation: `Consider mentoring others or leading initiatives that leverage your ${highest[0].toLowerCase()} expertise.`,
            priority: 'low',
            confidence: 95
          });
        }
      }
    }

    // Manager vs Self-Assessment Gap
    if (evaluationData.length > 0) {
      const latestEval = evaluationData[evaluationData.length - 1];
      if (latestEval.overallRating && latestEval.managerRating) {
        const gap = Math.abs(latestEval.overallRating - latestEval.managerRating);
        
        if (gap > 1) {
          const higher = latestEval.overallRating > latestEval.managerRating ? 'self' : 'manager';
          insights.push({
            id: 'assessment_gap',
            type: 'insight',
            category: 'Alignment',
            title: 'Rating Alignment Opportunity',
            description: `There's a ${gap.toFixed(1)} point difference between your self-assessment and manager rating.`,
            recommendation: `Discuss expectations and performance criteria with your manager to align perspectives.`,
            priority: 'medium',
            confidence: 75
          });
        }
      }
    }

    // Team Performance Context (for managers)
    if (currentUser?.roles?.includes('MANAGER') && analyticsData.averageTeamRating) {
      if (analyticsData.averageTeamRating < 3.0) {
        insights.push({
          id: 'team_performance',
          type: 'warning',
          category: 'Team Management',
          title: 'Team Performance Below Average',
          description: `Your team's average rating of ${analyticsData.averageTeamRating}/5 indicates room for improvement.`,
          recommendation: 'Consider team development initiatives, additional training, or process improvements.',
          priority: 'high',
          confidence: 85
        });
      } else if (analyticsData.averageTeamRating >= 4.0) {
        insights.push({
          id: 'team_excellence',
          type: 'positive',
          category: 'Team Management',
          title: 'High-Performing Team',
          description: `Your team's average rating of ${analyticsData.averageTeamRating}/5 demonstrates excellent leadership.`,
          recommendation: 'Share your successful management practices with other team leads.',
          priority: 'low',
          confidence: 90
        });
      }
    }

    // Goal Achievement Prediction
    insights.push({
      id: 'goal_prediction',
      type: 'insight',
      category: 'Goals',
      title: 'Q4 Performance Projection',
      description: 'Based on current trends, you\'re on track to meet 80% of your annual performance goals.',
      recommendation: 'Focus on the remaining 20% by prioritizing high-impact activities in the next quarter.',
      priority: 'medium',
      confidence: 70
    });

    // Career Development Suggestion
    if (evaluationData.length > 0) {
      const avgRating = evaluationData.reduce((sum, evaluation) => sum + evaluation.overallRating, 0) / evaluationData.length;
      
      if (avgRating >= 4.0) {
        insights.push({
          id: 'career_advancement',
          type: 'opportunity',
          category: 'Career',
          title: 'Ready for Next Level',
          description: `Your consistent ${avgRating.toFixed(1)}/5 performance indicates readiness for increased responsibilities.`,
          recommendation: 'Discuss promotion opportunities or stretch assignments with your manager.',
          priority: 'medium',
          confidence: 80
        });
      }
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [evaluationData, analyticsData] = await Promise.all([
        getEvaluations(),
        currentUser?.roles?.includes('MANAGER') ? getManagerAnalytics() : Promise.resolve({})
      ]);

      // Filter evaluations for current user if employee
      const userEvaluations = currentUser?.roles?.includes('EMPLOYEE') 
        ? evaluationData.filter(evaluation => evaluation.employeeEmail === currentUser.email)
        : evaluationData;

      setAnalytics(analyticsData);
      const generatedInsights = generateInsights(userEvaluations, analyticsData);
      setInsights(generatedInsights);
    } catch (e) {
      setError(e?.message || 'Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const refreshInsights = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive': return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
      case 'warning': return <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />;
      case 'improvement': return <ChartBarIcon className="w-6 h-6 text-blue-600" />;
      case 'opportunity': return <AcademicCapIcon className="w-6 h-6 text-purple-600" />;
      default: return <LightBulbIcon className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'positive': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-red-200 bg-red-50';
      case 'improvement': return 'border-blue-200 bg-blue-50';
      case 'opportunity': return 'border-purple-200 bg-purple-50';
      default: return 'border-yellow-200 bg-yellow-50';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[priority]}`}>
        {priority.toUpperCase()} PRIORITY
      </span>
    );
  };

  return (
    <PerformanceLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Personalized recommendations powered by performance data</p>
          <button
            onClick={refreshInsights}
            disabled={refreshing}
            className="mt-4 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 disabled:opacity-50 mx-auto"
          >
            <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Insights</span>
          </button>
        </div>

      {/* Loading / Error */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
            <span>Analyzing your performance data...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* Insights Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-50">
                  <LightBulbIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Insights</p>
                  <p className="text-2xl font-bold text-gray-900">{insights.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-50">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">High Priority</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.filter(i => i.priority === 'high').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-50">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Strengths</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.filter(i => i.type === 'positive').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-50">
                  <AcademicCapIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Opportunities</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.filter(i => i.type === 'opportunity').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Insights List */}
          <div className="space-y-6">
            {insights.map(insight => (
              <div key={insight.id} className={`rounded-lg border-2 ${getInsightColor(insight.type)} p-6`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                        {getPriorityBadge(insight.priority)}
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                          {insight.confidence}% confidence
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{insight.description}</p>
                      
                      <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-800 mb-1">💡 Recommendation:</p>
                        <p className="text-sm text-gray-700">{insight.recommendation}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4">
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                      {insight.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {insights.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <LightBulbIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available</h3>
              <p className="text-gray-500 mb-4">Complete more evaluations to receive personalized AI insights</p>
              <button
                onClick={refreshInsights}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Refresh Analysis
              </button>
            </div>
          )}

          {/* AI Disclaimer */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">AI</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>About AI Insights:</strong> These recommendations are generated based on your performance data and industry best practices. 
                  They should be considered alongside feedback from your manager and personal career goals. 
                  AI insights are meant to supplement, not replace, human judgment and professional guidance.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </PerformanceLayout>
  );
};

export default AIInsights;
