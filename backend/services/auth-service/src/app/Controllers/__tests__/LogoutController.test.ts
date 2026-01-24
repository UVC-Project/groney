import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '../../../__mocks__/prisma';
import { mockRequest, mockResponse } from './helper';

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => prisma),
}));

let LogoutController: typeof import('../LogoutController').default;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  LogoutController = (await import('../LogoutController')).default;
});

describe('LogoutController.logout', () => {
  it('returns 400 if no token provided', async () => {
    const req = mockRequest({ headers: {} });
    const res = mockResponse();

    await LogoutController.logout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No token provided',
    });
  });

  it('returns success when token is provided', async () => {
    prisma.authLog.create.mockResolvedValue({});

    const req = mockRequest({
      headers: {
        authorization: 'Bearer abc.def.ghi',
        'x-user-id': 'user-1',
      },
    });
    const res = mockResponse();

    await LogoutController.logout(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Logged out successfully',
    });
    expect(res.clearCookie).toHaveBeenCalledWith('access_token');
  });

  it('still returns success even if auth log fails', async () => {
    prisma.authLog.create.mockRejectedValue(new Error('DB down'));

    const req = mockRequest({
      headers: {
        authorization: 'Bearer token123',
      },
    });
    const res = mockResponse();

    await LogoutController.logout(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Logged out successfully',
    });
    expect(res.clearCookie).toHaveBeenCalledWith('access_token');
  });
});
