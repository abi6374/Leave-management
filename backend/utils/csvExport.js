const csvEscape = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value).replace(/\"/g, '\"\"');
  return `\"${str}\"`;
};

export const buildLeavesCsv = (leaves = []) => {
  const headers = [
    'Leave ID',
    'Applicant Name',
    'Applicant Email',
    'Role',
    'Department',
    'Leave Type',
    'From Date',
    'To Date',
    'Total Days',
    'Status',
    'Is Urgent',
    'Created At',
  ];

  const rows = leaves.map((leave) => {
    const applicant = leave.userId || {};
    return [
      leave._id,
      applicant.name,
      applicant.email,
      leave.role,
      applicant.department,
      leave.leaveType,
      leave.fromDate ? new Date(leave.fromDate).toISOString().slice(0, 10) : '',
      leave.toDate ? new Date(leave.toDate).toISOString().slice(0, 10) : '',
      leave.totalDays,
      leave.status,
      leave.isUrgent ? 'Yes' : 'No',
      leave.createdAt ? new Date(leave.createdAt).toISOString() : '',
    ].map(csvEscape).join(',');
  });

  return `${headers.map(csvEscape).join(',')}\n${rows.join('\n')}`;
};
