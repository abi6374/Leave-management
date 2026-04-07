import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getAllLeaves,
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
  roleMiddleware(['principal']),
  getAllLeaves
);

export default router;
