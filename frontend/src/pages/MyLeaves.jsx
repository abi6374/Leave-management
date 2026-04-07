import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
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

export const MyLeaves = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const response = await leaveAPI.getMyLeaves();
      setLeaves(response.data.leaves);
    } catch (error) {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const approvedCount = leaves.filter((leave) => leave.status === 'approved').length;
  const rejectedCount = leaves.filter((leave) => leave.status === 'rejected').length;
  const pendingCount = leaves.filter((leave) => leave.status.startsWith('pending')).length;

  return (
    <div className="space-y-5">
      <section className="page-hero">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="page-kicker">History</p>
            <h1 className="page-title">My Leave Applications</h1>
            <p className="page-subtitle">Track status updates and approval remarks across each level.</p>
          </div>
          {(user?.role === 'student' || user?.role === 'staff') && (
            <button onClick={() => navigate('/apply-leave')} className="btn-primary">
              + Apply for Leave
            </button>
          )}
        </div>
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

      {leaves.length === 0 ? (
        <div className="card text-center">
          <p className="text-lg font-semibold text-slate-700">No leave applications yet</p>
          <p className="mt-1 text-sm text-slate-500">Create your first request from the apply page.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaves.map((leave) => (
            <div key={leave._id} className="card">
              <div
                className="flex cursor-pointer items-start justify-between gap-4"
                onClick={() =>
                  setExpandedId(expandedId === leave._id ? null : leave._id)
                }
              >
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-800">{leave.leaveType} Leave</h3>
                    <span className={`badge ${getStatusBadge(leave.status)}`}>
                      {leave.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {formatDate(leave.fromDate)} to {formatDate(leave.toDate)}
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
                      <p className="label-subtle">Staff Approval</p>
                      <p className={`mt-1 text-sm font-bold ${statusClass(leave.approvals.staffApproval.status)}`}>
                        {leave.approvals.staffApproval.status.toUpperCase()}
                      </p>
                      {leave.approvals.staffApproval.remarks && (
                        <p className="mt-2 text-xs text-slate-600">{leave.approvals.staffApproval.remarks}</p>
                      )}
                    </div>

                    <div className="approval-cell">
                      <p className="label-subtle">HOD Approval</p>
                      <p className={`mt-1 text-sm font-bold ${statusClass(leave.approvals.hodApproval.status)}`}>
                        {leave.approvals.hodApproval.status.toUpperCase()}
                      </p>
                      {leave.approvals.hodApproval.remarks && (
                        <p className="mt-2 text-xs text-slate-600">{leave.approvals.hodApproval.remarks}</p>
                      )}
                    </div>

                    <div className="approval-cell">
                      <p className="label-subtle">Principal Approval</p>
                      <p
                        className={`mt-1 text-sm font-bold ${statusClass(
                          leave.approvals.principalApproval.status
                        )}`}
                      >
                        {leave.approvals.principalApproval.status.toUpperCase()}
                      </p>
                      {leave.approvals.principalApproval.remarks && (
                        <p className="mt-2 text-xs text-slate-600">
                          {leave.approvals.principalApproval.remarks}
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
