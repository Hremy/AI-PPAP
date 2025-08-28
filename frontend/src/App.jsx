import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import HomePage from './components/HomePage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import EmailVerification from './components/auth/EmailVerification';
import Dashboard from './components/dashboard/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Logout from './components/auth/Logout';

// New Pages
import Register from './pages/auth/Register';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import Features from './pages/public/Features';

import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-secondary mb-4">Pricing Page</h1><p className="text-secondary/70">Coming Soon...</p></div></div>} />
            <Route path="/about" element={<div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-secondary mb-4">About Page</h1><p className="text-secondary/70">Coming Soon...</p></div></div>} />
            
            {/* Authentication routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
            <Route path="/reset-password" element={<ResetPasswordForm />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            
            {/* Protected routes - Role-based dashboards */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <EmployeeDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/dashboard" 
              element={
                <ProtectedRoute requiredRole="ROLE_MANAGER">
                  <ManagerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="ROLE_ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Placeholder routes for future pages */}
            <Route path="/reviews/self" element={<ProtectedRoute><div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-secondary mb-4">Self Review</h1><p className="text-secondary/70">Coming Soon...</p></div></div></ProtectedRoute>} />
            <Route path="/performance/history" element={<ProtectedRoute><div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-secondary mb-4">Performance History</h1><p className="text-secondary/70">Coming Soon...</p></div></div></ProtectedRoute>} />
            <Route path="/performance/goals" element={<ProtectedRoute><div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-secondary mb-4">Goals</h1><p className="text-secondary/70">Coming Soon...</p></div></div></ProtectedRoute>} />
            <Route path="/ai/insights" element={<ProtectedRoute><div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-secondary mb-4">AI Insights</h1><p className="text-secondary/70">Coming Soon...</p></div></div></ProtectedRoute>} />
            <Route path="/settings/profile" element={<ProtectedRoute><div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-secondary mb-4">Profile Settings</h1><p className="text-secondary/70">Coming Soon...</p></div></div></ProtectedRoute>} />
            
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
