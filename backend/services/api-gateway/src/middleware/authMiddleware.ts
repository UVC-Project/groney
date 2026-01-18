import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				role: "TEACHER" | "STUDENT";
				classId?: string;
			};
		}
	}
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
	let token: string | undefined;

	const header = req.headers.authorization;
	if (header && header.startsWith('Bearer ')) {
		token = header.split(' ')[1];
	} else if (req.cookies && req.cookies.access_token) {
		token = req.cookies.access_token;
	}

	if (!token) {
		return res.status(401).json({ message: "Missing token" });
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as any;

		req.user = {
			id: decoded.id,
			role: decoded.role,
			classId: decoded.classId
		};

		next();
	} catch {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
};
