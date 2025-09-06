import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HomeIcon, 
  ChartBarIcon, 
  DocumentTextIcon, 
  UserIcon
} from '@heroicons/react/24/outline';

const ManagerLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const orgName = (typeof localStorage !== 'undefined' && localStorage.getItem('ai_ppap_org_name')) || 'AI-PPPA';

  const navigation = [
    { name: 'Dashboard', href: '/manager/dashboard', icon: HomeIcon },
    { name: 'Evaluations', href: '/manager/evaluations', icon: DocumentTextIcon },
    { name: 'Analytics', href: '/manager/analytics', icon: ChartBarIcon },
    { name: 'Profile', href: '/manager/profile', icon: UserIcon },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 shadow-lg" style={{backgroundColor: '#002035'}}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-white/10">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-white">{orgName}</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col px-6 py-6">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors
                          ${isActive(item.href)
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                          }
                        `}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              
            </ul>
          </nav>

          {/* User menu */}
          <div className="border-t border-white/10 p-6">
            <div className="flex items-center gap-x-4">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-xs text-white/70">Manager</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
