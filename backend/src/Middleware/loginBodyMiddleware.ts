import { NextFunction, Request, Response } from 'express';
import z from 'zod';

const loginBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const loginBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const result = loginBodySchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: 'Invalid email or password',
            error: result.error.flatten(),
        });
    }

    req.body = result.data;
    next();
};

export default loginBodyMiddleware;