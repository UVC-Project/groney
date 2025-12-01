import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma: PrismaClient = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey"; // create in .env later
const JWT_EXPIRES_IN = "7d"; // adjust if needed

export default class LoginController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Missing username or password" });
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Check password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Create JWT payload
      const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        classId: user.classId,
      };

      // Sign JWT token
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
