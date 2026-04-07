import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useLeaves } from '../hooks/useLeaves';
import { leaveAPI } from '../services/api';
import { LeaveCard } from '../components/leaves/LeaveCard';
import { ApprovalTimeline } from '../components/leaves/ApprovalTimeline';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { CommentDrawer } from '../components/leaves/CommentDrawer';

export const Approvals = () => {
  const { leaves, loading, refreshLeaves } = useLeaves('pending');
  const [remarks, setRemarks] = useState({});
  const [decision, setDecision] = useState(null);
  const [commentLeave, setCommentLeave] = useState(null);

  const submitDecision = async () => {
    if (!decision) return;

    try {
      if (decision.type === 'approve') {
        await leaveAPI.approveLeave(decision.leaveId, { remarks: remarks[decision.leaveId] || '' });
        toast.success('Leave approved');
      } else {
        await leaveAPI.rejectLeave(decision.leaveId, { remarks: remarks[decision.leaveId] || '' });
        toast.success('Leave rejected');
      }

      setDecision(null);
      refreshLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Decision failed');
    }
  };

  if (loading) return <div className="card">Loading pending approvals...</div>;

  return (
    <div className="space-y-4">
      <div className="page-hero">
        <p className="page-kicker">Queue</p>
        <h2 className="page-title">Approval Queue</h2>
        <p className="page-subtitle">Review requests, add remarks, and decide with confirmation.</p>
      </div>

      <div className="space-y-3">
        {leaves.map((leave) => (
          <LeaveCard
            key={leave._id}
            leave={leave}
            actions={
              <div className="space-y-3">
                <ApprovalTimeline approvals={leave.approvals} />
                <textarea
                  rows="3"
                  className="input-field resize-none"
                  placeholder="Add remark"
                  value={remarks[leave._id] || ''}
                  onChange={(e) => setRemarks((prev) => ({ ...prev, [leave._id]: e.target.value }))}
                />
                <div className="flex flex-wrap gap-2">
                  <button className="btn-success" onClick={() => setDecision({ type: 'approve', leaveId: leave._id })}>Approve</button>
                  <button className="btn-danger" onClick={() => setDecision({ type: 'reject', leaveId: leave._id })}>Reject</button>
                  <button className="btn-secondary" onClick={() => setCommentLeave(leave)}>View Comments</button>
                </div>
              </div>
            }
          />
        ))}
        {!leaves.length ? <div className="card">No pending approvals right now.</div> : null}
      </div>

      <ConfirmModal
        open={Boolean(decision)}
        title={decision?.type === 'approve' ? 'Approve Leave?' : 'Reject Leave?'}
        message="This action will update workflow status and notify the applicant."
        confirmText={decision?.type === 'approve' ? 'Approve' : 'Reject'}
        onConfirm={submitDecision}
        onCancel={() => setDecision(null)}
      />

      <CommentDrawer
        open={Boolean(commentLeave)}
        comments={commentLeave?.comments || []}
        onClose={() => setCommentLeave(null)}
      />
    </div>
  );
};
