import { Request, Response, NextFunction } from "express";

export const passAuthContext = (req: Request, res: Response, next: NextFunction) => {
	if (req.user) {
		req.headers["x-user-id"] = req.user.id;
		req.headers["x-user-role"] = req.user.role;
		req.headers["x-user-class-id"] = req.user.classId;
	}
	next();
};
