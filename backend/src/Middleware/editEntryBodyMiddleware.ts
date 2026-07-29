import { NextFunction, Request, Response } from 'express';
import z from 'zod';

const editEntryBodySchema = z.object({
    date: z.string().min(1),
    description: z.string().min(1),
});

const editEntryBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const result = editEntryBodySchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: 'Invalid entry update data',
            error: result.error.flatten(),
        });
    }

    req.body = result.data;
    next();
};

export default editEntryBodyMiddleware;