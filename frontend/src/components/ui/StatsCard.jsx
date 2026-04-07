import React from 'react';

export const StatsCard = ({ title, value, tone = 'blue', subtitle }) => {
  const toneClass = {
    blue: 'from-blue-500/20 to-cyan-400/20 text-blue-800',
    green: 'from-emerald-500/20 to-teal-400/20 text-emerald-800',
    amber: 'from-amber-500/20 to-yellow-400/20 text-amber-800',
    red: 'from-rose-500/20 to-red-400/20 text-rose-800',
  }[tone] || 'from-blue-500/20 to-cyan-400/20 text-blue-800';

  return (
    <div className={`card bg-gradient-to-br ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wider">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
    </div>
  );
};
