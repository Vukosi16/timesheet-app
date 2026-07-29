import { NextFunction, Request, Response } from 'express';
import z from 'zod';

const addBankDetailsBodySchema = z.object({
    bankName: z.string().min(1),
    accountType: z.string().min(1),
    accountNumber: z.string().min(1),
});

const addBankDetailsBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const result = addBankDetailsBodySchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: 'Invalid bank details',
            error: result.error.flatten(),
        });
    }

    req.body = result.data;
    next();
};

export default addBankDetailsBodyMiddleware;