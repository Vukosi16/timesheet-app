import { Request, Response, NextFunction } from "express";

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.userInfo?.role !== 'ADMIN') {
    return res.status(403).json({ message: "Forbidden: admin access only" });
  }
  next();
}

export default adminMiddleware;