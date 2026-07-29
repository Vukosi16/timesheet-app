import { NextFunction, Request, Response } from 'express';
import z from 'zod';

const createTimesheetBodySchema = z.object({
    periodMonth: z.string().min(1),
});

const createTimesheetBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const result = createTimesheetBodySchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: 'Invalid timesheet data',
            error: result.error.flatten(),
        });
    }

    req.body = result.data;
    next();
};

export default createTimesheetBodyMiddleware;