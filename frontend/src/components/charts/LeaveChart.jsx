import React from 'react';
import { LeaveBarChart } from './LeaveBarChart';
import { LeaveTypeDonut } from './LeaveTypeDonut';

export const LeaveChart = ({ trendData = [], distributionData = [] }) => {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <LeaveBarChart data={trendData} />
      <LeaveTypeDonut data={distributionData} />
    </div>
  );
};
