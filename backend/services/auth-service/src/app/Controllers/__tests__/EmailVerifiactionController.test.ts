import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '../../../__mocks__/prisma';
import { mockRequest, mockResponse } from './helper';

/* -------------------------------------------------------------------------- */
/*                                   MOCKS                                    */
/* -------------------------------------------------------------------------- */

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => prisma),
  UserRole: { TEACHER: 'TEACHER' },
}));

// 🔴 CRITICAL: mock email sender EXACTLY
vi.mock('../../utils/VerifyEmailMailer', () => ({
  sendVerifyEmail: vi.fn(() => Promise.resolve()),
}));

vi.mock('crypto', () => ({
  default: {
    randomBytes: () => ({
      toString: () => 'mock-verification-token',
    }),
  },
}));

let EmailVerificationController: typeof import('../EmailVerificationController').default;

beforeEach(async () => {
  vi.clearAllMocks();
  EmailVerificationController =
    (await import('../EmailVerificationController')).default;
});

/* -------------------------------------------------------------------------- */
/*                                   VERIFY                                   */
/* -------------------------------------------------------------------------- */

describe('EmailVerificationController.verify', () => {
  it('returns 400 if token invalid', async () => {
    const req = mockRequest({ query: {} } as any);
    const res = mockResponse();

    await EmailVerificationController.verify(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('verifies email successfully', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      emailVerificationExp: new Date(Date.now() + 1000),
    });

    prisma.user.update.mockResolvedValue({});

    const req = mockRequest({
      query: { token: 'valid-token' },
    } as any);
    const res = mockResponse();

    await EmailVerificationController.verify(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Email verified successfully',
    });
  });
});

/* -------------------------------------------------------------------------- */
/*                                   RESEND                                   */
/* -------------------------------------------------------------------------- */

describe('EmailVerificationController.resend', () => {
  it('returns 400 if email missing', async () => {
    const req = mockRequest({ body: {} });
    const res = mockResponse();

    await EmailVerificationController.resend(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('resends verification email for teacher', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      email: 'teacher@test.com',
      emailVerified: false,
    });

    prisma.user.update.mockResolvedValue({});

    const req = mockRequest({
      body: { email: 'teacher@test.com' },
    });
    const res = mockResponse();

    await EmailVerificationController.resend(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: 'If the email exists, a verification link has been sent',
    });
  });
});
