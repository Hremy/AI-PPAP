import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { verifyEmail, resendVerificationEmail } from '../../lib/api';
import { CheckCircleIcon, XMarkIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [isVerified, setIsVerified] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify email on component mount
  useEffect(() => {
    if (!token) {
      setError('Verification link is missing. Please check your email for the complete link.');
      setIsLoading(false);
      return;
    }

    verifyEmail(token)
      .then(() => {
        setIsVerified(true);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Email verification failed. Please try again.');
        setIsVerified(false);
        setIsLoading(false);
      });
  }, [token]);

  const resendMutation = useMutation({
    mutationFn: resendVerificationEmail,
    onSuccess: () => {
      // Show success message
      alert('Verification email sent! Please check your inbox.');
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to resend verification email.');
    }
  });

  const handleResend = () => {
    if (email) {
      resendMutation.mutate({ email });
    } else {
      setError('Email address not found. Please try registering again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Email verified!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your email has been successfully verified. You can now sign in to your account.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Welcome to AI-PPAP!</h3>
              <p className="text-sm text-gray-500">
                Your account is now active and ready to use. You can start managing your PPAP documents.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
            <XMarkIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verification failed
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We couldn't verify your email address. Please try again.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">What happened?</h3>
            <p className="mt-1 text-sm text-gray-500 mb-4">
              {error || 'The verification link may have expired or is invalid.'}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {resendMutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Resend verification email'
                )}
              </button>
              
              <Link 
                to="/register" 
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Register with different email
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link 
            to="/login" 
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
