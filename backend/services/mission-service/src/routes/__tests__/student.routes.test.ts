import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import studentRouter from '../student.routes'; // Import your router
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
vi.mock('@prisma/client', () => {
    const mockPrisma = {
        classUser: { findUnique: vi.fn() },
        class: { findUnique: vi.fn() },
        sector: { findMany: vi.fn() },
        mascot: { findUnique: vi.fn() },
        mission: { findUnique: vi.fn(), update: vi.fn() },
        submission: { findFirst: vi.fn(), create: vi.fn(), findMany: vi.fn() },
        mapDecoration: { findMany: vi.fn() }
    };
    return { PrismaClient: vi.fn(() => mockPrisma) };
});

// Setup App
const app = express();
app.use(express.json());
app.use('/api/student', studentRouter);

// Access the mocked prisma to define return values in tests
const prisma = new PrismaClient() as any;

describe('Student Routes Integration', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // --- 1. MIDDLEWARE & AUTH TESTS ---
    describe('Auth Middleware', () => {
        it('⛔ Should return 401 if x-user-id header is missing', async () => {
            const res = await request(app).get('/api/student/class');
            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Unauthorized');
        });

        it('⛔ Should return 403 if role is invalid', async () => {
            const res = await request(app)
                .get('/api/student/class')
                .set('x-user-id', '123')
                .set('x-user-role', 'ADMIN'); // Only STUDENT/TEACHER allowed
            
            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Forbidden');
        });
    });

    // --- 2. GET /class TESTS ---
    describe('GET /class', () => {
        const headers = { 'x-user-id': 'student_1', 'x-user-role': 'STUDENT' };

        it('⛔ Should return 400 if classId query is missing', async () => {
            const res = await request(app).get('/api/student/class').set(headers);
            expect(res.status).toBe(400);
        });

        it('⛔ Should return 403 if student is NOT in the class', async () => {
            // Mock verifyClassAccess returning null (no membership)
            prisma.classUser.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .get('/api/student/class?classId=class_123')
                .set(headers);

            expect(res.status).toBe(403);
            expect(res.body.message).toMatch(/do not have access/);
        });

        it('✅ Should return class data if student IS in class', async () => {
            // Mock membership exists
            prisma.classUser.findUnique.mockResolvedValue({ userId: 'student_1' });
            // Mock class data
            prisma.class.findUnique.mockResolvedValue({ id: 'class_123', name: 'Math' });

            const res = await request(app)
                .get('/api/student/class?classId=class_123')
                .set(headers);

            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Math');
        });
    });

    // --- 3. GET /sectors TESTS (Logic Verification) ---
    describe('GET /sectors', () => {
        const headers = { 'x-user-id': 'student_1', 'x-user-role': 'STUDENT' };

        it('✅ Should return sectors with calculated mission status', async () => {
            // Mock Access
            prisma.classUser.findUnique.mockResolvedValue({ userId: 'student_1' });
            
            // Mock Data: One sector with one mission
            prisma.sector.findMany.mockResolvedValue([{
                id: 'sec_1',
                missions: [{ 
                    id: 'mis_1', 
                    title: 'Clean Up', 
                    cooldownHours: 24, 
                    maxCompletions: null,
                    thirstBoost: 10 
                }]
            }]);

            // Mock Mascot (Healthy)
            prisma.mascot.findUnique.mockResolvedValue({ thirst: 100, hunger: 100 });

            // Mock Submissions (None)
            prisma.submission.findMany.mockResolvedValue([]); // For cooldown check
            prisma.submission.findFirst.mockResolvedValue(null); // For pending check

            const res = await request(app)
                .get('/api/student/sectors?classId=class_123')
                .set(headers);

            expect(res.status).toBe(200);
            const mission = res.body[0].missions[0];
            
            // Verify Logic results
            expect(mission.missionStatus).toBe('available');
            expect(mission.isUrgent).toBe(false); // Mascot is healthy
        });

        it('✅ Should mark mission URGENT if mascot stat is low', async () => {
            prisma.classUser.findUnique.mockResolvedValue({ userId: 'student_1' });
            
            // Mission gives +10 Thirst
            prisma.sector.findMany.mockResolvedValue([{
                id: 'sec_1',
                missions: [{ id: 'mis_1', thirstBoost: 10, cooldownHours: 24 }]
            }]);

            // Mascot is CRITICAL on thirst (below 30)
            prisma.mascot.findUnique.mockResolvedValue({ thirst: 10, hunger: 100, happiness: 100, cleanliness: 100 });

            // No submissions
            prisma.submission.findMany.mockResolvedValue([]); 
            prisma.submission.findFirst.mockResolvedValue(null);

            const res = await request(app)
                .get('/api/student/sectors?classId=class_123')
                .set(headers);

            // Expect isUrgent = true because thirst is low and mission boosts thirst
            expect(res.body[0].missions[0].isUrgent).toBe(true);
        });
    });

    // --- 4. POST /accept TESTS ---
    describe('POST /missions/:id/accept', () => {
        const headers = { 'x-user-id': 'student_1', 'x-user-role': 'STUDENT' };
        const body = { classId: 'class_123' };

        it('⛔ Should return 404 if mission does not exist', async () => {
            prisma.classUser.findUnique.mockResolvedValue({ userId: 'student_1' });
            prisma.mission.findUnique.mockResolvedValue(null); // Not found

            const res = await request(app)
                .post('/api/student/missions/mis_999/accept')
                .set(headers)
                .send(body);

            expect(res.status).toBe(404);
        });

        it('⛔ Should return 400 if user already has pending submission', async () => {
            prisma.classUser.findUnique.mockResolvedValue({ userId: 'student_1' });
            
            prisma.mission.findUnique.mockResolvedValue({ 
                id: 'mis_1', 
                status: 'AVAILABLE',
                sector: { classId: 'class_123' } 
            });

            // Mock existing pending submission
            prisma.submission.findFirst.mockResolvedValue({ id: 'sub_existing', status: 'PENDING' });

            const res = await request(app)
                .post('/api/student/missions/mis_1/accept')
                .set(headers)
                .send(body);

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/already have a pending submission/);
        });

        it('✅ Should accept mission successfully', async () => {
            prisma.classUser.findUnique.mockResolvedValue({ userId: 'student_1' });
            
            // Mission is Valid
            prisma.mission.findUnique.mockResolvedValue({ 
                id: 'mis_1', 
                status: 'AVAILABLE',
                cooldownHours: 24,
                sector: { classId: 'class_123' } 
            });

            // No pending submissions
            prisma.submission.findFirst.mockResolvedValue(null);
            
            // No cooldown (empty array)
            prisma.submission.findMany.mockResolvedValue([]);

            // Create successful
            prisma.submission.create.mockResolvedValue({ id: 'sub_new', status: 'PENDING' });

            const res = await request(app)
                .post('/api/student/missions/mis_1/accept')
                .set(headers)
                .send(body);

            expect(res.status).toBe(201);
            expect(res.body.message).toMatch(/accepted/);
            
            // Verify DB update was called
            expect(prisma.mission.update).toHaveBeenCalledWith({
                where: { id: 'mis_1' },
                data: { status: 'IN_PROGRESS' }
            });
        });
    });

});