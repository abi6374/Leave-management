import React from 'react';
import { useBalance } from '../hooks/useBalance';
import { LeaveBalanceCard } from '../components/leaves/LeaveBalanceCard';

export const Balance = () => {
  const { balance, loading } = useBalance(new Date().getFullYear());

  if (loading) return <div className="card">Loading leave balance...</div>;

  return (
    <div className="space-y-4">
      <div className="page-hero">
        <p className="page-kicker">Balance</p>
        <h2 className="page-title">Leave Balance Details</h2>
        <p className="page-subtitle">Track your available leaves by type.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <LeaveBalanceCard title="Sick Leave" data={balance?.sick} tone="red" />
        <LeaveBalanceCard title="Casual Leave" data={balance?.casual} tone="blue" />
        <LeaveBalanceCard title="Earned Leave" data={balance?.earned} tone="green" />
        <LeaveBalanceCard title="Duty Leave" data={balance?.duty} tone="amber" />
      </div>
    </div>
  );
};
