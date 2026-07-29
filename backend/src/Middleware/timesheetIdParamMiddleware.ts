import { NextFunction, Request, Response } from 'express';
import z from 'zod';

const timesheetIdParamSchema = z.object({
    timesheetId: z.coerce.number().int().positive(),
});

const timesheetIdParamMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const result = timesheetIdParamSchema.safeParse(req.params);

    if (!result.success) {
        return res.status(400).json({
            message: 'Invalid timesheet id',
            error: result.error.flatten(),
        });
    }

    req.params.timesheetId = String(result.data.timesheetId);
    next();
};

export default timesheetIdParamMiddleware;