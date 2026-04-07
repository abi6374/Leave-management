import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { leaveAPI } from '../services/api';
import { SelectField } from '../components/SelectField';

export const ApplyLeave = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Casual',
    reason: '',
    fromDate: '',
    toDate: '',
  });

  const leaveTypeOptions = [
    { value: 'Casual', label: 'Casual' },
    { value: 'Sick', label: 'Sick' },
    { value: 'Earned', label: 'Earned' },
    { value: 'Medical', label: 'Medical' },
    { value: 'Special', label: 'Special' },
  ];

  useEffect(() => {
    if (user && (user.role === 'principal' || user.role === 'hod')) {
      toast.error('You cannot apply for leave');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await leaveAPI.applyLeave(formData);
      toast.success('Leave application submitted!');
      navigate('/my-leaves');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <section className="page-hero">
        <p className="page-kicker">Leave Console</p>
        <h1 className="page-title">Apply for Leave</h1>
        <p className="page-subtitle">
          Submit your request with exact dates and a clear reason so approvals can move faster.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <SelectField
                  label="Leave Type"
                  value={formData.leaveType}
                  options={leaveTypeOptions}
                  onChange={(leaveType) =>
                    setFormData((prev) => ({
                      ...prev,
                      leaveType,
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">From Date</label>
                <input
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">To Date</label>
              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Reason for Leave</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="input-field resize-none"
                rows="6"
                placeholder="Briefly mention why you need leave"
                required
              ></textarea>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <aside className="card">
          <p className="label-subtle">Submission Tips</p>
          <ul className="mt-3 space-y-3 text-sm text-slate-600">
            <li>Use exact dates for faster approval decisions.</li>
            <li>Keep your reason short but specific.</li>
            <li>Medical leaves should mention if documents are available.</li>
          </ul>
          <div className="panel-soft mt-5">
            <p className="label-subtle">Workflow</p>
            <p className="mt-2 text-sm text-slate-700">Student: Staff to HOD to Principal</p>
            <p className="mt-1 text-sm text-slate-700">Staff: Principal</p>
          </div>
        </aside>
      </div>
    </div>
  );
};
