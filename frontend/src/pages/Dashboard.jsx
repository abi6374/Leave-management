import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { leaveAPI } from '../services/api';
import { useBalance } from '../hooks/useBalance';
import { StatsCard } from '../components/ui/StatsCard';
import { LeaveBalanceCard } from '../components/leaves/LeaveBalanceCard';
import { LeaveCalendar } from '../components/leaves/LeaveCalendar';
import { LeaveStatusBadge } from '../components/leaves/LeaveStatusBadge';
import { LeaveChart } from '../components/charts/LeaveChart';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance } = useBalance(new Date().getFullYear());

  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [trend, setTrend] = useState([]);
  const [distribution, setDistribution] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [statsResponse, leavesResponse, calendarResponse] = await Promise.all([
        leaveAPI.getDashboardStats(),
        ['principal', 'hod'].includes(user?.role) ? leaveAPI.getAllLeaves() : leaveAPI.getMyLeaves(),
        leaveAPI.getCalendar(),
      ]);

      setStats(statsResponse.data.stats || { total: 0, approved: 0, pending: 0, rejected: 0 });
      setTrend(statsResponse.data.monthlyTrend || []);
      setDistribution(statsResponse.data.leaveTypeDistribution || []);
      setRecentLeaves((leavesResponse.data.leaves || []).slice(0, 6));
      setCalendarEvents(calendarResponse.data.events || []);
    };

    load().catch(() => {
      setStats({ total: 0, approved: 0, pending: 0, rejected: 0 });
      setRecentLeaves([]);
      setCalendarEvents([]);
      setTrend([]);
      setDistribution([]);
    });
  }, [user?.role]);

  const quickActions = useMemo(() => {
    const base = [{ label: 'My Leaves', route: '/my-leaves' }];

    if (['student', 'staff'].includes(user?.role)) base.unshift({ label: 'Apply Leave', route: '/apply' });
    if (['staff', 'hod', 'principal'].includes(user?.role)) base.push({ label: 'Approvals', route: '/approvals' });
    if (user?.role === 'principal') base.push({ label: 'User Management', route: '/admin/users' });

    return base;
  }, [user?.role]);

  return (
    <div className="space-y-5">
      <section className="page-hero">
        <p className="page-kicker">Overview</p>
        <h2 className="page-title">{user?.role?.toUpperCase()} Dashboard</h2>
        <p className="page-subtitle">Role-aware insights, approvals, and leave analytics in one place.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total" value={stats.total} tone="blue" />
        <StatsCard title="Approved" value={stats.approved} tone="green" />
        <StatsCard title="Pending" value={stats.pending} tone="amber" />
        <StatsCard title="Rejected" value={stats.rejected} tone="red" />
      </section>

      {['student', 'staff'].includes(user?.role) ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <LeaveBalanceCard title="Sick" data={balance?.sick} tone="red" />
          <LeaveBalanceCard title="Casual" data={balance?.casual} tone="blue" />
          <LeaveBalanceCard title="Earned" data={balance?.earned} tone="green" />
          <LeaveBalanceCard title="Duty" data={balance?.duty} tone="amber" />
        </section>
      ) : null}

      {user?.role === 'principal' ? <LeaveChart trendData={trend} distributionData={distribution} /> : null}

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Recent Applications</h3>
            <button className="btn-secondary" onClick={() => navigate('/my-leaves')}>View All</button>
          </div>
          <div className="space-y-3">
            {recentLeaves.map((leave) => (
              <div key={leave._id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">{leave.leaveType}</p>
                  <LeaveStatusBadge status={leave.status} />
                </div>
                <p className="mt-1 text-sm text-slate-600">{leave.reason}</p>
              </div>
            ))}
            {!recentLeaves.length ? <p className="text-sm text-slate-500">No leave applications yet.</p> : null}
          </div>
        </div>

        <LeaveCalendar events={calendarEvents} />
      </section>

      <section className="card">
        <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <button key={action.route} className="btn-secondary" onClick={() => navigate(action.route)}>
              {action.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
