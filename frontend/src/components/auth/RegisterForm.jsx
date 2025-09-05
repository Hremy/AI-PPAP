import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { registerUser } from '../../lib/api';
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem('ai_ppap_auth_token', data.token);
      localStorage.setItem('user', JSON.stringify({
        email: data.email,
        role: data.role
      }));
      
      // Redirect to dashboard
      navigate('/dashboard');
    },
    onError: (error) => {
      setErrors({
        general: error.response?.data?.message || 'Registration failed. Please try again.'
      });
    }
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Only employees can sign up: prevent manager/admin signups (dev heuristic)
    const lowerEmail = formData.email.toLowerCase();
    if (lowerEmail.includes('manager') || lowerEmail.includes('admin')) {
      setErrors({
        general: 'Only employees can sign up. Managers must be added by an admin from the Admin > User Roles page.'
      });
      return;
    }

    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registrationData } = formData;
    registerMutation.mutate(registrationData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const passwordStrength = formData.password.length > 0 ? Math.min(100, (formData.password.length / 8) * 100) : 0;
  const isPasswordStrong = formData.password.length >= 6;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
            <svg className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-secondary">
            Create your employee account
          </h2>
          <p className="mt-2 text-sm text-secondary/70">
            Employees can self-register. Managers must be created by an admin in the Admin Dashboard.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-secondary mb-1">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-3 border rounded-lg placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                    errors.firstName ? 'border-error focus:ring-error focus:border-error' : 'border-secondary/30'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-error">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-secondary mb-1">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-3 border rounded-lg placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                    errors.lastName ? 'border-error focus:ring-error focus:border-error' : 'border-secondary/30'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-error">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
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
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-3 border rounded-lg placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                  errors.email ? 'border-error focus:ring-error focus:border-error' : 'border-secondary/30'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-3 pr-10 border rounded-lg placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                    errors.password ? 'border-error focus:ring-error focus:border-error' : 'border-secondary/30'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-secondary/50 hover:text-secondary" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-secondary/50 hover:text-secondary" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-secondary/20 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isPasswordStrong ? 'bg-primary' : 'bg-primary/60'
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                    {isPasswordStrong && (
                      <CheckIcon className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-secondary/70">
                    {isPasswordStrong ? 'Strong password' : 'At least 6 characters required'}
                  </p>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-error">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary mb-1">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-3 pr-10 border rounded-lg placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                    errors.confirmPassword ? 'border-error focus:ring-error focus:border-error' : 'border-secondary/30'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-secondary/50 hover:text-secondary" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-secondary/50 hover:text-secondary" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>
              )}
            </div>
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
            disabled={registerMutation.isPending}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {registerMutation.isPending ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </div>
            ) : (
              'Create account'
            )}
          </button>

          {/* Links */}
          <div className="text-center">
            <p className="text-sm text-secondary/70">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors duration-200">
                Sign in
              </Link>
            </p>
            <p className="mt-2 text-xs text-secondary/60">
              Are you a manager? Contact your administrator to be added under Admin → User Roles.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
