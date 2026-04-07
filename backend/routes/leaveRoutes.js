import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getAllLeaves,
  getDashboardStats,
  cancelLeave,
  addComment,
  getCalendarLeaves,
  exportLeavesCsv,
} from '../controllers/leaveController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply for leave - students and staff only
router.post(
  '/apply',
  authMiddleware,
  roleMiddleware(['student', 'staff']),
  applyLeave
);

// Get my leaves - all authenticated users
router.get('/my', authMiddleware, getMyLeaves);

// Get pending leaves - staff, hod, principal only
router.get(
  '/pending',
  authMiddleware,
  roleMiddleware(['staff', 'hod', 'principal']),
  getPendingLeaves
);

// Approve leave - staff, hod, principal only
router.put(
  '/approve/:id',
  authMiddleware,
  roleMiddleware(['staff', 'hod', 'principal']),
  approveLeave
);

// Reject leave - staff, hod, principal only
router.put(
  '/reject/:id',
  authMiddleware,
  roleMiddleware(['staff', 'hod', 'principal']),
  rejectLeave
);

// Get all leaves - principal only
router.get(
  '/all',
  authMiddleware,
  roleMiddleware(['principal', 'hod']),
  getAllLeaves
);

router.get(
  '/dashboard-stats',
  authMiddleware,
  roleMiddleware(['student', 'staff', 'hod', 'principal']),
  getDashboardStats
);

router.put('/cancel/:id', authMiddleware, roleMiddleware(['student', 'staff']), cancelLeave);

router.post('/comment/:id', authMiddleware, addComment);

router.get('/calendar', authMiddleware, getCalendarLeaves);

router.get('/export', authMiddleware, roleMiddleware(['principal', 'hod']), exportLeavesCsv);

export default router;
