import { Request, Response, NextFunction } from "express";

export const requireStudent = (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) {
		return res.status(401).json({ message: "Not authenticated" });
	}

	if (req.user.role !== "STUDENT") {
		return res.status(403).json({ message: "Student access required" });
	}

	next();
};
