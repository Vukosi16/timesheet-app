import { Router } from 'express';
import timesheetController from '../Controllers/timesheetController';  
import authMiddleware from '../Middleware/authMiddleware';
import adminMiddleware from '../Middleware/adminMiddleware';
import createTimesheetBodyMiddleware from '../Middleware/createTimesheetBodyMiddleware';
import timesheetIdParamMiddleware from '../Middleware/timesheetIdParamMiddleware';
import reviewTimesheetBodyMiddleware from '../Middleware/reviewTimesheetBodyMiddleware';

const router = Router();

router.get('/timesheets', authMiddleware, timesheetController.getCoachTimesheets)
router.get('/timesheet/:timesheetId', authMiddleware, timesheetIdParamMiddleware,timesheetController.getTimesheetById)
router.get('/submitted', authMiddleware, adminMiddleware, timesheetController.getSubmittedTimesheets)
router.post('/create', authMiddleware, createTimesheetBodyMiddleware ,timesheetController.createTimesheet);
router.post('/review/:timesheetId', authMiddleware, adminMiddleware, timesheetIdParamMiddleware, reviewTimesheetBodyMiddleware, timesheetController.reviewTimesheet)
router.post('/paid/:timesheetId', authMiddleware, adminMiddleware, timesheetIdParamMiddleware ,timesheetController.markPaid)
router.patch('/submit/:timesheetId', authMiddleware, timesheetIdParamMiddleware,timesheetController.submitTimesheet);
router.delete('/delete/:timesheetId', authMiddleware, timesheetIdParamMiddleware,timesheetController.deleteTimesheet);

export default router;