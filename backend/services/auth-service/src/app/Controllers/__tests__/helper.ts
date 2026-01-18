import type { Request, Response } from 'express';
import { vi } from 'vitest';

export const mockRequest = (
  overrides: Partial<Request> = {}
) =>
  ({
    body: {},
    headers: {},
    ip: '127.0.0.1',
    ...overrides,
  } as unknown as Request);

export const mockResponse = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};
