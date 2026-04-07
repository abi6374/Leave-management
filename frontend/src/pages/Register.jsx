import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SelectField } from '../components/SelectField';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    employeeId: '',
    studentId: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'staff', label: 'Staff' },
    { value: 'hod', label: 'HOD' },
    { value: 'principal', label: 'Principal' },
  ];

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
      await register(formData);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell relative flex min-h-screen items-center justify-center p-4 sm:p-8">
      <div className="relative z-10 grid w-full max-w-6xl overflow-visible rounded-3xl border border-slate-200/70 bg-white/85 shadow-2xl backdrop-blur md:min-h-[620px] md:grid-cols-2">
        <section className="hidden bg-gradient-to-br from-cyan-700 via-sky-700 to-blue-600 p-10 text-white md:block">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">LeaveFlow</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Create Your Role-Based Workspace</h1>
          <p className="mt-4 max-w-sm text-sm text-cyan-100">
            Register once and get immediate access to your leave operations and approval pipeline.
          </p>
          <div className="mt-8 rounded-2xl bg-white/10 p-4 text-sm">
            <p>Choose role carefully:</p>
            <p className="mt-2">Student, Staff, HOD, Principal</p>
          </div>
        </section>

        <section className="relative p-6 sm:p-10">
          <h2 className="text-3xl font-bold text-slate-800">Create Account</h2>
          <p className="mt-2 text-sm text-slate-500">Get started in less than a minute.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@campus.edu"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pr-16"
                    placeholder="Minimum 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 text-sm font-semibold text-sky-700 hover:text-sky-800"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div>
                <SelectField
                  label="Role"
                  value={formData.role}
                  options={roleOptions}
                  onChange={(newRole) =>
                    setFormData((prev) => ({
                      ...prev,
                      role: newRole,
                    }))
                  }
                />
              </div>
            </div>

            {(formData.role === 'student' || formData.role === 'staff' || formData.role === 'hod') && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Computer Science"
                  required
                />
              </div>
            )}

            {formData.role === 'student' ? (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="STU-001"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="EMP-001"
                  required
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-sky-700 hover:text-sky-800">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};
