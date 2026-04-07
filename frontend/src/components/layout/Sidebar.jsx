import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = () => {
  const { user } = useAuth();

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
    <aside className="w-full rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-sm lg:w-72">
      <h2 className="text-xl font-bold text-slate-900">LeaveFlow</h2>
      <p className="mt-1 text-sm text-slate-500">{user?.role?.toUpperCase()}</p>

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
    </aside>
  );
};
