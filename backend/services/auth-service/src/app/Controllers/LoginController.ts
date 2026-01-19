import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma: PrismaClient = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_EXPIRES_IN = "7d";

export default class LoginController {
  /**
   * Login a user, student or teacher
   * @param req 
   * @param res 
   * @returns json
   */
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Missing username or password" });
      }

      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        classId: user.classId,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      return res.json({
        message: "Login successful",
        token,
        user: payload,
      });

    } catch (err: any) {
      console.error("Login error:", err);
      return res.status(500).json({ message: err.message });
    }
  }
}
