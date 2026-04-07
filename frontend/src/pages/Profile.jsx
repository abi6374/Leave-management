import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <div className="page-hero">
        <p className="page-kicker">Account</p>
        <h2 className="page-title">Profile</h2>
        <p className="page-subtitle">Your role and account information.</p>
      </div>

      <div className="card">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="label-subtle">Name</p>
            <p className="mt-1 text-base font-semibold text-slate-800">{user?.name}</p>
          </div>
          <div>
            <p className="label-subtle">Email</p>
            <p className="mt-1 text-base font-semibold text-slate-800">{user?.email}</p>
          </div>
          <div>
            <p className="label-subtle">Role</p>
            <p className="mt-1 text-base font-semibold text-slate-800">{user?.role}</p>
          </div>
          <div>
            <p className="label-subtle">Department</p>
            <p className="mt-1 text-base font-semibold text-slate-800">{user?.department || '-'}</p>
          </div>
          <div>
            <p className="label-subtle">Employee ID</p>
            <p className="mt-1 text-base font-semibold text-slate-800">{user?.employeeId || '-'}</p>
          </div>
          <div>
            <p className="label-subtle">Student ID</p>
            <p className="mt-1 text-base font-semibold text-slate-800">{user?.studentId || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
