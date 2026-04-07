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

export const Approvals = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      const response = await leaveAPI.getPendingLeaves();
      setLeaves(response.data.leaves);
    } catch (error) {
      toast.error('Failed to fetch pending leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    setProcessingId(leaveId);
    try {
      await leaveAPI.approveLeave(leaveId, { remarks: remarks[leaveId] || '' });
      toast.success('Leave approved!');
      fetchPendingLeaves();
    } catch (error) {
      toast.error('Failed to approve leave');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (leaveId) => {
    setProcessingId(leaveId);
    try {
      await leaveAPI.rejectLeave(leaveId, { remarks: remarks[leaveId] || '' });
      toast.success('Leave rejected!');
      fetchPendingLeaves();
    } catch (error) {
      toast.error('Failed to reject leave');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (leaves.length === 0) {
    return (
      <div className="space-y-5">
        <section className="page-hero">
          <p className="page-kicker">Approvals</p>
          <h1 className="page-title">Pending Approvals</h1>
          <p className="page-subtitle">Review requests and act with remarks for clear audit trails.</p>
        </section>
        <div className="card text-center">
          <p className="text-lg font-semibold text-slate-700">No pending leaves for approval</p>
          <p className="mt-1 text-sm text-slate-500">Everything is currently up to date.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="page-hero">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="page-kicker">Approvals</p>
            <h1 className="page-title">Pending Approvals</h1>
            <p className="page-subtitle">Role: {user?.role?.toUpperCase()} | Total pending: {leaves.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100">
            Decision window open
          </div>
        </div>
      </section>

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
                  <h3 className="text-lg font-bold text-slate-800">{leave.userId?.name}</h3>
                  <span className={`badge ${getStatusBadge(leave.status)}`}>
                    {leave.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {leave.leaveType} Leave • {formatDate(leave.fromDate)} to{' '}
                  {formatDate(leave.toDate)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  <strong>Role:</strong> {leave.userId?.role.toUpperCase()} | <strong>Email:</strong>{' '}
                  {leave.userId?.email}
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

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Add Remarks (Optional)
                  </label>
                  <textarea
                    value={remarks[leave._id] || ''}
                    onChange={(e) =>
                      setRemarks((prev) => ({
                        ...prev,
                        [leave._id]: e.target.value,
                      }))
                    }
                    className="input-field resize-none"
                    rows="3"
                    placeholder="Add any remarks..."
                  ></textarea>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => handleApprove(leave._id)}
                    disabled={processingId === leave._id}
                    className="btn-success flex-1"
                  >
                    {processingId === leave._id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(leave._id)}
                    disabled={processingId === leave._id}
                    className="btn-danger flex-1"
                  >
                    {processingId === leave._id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
