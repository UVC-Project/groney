import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";

export const noAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const header = req.headers.authorization;

	if (!header) return next();

	const token = header.split(" ")[1];
	try {
		jwt.verify(token, JWT_SECRET);

		return res.status(403).json({
			message: "Already authenticated — cannot access login/register"
		});
	} catch {
		return next();
	}
};
