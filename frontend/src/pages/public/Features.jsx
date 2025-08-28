import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  CpuChipIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  CheckIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import SelfEvaluationForm from '../../components/evaluation/SelfEvaluationForm';

const Features = () => {
  const [activeTab, setActiveTab] = useState('evaluation');
  
  // Icon mapping for dynamic icon rendering
  const iconMap = {
    'ChartBarIcon': ChartBarIcon,
    'DocumentTextIcon': DocumentTextIcon,
    'CpuChipIcon': CpuChipIcon,
    'UserGroupIcon': UserGroupIcon,
    'ShieldCheckIcon': ShieldCheckIcon,
    'ArrowTrendingUpIcon': ArrowTrendingUpIcon
  };

  // Sample features data
  const features = [
    {
      icon: 'ChartBarIcon',
      title: 'Performance Analytics',
      description: 'Comprehensive performance tracking with real-time analytics and insights.',
      benefits: ['Real-time performance metrics', 'Historical trend analysis', 'Customizable KPIs']
    },
    {
      icon: 'DocumentTextIcon',
      title: 'Smart Reviews',
      description: 'AI-powered review system with self, manager, and 360° peer reviews.',
      benefits: ['Automated review workflows', 'AI-assisted feedback', 'Multi-source reviews']
    },
    {
      icon: 'CpuChipIcon',
      title: 'AI Insights',
      description: 'Advanced AI analysis providing personalized recommendations and insights.',
      benefits: ['Sentiment analysis', 'Performance predictions', 'Growth recommendations']
    },
    {
      icon: 'UserGroupIcon',
      title: 'Team Management',
      description: 'Comprehensive team oversight with collaborative performance management.',
      benefits: ['Team performance tracking', 'Collaborative goal setting', 'Manager dashboards']
    },
    {
      icon: 'ShieldCheckIcon',
      title: 'Enterprise Security',
      description: 'Bank-level security with role-based access and data protection.',
      benefits: ['Role-based permissions', 'Data encryption', 'Audit trails']
    },
    {
      icon: 'ArrowTrendingUpIcon',
      title: 'Goal Tracking',
      description: 'Smart goal setting and tracking with automated progress monitoring.',
      benefits: ['SMART goal framework', 'Progress tracking', 'Milestone alerts']
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'evaluation':
        return (
          <div className="py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-secondary mb-6">Self-Evaluation</h2>
              <SelfEvaluationForm />
            </div>
          </div>
        );
      
      case 'features':
      default:
        return (
          <div className="space-y-20 py-12">
            {/* Hero Section */}
            <section>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-secondary sm:text-5xl lg:text-6xl">
                  AI-Powered Performance Analysis
                </h1>
                <p className="mt-6 max-w-3xl mx-auto text-xl text-secondary/70">
                  Transform your performance management with our intelligent platform.
                </p>
              </div>
            </section>

            {/* Features Grid */}
            <section className="bg-white py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-secondary mb-12">Key Features</h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature, index) => {
                    const Icon = iconMap[feature.icon] || ChartBarIcon;
                    return (
                      <div key={index} className="bg-background rounded-xl p-6 border border-primary/10 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-secondary mb-2">{feature.title}</h3>
                        <p className="text-secondary/70 mb-4">{feature.description}</p>
                        <ul className="space-y-2">
                          {feature.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start">
                              <CheckIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-secondary/80">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Navigation */}
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
              <Link 
                to="/features" 
                className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link
                to="/login"
                className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Tabs Navigation - Full Width */}
      <div className="bg-white border-b border-secondary/10 w-full">
        <div className="w-full">
          <div className="flex w-full">
            <button
              onClick={() => setActiveTab('features')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex-1 text-center justify-center ${
                activeTab === 'features'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-secondary/60 hover:text-secondary/80 hover:border-secondary/30'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ChartBarIcon className="w-5 h-5" />
                <span>Features</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('evaluation')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex-1 text-center justify-center ${
                activeTab === 'evaluation'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-secondary/60 hover:text-secondary/80 hover:border-secondary/30'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ClipboardDocumentCheckIcon className="w-5 h-5" />
                <span>Self-Evaluation</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="min-h-[calc(100vh-64px)]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Features;
