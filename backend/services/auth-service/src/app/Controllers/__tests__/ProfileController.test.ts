import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '../../../__mocks__/prisma';
import { mockRequest, mockResponse } from './helper';

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => prisma),
}));

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(() => Promise.resolve(true)),
    hash: vi.fn(() => Promise.resolve('hashed-new-password')),
  },
}));

let ProfileController: typeof import('../ProfileController').default;

beforeEach(async () => {
  vi.clearAllMocks();
  ProfileController = (await import('../ProfileController')).default;
});

describe('ProfileController.getProfile', () => {
  it('returns 401 if user is not authenticated', async () => {
    const req = mockRequest({ headers: {} });
    const res = mockResponse();

    await ProfileController.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized',
    });
  });

  it('returns 404 if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const req = mockRequest({
      headers: { 'x-user-id': 'user-1' },
    });
    const res = mockResponse();

    await ProfileController.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User not found',
    });
  });

  it('returns user profile successfully', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      firstName: 'Ali',
      lastName: 'Ahmad',
      username: 'ali123',
      email: 'ali@test.com',
      role: 'STUDENT',
    });

    const req = mockRequest({
      headers: { 'x-user-id': 'user-1' },
    });
    const res = mockResponse();

    await ProfileController.getProfile(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-1',
        username: 'ali123',
      })
    );
  });
});

describe('ProfileController.updateProfile', () => {
  it('returns 401 if user is not authenticated', async () => {
    const req = mockRequest({ body: {} });
    const res = mockResponse();

    await ProfileController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized',
    });
  });

  it('returns 404 if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const req = mockRequest({
      headers: { 'x-user-id': 'user-1' },
      body: {},
    });
    const res = mockResponse();

    await ProfileController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User not found',
    });
  });

  it('returns 400 if changing password without current password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      password: 'hashed-password',
    });

    const req = mockRequest({
      headers: { 'x-user-id': 'user-1' },
      body: {
        password: 'newpassword123',
      },
    });
    const res = mockResponse();

    await ProfileController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Current password is required to change password',
    });
  });

  it('returns 401 if current password is incorrect', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      password: 'hashed-password',
    });

    const bcrypt = await import('bcrypt');
    (bcrypt.default.compare as any).mockResolvedValue(false);

    const req = mockRequest({
      headers: { 'x-user-id': 'user-1' },
      body: {
        currentPassword: 'wrongpassword',
        password: 'newpassword123',
      },
    });
    const res = mockResponse();

    await ProfileController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Current password is incorrect',
    });
  });

  it('returns 400 if new password is too short', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      password: 'hashed-password',
    });

    const bcrypt = await import('bcrypt');
    (bcrypt.default.compare as any).mockResolvedValue(true);

    const req = mockRequest({
      headers: { 'x-user-id': 'user-1' },
      body: {
        currentPassword: 'correctpassword',
        password: 'short',
      },
    });
    const res = mockResponse();

    await ProfileController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'New password must be at least 8 characters',
    });
  });

  it('updates profile successfully (non-password)', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      password: 'hashed-password',
    });

    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      firstName: 'Ali',
      lastName: 'Updated',
      username: 'ali123',
      email: 'ali@test.com',
      role: 'STUDENT',
    });

    const req = mockRequest({
      headers: {
        'x-user-id': 'user-1',
        'x-user-role': 'STUDENT',
      },
      body: {
        lastName: 'Updated',
      },
    });
    const res = mockResponse();

    await ProfileController.updateProfile(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Profile updated successfully',
      })
    );
  });

  it('updates password successfully', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      password: 'hashed-password',
    });

    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      firstName: 'Ali',
      lastName: 'Ahmad',
      username: 'ali123',
      email: 'ali@test.com',
      role: 'STUDENT',
    });

    const bcrypt = await import('bcrypt');
    (bcrypt.default.compare as any).mockResolvedValue(true);

    const req = mockRequest({
      headers: { 'x-user-id': 'user-1' },
      body: {
        currentPassword: 'correctpassword',
        password: 'newpassword123',
      },
    });
    const res = mockResponse();

    await ProfileController.updateProfile(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Profile updated successfully',
      })
    );
  });
});
