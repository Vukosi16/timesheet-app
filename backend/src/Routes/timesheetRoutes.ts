import { Router } from 'express';
import timesheetController from '../Controllers/timesheetController';  
import authMiddleware from '../Middleware/authMiddleware';

const router = Router();

router.get('/timesheets', authMiddleware, timesheetController.getCoachTimesheets)
router.get('/timesheet/:id', authMiddleware, timesheetController.getTimesheetById)
router.post('/create', authMiddleware,timesheetController.createTimesheet);
router.patch('/submit/:id', authMiddleware, timesheetController.submitTimesheet);
router.delete('/delete/:id', authMiddleware, timesheetController.deleteTimesheet);

export default router;