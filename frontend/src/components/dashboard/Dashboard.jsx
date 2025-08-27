import { useState } from 'react';
import { getCurrentUser, logoutUser } from '../../lib/api';
import { 
  UserCircleIcon, 
  DocumentTextIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = getCurrentUser();

  const handleLogout = () => {
    logoutUser();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-5 w-5 text-secondary" />
                </div>
                <span className="ml-2 text-xl font-bold text-secondary">AI-PPAP</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-3 text-secondary/70 hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-2"
                >
                  <UserCircleIcon className="h-8 w-8 text-secondary/50" />
                  <span className="hidden md:block text-sm font-medium">{user?.email}</span>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-secondary border-b border-secondary/10">
                      <p className="font-medium">{user?.email}</p>
                      <p className="text-secondary/70 capitalize">{user?.role?.replace('ROLE_', '').toLowerCase()}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-secondary hover:bg-background"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-secondary">
                    Welcome to AI-PPAP Dashboard
                  </h3>
                  <p className="mt-1 text-sm text-secondary/70">
                    You are successfully authenticated as {user?.role?.replace('ROLE_', '').toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-secondary/50" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-secondary/70 truncate">
                        Total Documents
                      </dt>
                      <dd className="text-lg font-medium text-secondary">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 bg-primary/70 rounded-full flex items-center justify-center">
                      <div className="h-2 w-2 bg-secondary rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-secondary/70 truncate">
                        Pending Reviews
                      </dt>
                      <dd className="text-lg font-medium text-secondary">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                      <div className="h-2 w-2 bg-secondary rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-secondary/70 truncate">
                        Approved Documents
                      </dt>
                      <dd className="text-lg font-medium text-secondary">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-secondary mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary rounded-lg border border-secondary/20 hover:border-secondary/30 transition-all duration-200">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-primary/10 text-primary ring-4 ring-white">
                      <DocumentTextIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Upload Document
                    </h3>
                    <p className="mt-2 text-sm text-secondary/70">
                      Upload a new PPAP document for review
                    </p>
                  </div>
                </button>

                <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary rounded-lg border border-secondary/20 hover:border-secondary/30 transition-all duration-200">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-primary/10 text-primary ring-4 ring-white">
                      <Cog6ToothIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Settings
                    </h3>
                    <p className="mt-2 text-sm text-secondary/70">
                      Manage your account settings and preferences
                    </p>
                  </div>
                </button>

                <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary rounded-lg border border-secondary/20 hover:border-secondary/30 transition-all duration-200">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-primary/10 text-primary ring-4 ring-white">
                      <UserCircleIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Profile
                    </h3>
                    <p className="mt-2 text-sm text-secondary/70">
                      View and edit your profile information
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
