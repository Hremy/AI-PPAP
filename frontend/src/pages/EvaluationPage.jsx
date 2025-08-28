import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../lib/api';
import EvaluationForm from '../components/EvaluationForm';

const EvaluationPage = () => {
  return (
    <div className="min-h-screen bg-white">
r      {/* Navigation - Using Global Colors */}
      <nav className="bg-primary/90 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-xl font-bold text-secondary">
                  AI-PPAP
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/evaluation" 
                className="text-secondary font-medium px-3 py-2 rounded-md text-sm transition-colors bg-white/20"
              >
                Evaluation
              </Link>
              <Link 
                to="/about" 
                className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </Link>

              {isAuthenticated() ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/profile" 
                    className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/logout" 
                    className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-secondary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/90 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Using Global Colors */}
      <div className="bg-primary text-secondary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Performance Evaluation</h1>
          <p className="text-xl text-secondary/80 max-w-3xl mx-auto">
            Complete the form below to evaluate team performance and provide valuable feedback.
          </p>
        </div>
      </div>

      {/* Evaluation Form Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <EvaluationForm />
        </div>
      </div>
    </div>
  );
};

export default EvaluationPage;
