import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLeaves } from '../hooks/useLeaves';
import { LeaveStatusBadge } from '../components/leaves/LeaveStatusBadge';
import { ApprovalTimeline } from '../components/leaves/ApprovalTimeline';
import { formatDate } from '../utils/dateUtils';
import { leaveAPI } from '../services/api';
import { SelectField } from '../components/SelectField';

const PAGE_SIZE = 6;

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending_staff', label: 'Pending Staff' },
  { value: 'pending_hod', label: 'Pending HOD' },
  { value: 'pending_principal', label: 'Pending Principal' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const MyLeaves = () => {
  const navigate = useNavigate();
  const { leaves, loading, refreshLeaves } = useLeaves('my');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return leaves;
    return leaves.filter((l) => l.status === statusFilter);
  }, [leaves, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const cancelLeave = async (id) => {
    try {
      await leaveAPI.cancelLeave(id);
      toast.success('Leave cancelled successfully');
      refreshLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel leave');
    }
  };

  if (loading) return <div className="card">Loading leave history...</div>;

  return (
    <div className="space-y-4">
      <div className="page-hero">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="page-kicker">History</p>
            <h2 className="page-title">My Leave History</h2>
            <p className="page-subtitle">Filter and review your application timeline.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/apply')}>Apply Leave</button>
        </div>
      </div>

      <div className="card">
        <div className="max-w-sm">
          <SelectField label="Filter by status" value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
        </div>
      </div>

      <div className="space-y-3">
        {paged.map((leave) => (
          <div key={leave._id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{leave.leaveType}</h3>
                <p className="text-sm text-slate-500">{formatDate(leave.fromDate)} - {formatDate(leave.toDate)} | {leave.totalDays} day(s)</p>
                <p className="mt-2 text-sm text-slate-700">{leave.reason}</p>
              </div>
              <div className="space-y-2">
                <LeaveStatusBadge status={leave.status} />
                {['approved', 'pending_staff', 'pending_hod', 'pending_principal'].includes(leave.status) ? (
                  <button className="btn-secondary" onClick={() => cancelLeave(leave._id)}>Cancel</button>
                ) : null}
              </div>
            </div>
            <div className="mt-4">
              <ApprovalTimeline approvals={leave.approvals} />
            </div>
          </div>
        ))}
        {!paged.length ? <div className="card">No leaves found for selected filter.</div> : null}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-4 py-3">
        <p className="text-sm text-slate-600">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button className="btn-secondary" disabled={page === 1} onClick={() => setPage((v) => Math.max(1, v - 1))}>Previous</button>
          <button className="btn-secondary" disabled={page === totalPages} onClick={() => setPage((v) => Math.min(totalPages, v + 1))}>Next</button>
        </div>
      </div>
    </div>
  );
};
