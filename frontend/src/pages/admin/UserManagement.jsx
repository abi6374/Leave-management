import React, { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.listUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleStatus = async (user) => {
    try {
      await userAPI.toggleUserActivation(user._id || user.id, !user.isActive);
      toast.success('User status updated');
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  if (loading) return <div className="card">Loading users...</div>;

  return (
    <div className="space-y-4">
      <div className="page-hero">
        <p className="page-kicker">Admin</p>
        <h2 className="page-title">User Management</h2>
        <p className="page-subtitle">Activate or deactivate user accounts.</p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Department</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id || user.id} className="border-t border-slate-200/80">
                <td className="py-3 font-semibold text-slate-800">{user.name}</td>
                <td className="py-3 text-slate-600">{user.email}</td>
                <td className="py-3 text-slate-600">{user.role}</td>
                <td className="py-3 text-slate-600">{user.department || '-'}</td>
                <td className="py-3 text-slate-600">{user.isActive ? 'Active' : 'Inactive'}</td>
                <td className="py-3">
                  {user.role === 'principal' ? (
                    <span className="text-xs font-semibold text-slate-400">Protected</span>
                  ) : (
                    <button className="btn-secondary" onClick={() => toggleStatus(user)}>
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
