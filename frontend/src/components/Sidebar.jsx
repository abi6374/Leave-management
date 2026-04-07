import React, { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { NavLink, useNavigate } from 'react-router-dom';

export const Sidebar = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = useMemo(() => {
    const common = [{ to: '/dashboard', label: 'Dashboard', icon: '□' }];

    if (user?.role === 'student') {
      return [
        ...common,
        { to: '/my-leaves', label: 'My Leaves', icon: '◧' },
        { to: '/apply-leave', label: 'Apply Leave', icon: '+' },
      ];
    }

    if (user?.role === 'staff') {
      return [
        ...common,
        { to: '/approvals', label: 'Approvals', icon: '!' },
        { to: '/my-leaves', label: 'My Leaves', icon: '◧' },
        { to: '/apply-leave', label: 'Apply Leave', icon: '+' },
      ];
    }

    if (user?.role === 'hod') {
      return [
        ...common,
        { to: '/approvals', label: 'Approvals', icon: '!' },
        { to: '/my-leaves', label: 'My Leaves', icon: '◧' },
      ];
    }

    if (user?.role === 'principal') {
      return [
        ...common,
        { to: '/approvals', label: 'Approvals', icon: '!' },
        { to: '/all-leaves', label: 'All Leaves', icon: '#' },
        { to: '/my-leaves', label: 'My Leaves', icon: '◧' },
      ];
    }

    return common;
  }, [user?.role]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-slate-800">LeaveFlow</p>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Menu
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px] gap-4 px-3 pb-6 pt-4 lg:px-5">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200/70 bg-white/95 p-5 shadow-xl backdrop-blur transition-transform duration-300 lg:static lg:translate-x-0 lg:rounded-2xl lg:border lg:shadow-none ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 p-5 text-white">
            <h2 className="text-2xl font-bold">LeaveFlow</h2>
            <p className="mt-1 text-sm text-sky-100">Leave Management System</p>
          </div>

          <div className="mb-5 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Signed in as</p>
            <p className="mt-1 text-base font-bold text-slate-800">{user?.name}</p>
            <span className="mt-2 inline-flex rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
              {user?.role}
            </span>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `nav-pill ${isActive ? 'nav-pill-active' : ''}`}
              >
                <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-200 text-xs font-bold text-slate-700">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <button onClick={handleLogout} className="btn-danger w-full text-center">
              Logout
            </button>
          </div>
        </aside>

        {menuOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        <main className="min-h-[calc(100vh-64px)] flex-1 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur md:p-7">
          {children}
        </main>
      </div>
    </div>
  );
};
