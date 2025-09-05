import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/v1/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: 'ROLE_EMPLOYEE'
      });
      return response.data;
    },
    onSuccess: (data) => {
      // After successful registration, require user to log in
      navigate('/login', { replace: true, state: { registeredEmail: data.email } });
    },
    onError: (error) => {
      setErrors({ 
        submit: error.response?.data?.message || 'Registration failed. Please try again.' 
      });
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Removed project selection during registration

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    registerMutation.mutate(formData);
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
                AI-PPPA
              </span>
            </Link>
            <Link 
              to="/login" 
              className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Already have an account?
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-secondary">
              Create your account
            </h2>
            <p className="mt-2 text-secondary/70">
              Join AI-PPPA and transform your performance management
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                {/* First Name Field */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-secondary mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-4 py-3 border rounded-xl placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                      errors.firstName ? 'border-error focus:ring-error focus:border-error' : 'border-secondary/30'
                    }`}
                    placeholder="First name"
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-error">{errors.firstName}</p>
                  )}
                </div>

                {/* Last Name Field */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-secondary mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-4 py-3 border rounded-xl placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                      errors.lastName ? 'border-error focus:ring-error focus:border-error' : 'border-secondary/30'
                    }`}
                    placeholder="Last name"
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-error">{errors.lastName}</p>
                  )}
                </div>
              </div>

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

              {/* Role selection removed: all signups here are employees */}

              {/* Project selection removed; users can add projects after login */}

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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-4 py-3 pr-12 border rounded-xl placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                      errors.password ? 'border-error focus:ring-error focus:border-error' : 'border-secondary/30'
                    }`}
                    placeholder="Create a password"
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

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary mb-2">
                  Confirm Password
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
                    className={`appearance-none relative block w-full px-4 py-3 pr-12 border rounded-xl placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                      errors.confirmPassword ? 'border-error focus:ring-error focus:border-error' : 'border-secondary/30'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-secondary/50 hover:text-secondary transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-secondary/50 hover:text-secondary transition-colors" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-error">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="bg-error/10 border border-error/20 rounded-xl p-4">
                  <p className="text-sm text-error">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-secondary bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-md"
              >
                {registerMutation.isPending ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Links */}
              <div className="text-center">
                <p className="text-sm text-secondary/70">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
