import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';
import { getMyBalance, getUserBalance, resetBalances } from '../controllers/balanceController.js';

const router = express.Router();

router.get('/my', authMiddleware, getMyBalance);
router.get('/:userId', authMiddleware, roleMiddleware(['principal', 'hod']), getUserBalance);
router.post('/reset', authMiddleware, roleMiddleware(['principal']), resetBalances);

export default router;
