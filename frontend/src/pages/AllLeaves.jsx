import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useLeaves } from '../hooks/useLeaves';
import { leaveAPI } from '../services/api';
import { SelectField } from '../components/SelectField';
import { LeaveStatusBadge } from '../components/leaves/LeaveStatusBadge';
import { formatDate } from '../utils/dateUtils';
import { downloadBlob } from '../utils/exportUtils';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending_staff', label: 'Pending Staff' },
  { value: 'pending_hod', label: 'Pending HOD' },
  { value: 'pending_principal', label: 'Pending Principal' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const AllLeaves = () => {
  const { leaves, loading } = useLeaves('all');
  const [status, setStatus] = useState('all');

  const filtered = useMemo(() => {
    if (status === 'all') return leaves;
    return leaves.filter((leave) => leave.status === status);
  }, [leaves, status]);

  const exportCsv = async () => {
    try {
      const response = await leaveAPI.exportCsv({ status: status === 'all' ? undefined : status });
      downloadBlob(response.data, `leave-report-${Date.now()}.csv`);
      toast.success('CSV export downloaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to export CSV');
    }
  };

  if (loading) return <div className="card">Loading all leave records...</div>;

  return (
    <div className="space-y-4">
      <div className="page-hero">
        <p className="page-kicker">Admin View</p>
        <h2 className="page-title">All Leaves</h2>
        <p className="page-subtitle">Filter requests and export department-level leave data.</p>
      </div>

      <div className="card flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-sm">
          <SelectField label="Filter status" value={status} options={statusOptions} onChange={setStatus} />
        </div>
        <button className="btn-primary" onClick={exportCsv}>Export CSV</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Applicant</th>
              <th className="pb-3">Department</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Duration</th>
              <th className="pb-3">Days</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Urgent</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((leave) => (
              <tr key={leave._id} className="border-t border-slate-200/70">
                <td className="py-3 font-semibold text-slate-800">{leave.userId?.name || '-'}</td>
                <td className="py-3 text-slate-600">{leave.userId?.department || '-'}</td>
                <td className="py-3 text-slate-600">{leave.leaveType}</td>
                <td className="py-3 text-slate-600">{formatDate(leave.fromDate)} - {formatDate(leave.toDate)}</td>
                <td className="py-3 text-slate-600">{leave.totalDays}</td>
                <td className="py-3"><LeaveStatusBadge status={leave.status} /></td>
                <td className="py-3 text-slate-600">{leave.isUrgent ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length ? <p className="mt-3 text-sm text-slate-500">No leaves found for current filter.</p> : null}
      </div>
    </div>
  );
};
