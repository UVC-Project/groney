import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma: PrismaClient = new PrismaClient(); import crypto from "crypto";
import bcrypt from "bcrypt/bcrypt";

export default class PasswordResetController {
    /**
     * Request a link to reset password
     * @param req 
     * @param res 
     * @returns json
     */
    static async requestReset(req: Request, res: Response) {
        const { email } = req.body;

        if (!email)
            return res.status(400).json({ message: "Email is required" });

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.role !== "TEACHER")
            return res.status(404).json({ message: "Teacher not found" });

        const token = crypto.randomBytes(32).toString("hex");

        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
            }
        });

        return res.json({
            message: "Password reset token created",
            token // this needs to be emailed later
        });
    }

    /**
     * Reset the password
     * @param req
     * @param res 
     * @returns json
     */
    static async resetPassword(req: Request, res: Response) {
        const { token, newPassword } = req.body;

        if (!token || !newPassword)
            return res.status(400).json({ message: "Token and new password required" });

        if (newPassword.length < 8)
            return res.status(400).json({ message: "Password must be at least 8 characters" });

        const tokenRecord = await prisma.passwordResetToken.findUnique({
            where: { token }
        });

        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: tokenRecord.userId },
            data: { password: hashed }
        });

        await prisma.passwordResetToken.delete({ where: { token } });

        return res.json({ message: "Password reset successful" });
    }
}
