import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Squares2X2Icon,
  UsersIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: Squares2X2Icon },
  { to: '/admin/evaluations', label: 'Evaluations', icon: DocumentTextIcon },
  { to: '/admin/user-roles', label: 'User Roles', icon: UsersIcon },
  { to: '/admin/settings', label: 'Settings', icon: Cog6ToothIcon },
];

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-primary/10 hidden md:flex md:flex-col">
        <div className="h-16 flex items-center px-6 border-b border-primary/10">
          <span className="text-lg font-bold text-secondary">Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-secondary/80 hover:bg-background hover:text-secondary'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-primary/10">
          <NavLink to="/logout" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary/80 hover:text-secondary">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
