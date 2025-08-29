import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getManagers } from '../lib/api';
import { ArrowRightIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const HomePage = () => {
  const { currentUser, hasRole, isAuthenticated } = useAuth();
  const [managers, setManagers] = useState([]);
  const [managersLoading, setManagersLoading] = useState(true);
  const [managersError, setManagersError] = useState(null);

  useEffect(() => {
    // fetch managers only
    (async () => {
      setManagersLoading(true);
      setManagersError(null);
      try {
        const m = await getManagers();
        setManagers(Array.isArray(m) ? m : []);
      } catch (e) {
        console.error('Failed to load managers', e);
        setManagersError('Failed to load managers.');
      } finally {
        setManagersLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="font-bold text-secondary">AI-PPPA</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/evaluation" 
                className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Evaluation
              </Link>
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="bg-primary text-secondary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all transform hover:scale-105 shadow-md"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-secondary/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {(currentUser?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-secondary/80 max-w-[180px] truncate">
                      {currentUser?.email}
                    </span>
                  </Link>
                  <Link 
                    to="/logout" 
                    className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-primary text-secondary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all transform hover:scale-105 shadow-md"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-secondary mb-6">
              AI-Powered Performance &
              <span className="text-primary">
                {" "}Productivity Assessment
              </span>
            </h1>
            <p className="text-xl text-secondary/70 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your team's performance with intelligent analytics, automated reviews, 
              and data-driven insights that drive real results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isAuthenticated && (
                <Link 
                  to="/register" 
                  className="bg-primary text-secondary px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
                >
                  <span>Register</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              )}
              <a
                href={import.meta.env.VITE_DEMO_VIDEO_URL || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary/70 hover:text-secondary px-8 py-4 rounded-xl text-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <span>Watch Demo</span>
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[6px] border-l-secondary border-y-[4px] border-y-transparent ml-1"></div>
                </div>
              </a>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Board Team Section - Managers only */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-secondary inline-flex items-center gap-3">
              <UserGroupIcon className="w-8 h-8 text-primary" />
              Our Managers
            </h2>
            <p className="text-secondary/70 mt-2">Meet the managers who lead the platform.</p>
          </div>
          {managersError && (
            <div className="mb-6 p-4 rounded-lg border border-error/20 bg-error/5 text-error">
              {managersError}
            </div>
          )}
          <div className="grid grid-cols-1 gap-12 justify-items-center">
            <div>
              <h3 className="text-xl font-semibold text-secondary mb-4 text-center">Managers</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {managersLoading ? (
                  <div className="text-secondary/60 text-center col-span-full">Loading managers…</div>
                ) : managers.length ? (
                  managers.map((u) => (
                    <div key={`manager-${u.id}`} className="p-6 rounded-2xl border border-primary/10 bg-background hover:bg-white hover:shadow-md transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-lg">
                          {(u.firstName || u.username || 'M').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-secondary truncate">{u.firstName} {u.lastName}</div>
                            <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-primary/10 text-primary">Manager</span>
                          </div>
                          <div className="text-sm text-secondary/70 truncate">{u.email}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-secondary/60 text-center col-span-full">No managers added yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Employee Evaluation Guide */}
      <section className="py-16 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-secondary mb-6">Guide to Passing Your Evaluation</h2>
          <p className="text-secondary/70 mb-10">Follow these steps to prepare and excel in your performance evaluation.</p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white rounded-xl p-6 border border-primary/10">
              <div className="text-sm font-semibold text-primary mb-2">Step 1</div>
              <div className="font-semibold text-secondary mb-2">Complete Your Self-Review</div>
              <p className="text-secondary/70 text-sm">Reflect on your accomplishments, challenges, and goals. Be specific and provide examples.</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-primary/10">
              <div className="text-sm font-semibold text-primary mb-2">Step 2</div>
              <div className="font-semibold text-secondary mb-2">Collect Feedback</div>
              <p className="text-secondary/70 text-sm">Gather input from peers and managers. Address areas of improvement proactively.</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-primary/10">
              <div className="text-sm font-semibold text-primary mb-2">Step 3</div>
              <div className="font-semibold text-secondary mb-2">Set Clear Goals</div>
              <p className="text-secondary/70 text-sm">Define SMART goals for the next period with measurable outcomes aligned to team objectives.</p>
            </div>
          </div>
          <div className="mt-8">
            <Link
              to="/evaluation"
              className="inline-flex items-center gap-2 bg-primary text-secondary px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Start Self Review
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-primary/10 text-center text-secondary/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} AI-PPPA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
