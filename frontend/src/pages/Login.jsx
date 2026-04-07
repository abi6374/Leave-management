import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell relative flex min-h-screen items-center justify-center p-4 sm:p-8">
      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white/85 shadow-2xl backdrop-blur md:grid-cols-2">
        <section className="hidden bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-500 p-10 text-white md:block">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-100">LeaveFlow</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Manage Leaves With Real Workflow Control</h1>
          <p className="mt-4 max-w-sm text-sm text-cyan-100">
            Fast approvals, clear status trails, and role-based dashboards for students, staff,
            HODs, and principals.
          </p>
          <div className="mt-8 space-y-3 text-sm">
            <p>• JWT secured sessions</p>
            <p>• Multi-stage approval lifecycle</p>
            <p>• Responsive dashboard experience</p>
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in to continue to your dashboard.</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {['student', 'staff', 'hod', 'principal'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                  selectedRole === role
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@campus.edu"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-16"
                  placeholder="Enter password"
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
              <div className="mt-1 text-right">
                <button type="button" className="text-xs font-semibold text-sky-700 hover:text-sky-800">
                  Forgot password?
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            New here?{' '}
            <Link to="/register" className="font-bold text-sky-700 hover:text-sky-800">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};
