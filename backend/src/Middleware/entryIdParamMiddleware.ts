import { NextFunction, Request, Response } from 'express';
import z from 'zod';

const entryIdParamSchema = z.object({
    entryId: z.coerce.number().int().positive(),
});

const entryIdParamMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const result = entryIdParamSchema.safeParse(req.params);

    if (!result.success) {
        return res.status(400).json({
            message: 'Invalid entry id',
            error: result.error.flatten(),
        });
    }

    req.params.entryId = String(result.data.entryId);
    next();
};

export default entryIdParamMiddleware;