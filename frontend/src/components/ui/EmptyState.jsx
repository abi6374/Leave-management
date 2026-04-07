import React from 'react';

export const EmptyState = ({ title, description }) => (
  <div className="card text-center">
    <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-slate-100" />
    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
  </div>
);
