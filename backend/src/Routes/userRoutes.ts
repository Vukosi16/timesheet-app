import { Router } from 'express';
import authMiddleware from '../Middleware/authMiddleware';
import adminMiddleware from '../Middleware/adminMiddleware';
import userController from '../Controllers/userController';

const router = Router();

router.patch('/bank', authMiddleware, userController.addBankDetails);
router.get('/me', authMiddleware, userController.getUser)




export default router;