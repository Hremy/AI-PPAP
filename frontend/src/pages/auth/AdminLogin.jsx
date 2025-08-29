import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../../lib/api';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const token = data.token;
      const roleRaw = data.role;
      const normalizedRole = roleRaw?.startsWith('ROLE_') ? roleRaw : `ROLE_${roleRaw}`;

      // Must be admin
      if (normalizedRole !== 'ROLE_ADMIN') {
        setErrors({ general: 'Access denied: This portal is for administrators only.' });
        return;
      }

      // Persist and route to admin dashboard
      localStorage.setItem('ai_ppap_auth_token', token);
      localStorage.setItem('user', JSON.stringify({ email: data.email, role: normalizedRole }));
      navigate('/admin/dashboard');
    },
    onError: (error) => {
      setErrors({ general: error.response?.data?.message || 'Admin login failed. Please try again.' });
    },
    onSettled: () => setSubmitting(false)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    loginMutation.mutate({ email: formData.email, password: formData.password });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
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
              <span className="text-xl font-bold text-secondary">AI-PPPA</span>
            </Link>
            <Link to="/login" className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Employee/Manager login
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.105.895-2 2-2h2V7a3 3 0 00-3-3H7a3 3 0 00-3 3v2h2c1.105 0 2 .895 2 2v2H4v4a3 3 0 003 3h6a3 3 0 003-3v-4h-4v-2z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-secondary">Administrator Sign In</h2>
            <p className="mt-2 text-secondary/70">Use your admin credentials to continue</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-4 py-3 border rounded-xl placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${errors.email ? 'border-error focus:ring-error focus:border-error' : 'border-secondary/30'}`}
                    placeholder="admin@ai-pppa.com"
                  />
                  {errors.email && <p className="mt-2 text-sm text-error">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-4 py-3 border rounded-xl placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${errors.password ? 'border-error focus:ring-error focus:border-error' : 'border-secondary/30'}`}
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="mt-2 text-sm text-error">{errors.password}</p>}
                </div>
              </div>

              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || loginMutation.isPending}
                className="w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-xl text-secondary bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-md"
              >
                {submitting || loginMutation.isPending ? 'Signing in…' : 'Sign in as Admin'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
