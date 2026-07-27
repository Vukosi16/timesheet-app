import { Router } from 'express';
import authController from '../Controllers/authController';
import authMiddleware from '../Middleware/authMiddleware';
import adminMiddleware from '../Middleware/adminMiddleware';


const router = Router();
router.post('/login', authController.login);
router.post('/register', authMiddleware, adminMiddleware ,authController.register)

export default router;