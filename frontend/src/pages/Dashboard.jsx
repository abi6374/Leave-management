import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { leaveAPI } from '../services/api';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'student' || user?.role === 'staff') {
      fetchUserStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await leaveAPI.getMyLeaves();
      const leaves = response.data.leaves;

      const newStats = {
        total: leaves.length,
        approved: leaves.filter((l) => l.status === 'approved').length,
        pending: leaves.filter((l) => l.status.startsWith('pending')).length,
        rejected: leaves.filter((l) => l.status === 'rejected').length,
      };

      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardContent = () => {
    const roleAccess = {
      principal: [
        { label: 'Pending Approvals', route: '/approvals', icon: '!' },
        { label: 'All Leaves', route: '/all-leaves', icon: '#' },
      ],
      hod: [
        { label: 'Pending Approvals', route: '/approvals', icon: '!' },
        { label: 'My Leaves', route: '/my-leaves', icon: '◧' },
      ],
      staff: [
        { label: 'Pending Approvals', route: '/approvals', icon: '!' },
        { label: 'My Leaves', route: '/my-leaves', icon: '◧' },
        { label: 'Apply for Leave', route: '/apply-leave', icon: '+' },
      ],
      student: [
        { label: 'My Leaves', route: '/my-leaves', icon: '◧' },
        { label: 'Apply for Leave', route: '/apply-leave', icon: '+' },
      ],
    };

    return roleAccess[user?.role] || [];
  };

  const menuItems = getDashboardContent();
  const greetingRole = user?.role ? user.role.toUpperCase() : 'USER';

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden border-0 bg-gradient-to-r from-slate-900 via-sky-900 to-cyan-900 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Welcome back, {user?.name}</h1>
            <p className="mt-2 text-sm text-cyan-100">
              You are signed in as <span className="font-bold">{greetingRole}</span>.
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            Log Out
          </button>
        </div>
      </section>

      {(user?.role === 'student' || user?.role === 'staff') && !loading && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Leaves</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">{stats.total}</p>
          </article>
          <article className="card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Approved</p>
            <p className="mt-3 text-4xl font-bold text-emerald-600">{stats.approved}</p>
          </article>
          <article className="card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
            <p className="mt-3 text-4xl font-bold text-amber-500">{stats.pending}</p>
          </article>
          <article className="card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rejected</p>
            <p className="mt-3 text-4xl font-bold text-rose-500">{stats.rejected}</p>
          </article>
        </section>
      )}

      <section className="card">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Quick Actions</h2>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role based</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {menuItems.map((item) => (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-200 text-sm font-bold text-slate-700">
                {item.icon}
              </span>
              <p className="mt-3 text-lg font-bold text-slate-800">{item.label}</p>
              <p className="mt-1 text-sm text-slate-500">Open section</p>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="text-2xl font-bold text-slate-800">Profile Snapshot</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</p>
            <p className="mt-1 font-bold text-slate-800">{user?.name}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
            <p className="mt-1 font-bold text-slate-800">{user?.email}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</p>
            <p className="mt-1 font-bold text-slate-800">{greetingRole}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Department</p>
            <p className="mt-1 font-bold text-slate-800">{user?.department || 'Not Assigned'}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
