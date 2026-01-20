import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '../../../__mocks__/prisma';
import { mockRequest, mockResponse } from './helper';

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => prisma),
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(() => Promise.resolve('hashed-password')),
  },
}));

vi.mock('crypto', () => ({
  default: {
    randomBytes: () => ({
      toString: () => 'mock-reset-token',
    }),
  },
}));

let PasswordResetController: typeof import('../PasswordResetController').default;

beforeEach(async () => {
  vi.clearAllMocks();
  PasswordResetController =
    (await import('../PasswordResetController')).default;
});

describe('PasswordResetController.requestReset', () => {
  it('returns 400 if email is missing', async () => {
    const req = mockRequest({ body: {} });
    const res = mockResponse();

    await PasswordResetController.requestReset(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Email is required',
    });
  });

  it('returns 404 if teacher not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const req = mockRequest({
      body: { email: 'notfound@test.com' },
    });
    const res = mockResponse();

    await PasswordResetController.requestReset(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Teacher not found',
    });
  });

  it('creates reset token and sends email', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      role: 'TEACHER',
    });

    prisma.passwordResetToken.deleteMany.mockResolvedValue({});
    prisma.passwordResetToken.create.mockResolvedValue({});

    const req = mockRequest({
      body: { email: 'teacher@test.com' },
    });
    const res = mockResponse();

    await PasswordResetController.requestReset(req, res);

    expect(prisma.passwordResetToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          token: 'mock-reset-token',
        }),
      })
    );

    expect(res.json).toHaveBeenCalledWith({
      message: 'Password reset token created',
    });
  });
});

describe('PasswordResetController.resetPassword', () => {
  it('returns 400 if token or password missing', async () => {
    const req = mockRequest({ body: {} });
    const res = mockResponse();

    await PasswordResetController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token and new password required',
    });
  });

  it('returns 400 if password too short', async () => {
    const req = mockRequest({
      body: {
        token: 'token',
        newPassword: 'short',
      },
    });
    const res = mockResponse();

    await PasswordResetController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Password must be at least 8 characters',
    });
  });

  it('returns 400 if token invalid or expired', async () => {
    prisma.passwordResetToken.findUnique.mockResolvedValue(null);

    const req = mockRequest({
      body: {
        token: 'invalid',
        newPassword: 'newpassword123',
      },
    });
    const res = mockResponse();

    await PasswordResetController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid or expired token',
    });
  });

  it('resets password successfully', async () => {
    prisma.passwordResetToken.findUnique.mockResolvedValue({
      userId: 'user-1',
      token: 'mock-reset-token',
      expiresAt: new Date(Date.now() + 1000),
    });

    prisma.user.update.mockResolvedValue({});
    prisma.passwordResetToken.delete.mockResolvedValue({});

    const req = mockRequest({
      body: {
        token: 'mock-reset-token',
        newPassword: 'newpassword123',
      },
    });
    const res = mockResponse();

    await PasswordResetController.resetPassword(req, res);

    expect(prisma.user.update).toHaveBeenCalled();
    expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({
      where: { token: 'mock-reset-token' },
    });

    expect(res.json).toHaveBeenCalledWith({
      message: 'Password reset successful',
    });
  });
});
