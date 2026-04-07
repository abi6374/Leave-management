import React from 'react';

export const LeaveBalanceCard = ({ title, data, tone = 'blue' }) => {
  const percent = data?.total ? Math.max(0, Math.min(100, Math.round((data.remaining / data.total) * 100))) : 0;

  const ringClass = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    amber: 'text-amber-600',
    red: 'text-rose-600',
  }[tone] || 'text-blue-600';

  return (
    <div className="card">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <div className="mt-3 flex items-center gap-4">
        <div className={`grid h-16 w-16 place-items-center rounded-full border-4 border-current ${ringClass}`}>
          <span className="text-xs font-bold">{percent}%</span>
        </div>
        <div>
          <p className="text-sm text-slate-600">Remaining: <span className="font-bold">{data?.remaining ?? 0}</span></p>
          <p className="text-sm text-slate-600">Used: <span className="font-bold">{data?.used ?? 0}</span></p>
          <p className="text-sm text-slate-600">Total: <span className="font-bold">{data?.total ?? 0}</span></p>
        </div>
      </div>
    </div>
  );
};
