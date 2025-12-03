import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenBlacklist } from "../../Services/TokenBlacklist";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";

/**
 * Checks if token is valid or not
 * @param req 
 * @param res 
 * @param next 
 * @returns json
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader)
        return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];

    if (TokenBlacklist.has(token)) {
        return res.status(401).json({ message: "Token has been logged out" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
