import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: string;
            };
        }
    }
}

export const verifyUser = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please login first",
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: string;
            role: string;
        };

        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export const verifyVendor = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.user?.role !== "vendor") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Vendor only.",
        });
    }

    next();
};

export const verifyUserRole = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.user?.role !== "user") {
        return res.status(403).json({
            success: false,
            message: "Access denied. User only.",
        });
    }

    next();
};