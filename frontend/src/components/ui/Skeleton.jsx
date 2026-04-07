import React from 'react';

export const Skeleton = ({ className = 'h-4 w-full' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
);
