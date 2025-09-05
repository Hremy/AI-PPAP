import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  CpuChipIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  CheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import EvaluationFormWrapper from '../../components/evaluation/EvaluationFormWrapper';

const Features = () => {
  const [showEvaluation, setShowEvaluation] = useState(false);
  
  // Sample features data with icons
  const features = [
    {
      icon: ChartBarIcon,
      title: 'Performance Analytics',
      description: 'Comprehensive performance tracking with real-time analytics and insights.',
      benefits: ['Real-time performance metrics', 'Historical trend analysis', 'Customizable KPIs']
    },
    {
      icon: DocumentTextIcon,
      title: 'Smart Reviews',
      description: 'AI-powered review system with self, manager, and 360° peer reviews.',
      benefits: ['Automated review workflows', 'AI-assisted feedback', 'Multi-source reviews']
    },
    {
      icon: CpuChipIcon,
      title: 'AI Insights',
      description: 'Advanced AI analysis providing personalized recommendations and insights.',
      benefits: ['Sentiment analysis', 'Performance predictions', 'Growth recommendations']
    },
    {
      icon: UserGroupIcon,
      title: 'Team Management',
      description: 'Comprehensive team oversight with collaborative performance management.',
      benefits: ['Team performance tracking', 'Collaborative goal setting', 'Manager dashboards']
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'Bank-level security with role-based access and data protection.',
      benefits: ['Role-based permissions', 'Data encryption', 'Audit trails']
    },
    {
      icon: ArrowTrendingUpIcon,
      title: 'Goal Tracking',
      description: 'Smart goal setting and tracking with automated progress monitoring.',
      benefits: ['SMART goal framework', 'Progress tracking', 'Milestone alerts']
    }
  ];

  const scrollToEvaluation = () => {
    const element = document.getElementById('evaluation-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };
  const renderFeatures = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div 
            key={index} 
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
            <p className="text-gray-600 mb-4 flex-grow">{feature.description}</p>
            <ul className="space-y-2">
              {feature.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl mb-6">
            Transform Your Performance Reviews
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            AI-powered insights to help you and your team excel with data-driven performance management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={scrollToEvaluation}
              className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Start Your Evaluation
            </button>
            <a 
              href="#features"
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need to Succeed</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform combines powerful analytics with intuitive design to transform how you manage performance.
            </p>
          </div>
          {renderFeatures()}
        </div>
      </section>

      {/* Evaluation Section */}
      <section id="evaluation-section" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to evaluate your performance?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Take 10 minutes to complete your self-evaluation and get personalized insights to help you grow professionally.
            </p>
            <button 
              onClick={() => setShowEvaluation(!showEvaluation)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center mx-auto"
            >
              {showEvaluation ? 'Hide Evaluation Form' : 'Start Evaluation'}
              <ArrowRightIcon className={`ml-2 w-5 h-5 transition-transform ${showEvaluation ? 'rotate-90' : ''}`} />
            </button>
            
            {showEvaluation && (
              <div className="mt-12 bg-white p-6 rounded-xl shadow-sm text-left">
                <EvaluationFormWrapper />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your performance reviews?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of professionals who have improved their performance with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Started Free
            </Link>
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Features;
