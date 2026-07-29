import { NextFunction, Request, Response } from 'express';
import z from 'zod';

const createEntryBodySchema = z.object({
    date: z.string().min(1),
    activityType: z.string().min(1),
    description: z.string().min(1).optional(),
    amount: z.number().optional(),
});

const createEntryBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const result = createEntryBodySchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: 'Invalid entry data',
            error: result.error.flatten(),
        });
    }

    req.body = result.data;
    next();
};

export default createEntryBodyMiddleware;