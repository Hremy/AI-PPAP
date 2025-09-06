import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChartBarIcon, 
  ClockIcon, 
  LightBulbIcon,
  Cog6ToothIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const PerformanceLayout = ({ children }) => {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Performance History',
      href: '/performance/history',
      icon: ChartBarIcon,
      description: 'View historical performance data'
    },
    {
      name: 'Goals',
      href: '/performance/goals',
      icon: ClockIcon,
      description: 'Set and track performance goals'
    },
    {
      name: 'AI Insights',
      href: '/ai/insights',
      icon: LightBulbIcon,
      description: 'Get AI-powered recommendations'
    }
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Performance Portal</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden sm:block">Profile</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <Cog6ToothIcon className="w-5 h-5" />
                <span className="hidden sm:block">Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-3 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                    isActive(item.href)
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600">
                © 2025 AI Performance Portal. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link to="/help" className="text-sm text-gray-600 hover:text-gray-900">
                Help
              </Link>
              <Link to="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy
              </Link>
              <Link to="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PerformanceLayout;
