import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '../../lib/api';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (error) => {
      setErrors({
        general: error.response?.data?.message || 'Failed to send reset email. Please try again.'
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email' });
      return;
    }

    forgotPasswordMutation.mutate({ email });
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="h-8 w-8 text-secondary" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-secondary">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-secondary/70">
              We've sent a password reset link to <span className="font-medium text-secondary">{email}</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-secondary/20 p-6">
            <div className="text-center">
              <EnvelopeIcon className="mx-auto h-12 w-12 text-secondary/50" />
              <h3 className="mt-2 text-sm font-medium text-secondary">Reset link sent</h3>
              <p className="mt-1 text-sm text-secondary/70">
                Click the link in your email to reset your password. The link will expire in 1 hour.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                >
                  Send another email
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link 
              to="/login" 
              className="font-medium text-primary hover:text-primary/80 transition-colors duration-200"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
            <svg className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-secondary">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-secondary/70">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleChange}
              className={`appearance-none relative block w-full px-3 py-3 border rounded-lg placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                errors.email ? 'border-error focus:ring-error focus:border-error' : 'border-secondary/30'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-error">{errors.email}</p>
            )}
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="bg-error/10 border border-error/30 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-error" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-error">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {forgotPasswordMutation.isPending ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </div>
            ) : (
              'Send reset link'
            )}
          </button>

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-secondary/70">
              Remember your password?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors duration-200">
                Sign in
              </Link>
            </p>
            <p className="text-sm text-secondary/70">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:text-primary/80 transition-colors duration-200">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
