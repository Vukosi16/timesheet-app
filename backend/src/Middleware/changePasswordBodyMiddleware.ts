import { NextFunction, Request, Response } from 'express';
import z from 'zod';

const changePasswordBodySchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(1),
});

const changePasswordBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const result = changePasswordBodySchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: 'Invalid password data',
            error: result.error.flatten(),
        });
    }

    req.body = result.data;
    next();
};

export default changePasswordBodyMiddleware;