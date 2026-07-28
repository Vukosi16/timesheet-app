import { Router } from 'express';
import timesheetController from '../Controllers/timesheetController';  
import authMiddleware from '../Middleware/authMiddleware';
import adminMiddleware from '../Middleware/adminMiddleware';

const router = Router();

router.get('/timesheets', authMiddleware, timesheetController.getCoachTimesheets)
router.get('/timesheet/:id', authMiddleware, timesheetController.getTimesheetById)
router.get('/submitted', authMiddleware, adminMiddleware, timesheetController.getSubmittedTimesheets)
router.post('/create', authMiddleware,timesheetController.createTimesheet);
router.post('/review/:id', authMiddleware, adminMiddleware, timesheetController.reviewTimesheet)
router.post('/paid/:id', authMiddleware, adminMiddleware, timesheetController.markPaid)
router.patch('/submit/:id', authMiddleware, timesheetController.submitTimesheet);
router.delete('/delete/:id', authMiddleware, timesheetController.deleteTimesheet);

export default router;