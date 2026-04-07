import React from 'react';

export const TeamOnLeaveToday = ({ users = [] }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-bold text-slate-800">Team On Leave Today</h3>
      <div className="mt-3 space-y-2">
        {users.map((user) => (
          <div key={user._id || user.id} className="rounded-xl border border-slate-200 p-3">
            <p className="font-semibold text-slate-800">{user.name}</p>
            <p className="text-sm text-slate-500">{user.role} | {user.department}</p>
          </div>
        ))}
        {!users.length ? <p className="text-sm text-slate-500">No one is on leave today.</p> : null}
      </div>
    </div>
  );
};
