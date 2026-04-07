import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { NotificationBell } from '../notifications/NotificationBell';

export const Header = ({ darkMode, onToggleDarkMode }) => {
  const { user } = useAuth();

  return (
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">LeaveFlow</p>
        <h1 className="text-2xl font-bold text-slate-900">Hello, {user?.name}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onToggleDarkMode} className="btn-secondary">
          {darkMode ? 'Light mode' : 'Dark mode'}
        </button>
        <NotificationBell />
      </div>
    </header>
  );
};
