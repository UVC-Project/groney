import { Request, Response } from "express";
import { TokenBlacklist } from "../../Services/TokenBlacklist";

export default class LogoutController {
    /**
     * Log the user out
     * @param req 
     * @param res 
     * @returns json
     */
    static logout(req: Request, res: Response) {
        const authHeader = req.headers.authorization;

        if (!authHeader)
            return res.status(400).json({ message: "No token provided" });

        const token = authHeader.split(" ")[1];

        TokenBlacklist.add(token);

        return res.json({
            message: "Logged out successfully"
        });
    }
}
