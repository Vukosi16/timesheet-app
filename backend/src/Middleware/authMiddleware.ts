import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token){
        return res.status(401).json({
            message: "Unauthenticated user"
        });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.userInfo = decodedToken

        next();
    
    }catch(e){
        return res.status(401).json({
            message: "Unauthenticated user",
            error: e
        })
    }
}

export default authMiddleware;