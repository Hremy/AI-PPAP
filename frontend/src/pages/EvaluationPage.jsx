import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SelfEvaluationForm from '../components/evaluation/SelfEvaluationForm';

const EvaluationPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    // Go back if possible, else to dashboard
    if (window.history.length > 1) navigate(-1);
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen">
      {/* Dimmed backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-lg font-bold text-secondary">AI-PPPA</span>
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-sm text-gray-700 font-medium">Performance Evaluation</span>
            </div>
            <button
              onClick={handleClose}
              className="rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Modal content */}
          <div className="max-h-[85vh] overflow-y-auto">
            <SelfEvaluationForm />
          </div>
        </div>
      </div>
    </div>
  );
}
;

export default EvaluationPage;
