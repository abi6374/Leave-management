import React from 'react';
import { LeaveStatusBadge } from './LeaveStatusBadge';
import { formatDate } from '../../utils/dateUtils';

export const LeaveCard = ({ leave, actions }) => {
  return (
    <div className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{leave.userId?.name || 'Applicant'}</h3>
          <p className="text-sm text-slate-500">{leave.leaveType} | {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}</p>
        </div>
        <LeaveStatusBadge status={leave.status} />
      </div>
      <p className="mt-3 text-sm text-slate-700">{leave.reason}</p>
      {actions ? <div className="mt-4">{actions}</div> : null}
    </div>
  );
};
