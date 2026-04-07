import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({ darkMode = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = useMemo(() => {
    const common = [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/my-leaves', label: 'My Leaves' },
      { to: '/calendar', label: 'Calendar' },
      { to: '/balance', label: 'Leave Balance' },
      { to: '/notifications', label: 'Notifications' },
      { to: '/profile', label: 'Profile' },
    ];

    if (['student', 'staff'].includes(user?.role)) {
      common.splice(1, 0, { to: '/apply', label: 'Apply Leave' });
    }

    if (['staff', 'hod', 'principal'].includes(user?.role)) {
      common.splice(2, 0, { to: '/approvals', label: 'Approvals' });
    }

    if (user?.role === 'principal') {
      common.push({ to: '/admin/users', label: 'User Management' });
      common.push({ to: '/all-leaves', label: 'All Leaves' });
    }

    return common;
  }, [user?.role]);

  return (
    <aside className={`w-full rounded-2xl border p-4 shadow-sm lg:w-72 ${darkMode ? 'border-slate-700 bg-slate-950/90 text-slate-100' : 'border-slate-200/70 bg-white/85 text-slate-900'}`}>
      <h2 className="text-xl font-bold">LeaveFlow</h2>
      <p className={`mt-1 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>{user?.role?.toUpperCase()}</p>

      <nav className="mt-4 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-pill ${isActive ? 'nav-pill-active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 border-t border-slate-200/70 pt-4">
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="btn-danger w-full"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};
