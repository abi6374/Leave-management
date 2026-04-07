import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const LS_KEYS = {
  users: 'lms_mock_users_v2',
  leaves: 'lms_mock_leaves_v2',
  balances: 'lms_mock_balances_v2',
  notifications: 'lms_mock_notifications_v2',
  tokenPrefix: 'mock::',
};

const sleep = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const createError = (message, status = 400) => {
  const err = new Error(message);
  err.response = { status, data: { message } };
  return err;
};

const clone = (v) => JSON.parse(JSON.stringify(v));
const createId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const ensureData = () => {
  if (!localStorage.getItem(LS_KEYS.users)) {
    localStorage.setItem(
      LS_KEYS.users,
      JSON.stringify([
        {
          _id: 'u_principal_1',
          name: 'Dr. Principal',
          email: 'principal@campus.edu',
          password: 'Password@123',
          role: 'principal',
          department: 'Administration',
          employeeId: 'EMP-P-001',
          isActive: true,
        },
        {
          _id: 'u_hod_1',
          name: 'Prof. HOD CSE',
          email: 'hod.cse@campus.edu',
          password: 'Password@123',
          role: 'hod',
          department: 'CSE',
          employeeId: 'EMP-H-001',
          isActive: true,
        },
        {
          _id: 'u_staff_1',
          name: 'Ms. Staff',
          email: 'staff@campus.edu',
          password: 'Password@123',
          role: 'staff',
          department: 'CSE',
          employeeId: 'EMP-S-001',
          isActive: true,
        },
        {
          _id: 'u_student_1',
          name: 'Student One',
          email: 'student@campus.edu',
          password: 'Password@123',
          role: 'student',
          department: 'CSE',
          studentId: 'STU-001',
          isActive: true,
        },
      ])
    );
  }

  if (!localStorage.getItem(LS_KEYS.leaves)) {
    localStorage.setItem(
      LS_KEYS.leaves,
      JSON.stringify([
        {
          _id: 'l_1',
          userId: 'u_student_1',
          role: 'student',
          leaveType: 'Casual',
          reason: 'Family event',
          fromDate: new Date(Date.now() + 86400000).toISOString(),
          toDate: new Date(Date.now() + 2 * 86400000).toISOString(),
          totalDays: 2,
          status: 'pending_staff',
          isUrgent: false,
          comments: [],
          approvals: {
            staffApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
            hodApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
            principalApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
          },
          createdAt: new Date().toISOString(),
        },
      ])
    );
  }

  if (!localStorage.getItem(LS_KEYS.balances)) {
    localStorage.setItem(
      LS_KEYS.balances,
      JSON.stringify([
        {
          userId: 'u_student_1',
          year: new Date().getFullYear(),
          sick: { total: 12, used: 0, remaining: 12 },
          casual: { total: 12, used: 2, remaining: 10 },
          earned: { total: 15, used: 0, remaining: 15 },
          duty: { total: 10, used: 0, remaining: 10 },
        },
      ])
    );
  }

  if (!localStorage.getItem(LS_KEYS.notifications)) {
    localStorage.setItem(
      LS_KEYS.notifications,
      JSON.stringify([
        {
          _id: createId(),
          userId: 'u_student_1',
          message: 'Welcome to LeaveFlow',
          type: 'info',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ])
    );
  }
};

const getUsers = () => clone(JSON.parse(localStorage.getItem(LS_KEYS.users) || '[]'));
const setUsers = (v) => localStorage.setItem(LS_KEYS.users, JSON.stringify(v));
const getLeaves = () => clone(JSON.parse(localStorage.getItem(LS_KEYS.leaves) || '[]'));
const setLeaves = (v) => localStorage.setItem(LS_KEYS.leaves, JSON.stringify(v));
const getBalances = () => clone(JSON.parse(localStorage.getItem(LS_KEYS.balances) || '[]'));
const setBalances = (v) => localStorage.setItem(LS_KEYS.balances, JSON.stringify(v));
const getNotifications = () => clone(JSON.parse(localStorage.getItem(LS_KEYS.notifications) || '[]'));
const setNotifications = (v) => localStorage.setItem(LS_KEYS.notifications, JSON.stringify(v));

const currentUser = () => {
  ensureData();
  const token = localStorage.getItem('token');
  if (!token || !token.startsWith(LS_KEYS.tokenPrefix)) throw createError('Invalid token', 401);
  const userId = token.replace(LS_KEYS.tokenPrefix, '');
  const user = getUsers().find((u) => u._id === userId);
  if (!user) throw createError('User not found', 404);
  return user;
};

const mapUser = (u) => ({
  id: u._id,
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  department: u.department,
  employeeId: u.employeeId || null,
  studentId: u.studentId || null,
  isActive: u.isActive,
});

const withPopulation = (leave) => {
  const users = getUsers();
  const owner = users.find((u) => u._id === leave.userId);

  const mapApprover = (id) => {
    const u = users.find((x) => x._id === id);
    return u ? { _id: u._id, name: u.name, email: u.email, role: u.role } : null;
  };

  return {
    ...leave,
    userId: owner ? mapUser(owner) : null,
    approvals: {
      staffApproval: {
        ...leave.approvals.staffApproval,
        approvedBy: mapApprover(leave.approvals.staffApproval.approvedBy),
      },
      hodApproval: {
        ...leave.approvals.hodApproval,
        approvedBy: mapApprover(leave.approvals.hodApproval.approvedBy),
      },
      principalApproval: {
        ...leave.approvals.principalApproval,
        approvedBy: mapApprover(leave.approvals.principalApproval.approvedBy),
      },
    },
  };
};

const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const liveAuthAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

const liveLeaveAPI = {
  applyLeave: (data) => api.post('/leaves/apply', data),
  getMyLeaves: () => api.get('/leaves/my'),
  getPendingLeaves: () => api.get('/leaves/pending'),
  approveLeave: (id, data) => api.put(`/leaves/approve/${id}`, data),
  rejectLeave: (id, data) => api.put(`/leaves/reject/${id}`, data),
  getAllLeaves: (params) => api.get('/leaves/all', { params }),
  getDashboardStats: () => api.get('/leaves/dashboard-stats'),
  cancelLeave: (id) => api.put(`/leaves/cancel/${id}`),
  addComment: (id, data) => api.post(`/leaves/comment/${id}`, data),
  getCalendar: () => api.get('/leaves/calendar'),
  exportCsv: (params) => api.get('/leaves/export', { params, responseType: 'blob' }),
};

const liveBalanceAPI = {
  getMyBalance: (year) => api.get('/balance/my', { params: { year } }),
  getUserBalance: (userId, year) => api.get(`/balance/${userId}`, { params: { year } }),
  resetBalances: (year) => api.post('/balance/reset', { year }),
};

const liveNotificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/read/${id}`),
  markAllRead: () => api.put('/notifications/read-all'),
};

const liveUserAPI = {
  listUsers: (params) => api.get('/users', { params }),
  toggleUserActivation: (id, isActive) => api.put(`/users/${id}/activate`, { isActive }),
  getUsersByDepartment: (dept) => api.get(`/users/department/${dept}`),
};

const mockAuthAPI = {
  register: async (data) => {
    ensureData();
    await sleep();
    const { name, email, password, role, department, employeeId, studentId } = data || {};

    if (!name || !email || !password || !role) throw createError('Please provide all required fields', 400);
    if (['hod', 'staff', 'student'].includes(role) && !department) {
      throw createError('Department is required for this role', 400);
    }

    const users = getUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw createError('Email already in use', 400);
    }

    const user = {
      _id: createId(),
      name,
      email: email.toLowerCase(),
      password,
      role,
      department,
      employeeId: employeeId || null,
      studentId: studentId || null,
      isActive: true,
    };

    users.push(user);
    setUsers(users);

    const balances = getBalances();
    balances.push({
      userId: user._id,
      year: new Date().getFullYear(),
      sick: { total: 12, used: 0, remaining: 12 },
      casual: { total: 12, used: 0, remaining: 12 },
      earned: { total: 15, used: 0, remaining: 15 },
      duty: { total: 10, used: 0, remaining: 10 },
    });
    setBalances(balances);

    return {
      data: {
        message: 'User registered successfully',
        token: `${LS_KEYS.tokenPrefix}${user._id}`,
        user: mapUser(user),
      },
    };
  },
  login: async ({ email, password }) => {
    ensureData();
    await sleep();
    const user = getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) throw createError('Invalid credentials', 401);
    if (!user.isActive) throw createError('Account is deactivated. Contact principal.', 403);

    return {
      data: {
        message: 'Login successful',
        token: `${LS_KEYS.tokenPrefix}${user._id}`,
        user: mapUser(user),
      },
    };
  },
  getMe: async () => {
    ensureData();
    await sleep(100);
    return { data: { user: mapUser(currentUser()) } };
  },
};

const mockLeaveAPI = {
  applyLeave: async (data) => {
    ensureData();
    await sleep();
    const user = currentUser();
    if (!['student', 'staff'].includes(user.role)) throw createError('Only students and staff can apply', 403);

    const leave = {
      _id: createId(),
      userId: user._id,
      role: user.role,
      leaveType: data.leaveType,
      reason: data.reason,
      fromDate: data.fromDate,
      toDate: data.toDate,
      totalDays: data.totalDays || 1,
      isUrgent: Boolean(data.isUrgent),
      attachmentUrl: data.attachmentUrl || null,
      status: user.role === 'student' ? 'pending_staff' : 'pending_principal',
      comments: [],
      approvals: {
        staffApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
        hodApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
        principalApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
      },
      createdAt: new Date().toISOString(),
    };

    const leaves = getLeaves();
    leaves.unshift(leave);
    setLeaves(leaves);

    return { data: { message: 'Leave application submitted', leave: withPopulation(leave) } };
  },
  getMyLeaves: async () => {
    ensureData();
    await sleep();
    const user = currentUser();
    return { data: { leaves: getLeaves().filter((l) => l.userId === user._id).map(withPopulation) } };
  },
  getPendingLeaves: async () => {
    ensureData();
    await sleep();
    const user = currentUser();
    const leaves = getLeaves();

    let filtered = [];
    if (user.role === 'staff') filtered = leaves.filter((l) => l.status === 'pending_staff');
    else if (user.role === 'hod') filtered = leaves.filter((l) => l.status === 'pending_hod');
    else if (user.role === 'principal') filtered = leaves.filter((l) => l.status === 'pending_principal');

    return { data: { leaves: filtered.map(withPopulation) } };
  },
  approveLeave: async (id, payload) => {
    ensureData();
    await sleep();
    const user = currentUser();
    const leaves = getLeaves();
    const idx = leaves.findIndex((l) => l._id === id);
    if (idx < 0) throw createError('Leave not found', 404);
    const leave = leaves[idx];

    if (user.role === 'staff' && leave.status === 'pending_staff') {
      leave.status = 'pending_hod';
      leave.approvals.staffApproval = {
        status: 'approved',
        approvedBy: user._id,
        remarks: payload?.remarks || '',
        approvedAt: new Date().toISOString(),
      };
    } else if (user.role === 'hod' && leave.status === 'pending_hod') {
      leave.status = 'approved';
      leave.approvals.hodApproval = {
        status: 'approved',
        approvedBy: user._id,
        remarks: payload?.remarks || '',
        approvedAt: new Date().toISOString(),
      };
    } else if (user.role === 'principal' && leave.status === 'pending_principal') {
      leave.status = 'approved';
      leave.approvals.principalApproval = {
        status: 'approved',
        approvedBy: user._id,
        remarks: payload?.remarks || '',
        approvedAt: new Date().toISOString(),
      };
    } else {
      throw createError('Unauthorized to approve this leave', 403);
    }

    leaves[idx] = leave;
    setLeaves(leaves);
    return { data: { message: 'Leave approved', leave: withPopulation(leave) } };
  },
  rejectLeave: async (id, payload) => {
    ensureData();
    await sleep();
    const user = currentUser();
    const leaves = getLeaves();
    const idx = leaves.findIndex((l) => l._id === id);
    if (idx < 0) throw createError('Leave not found', 404);

    leaves[idx].status = 'rejected';
    leaves[idx].comments.push({ role: user.role, message: payload?.remarks || 'Rejected', timestamp: new Date().toISOString() });
    setLeaves(leaves);

    return { data: { message: 'Leave rejected', leave: withPopulation(leaves[idx]) } };
  },
  getAllLeaves: async () => {
    ensureData();
    await sleep();
    return { data: { leaves: getLeaves().map(withPopulation) } };
  },
  getDashboardStats: async () => {
    ensureData();
    await sleep();
    const leaves = getLeaves();
    const stats = {
      total: leaves.length,
      approved: leaves.filter((l) => l.status === 'approved').length,
      rejected: leaves.filter((l) => l.status === 'rejected').length,
      pending: leaves.filter((l) => l.status.includes('pending')).length,
    };
    return { data: { stats, monthlyTrend: [], leaveTypeDistribution: [] } };
  },
  cancelLeave: async (id) => {
    ensureData();
    await sleep();
    const user = currentUser();
    const leaves = getLeaves();
    const idx = leaves.findIndex((l) => l._id === id && l.userId === user._id);
    if (idx < 0) throw createError('Leave not found', 404);
    leaves[idx].status = 'cancelled';
    setLeaves(leaves);
    return { data: { message: 'Leave cancelled', leave: withPopulation(leaves[idx]) } };
  },
  addComment: async (id, data) => {
    ensureData();
    await sleep(100);
    const user = currentUser();
    const leaves = getLeaves();
    const idx = leaves.findIndex((l) => l._id === id);
    if (idx < 0) throw createError('Leave not found', 404);
    leaves[idx].comments.push({ role: user.role, message: data.message, timestamp: new Date().toISOString() });
    setLeaves(leaves);
    return { data: { message: 'Comment added', leave: withPopulation(leaves[idx]) } };
  },
  getCalendar: async () => {
    ensureData();
    await sleep(100);
    const events = getLeaves().map((l) => ({ id: l._id, title: l.leaveType, start: l.fromDate, end: l.toDate, status: l.status }));
    return { data: { events } };
  },
  exportCsv: async () => {
    const csv = 'Leave ID,Type,Status\n';
    return { data: new Blob([csv], { type: 'text/csv' }) };
  },
};

const mockBalanceAPI = {
  getMyBalance: async (year) => {
    ensureData();
    await sleep(100);
    const user = currentUser();
    const y = Number(year) || new Date().getFullYear();
    const balance = getBalances().find((b) => b.userId === user._id && b.year === y);
    return { data: { balance } };
  },
  getUserBalance: async (userId, year) => {
    ensureData();
    await sleep(100);
    const y = Number(year) || new Date().getFullYear();
    const balance = getBalances().find((b) => b.userId === userId && b.year === y);
    return { data: { balance } };
  },
  resetBalances: async (year) => {
    ensureData();
    await sleep(180);
    const y = Number(year) || new Date().getFullYear();
    const balances = getBalances().map((b) => ({
      ...b,
      year: y,
      sick: { total: 12, used: 0, remaining: 12 },
      casual: { total: 12, used: 0, remaining: 12 },
      earned: { total: 15, used: 0, remaining: 15 },
      duty: { total: 10, used: 0, remaining: 10 },
    }));
    setBalances(balances);
    return { data: { message: 'Balances reset' } };
  },
};

const mockNotificationAPI = {
  getNotifications: async () => {
    ensureData();
    await sleep(120);
    const user = currentUser();
    const notifications = getNotifications().filter((n) => n.userId === user._id);
    return {
      data: {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      },
    };
  },
  markRead: async (id) => {
    ensureData();
    const items = getNotifications();
    const idx = items.findIndex((n) => n._id === id);
    if (idx >= 0) items[idx].isRead = true;
    setNotifications(items);
    return { data: { message: 'Notification marked as read' } };
  },
  markAllRead: async () => {
    ensureData();
    const user = currentUser();
    const items = getNotifications().map((n) => (n.userId === user._id ? { ...n, isRead: true } : n));
    setNotifications(items);
    return { data: { message: 'All notifications marked as read' } };
  },
};

const mockUserAPI = {
  listUsers: async () => {
    ensureData();
    await sleep(120);
    return { data: { users: getUsers().map(mapUser) } };
  },
  toggleUserActivation: async (id, isActive) => {
    ensureData();
    const users = getUsers();
    const idx = users.findIndex((u) => u._id === id);
    if (idx < 0) throw createError('User not found', 404);
    users[idx].isActive = typeof isActive === 'boolean' ? isActive : !users[idx].isActive;
    setUsers(users);
    return { data: { user: mapUser(users[idx]) } };
  },
  getUsersByDepartment: async (dept) => {
    ensureData();
    await sleep(100);
    return { data: { users: getUsers().filter((u) => u.department === dept).map(mapUser) } };
  },
};

export const authAPI = USE_MOCK ? mockAuthAPI : liveAuthAPI;
export const leaveAPI = USE_MOCK ? mockLeaveAPI : liveLeaveAPI;
export const balanceAPI = USE_MOCK ? mockBalanceAPI : liveBalanceAPI;
export const notificationAPI = USE_MOCK ? mockNotificationAPI : liveNotificationAPI;
export const userAPI = USE_MOCK ? mockUserAPI : liveUserAPI;

export default api;
