import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import z from 'zod';

const registerBodySchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    role: z.nativeEnum(Role),
});

const registerBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const result = registerBodySchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: 'Invalid register data',
            error: result.error.flatten(),
        });
    }

    req.body = result.data;
    next();
};

export default registerBodyMiddleware;