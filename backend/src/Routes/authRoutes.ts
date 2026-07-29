import { Router } from 'express';
import authController from '../Controllers/authController';
import authMiddleware from '../Middleware/authMiddleware';
import adminMiddleware from '../Middleware/adminMiddleware';
import loginBodyMiddleware from '../Middleware/loginBodyMiddleware';
import registerBodyMiddleware from '../Middleware/registerBodyMiddleware';
import changePasswordBodyMiddleware from '../Middleware/changePasswordBodyMiddleware';


const router = Router();

router.post('/login', loginBodyMiddleware ,authController.login);
router.post('/register',authMiddleware, adminMiddleware , registerBodyMiddleware, authController.register);
router.post('/logout', authController.logout);
router.post('/changePassword', authMiddleware , changePasswordBodyMiddleware, authController.changePassword)

export default router;