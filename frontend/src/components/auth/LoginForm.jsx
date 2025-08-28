import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../../lib/api';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    loginAs: 'employee'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Normalize role to always include ROLE_ prefix
      const normalizedRole = data.role?.startsWith('ROLE_') ? data.role : `ROLE_${data.role}`;

      // Map selected toggle to expected backend role
      const expectedByToggle = {
        employee: 'ROLE_EMPLOYEE',
        manager: 'ROLE_MANAGER',
        admin: 'ROLE_ADMIN',
      }[formData.loginAs];

      // Enforce that selected role matches backend-provided role
      if (normalizedRole !== expectedByToggle) {
        setErrors({
          general: 'Incorrect role selected for this account. Please choose the correct role and try again.',
        });
        return; // Do not persist token/user or navigate
      }

      // Store token and user only after role check passes
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        email: data.email,
        role: normalizedRole,
      }));

      // Route based on actual user role from backend
      switch (normalizedRole) {
        case 'ROLE_ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'ROLE_MANAGER':
          navigate('/manager/dashboard');
          break;
        case 'ROLE_EMPLOYEE':
        default:
          navigate('/');
          break;
      }
    },
    onError: (error) => {
      setErrors({
        general: error.response?.data?.message || 'Login failed. Please try again.'
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    
    // Basic validation
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    loginMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-secondary font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-secondary">
                AI-PPAP
              </span>
            </Link>
            <Link 
              to="/register" 
              className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Don't have an account?
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-secondary">
              Welcome back
            </h2>
            <p className="mt-2 text-secondary/70">
              Sign in to your AI-PPAP account
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex justify-center">
            <div className="bg-white rounded-xl shadow-sm border border-primary/20 p-1 flex">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, loginAs: 'employee' }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.loginAs === 'employee'
                    ? 'bg-primary text-secondary shadow-sm'
                    : 'text-secondary/70 hover:text-secondary'
                }`}
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, loginAs: 'manager' }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.loginAs === 'manager'
                    ? 'bg-primary text-secondary shadow-sm'
                    : 'text-secondary/70 hover:text-secondary'
                }`}
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, loginAs: 'admin' }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.loginAs === 'admin'
                    ? 'bg-primary text-secondary shadow-sm'
                    : 'text-secondary/70 hover:text-secondary'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-4 py-3 border rounded-xl placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                      errors.email ? 'border-error focus:ring-error focus:border-error' : 'border-secondary/30'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-error">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-4 py-3 pr-12 border rounded-xl placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                        errors.password ? 'border-error focus:ring-error focus:border-error' : 'border-secondary/30'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-secondary/50 hover:text-secondary transition-colors" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-secondary/50 hover:text-secondary transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-error">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-800">{successMessage}</p>
                    </div>
                    <div className="ml-auto pl-3">
                      <button
                        onClick={() => setSuccessMessage('')}
                        className="inline-flex text-green-600 hover:text-green-800 transition-colors"
                      >
                        <span className="sr-only">Dismiss</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{errors.general}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-secondary bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-md"
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>

              {/* Links */}
              <div className="text-center space-y-3">
                <Link 
                  to="/forgot-password" 
                  className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
                <p className="text-sm text-secondary/70">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
