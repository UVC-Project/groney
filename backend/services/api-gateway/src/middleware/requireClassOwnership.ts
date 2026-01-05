import { Request, Response, NextFunction } from "express";

export const requireClassOwnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== "TEACHER") {
            return res.status(403).json({ message: "Only teachers can manage classes" });
        }

        const userClass = req.user.classId;
        const classId = req.params.classId || req.body.classId;

        if (!classId) return next();

        if (userClass !== classId) {
            return res.status(403).json({
                message: "Teacher does not own this class"
            });
        }

        next();
    } catch (err: any) {
        return res.status(500).json({
            message: "Error verifying class ownership"
        });
    }
};
