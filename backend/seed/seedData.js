import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Leave from '../models/Leave.js';
import LeaveBalance from '../models/LeaveBalance.js';
import Notification from '../models/Notification.js';
import { countWorkingDays } from '../utils/dateUtils.js';

dotenv.config();

const defaultBalance = {
  sick: { total: 12, used: 0, remaining: 12 },
  casual: { total: 12, used: 0, remaining: 12 },
  earned: { total: 15, used: 0, remaining: 15 },
  duty: { total: 10, used: 0, remaining: 10 },
};

const usersSeed = [
  { name: 'Dr. Arun Prakash', email: 'principal@campus.edu', role: 'principal', department: 'Administration', employeeId: 'EMP-P-001' },
  { name: 'Prof. Meena CSE', email: 'hod.cse@campus.edu', role: 'hod', department: 'CSE', employeeId: 'EMP-HCSE-001' },
  { name: 'Prof. Karthik ECE', email: 'hod.ece@campus.edu', role: 'hod', department: 'ECE', employeeId: 'EMP-HECE-001' },
  { name: 'Ms. Anitha CSE', email: 'staff1.cse@campus.edu', role: 'staff', department: 'CSE', employeeId: 'EMP-SCSE-001' },
  { name: 'Mr. Ravi CSE', email: 'staff2.cse@campus.edu', role: 'staff', department: 'CSE', employeeId: 'EMP-SCSE-002' },
  { name: 'Ms. Priya ECE', email: 'staff1.ece@campus.edu', role: 'staff', department: 'ECE', employeeId: 'EMP-SECE-001' },
  { name: 'Mr. Dinesh ECE', email: 'staff2.ece@campus.edu', role: 'staff', department: 'ECE', employeeId: 'EMP-SECE-002' },
  { name: 'Aadhil CSE', email: 'student1.cse@campus.edu', role: 'student', department: 'CSE', studentId: 'STU-CSE-001' },
  { name: 'Divya CSE', email: 'student2.cse@campus.edu', role: 'student', department: 'CSE', studentId: 'STU-CSE-002' },
  { name: 'Nikhil CSE', email: 'student3.cse@campus.edu', role: 'student', department: 'CSE', studentId: 'STU-CSE-003' },
  { name: 'Harini ECE', email: 'student1.ece@campus.edu', role: 'student', department: 'ECE', studentId: 'STU-ECE-001' },
  { name: 'Vimal ECE', email: 'student2.ece@campus.edu', role: 'student', department: 'ECE', studentId: 'STU-ECE-002' },
  { name: 'Sneha ECE', email: 'student3.ece@campus.edu', role: 'student', department: 'ECE', studentId: 'STU-ECE-003' },
];

const connect = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing in backend/.env');
  await mongoose.connect(process.env.MONGO_URI);
};

const upsertUsers = async () => {
  const map = {};

  for (const seed of usersSeed) {
    const update = {
      name: seed.name,
      role: seed.role,
      department: seed.department,
      employeeId: seed.employeeId || null,
      studentId: seed.studentId || null,
      joiningDate: new Date('2023-06-01'),
      isActive: true,
      phone: null,
      profilePhoto: null,
      password: 'Password@123',
    };

    const user = await User.findOne({ email: seed.email }).select('+password');
    if (!user) {
      const created = await User.create({ email: seed.email, ...update });
      map[seed.email] = created;
    } else {
      Object.assign(user, update);
      await user.save();
      map[seed.email] = user;
    }
  }

  return map;
};

const upsertBalances = async (usersMap) => {
  const year = new Date().getFullYear();

  for (const user of Object.values(usersMap)) {
    await LeaveBalance.findOneAndUpdate(
      { userId: user._id, year },
      {
        $set: {
          ...defaultBalance,
        },
      },
      { upsert: true }
    );
  }
};

const upsertSampleLeaves = async (usersMap) => {
  const s1 = usersMap['student1.cse@campus.edu'];
  const s2 = usersMap['student1.ece@campus.edu'];
  const st1 = usersMap['staff1.cse@campus.edu'];
  const hod = usersMap['hod.cse@campus.edu'];
  const principal = usersMap['principal@campus.edu'];

  const leaves = [
    {
      key: 'seed-pending-hod',
      userId: s1._id,
      role: 'student',
      leaveType: 'Casual',
      reason: 'Family function attendance',
      fromDate: new Date(Date.now() + 3 * 86400000),
      toDate: new Date(Date.now() + 4 * 86400000),
      status: 'pending_hod',
      approvals: {
        staffApproval: { status: 'approved', approvedBy: st1._id, remarks: 'Valid request', approvedAt: new Date() },
        hodApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
        principalApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
      },
    },
    {
      key: 'seed-approved-principal',
      userId: st1._id,
      role: 'staff',
      leaveType: 'Sick',
      reason: 'Fever and recovery',
      fromDate: new Date(Date.now() - 2 * 86400000),
      toDate: new Date(Date.now() - 1 * 86400000),
      status: 'approved',
      approvals: {
        staffApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
        hodApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
        principalApproval: { status: 'approved', approvedBy: principal._id, remarks: 'Approved', approvedAt: new Date() },
      },
    },
    {
      key: 'seed-rejected-hod',
      userId: s2._id,
      role: 'student',
      leaveType: 'Duty',
      reason: 'Department event logistics',
      fromDate: new Date(Date.now() + 6 * 86400000),
      toDate: new Date(Date.now() + 7 * 86400000),
      status: 'rejected',
      approvals: {
        staffApproval: { status: 'approved', approvedBy: usersMap['staff1.ece@campus.edu']._id, remarks: 'Forwarding', approvedAt: new Date() },
        hodApproval: { status: 'rejected', approvedBy: hod._id, remarks: 'Insufficient details', approvedAt: new Date() },
        principalApproval: { status: 'pending', approvedBy: null, remarks: '', approvedAt: null },
      },
    },
  ];

  for (const item of leaves) {
    const totalDays = countWorkingDays(item.fromDate, item.toDate);
    await Leave.findOneAndUpdate(
      { reason: item.reason, userId: item.userId },
      {
        $set: {
          ...item,
          totalDays,
          isUrgent: false,
          comments: [{ role: item.role, message: 'Seed leave request', timestamp: new Date() }],
        },
      },
      { upsert: true }
    );
  }
};

const run = async () => {
  try {
    await connect();

    const usersMap = await upsertUsers();
    await upsertBalances(usersMap);
    await upsertSampleLeaves(usersMap);

    await Notification.deleteMany({});

    console.log('Seed completed successfully');
    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Balances: ${await LeaveBalance.countDocuments()}`);
    console.log(`Leaves: ${await Leave.countDocuments()}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

run();
