import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
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
import EmployeeSpecificDashboard from './pages/dashboard/EmployeeSpecificDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import UserRoles from './pages/admin/UserRoles';
import EvaluationsPage from './pages/admin/EvaluationsPage';
import AdminProfile from './pages/admin/AdminProfile';
import Projects from './pages/admin/Projects';
import Settings from './pages/admin/Settings';
import ManagerEvaluationsPage from './pages/manager/EvaluationsPage';
import ManagerLayout from './pages/manager/ManagerLayout';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerProfile from './pages/manager/ManagerProfile';
import ManagerAnalytics from './pages/manager/ManagerAnalytics';
import ManagerTeam from './pages/manager/ManagerTeam';
import Features from './pages/public/Features';
import EvaluationPage from './pages/EvaluationPage';
import Profile from './pages/profile/Profile';
import AdminLogin from './pages/auth/AdminLogin';
import RoleBasedRedirect from './components/dashboard/RoleBasedRedirect';
import DashboardRouter from './components/dashboard/DashboardRouter';
import ErrorBoundary from './components/ErrorBoundary';
import RoleBasedRouteGuard from './components/auth/RoleBasedRouteGuard';


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
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <ErrorBoundary>
            <RoleBasedRouteGuard>
              <div className="App">
                <Toaster position="top-right" />
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/pricing" element={<div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-secondary mb-4">Pricing Page</h1><p className="text-secondary/70">Coming Soon...</p></div></div>} />

            
            {/* Protected routes */}
            <Route path="/evaluation" element={
              <ProtectedRoute>
                <EvaluationPage />
              </ProtectedRoute>
            } />
            
            {/* Authentication routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
            <Route path="/reset-password" element={<ResetPasswordForm />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            
                                        {/* Protected routes - Role-based dashboards */}
                            <Route
                              path="/dashboard"
                              element={
                                <ProtectedRoute>
                                  <DashboardRouter />
                                </ProtectedRoute>
                              }
                            />
            
            {/* Specific role-based dashboard routes */}
            <Route 
              path="/employee/dashboard" 
              element={
                <ProtectedRoute requiredRole="EMPLOYEE">
                  <EmployeeSpecificDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/dashboard" 
              element={
                <ProtectedRoute requiredRoles={["MANAGER", "ADMIN"]}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminLayout>
                    <Settings />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Profile */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/user-roles" 
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminLayout>
                    <UserRoles />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/projects" 
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminLayout>
                    <Projects />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
                                        <Route
                              path="/admin/evaluations"
                              element={
                                <ProtectedRoute requiredRole="ADMIN">
                                  <EvaluationsPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/admin/profile"
                              element={
                                <ProtectedRoute requiredRole="ADMIN">
                                  <AdminProfile />
                                </ProtectedRoute>
                              }
                            />
            <Route 
              path="/manager/evaluations" 
              element={
                <ProtectedRoute requiredRoles={["MANAGER", "ADMIN"]}>
                  <ManagerEvaluationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/analytics" 
              element={
                <ProtectedRoute requiredRoles={["MANAGER", "ADMIN"]}>
                  <ManagerLayout>
                    <ManagerAnalytics />
                  </ManagerLayout>
                </ProtectedRoute>
              } 
            />
                                        <Route
                              path="/manager/team"
                              element={
                                <ProtectedRoute requiredRoles={["MANAGER", "ADMIN"]}>
                                  <ManagerLayout>
                                    <ManagerTeam />
                                  </ManagerLayout>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/profile"
                              element={
                                <ProtectedRoute requiredRoles={["MANAGER", "ADMIN"]}>
                                  <ManagerProfile />
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
            </RoleBasedRouteGuard>
          </ErrorBoundary>
        </AuthProvider>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
