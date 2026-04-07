import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const MOCK_USERS_KEY = 'lms_mock_users';
const MOCK_LEAVES_KEY = 'lms_mock_leaves';
const MOCK_TOKEN_PREFIX = 'mock::';

const sleep = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.response = {
    status,
    data: { message },
  };
  return error;
};

const createId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const clone = (value) => JSON.parse(JSON.stringify(value));

const seedMockUsers = () => [
  {
    _id: 'u_principal_1',
    name: 'Dr. Principal',
    email: 'principal@school.edu',
    password: 'Principal@123',
    role: 'principal',
    department: 'Administration',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'u_hod_1',
    name: 'Prof. HOD',
    email: 'hod.cs@school.edu',
    password: 'HOD@123',
    role: 'hod',
    department: 'Computer Science',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'u_staff_1',
    name: 'Ms. Staff',
    email: 'staff@school.edu',
    password: 'Staff@123',
    role: 'staff',
    department: 'Computer Science',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'u_student_1',
    name: 'John Student',
    email: 'student@school.edu',
    password: 'Student@123',
    role: 'student',
    department: null,
    createdAt: new Date().toISOString(),
  },
];

const seedMockLeaves = () => [
  {
    _id: 'l_pending_staff_1',
    userId: 'u_student_1',
    role: 'student',
    leaveType: 'Casual',
    reason: 'Family function',
    fromDate: new Date(Date.now() + 86400000).toISOString(),
    toDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    status: 'pending_staff',
    approvals: {
      staffApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
      hodApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
      principalApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'l_pending_hod_1',
    userId: 'u_student_1',
    role: 'student',
    leaveType: 'Medical',
    reason: 'Medical checkup',
    fromDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    toDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    status: 'pending_hod',
    approvals: {
      staffApproval: {
        status: 'approved',
        approvedBy: 'u_staff_1',
        remarks: 'Proceed',
        approvedAt: new Date().toISOString(),
      },
      hodApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
      principalApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'l_pending_principal_1',
    userId: 'u_staff_1',
    role: 'staff',
    leaveType: 'Sick',
    reason: 'Fever and rest',
    fromDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    toDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    status: 'pending_principal',
    approvals: {
      staffApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
      hodApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
      principalApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
    },
    createdAt: new Date().toISOString(),
  },
];

const getUsers = () => {
  const raw = localStorage.getItem(MOCK_USERS_KEY);
  if (!raw) {
    const seeded = seedMockUsers();
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(raw);
};

const setUsers = (users) => localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

const getLeaves = () => {
  const raw = localStorage.getItem(MOCK_LEAVES_KEY);
  if (!raw) {
    const seeded = seedMockLeaves();
    localStorage.setItem(MOCK_LEAVES_KEY, JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(raw);
};

const setLeaves = (leaves) => localStorage.setItem(MOCK_LEAVES_KEY, JSON.stringify(leaves));

const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token || !token.startsWith(MOCK_TOKEN_PREFIX)) {
    throw createError('Invalid token', 401);
  }

  const userId = token.replace(MOCK_TOKEN_PREFIX, '');
  const user = getUsers().find((item) => item._id === userId);
  if (!user) {
    throw createError('User not found', 404);
  }
  return user;
};

const presentUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
});

const withPopulation = (leave) => {
  const users = getUsers();
  const findUser = (id) => users.find((item) => item._id === id) || null;

  const owner = findUser(leave.userId);
  const staffApprover = findUser(leave.approvals.staffApproval.approvedBy);
  const hodApprover = findUser(leave.approvals.hodApproval.approvedBy);
  const principalApprover = findUser(leave.approvals.principalApproval.approvedBy);

  return {
    ...clone(leave),
    userId: owner
      ? {
          _id: owner._id,
          name: owner.name,
          email: owner.email,
          role: owner.role,
          department: owner.department,
        }
      : null,
    approvals: {
      staffApproval: {
        ...leave.approvals.staffApproval,
        approvedBy: staffApprover
          ? { _id: staffApprover._id, name: staffApprover.name, email: staffApprover.email }
          : null,
      },
      hodApproval: {
        ...leave.approvals.hodApproval,
        approvedBy: hodApprover
          ? { _id: hodApprover._id, name: hodApprover.name, email: hodApprover.email }
          : null,
      },
      principalApproval: {
        ...leave.approvals.principalApproval,
        approvedBy: principalApprover
          ? { _id: principalApprover._id, name: principalApprover.name, email: principalApprover.email }
          : null,
      },
    },
  };
};

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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
  getAllLeaves: () => api.get('/leaves/all'),
};

const mockAuthAPI = {
  register: async (data) => {
    await sleep();
    const { name, email, password, role, department } = data || {};
    if (!name || !email || !password || !role) {
      throw createError('Please provide all required fields', 400);
    }

    if ((role === 'hod' || role === 'principal') && !department) {
      throw createError('Department is required for this role', 400);
    }

    const users = getUsers();
    const existing = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw createError('Email already in use', 400);
    }

    const newUser = {
      _id: createId(),
      name,
      email: email.toLowerCase(),
      password,
      role,
      department: department || null,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setUsers(users);

    return {
      data: {
        message: 'User registered successfully',
        token: `${MOCK_TOKEN_PREFIX}${newUser._id}`,
        user: presentUser(newUser),
      },
    };
  },
  login: async (data) => {
    await sleep();
    const { email, password } = data || {};
    if (!email || !password) {
      throw createError('Please provide email and password', 400);
    }

    const user = getUsers().find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      throw createError('Invalid credentials', 401);
    }

    return {
      data: {
        message: 'Login successful',
        token: `${MOCK_TOKEN_PREFIX}${user._id}`,
        user: presentUser(user),
      },
    };
  },
  getMe: async () => {
    await sleep(150);
    const user = getCurrentUser();
    return { data: { user: presentUser(user) } };
  },
};

const mockLeaveAPI = {
  applyLeave: async (data) => {
    await sleep();
    const user = getCurrentUser();
    if (user.role !== 'student' && user.role !== 'staff') {
      throw createError('Only students and staff can apply for leave', 403);
    }

    const { leaveType, reason, fromDate, toDate } = data || {};
    if (!leaveType || !reason || !fromDate || !toDate) {
      throw createError('Please provide all required fields', 400);
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
      throw createError('To date must be after from date', 400);
    }

    const leave = {
      _id: createId(),
      userId: user._id,
      role: user.role,
      leaveType,
      reason,
      fromDate: from.toISOString(),
      toDate: to.toISOString(),
      status: user.role === 'student' ? 'pending_staff' : 'pending_principal',
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

    return {
      data: {
        message: 'Leave application submitted',
        leave: withPopulation(leave),
      },
    };
  },
  getMyLeaves: async () => {
    await sleep(180);
    const user = getCurrentUser();
    const leaves = getLeaves()
      .filter((item) => item.userId === user._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(withPopulation);

    return { data: { leaves } };
  },
  getPendingLeaves: async () => {
    await sleep(180);
    const user = getCurrentUser();
    let filtered = [];

    if (user.role === 'staff') {
      filtered = getLeaves().filter((item) => item.status === 'pending_staff' && item.role === 'student');
    } else if (user.role === 'hod') {
      filtered = getLeaves().filter((item) => item.status === 'pending_hod');
    } else if (user.role === 'principal') {
      filtered = getLeaves().filter((item) => item.status === 'pending_principal');
    } else {
      throw createError('No pending leaves to view', 403);
    }

    return {
      data: {
        leaves: filtered
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(withPopulation),
      },
    };
  },
  approveLeave: async (id, data) => {
    await sleep();
    const user = getCurrentUser();
    const leaves = getLeaves();
    const idx = leaves.findIndex((item) => item._id === id);
    if (idx === -1) {
      throw createError('Leave not found', 404);
    }

    const leave = leaves[idx];
    const remarks = data?.remarks || '';

    if (user.role === 'staff' && leave.status === 'pending_staff') {
      leave.approvals.staffApproval = {
        status: 'approved',
        approvedBy: user._id,
        remarks,
        approvedAt: new Date().toISOString(),
      };
      leave.status = leave.role === 'student' ? 'pending_hod' : 'approved';
    } else if (user.role === 'hod' && leave.status === 'pending_hod') {
      leave.approvals.hodApproval = {
        status: 'approved',
        approvedBy: user._id,
        remarks,
        approvedAt: new Date().toISOString(),
      };
      leave.status = 'approved';
    } else if (user.role === 'principal' && leave.status === 'pending_principal') {
      leave.approvals.principalApproval = {
        status: 'approved',
        approvedBy: user._id,
        remarks,
        approvedAt: new Date().toISOString(),
      };
      leave.status = 'approved';
    } else {
      throw createError('Unauthorized to approve this leave', 403);
    }

    leaves[idx] = leave;
    setLeaves(leaves);
    return { data: { message: 'Leave approved', leave: withPopulation(leave) } };
  },
  rejectLeave: async (id, data) => {
    await sleep();
    const user = getCurrentUser();
    const leaves = getLeaves();
    const idx = leaves.findIndex((item) => item._id === id);
    if (idx === -1) {
      throw createError('Leave not found', 404);
    }

    const leave = leaves[idx];
    const remarks = data?.remarks || '';

    if (user.role === 'staff' && leave.status === 'pending_staff') {
      leave.approvals.staffApproval = {
        status: 'rejected',
        approvedBy: user._id,
        remarks,
        approvedAt: new Date().toISOString(),
      };
      leave.status = 'rejected';
    } else if (user.role === 'hod' && leave.status === 'pending_hod') {
      leave.approvals.hodApproval = {
        status: 'rejected',
        approvedBy: user._id,
        remarks,
        approvedAt: new Date().toISOString(),
      };
      leave.status = 'rejected';
    } else if (user.role === 'principal' && leave.status === 'pending_principal') {
      leave.approvals.principalApproval = {
        status: 'rejected',
        approvedBy: user._id,
        remarks,
        approvedAt: new Date().toISOString(),
      };
      leave.status = 'rejected';
    } else {
      throw createError('Unauthorized to reject this leave', 403);
    }

    leaves[idx] = leave;
    setLeaves(leaves);
    return { data: { message: 'Leave rejected', leave: withPopulation(leave) } };
  },
  getAllLeaves: async () => {
    await sleep(220);
    const user = getCurrentUser();
    if (user.role !== 'principal') {
      throw createError('Access denied', 403);
    }

    const leaves = getLeaves()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(withPopulation);

    return { data: { leaves } };
  },
};

export const authAPI = USE_MOCK ? mockAuthAPI : liveAuthAPI;
export const leaveAPI = USE_MOCK ? mockLeaveAPI : liveLeaveAPI;

export default api;
