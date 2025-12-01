import { Request, Response } from "express";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma: PrismaClient = new PrismaClient();

export default class RegisterController {
    /**
     * Register a teacher
     * @param req 
     * @param res 
     * @returns json
     */
    static async registerTeacher(req: Request, res: Response) {
        try {
            const { firstName, lastName, username, password, className, schoolName } =
                req.body;

            if (!firstName || !lastName || !username || !password || !className || !schoolName) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            const hashed = await bcrypt.hash(password, 10);

            const teacher = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    username,
                    password: hashed,
                    role: UserRole.TEACHER,
                },
            });

            const cls = await prisma.class.create({
                data: {
                    name: className,
                    school: schoolName,
                    classCode: `${className.toUpperCase()}-${Date.now()}`,
                    teacherId: teacher.id,
                },
            });

            return res.status(201).json({
                message: "Teacher registered successfully",
                teacher,
                class: cls,
            });
        } catch (err: any) {
            console.error("Teacher registration error:", err);
            return res.status(500).json({ message: err.message });
        }
    }

    /**
     * Registers a student
     * @param req 
     * @param res 
     * @returns json
     */
    static async registerStudent(req: Request, res: Response) {
        try {
            const { firstName, lastName, username, password, classCode } = req.body;

            if (!firstName || !lastName || !username || !password || !classCode) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            const cls = await prisma.class.findUnique({
                where: { classCode },
            });

            if (!cls) {
                return res.status(404).json({ message: "Class code does not exist" });
            }

            const hashed = await bcrypt.hash(password, 10);

            const student = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    username,
                    password: hashed,
                    role: UserRole.STUDENT,
                    classId: cls.id,
                },
            });

            return res.status(201).json({
                message: "Student registered successfully",
                student,
            });
        } catch (err: any) {
            console.error("Student registration error:", err);
            return res.status(500).json({ message: err.message });
        }
    }
}
