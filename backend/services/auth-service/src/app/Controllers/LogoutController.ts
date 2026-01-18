import { Request, Response } from "express";
import { TokenBlacklist } from "../../Services/TokenBlacklist";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default class LogoutController {
    /**
     * Log the user out
     */
    static async logout(req: Request, res: Response) {
    const authHeader =
            req.headers?.authorization ??
        (req.headers?.['authorization'] as string | undefined);

        if (!authHeader) {
            return res.status(400).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        // Add token to blacklist
        TokenBlacklist.add(token);

        // 🔐 Log logout event (non-blocking)
        try {
            const userId = req.headers["x-user-id"] as string | undefined;

            await prisma.authLog.create({
                data: {
                    action: "LOGOUT",
                    userId,
                    ipAddress: req.ip,
                },
            });
        } catch (err) {
            console.error("Logout logging failed:", err);
        }

        return res.json({
            message: "Logged out successfully",
        });
    }
}
