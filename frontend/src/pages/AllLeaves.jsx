import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { leaveAPI } from '../services/api';
import { toast } from 'react-toastify';

const getStatusBadge = (status) => {
  const badges = {
    pending_staff: 'badge-pending',
    pending_hod: 'badge-pending',
    pending_principal: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  };
  return badges[status] || 'badge-pending';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const statusClass = (status) => {
  if (status === 'approved') return 'status-approved';
  if (status === 'rejected') return 'status-rejected';
  return 'status-pending';
};

export const AllLeaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user?.role !== 'principal') {
      return;
    }
    fetchAllLeaves();
  }, [user]);

  const fetchAllLeaves = async () => {
    try {
      const response = await leaveAPI.getAllLeaves();
      setLeaves(response.data.leaves);
    } catch (error) {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaves = filterStatus === 'all'
    ? leaves
    : leaves.filter((leave) => leave.status === filterStatus);

  const approvedCount = leaves.filter((item) => item.status === 'approved').length;
  const rejectedCount = leaves.filter((item) => item.status === 'rejected').length;
  const pendingCount = leaves.filter((item) => item.status.startsWith('pending')).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="page-hero">
        <p className="page-kicker">Principal Overview</p>
        <h1 className="page-title">All Leave Requests</h1>
        <p className="page-subtitle">Filter by status and inspect complete approval chains with remarks.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="metric-tile">
          <p className="label-subtle">Pending</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{pendingCount}</p>
        </article>
        <article className="metric-tile">
          <p className="label-subtle">Approved</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{approvedCount}</p>
        </article>
        <article className="metric-tile">
          <p className="label-subtle">Rejected</p>
          <p className="mt-2 text-3xl font-bold text-rose-600">{rejectedCount}</p>
        </article>
      </section>

      <div className="card">
        <label className="mb-2 block text-sm font-semibold text-slate-700">Filter by Status</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field max-w-sm"
        >
          <option value="all">All Statuses</option>
          <option value="pending_staff">Pending Staff Approval</option>
          <option value="pending_hod">Pending HOD Approval</option>
          <option value="pending_principal">Pending Principal Approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {filteredLeaves.length === 0 ? (
        <div className="card text-center">
          <p className="text-lg font-semibold text-slate-700">No leave requests found</p>
          <p className="mt-1 text-sm text-slate-500">Try a different status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeaves.map((leave) => (
            <div key={leave._id} className="card">
              <div
                className="flex cursor-pointer items-start justify-between gap-4"
                onClick={() =>
                  setExpandedId(expandedId === leave._id ? null : leave._id)
                }
              >
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-800">
                      {leave.userId?.name}
                    </h3>
                    <span className={`badge ${getStatusBadge(leave.status)}`}>
                      {leave.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {leave.leaveType} Leave • {formatDate(leave.fromDate)} to{' '}
                    {formatDate(leave.toDate)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    <strong>Role:</strong> {leave.userId?.role.toUpperCase()} |{' '}
                    <strong>Department:</strong> {leave.userId?.department || 'N/A'}
                  </p>
                </div>
                <div className="text-2xl text-slate-400">{expandedId === leave._id ? '-' : '+'}</div>
              </div>

              {expandedId === leave._id && (
                <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                  <div className="panel-soft">
                    <p className="label-subtle">Reason</p>
                    <p className="mt-2 text-sm text-slate-700">{leave.reason}</p>
                  </div>

                  <div className="approval-grid">
                    <div className="approval-cell">
                      <p className="label-subtle">
                        Staff Approval
                      </p>
                      <p
                        className={`mt-1 text-sm font-bold ${statusClass(
                          leave.approvals.staffApproval.status
                        )}`}
                      >
                        {leave.approvals.staffApproval.status.toUpperCase()}
                      </p>
                      {leave.approvals.staffApproval.approvedBy && (
                        <p className="mt-2 text-xs text-slate-600">
                          By {leave.approvals.staffApproval.approvedBy.name}
                        </p>
                      )}
                    </div>

                    <div className="approval-cell">
                      <p className="label-subtle">
                        HOD Approval
                      </p>
                      <p
                        className={`mt-1 text-sm font-bold ${statusClass(
                          leave.approvals.hodApproval.status
                        )}`}
                      >
                        {leave.approvals.hodApproval.status.toUpperCase()}
                      </p>
                      {leave.approvals.hodApproval.approvedBy && (
                        <p className="mt-2 text-xs text-slate-600">
                          By {leave.approvals.hodApproval.approvedBy.name}
                        </p>
                      )}
                    </div>

                    <div className="approval-cell">
                      <p className="label-subtle">
                        Principal Approval
                      </p>
                      <p
                        className={`mt-1 text-sm font-bold ${statusClass(
                          leave.approvals.principalApproval.status
                        )}`}
                      >
                        {leave.approvals.principalApproval.status.toUpperCase()}
                      </p>
                      {leave.approvals.principalApproval.approvedBy && (
                        <p className="mt-2 text-xs text-slate-600">
                          By {leave.approvals.principalApproval.approvedBy.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
