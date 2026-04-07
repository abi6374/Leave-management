import React from 'react';

export const LeaveStatusBadge = ({ status }) => {
  const map = {
    approved: 'badge badge-approved',
    rejected: 'badge badge-rejected',
    cancelled: 'badge bg-slate-200 text-slate-700',
    pending_staff: 'badge badge-pending',
    pending_hod: 'badge badge-pending',
    pending_principal: 'badge badge-pending',
  };

  const label = (status || '').replace('_', ' ').replace('_', ' ');
  return <span className={map[status] || 'badge bg-slate-200 text-slate-700'}>{label || 'unknown'}</span>;
};
