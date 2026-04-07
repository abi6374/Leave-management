import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const LeaveBarChart = ({ data = [] }) => {
  const formatted = data.map((item) => ({
    month: `${item._id?.month || ''}/${item._id?.year || ''}`,
    Applied: item.totalApplied || 0,
    Approved: item.totalApproved || 0,
    Rejected: item.totalRejected || 0,
  }));

  return (
    <div className="card h-80">
      <h3 className="text-lg font-bold text-slate-800">Leave Trends by Month</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Applied" fill="#2563EB" />
            <Bar dataKey="Approved" fill="#10B981" />
            <Bar dataKey="Rejected" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
