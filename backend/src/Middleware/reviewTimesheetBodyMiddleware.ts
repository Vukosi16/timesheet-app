import { NextFunction, Request, Response } from 'express';
import z from 'zod';

const reviewTimesheetBodySchema = z.object({
    decision: z.enum(['APPROVE', 'REJECT']),
    adminMessage: z.string().min(1).optional(),
});

const reviewTimesheetBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const result = reviewTimesheetBodySchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: 'Invalid review data',
            error: result.error.flatten(),
        });
    }

    req.body = result.data;
    next();
};

export default reviewTimesheetBodyMiddleware;