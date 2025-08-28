import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  CpuChipIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  StarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { getFeaturesPageData, isAuthenticated, getCurrentUser } from '../../lib/api';

const Features = () => {
  // Icon mapping for dynamic icon rendering
  const iconMap = {
    'ChartBarIcon': ChartBarIcon,
    'DocumentTextIcon': DocumentTextIcon,
    'CpuChipIcon': CpuChipIcon,
    'UserGroupIcon': UserGroupIcon,
    'ShieldCheckIcon': ShieldCheckIcon,
    'ArrowTrendingUpIcon': ArrowTrendingUpIcon
  };

  // Fetch features page data from API
  const { data: featuresData, isLoading, error } = useQuery({
    queryKey: ['featuresPageData'],
    queryFn: getFeaturesPageData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fallback data in case API fails
  const fallbackFeatures = [
    {
      icon: 'ChartBarIcon',
      title: 'Performance Analytics',
      description: 'Comprehensive performance tracking with real-time analytics and insights.',
      benefits: ['Real-time performance metrics', 'Historical trend analysis', 'Customizable KPIs', 'Interactive dashboards']
    },
    {
      icon: 'DocumentTextIcon',
      title: 'Smart Reviews',
      description: 'AI-powered review system with self, manager, and 360° peer reviews.',
      benefits: ['Automated review workflows', 'AI-assisted feedback', 'Multi-source reviews', 'Review templates']
    },
    {
      icon: 'CpuChipIcon',
      title: 'AI Insights',
      description: 'Advanced AI analysis providing personalized recommendations and insights.',
      benefits: ['Sentiment analysis', 'Performance predictions', 'Growth recommendations', 'Skill gap analysis']
    },
    {
      icon: 'UserGroupIcon',
      title: 'Team Management',
      description: 'Comprehensive team oversight with collaborative performance management.',
      benefits: ['Team performance tracking', 'Collaborative goal setting', 'Team comparisons', 'Manager dashboards']
    },
    {
      icon: 'ShieldCheckIcon',
      title: 'Enterprise Security',
      description: 'Bank-level security with role-based access and data protection.',
      benefits: ['Role-based permissions', 'Data encryption', 'Audit trails', 'Compliance ready']
    },
    {
      icon: 'ArrowTrendingUpIcon',
      title: 'Goal Tracking',
      description: 'Smart goal setting and tracking with automated progress monitoring.',
      benefits: ['SMART goal framework', 'Progress tracking', 'Milestone alerts', 'Achievement analytics']
    }
  ];

  // Role-based highlights (fallback)
  const fallbackRoleHighlights = {
    employee: [
      'Personal performance dashboard',
      'Self-reviews with AI assistance',
      'Goal tracking and progress',
      'Performance history & trends'
    ],
    manager: [
      'Team performance dashboard',
      'Manager evaluations & feedback',
      'Review cycle management',
      'Talent insights & coaching tips'
    ],
    admin: [
      'Organization-wide analytics',
      'User & role management',
      'KPI and workflow configuration',
      'Security & compliance controls'
    ]
  };

  // Security badges (fallback)
  const fallbackSecurityBadges = [
    'Role-based access control',
    'Audit trails',
    'Encryption in transit',
    'JWT-based authentication',
    'Compliance ready'
  ];

  // Customer logos (emoji placeholders)
  const fallbackCustomerLogos = ['🏢', '🏬', '🏭', '🏦', '🏨', '🏫'];

  // FAQ (fallback)
  const fallbackFaq = [
    { q: 'How are roles handled?', a: 'We use role-based access control (Employee, Manager, Admin) with JWT auth.' },
    { q: 'Can we customize KPIs?', a: 'Yes. Admins can define KPIs, weights, and evaluation criteria.' },
    { q: 'Do you support peer reviews?', a: 'Yes. 360°/peer reviews are supported as part of review workflows.' },
    { q: 'Is our data secure?', a: 'Traffic is protected and actions are logged. Enterprise security best practices are followed.' },
    { q: 'Does it integrate with our tools?', a: 'We support common tools (Slack, Google Workspace, Jira, Salesforce, and more).'}
  ];

  // UI state for role tabs
  const [activeRole, setActiveRole] = useState('employee');

  const fallbackIntegrations = [
    { name: 'Slack', logo: '💬' },
    { name: 'Microsoft Teams', logo: '👥' },
    { name: 'Google Workspace', logo: '📧' },
    { name: 'Jira', logo: '🎯' },
    { name: 'Salesforce', logo: '☁️' },
    { name: 'Workday', logo: '💼' }
  ];

  const fallbackWorkflowSteps = [
    {
      stepNumber: 1,
      title: 'Collect Data',
      description: 'Gather performance data through self-reviews, manager evaluations, and peer feedback with our intelligent forms.'
    },
    {
      stepNumber: 2,
      title: 'AI Analysis',
      description: 'Our AI engine analyzes feedback, identifies patterns, and generates insights to understand performance trends.'
    },
    {
      stepNumber: 3,
      title: 'Drive Results',
      description: 'Get actionable recommendations, track progress, and make data-driven decisions to improve performance.'
    }
  ];

  // Use API data if available, otherwise fallback to static data
  const features = featuresData?.features || fallbackFeatures;
  const integrations = featuresData?.integrations || fallbackIntegrations;
  const workflowSteps = featuresData?.workflowSteps || fallbackWorkflowSteps;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary/70">Loading features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-secondary font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-secondary">AI-PPAP</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/features" className="text-primary font-medium px-3 py-2 rounded-md text-sm transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Pricing
              </Link>
              <Link to="/about" className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                About
              </Link>
              {isAuthenticated() ? (
                <>
                  <Link to="/profile" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-secondary/5 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {(getCurrentUser()?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-secondary/80 max-w-[180px] truncate">
                      {getCurrentUser()?.email}
                    </span>
                  </Link>
                  <Link to="/logout" className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Logout
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="bg-primary text-secondary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all transform hover:scale-105 shadow-md">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
            Powerful Features for Modern
            <span className="text-primary"> Performance Management</span>
          </h1>
          <p className="text-xl text-secondary/70 mb-8 max-w-3xl mx-auto">
            Discover how AI-PPAP transforms traditional performance reviews into intelligent, 
            data-driven insights that drive real business results.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || ChartBarIcon;
              return (
                <div key={feature.id || index} className="bg-background rounded-2xl p-8 border border-primary/10">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
                        <IconComponent className="w-6 h-6 text-secondary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-secondary mb-3">{feature.title}</h3>
                      <p className="text-secondary/70 mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center space-x-2">
                            <CheckIcon className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-sm text-secondary/80">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role-Based Highlights */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Built for Every Role</h2>
            <p className="text-secondary/70">Tailored experiences for employees, managers, and administrators.</p>
          </div>
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-primary/20 p-1 flex">
              {['employee','manager','admin'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setActiveRole(role)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeRole === role ? 'bg-primary text-secondary shadow-sm' : 'text-secondary/70 hover:text-secondary'
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-primary/10 p-8">
            <ul className="grid md:grid-cols-2 gap-3">
              {(fallbackRoleHighlights[activeRole] || []).map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckIcon className="w-4 h-4 mt-1 text-primary" />
                  <span className="text-secondary/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Actionable Analytics</h2>
            <p className="text-secondary/70">Get a snapshot of performance with intuitive KPIs and trends.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[{label:'Overall Score',value:'86%'},{label:'On-time Reviews',value:'92%'},{label:'Goal Progress',value:'74%'},{label:'Engagement',value:'88%'}].map((kpi, i) => (
              <div key={i} className="bg-background rounded-xl p-6 border border-primary/10">
                <p className="text-secondary/70 text-sm mb-2">{kpi.label}</p>
                <p className="text-2xl font-bold text-secondary">{kpi.value}</p>
                <div className="mt-4 h-2 bg-white rounded-full overflow-hidden border border-primary/10">
                  <div className="h-full bg-primary" style={{ width: kpi.value }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              How AI-PPAP Works
            </h2>
            <p className="text-xl text-secondary/70 max-w-2xl mx-auto">
              Simple, intelligent, and effective performance management in three steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {workflowSteps.map((step, index) => (
              <div key={step.id || index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-6">
                  <span className="text-2xl font-bold text-secondary">{step.stepNumber}</span>
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">{step.title}</h3>
                <p className="text-secondary/70">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Seamless Integrations
          </h2>
          <p className="text-xl text-secondary/70 mb-12 max-w-2xl mx-auto">
            Connect AI-PPAP with your existing tools and workflows for a unified experience.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {integrations.map((integration, index) => (
              <div key={integration.id || index} className="flex flex-col items-center p-6 bg-background rounded-xl border border-primary/10 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{integration.logo}</div>
                <span className="text-sm font-medium text-secondary">{integration.name}</span>
                {integration.description && (
                  <p className="text-xs text-secondary/60 mt-2 text-center">{integration.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Enterprise-grade Security</h2>
            <p className="text-secondary/70">Protect data with robust controls and best practices.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {fallbackSecurityBadges.map((badge, i) => (
              <div key={i} className="bg-white rounded-xl border border-primary/10 p-4 text-center">
                <span className="text-sm font-medium text-secondary">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Logos */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-80">
            {fallbackCustomerLogos.map((logo, i) => (
              <div key={i} className="text-4xl">{logo}</div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Frequently Asked Questions</h2>
            <p className="text-secondary/70">Answers to the most common questions.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {fallbackFaq.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-primary/10 p-6">
                <h3 className="font-semibold text-secondary mb-2">{item.q}</h3>
                <p className="text-secondary/70 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
            Ready to Transform Your Performance Management?
          </h2>
          <p className="text-xl text-secondary/80 mb-8">
            Join thousands of companies using AI-PPAP to drive better results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-secondary px-8 py-4 rounded-xl text-lg font-semibold hover:bg-secondary/5 transition-colors flex items-center justify-center space-x-2 shadow-md"
            >
              <span>Start Free Trial</span>
            </Link>
            <Link 
              to="/pricing" 
              className="border-2 border-secondary text-secondary px-8 py-4 rounded-xl text-lg font-semibold hover:bg-secondary hover:text-white transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-secondary font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold">AI-PPAP</span>
            </div>
            <p className="text-white/70 mb-4">
              AI-Powered Performance & Productivity Assessment Platform
            </p>
            <div className="border-t border-white/20 pt-4">
              <p className="text-white/70">&copy; 2025 AI-PPAP. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features;
