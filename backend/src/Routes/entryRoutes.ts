import { Router } from 'express';
import authMiddleware from '../Middleware/authMiddleware';
import entryController from '../Controllers/entryController';
import createEntryBodyMiddleware from '../Middleware/createEntryBodyMiddleware';
import timesheetIdParamMiddleware from '../Middleware/timesheetIdParamMiddleware';
import entryIdParamMiddleware from '../Middleware/entryIdParamMiddleware';
import editEntryBodyMiddleware from '../Middleware/editEntryBodyMiddleware';


const router = Router();

router.post('/:timesheetId/create', authMiddleware , timesheetIdParamMiddleware, createEntryBodyMiddleware, entryController.createEntry);
router.patch('/:timesheetId/:entryId', authMiddleware, timesheetIdParamMiddleware, entryIdParamMiddleware, editEntryBodyMiddleware ,entryController.editEntry);
router.delete('/:timesheetId/:entryId', authMiddleware , timesheetIdParamMiddleware, entryIdParamMiddleware, entryController.deleteEntry);




export default router;
