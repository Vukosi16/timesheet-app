import { Router } from 'express';
import authMiddleware from '../Middleware/authMiddleware';
import adminMiddleware from '../Middleware/adminMiddleware';
import userController from '../Controllers/userController';
import addBankDetailsBodyMiddleware from '../Middleware/addBankDetailsBodyMiddleware';

const router = Router();

router.patch('/bank', authMiddleware, addBankDetailsBodyMiddleware ,userController.addBankDetails);
router.get('/me', authMiddleware, userController.getUser);
router.get('/coaches', authMiddleware, adminMiddleware, userController.viewAllCoaches)




export default router;