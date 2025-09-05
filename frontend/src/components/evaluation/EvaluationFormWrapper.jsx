import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import SelfEvaluationForm from './SelfEvaluationForm';

const EvaluationFormWrapper = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold text-secondary mb-4">Sign In Required</h2>
            <p className="text-secondary/70 mb-6">Please sign in to access the evaluation form.</p>
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <SelfEvaluationForm />;
};

export default EvaluationFormWrapper;
