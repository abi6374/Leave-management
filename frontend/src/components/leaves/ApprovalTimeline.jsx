import React from 'react';

export const ApprovalTimeline = ({ approvals = {} }) => {
  const steps = [
    { key: 'staffApproval', label: 'Staff' },
    { key: 'hodApproval', label: 'HOD' },
    { key: 'principalApproval', label: 'Principal' },
  ];

  return (
    <div className="approval-grid">
      {steps.map((step) => {
        const node = approvals[step.key] || { status: 'pending' };
        const statusClass = node.status === 'approved' ? 'status-approved' : node.status === 'rejected' ? 'status-rejected' : 'status-pending';
        return (
          <div key={step.key} className="approval-cell">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{step.label}</p>
            <p className={`mt-1 text-sm font-bold ${statusClass}`}>{node.status || 'pending'}</p>
            <p className="mt-1 text-xs text-slate-500">{node.remarks || 'No remarks yet'}</p>
          </div>
        );
      })}
    </div>
  );
};
