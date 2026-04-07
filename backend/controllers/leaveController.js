import Leave from '../models/Leave.js';
import User from '../models/User.js';

// Apply for leave
export const applyLeave = async (req, res) => {
  try {
    const { leaveType, reason, fromDate, toDate } = req.body;

    // Validation
    if (!leaveType || !reason || !fromDate || !toDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'principal' || user.role === 'hod') {
      return res.status(400).json({ message: 'Only students and staff can apply for leave' });
    }

    const leave = new Leave({
      userId: req.user.id,
      role: user.role,
      leaveType,
      reason,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      status: user.role === 'student' ? 'pending_staff' : 'pending_principal',
    });

    await leave.save();

    res.status(201).json({
      message: 'Leave application submitted',
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my leaves
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user.id })
      .populate('userId', 'name email role')
      .populate('approvals.staffApproval.approvedBy', 'name email')
      .populate('approvals.hodApproval.approvedBy', 'name email')
      .populate('approvals.principalApproval.approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ leaves });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending leaves for approval
export const getPendingLeaves = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let query = {};

    if (user.role === 'staff') {
      // Staff sees pending_staff leaves for students in their department
      query = {
        status: 'pending_staff',
        role: 'student',
      };
    } else if (user.role === 'hod') {
      // HOD sees pending_hod leaves
      query = {
        status: 'pending_hod',
      };
    } else if (user.role === 'principal') {
      // Principal sees pending_principal leaves (staff workflow)
      query = {
        status: 'pending_principal',
        role: 'staff',
      };
    } else {
      return res.status(403).json({ message: 'No pending leaves to view' });
    }

    const leaves = await Leave.find(query)
      .populate('userId', 'name email role department')
      .populate('approvals.staffApproval.approvedBy', 'name email')
      .populate('approvals.hodApproval.approvedBy', 'name email')
      .populate('approvals.principalApproval.approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ leaves });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve leave
export const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine which approval level to update
    if (user.role === 'staff' && leave.status === 'pending_staff') {
      leave.approvals.staffApproval = {
        status: 'approved',
        approvedBy: req.user.id,
        remarks: remarks || '',
        approvedAt: new Date(),
      };

      // Update status for next level
      if (leave.role === 'student') {
        leave.status = 'pending_hod';
      } else {
        leave.status = 'approved';
      }
    } else if (user.role === 'hod' && leave.status === 'pending_hod') {
      leave.approvals.hodApproval = {
        status: 'approved',
        approvedBy: req.user.id,
        remarks: remarks || '',
        approvedAt: new Date(),
      };
      // Student workflow ends at HOD approval.
      leave.status = 'approved';
    } else if (user.role === 'principal' && leave.status === 'pending_principal') {
      leave.approvals.principalApproval = {
        status: 'approved',
        approvedBy: req.user.id,
        remarks: remarks || '',
        approvedAt: new Date(),
      };
      leave.status = 'approved';
    } else {
      return res.status(403).json({ message: 'Unauthorized to approve this leave' });
    }

    await leave.save();

    res.status(200).json({
      message: 'Leave approved',
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject leave
export const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine which approval level to update
    if (user.role === 'staff' && leave.status === 'pending_staff') {
      leave.approvals.staffApproval = {
        status: 'rejected',
        approvedBy: req.user.id,
        remarks: remarks || '',
        approvedAt: new Date(),
      };
      leave.status = 'rejected';
    } else if (user.role === 'hod' && leave.status === 'pending_hod') {
      leave.approvals.hodApproval = {
        status: 'rejected',
        approvedBy: req.user.id,
        remarks: remarks || '',
        approvedAt: new Date(),
      };
      leave.status = 'rejected';
    } else if (user.role === 'principal' && leave.status === 'pending_principal') {
      leave.approvals.principalApproval = {
        status: 'rejected',
        approvedBy: req.user.id,
        remarks: remarks || '',
        approvedAt: new Date(),
      };
      leave.status = 'rejected';
    } else {
      return res.status(403).json({ message: 'Unauthorized to reject this leave' });
    }

    await leave.save();

    res.status(200).json({
      message: 'Leave rejected',
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all leaves (for admin/stats)
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('userId', 'name email role')
      .populate('approvals.staffApproval.approvedBy', 'name email')
      .populate('approvals.hodApproval.approvedBy', 'name email')
      .populate('approvals.principalApproval.approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ leaves });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
