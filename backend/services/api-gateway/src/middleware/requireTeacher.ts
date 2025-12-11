import { Request, Response, NextFunction } from "express";

export const requireTeacher = (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) {
		return res.status(401).json({ message: "Not authenticated" });
	}

	if (req.user.role !== "TEACHER") {
		return res.status(403).json({ message: "Teacher access required" });
	}

	next();
};
