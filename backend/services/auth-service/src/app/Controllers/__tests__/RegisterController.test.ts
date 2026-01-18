import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '../../../__mocks__/prisma';
import RegisterController from '../RegisterController';
import { mockRequest, mockResponse } from './helper';

/**
 * Mocks setup
 */
vi.mock('@prisma/client', async () => {
  const actual = await vi.importActual<any>('@prisma/client');
  return {
    ...actual,
    PrismaClient: vi.fn(() => prisma),
  };
});

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(() => Promise.resolve('hashed-password')),
  },
}));

vi.mock('../../utils/VerifyEmailMailer', () => ({
  sendVerifyEmail: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * Registering a teacher
 */
describe('RegisterController.registerTeacher', () => {
  it('registers a teacher successfully', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce(null) // username check
      .mockResolvedValueOnce(null); // email check

    prisma.class.findUnique.mockResolvedValue(null);

    prisma.$transaction.mockImplementation(async (cb: any) =>
      cb({
        user: {
          create: vi.fn().mockResolvedValue({
            id: 1,
            firstName: 'Ali',
            lastName: 'Ahmad',
            username: 'ali123',
            email: 'ali@test.com',
            role: 'TEACHER',
          }),
        },
        class: {
          create: vi.fn().mockResolvedValue({
            id: 10,
            name: '4 Amanah',
            school: 'SK Test',
            classCode: 'ABC123',
          }),
        },
        classUser: { create: vi.fn() },
        mascot: { create: vi.fn() },
      })
    );

    const req = mockRequest({
      body: {
        firstName: 'Ali',
        lastName: 'Ahmad',
        username: 'ali123',
        email: 'ali@test.com',
        password: 'password123',
        className: '4 Amanah',
        schoolName: 'SK Test',
      },
    });

    const res = mockResponse();

    await RegisterController.registerTeacher(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Teacher registered successfully',
      })
    );
  });

  it('returns 400 if required fields are missing', async () => {
    const req = mockRequest({
      body: { username: 'test' }, // missing required fields
    });
    const res = mockResponse();

    await RegisterController.registerTeacher(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Missing required fields',
    });
  });

  it('returns 409 if username is taken', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 99 });

    const req = mockRequest({
      body: {
        firstName: 'Ali',
        lastName: 'Ahmad',
        username: 'ali123',
        email: 'ali@test.com',
        password: 'password123',
        className: '4 Amanah',
        schoolName: 'SK Test',
      },
    });

    const res = mockResponse();

    await RegisterController.registerTeacher(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });
});

/**
 * Registering a student
 */
describe('RegisterController.registerStudent', () => {
  it('returns 404 for invalid class code', async () => {
    prisma.class.findUnique.mockResolvedValue(null);

    const req = mockRequest({
      body: {
        firstName: 'Aisyah',
        lastName: 'Zainal',
        username: 'aisyah1',
        password: 'password123',
        classCode: 'WRONG',
      },
    });

    const res = mockResponse();

    await RegisterController.registerStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid class code',
    });
  });

  it('returns 409 if username is taken', async () => {
    prisma.class.findUnique.mockResolvedValue({ id: 1 });
    prisma.user.findUnique.mockResolvedValue({ id: 5 });

    const req = mockRequest({
      body: {
        firstName: 'Aisyah',
        lastName: 'Zainal',
        username: 'aisyah1',
        password: 'password123',
        classCode: 'ABC123',
      },
    });

    const res = mockResponse();

    await RegisterController.registerStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('registers a student successfully', async () => {
    prisma.class.findUnique.mockResolvedValue({ id: 1 });
    prisma.user.findUnique.mockResolvedValue(null);

    prisma.$transaction.mockImplementation(async (cb: any) =>
      cb({
        user: {
          create: vi.fn().mockResolvedValue({
            id: 2,
            firstName: 'Aisyah',
            lastName: 'Zainal',
            username: 'aisyah1',
            role: 'STUDENT',
          }),
        },
        classUser: { create: vi.fn() },
      })
    );

    const req = mockRequest({
      body: {
        firstName: 'Aisyah',
        lastName: 'Zainal',
        username: 'aisyah1',
        password: 'password123',
        classCode: 'ABC123',
      },
    });

    const res = mockResponse();

    await RegisterController.registerStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Student registered successfully',
      })
    );
  });
});
