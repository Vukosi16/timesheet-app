import { Router } from 'express';
import authMiddleware from '../Middleware/authMiddleware';
import entryController from '../Controllers/entryController';


const router = Router();

router.post('/:timesheetId/create', authMiddleware, entryController.createEntry);
router.patch('/:timesheetId/:entryId', authMiddleware, entryController.editEntry)




export default router;
