import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '../../../__mocks__/prisma';
import { mockRequest, mockResponse } from './helper';

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: vi.fn(() => prisma),
  };
});

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(() => Promise.resolve(true)),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'fake-jwt-token'),
    verify: vi.fn(() => ({
      id: '1',
      username: 'student1',
      role: 'STUDENT',
    })),
  },
}));

let LoginController: typeof import('../LoginController').default;

beforeEach(async () => {
  vi.clearAllMocks();
  LoginController = (await import('../LoginController')).default;
});

describe('LoginController.login', () => {
  it('returns 400 if username or password is missing', async () => {
    const req = mockRequest({
      body: { username: 'test' }, // ✅ body is required
    });
    const res = mockResponse();

    await LoginController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Missing username or password',
    });
  });

  it('returns 401 if user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const req = mockRequest({
      body: {
        username: 'wrong',
        password: 'password123',
      },
    });
    const res = mockResponse();

    await LoginController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid username or password',
    });
  });

  it('logs in successfully', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      username: 'student1',
      password: 'hashed',
      role: 'STUDENT',
      isActive: true,
      firstName: 'Aisyah',
      lastName: 'Zainal',
      currentStreak: 1,
      longestStreak: 2,
      lastLoginDate: null,
      lastMilestoneReached: 0,
      classMember: [
        {
          classId: '10',
          class: {
            id: '10',
            name: '4 Amanah',
            school: 'SK Test',
            classCode: 'ABC123',
          },
        },
      ],
    });

    prisma.user.update.mockResolvedValue({});
    prisma.mascot.updateMany.mockResolvedValue({});
    prisma.authLog.create.mockResolvedValue({});

    const req = mockRequest({
      body: {
        username: 'student1',
        password: 'password123',
      },
    });
    const res = mockResponse();

    await LoginController.login(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Login successful',
        token: 'fake-jwt-token',
        user: expect.objectContaining({
          id: '1',
          username: 'student1',
          role: 'STUDENT',
        }),
        classes: expect.any(Array),
      })
    );
  });
});
