import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { leaveAPI } from '../services/api';
import { SelectField } from '../components/SelectField';
import { countWorkingDays } from '../utils/dateUtils';
import { useBalance } from '../hooks/useBalance';

const leaveTypeOptions = [
  { value: 'Sick', label: 'Sick' },
  { value: 'Casual', label: 'Casual' },
  { value: 'Earned', label: 'Earned' },
  { value: 'Duty', label: 'Duty' },
  { value: 'Emergency', label: 'Emergency' },
  { value: 'Other', label: 'Other' },
];

const balanceKeyMap = {
  Sick: 'sick',
  Casual: 'casual',
  Earned: 'earned',
  Duty: 'duty',
};

export const ApplyLeave = () => {
  const navigate = useNavigate();
  const { balance } = useBalance(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Casual',
    fromDate: '',
    toDate: '',
    reason: '',
    isUrgent: false,
    attachmentUrl: '',
  });

  const totalDays = useMemo(
    () => countWorkingDays(formData.fromDate, formData.toDate),
    [formData.fromDate, formData.toDate]
  );

  const selectedBalance = useMemo(() => {
    const key = balanceKeyMap[formData.leaveType];
    return key ? balance?.[key] : null;
  }, [balance, formData.leaveType]);

  const insufficient = selectedBalance && totalDays > selectedBalance.remaining;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (insufficient) {
      toast.error('Insufficient balance for selected leave type');
      return;
    }

    if (!totalDays) {
      toast.error('Select a valid working-day date range');
      return;
    }

    setLoading(true);
    try {
      await leaveAPI.applyLeave({ ...formData, totalDays });
      toast.success('Leave application submitted');
      navigate('/my-leaves');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-hero">
        <p className="page-kicker">Apply</p>
        <h2 className="page-title">Apply Leave</h2>
        <p className="page-subtitle">Smart validation, working-day calculation, and balance checks.</p>
      </div>

      <form className="card space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label="Leave Type"
            value={formData.leaveType}
            options={leaveTypeOptions}
            onChange={(leaveType) => setFormData((prev) => ({ ...prev, leaveType }))}
          />

          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Working Days</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{totalDays}</p>
            <p className="text-xs text-slate-500">Weekends are excluded automatically.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">From Date</label>
            <input
              type="date"
              className="input-field"
              value={formData.fromDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, fromDate: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">To Date</label>
            <input
              type="date"
              className="input-field"
              value={formData.toDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, toDate: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Attachment URL</label>
            <input
              type="url"
              className="input-field"
              placeholder="https://example.com/document.pdf"
              value={formData.attachmentUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, attachmentUrl: e.target.value }))}
            />
          </div>

          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              <input
                type="checkbox"
                checked={formData.isUrgent}
                onChange={(e) => setFormData((prev) => ({ ...prev, isUrgent: e.target.checked }))}
              />
              <span className="text-sm font-semibold text-slate-700">Is urgent?</span>
            </label>
          </div>
        </div>

        {selectedBalance ? (
          <div className={`rounded-xl border p-3 ${insufficient ? 'border-rose-300 bg-rose-50' : 'border-emerald-300 bg-emerald-50'}`}>
            <p className="text-sm font-semibold text-slate-700">
              Remaining balance: {selectedBalance.remaining} day(s)
            </p>
            {insufficient ? <p className="mt-1 text-sm text-rose-700">Insufficient balance for selected range.</p> : null}
          </div>
        ) : null}

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Reason</label>
          <textarea
            rows="5"
            maxLength={500}
            className="input-field resize-none"
            value={formData.reason}
            onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
            required
          />
          <p className="mt-1 text-right text-xs text-slate-500">{formData.reason.length}/500</p>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={loading || insufficient}>
            {loading ? 'Submitting...' : 'Submit Leave Request'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
