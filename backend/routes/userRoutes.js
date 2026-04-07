import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';
import { listUsers, toggleUserActivation, getUsersByDepartment } from '../controllers/userController.js';

const router = express.Router();

router.get('/', authMiddleware, roleMiddleware(['principal']), listUsers);
router.put('/:id/activate', authMiddleware, roleMiddleware(['principal']), toggleUserActivation);
router.get('/department/:dept', authMiddleware, getUsersByDepartment);

export default router;
