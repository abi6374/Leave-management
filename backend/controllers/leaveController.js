import Leave from '../models/Leave.js';
import User from '../models/User.js';
import LeaveBalance from '../models/LeaveBalance.js';
import { countWorkingDays, isPastDate } from '../utils/dateUtils.js';
import { createNotification } from '../utils/notifyHelper.js';
import { buildLeavesCsv } from '../utils/csvExport.js';

const LEAVE_TYPE_TO_BALANCE_KEY = {
  Sick: 'sick',
  Casual: 'casual',
  Earned: 'earned',
  Duty: 'duty',
};

const ensureLeaveBalance = async (userId, year) => {
  return LeaveBalance.findOneAndUpdate(
    { userId, year },
    {
      $setOnInsert: {
        userId,
        year,
        sick: { total: 12, used: 0, remaining: 12 },
        casual: { total: 12, used: 0, remaining: 12 },
        earned: { total: 15, used: 0, remaining: 15 },
        duty: { total: 10, used: 0, remaining: 10 },
      },
    },
    { upsert: true, new: true }
  );
};

const deductBalance = async (leave) => {
  const key = LEAVE_TYPE_TO_BALANCE_KEY[leave.leaveType];
  if (!key) return;

  const year = new Date(leave.fromDate).getFullYear();
  const balance = await ensureLeaveBalance(leave.userId, year);
  if (balance[key].remaining < leave.totalDays) {
    throw new Error(`Insufficient ${leave.leaveType} balance`);
  }

  balance[key].used += leave.totalDays;
  balance[key].remaining -= leave.totalDays;
  await balance.save();
};

const restoreBalance = async (leave) => {
  const key = LEAVE_TYPE_TO_BALANCE_KEY[leave.leaveType];
  if (!key) return;

  const year = new Date(leave.fromDate).getFullYear();
  const balance = await ensureLeaveBalance(leave.userId, year);

  balance[key].used = Math.max(0, balance[key].used - leave.totalDays);
  balance[key].remaining = Math.min(balance[key].total, balance[key].remaining + leave.totalDays);
  await balance.save();
};

const buildApprovalPopulation = (query) =>
  query
    .populate('userId', 'name email role department employeeId studentId')
    .populate('approvals.staffApproval.approvedBy', 'name email role')
    .populate('approvals.hodApproval.approvedBy', 'name email role')
    .populate('approvals.principalApproval.approvedBy', 'name email role')
    .populate('cancelledBy', 'name email role');

const buildAllLeavesQuery = async (currentUser, filters) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.role) query.role = filters.role;
  if (filters.leaveType) query.leaveType = filters.leaveType;
  if (filters.userId) query.userId = filters.userId;

  if (filters.fromDate || filters.toDate) {
    query.fromDate = {};
    if (filters.fromDate) query.fromDate.$gte = new Date(filters.fromDate);
    if (filters.toDate) query.fromDate.$lte = new Date(filters.toDate);
  }

  if (currentUser.role === 'hod') {
    const deptUsers = await User.find({ department: currentUser.department }).select('_id');
    query.userId = { $in: deptUsers.map((u) => u._id) };
  } else if (filters.department) {
    const deptUsers = await User.find({ department: filters.department }).select('_id');
    query.userId = { $in: deptUsers.map((u) => u._id) };
  }

  return query;
};

export const applyLeave = async (req, res) => {
  try {
    const { leaveType, reason, fromDate, toDate, attachmentUrl, isUrgent } = req.body;

    if (!leaveType || !reason || !fromDate || !toDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.isActive) return res.status(403).json({ message: 'Your account is inactive' });

    if (user.role === 'principal' || user.role === 'hod') {
      return res.status(400).json({ message: 'Only students and staff can apply for leave' });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return res.status(400).json({ message: 'Invalid leave date range' });
    }

    if (leaveType !== 'Sick' && isPastDate(start)) {
      return res.status(400).json({ message: 'From date cannot be in the past for this leave type' });
    }

    const totalDays = countWorkingDays(start, end);
    if (totalDays < 1) {
      return res.status(400).json({ message: 'Date range must include at least one working day' });
    }

    const balanceKey = LEAVE_TYPE_TO_BALANCE_KEY[leaveType];
    if (balanceKey) {
      const balance = await ensureLeaveBalance(user._id, start.getFullYear());
      if (balance[balanceKey].remaining < totalDays) {
        return res.status(400).json({ message: `Insufficient ${leaveType} balance` });
      }
    }

    const leave = await Leave.create({
      userId: req.user.id,
      role: user.role,
      leaveType,
      reason,
      fromDate: start,
      toDate: end,
      totalDays,
      attachmentUrl: attachmentUrl || null,
      isUrgent: Boolean(isUrgent),
      status: user.role === 'student' ? 'pending_staff' : 'pending_principal',
      comments: [
        {
          role: user.role,
          message: 'Leave request created',
        },
      ],
    });

    const populated = await buildApprovalPopulation(Leave.findById(leave._id));

    res.status(201).json({ message: 'Leave application submitted', leave: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await buildApprovalPopulation(
      Leave.find({ userId: req.user.id }).sort({ createdAt: -1 })
    );

    res.status(200).json({ leaves });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingLeaves = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let query = {};

    if (user.role === 'staff') {
      query = { status: 'pending_staff', role: 'student' };
    } else if (user.role === 'hod') {
      query = { status: 'pending_hod' };
    } else if (user.role === 'principal') {
      query = { status: 'pending_principal', role: 'staff' };
    } else {
      return res.status(403).json({ message: 'No pending leaves to view' });
    }

    let leaves = await buildApprovalPopulation(Leave.find(query).sort({ createdAt: -1 }));

    if (['staff', 'hod'].includes(user.role)) {
      leaves = leaves.filter((leave) => leave.userId?.department === user.department);
    }

    res.status(200).json({ leaves });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const applyDecision = async (req, res, decision) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const leave = await Leave.findById(id).populate('userId', 'name email role department');
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    const approver = await User.findById(req.user.id);
    if (!approver) return res.status(404).json({ message: 'User not found' });

    const approvalStatus = decision === 'approve' ? 'approved' : 'rejected';

    if (approver.role === 'staff' && leave.status === 'pending_staff') {
      leave.approvals.staffApproval = {
        status: approvalStatus,
        approvedBy: req.user.id,
        remarks: remarks || '',
        approvedAt: new Date(),
      };
      leave.status = decision === 'approve' ? 'pending_hod' : 'rejected';
    } else if (approver.role === 'hod' && leave.status === 'pending_hod') {
      leave.approvals.hodApproval = {
        status: approvalStatus,
        approvedBy: req.user.id,
        remarks: remarks || '',
        approvedAt: new Date(),
      };
      leave.status = decision === 'approve' ? 'approved' : 'rejected';
    } else if (approver.role === 'principal' && leave.status === 'pending_principal') {
      leave.approvals.principalApproval = {
        status: approvalStatus,
        approvedBy: req.user.id,
        remarks: remarks || '',
        approvedAt: new Date(),
      };
      leave.status = decision === 'approve' ? 'approved' : 'rejected';
    } else {
      return res.status(403).json({ message: `Unauthorized to ${decision} this leave` });
    }

    if (remarks) {
      leave.comments.push({ role: approver.role, message: remarks, timestamp: new Date() });
    }

    if (decision === 'approve' && leave.status === 'approved') {
      await deductBalance(leave);
      await createNotification({
        userId: leave.userId._id,
        message: `Your ${leave.leaveType} leave has been approved.`,
        type: 'approval',
        relatedLeaveId: leave._id,
      });
    }

    if (decision === 'reject' && leave.status === 'rejected') {
      await createNotification({
        userId: leave.userId._id,
        message: `Your ${leave.leaveType} leave has been rejected.${remarks ? ` Remark: ${remarks}` : ''}`,
        type: 'rejection',
        relatedLeaveId: leave._id,
      });
    }

    await leave.save();
    const populated = await buildApprovalPopulation(Leave.findById(leave._id));

    res.status(200).json({
      message: decision === 'approve' ? 'Leave approved' : 'Leave rejected',
      leave: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveLeave = async (req, res) => applyDecision(req, res, 'approve');
export const rejectLeave = async (req, res) => applyDecision(req, res, 'reject');

export const getAllLeaves = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const query = await buildAllLeavesQuery(user, req.query || {});
    const leaves = await buildApprovalPopulation(Leave.find(query).sort({ createdAt: -1 }));

    res.status(200).json({ leaves });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const roleFilter = ['student', 'staff'].includes(user.role)
      ? { userId: user._id }
      : user.role === 'hod'
      ? { department: user.department }
      : {};

    let query = {};
    if (roleFilter.userId) {
      query.userId = roleFilter.userId;
    } else if (roleFilter.department) {
      const deptUsers = await User.find({ department: roleFilter.department }).select('_id');
      query.userId = { $in: deptUsers.map((u) => u._id) };
    }

    const [total, approved, rejected, pending] = await Promise.all([
      Leave.countDocuments(query),
      Leave.countDocuments({ ...query, status: 'approved' }),
      Leave.countDocuments({ ...query, status: 'rejected' }),
      Leave.countDocuments({
        ...query,
        status: { $in: ['pending_staff', 'pending_hod', 'pending_principal'] },
      }),
    ]);

    const monthlyTrend = await Leave.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$fromDate' },
            month: { $month: '$fromDate' },
          },
          totalApplied: { $sum: 1 },
          totalApproved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'approved'] }, 1, 0],
            },
          },
          totalRejected: {
            $sum: {
              $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const leaveTypeDistribution = await Leave.aggregate([
      { $match: query },
      { $group: { _id: '$leaveType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      stats: { total, approved, rejected, pending },
      monthlyTrend,
      leaveTypeDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    if (String(leave.userId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'You can only cancel your own leave' });
    }

    if (!['approved', 'pending_staff', 'pending_hod', 'pending_principal'].includes(leave.status)) {
      return res.status(400).json({ message: 'Only pending or approved leave can be cancelled' });
    }

    if (leave.status === 'approved') {
      await restoreBalance(leave);
    }

    leave.status = 'cancelled';
    leave.cancelledBy = req.user.id;
    leave.comments.push({ role: req.user.role, message: 'Leave cancelled by applicant', timestamp: new Date() });

    await leave.save();

    res.status(200).json({ message: 'Leave cancelled', leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Comment message is required' });
    }

    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    leave.comments.push({
      role: req.user.role,
      message: message.trim(),
      timestamp: new Date(),
    });

    await leave.save();
    res.status(200).json({ message: 'Comment added', leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCalendarLeaves = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let query = { status: { $in: ['approved', 'pending_staff', 'pending_hod', 'pending_principal'] } };

    if (['student', 'staff'].includes(user.role)) {
      query.userId = user._id;
    } else if (user.role === 'hod') {
      const deptUsers = await User.find({ department: user.department }).select('_id');
      query.userId = { $in: deptUsers.map((u) => u._id) };
    }

    const leaves = await Leave.find(query).populate('userId', 'name role department').sort({ fromDate: 1 });

    const events = leaves.map((leave) => ({
      id: leave._id,
      title: `${leave.userId?.name || 'User'} - ${leave.leaveType}`,
      start: leave.fromDate,
      end: leave.toDate,
      status: leave.status,
      isUrgent: leave.isUrgent,
      user: leave.userId,
    }));

    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportLeavesCsv = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const query = await buildAllLeavesQuery(user, req.query || {});
    const leaves = await Leave.find(query).populate('userId', 'name email role department').sort({ createdAt: -1 });
    const csv = buildLeavesCsv(leaves);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=leave-report-${Date.now()}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
