export const canApprove = (role) => ['staff', 'hod', 'principal'].includes(role);

export const isAdminRole = (role) => ['principal', 'hod'].includes(role);

export const canViewUsers = (role) => role === 'principal';

export const roleLabel = (role) => {
  if (!role) return 'Unknown';
  if (role === 'hod') return 'HOD';
  return role.charAt(0).toUpperCase() + role.slice(1);
};
