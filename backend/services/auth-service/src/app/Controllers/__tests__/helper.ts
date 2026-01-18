import type { Request, Response } from 'express';
import { vi } from 'vitest';

export const mockRequest = (
  overrides: Partial<Request> = {}
) =>
  ({
    body: {},        // ✅ always exists in Express
    headers: {},     // ✅ always exists
    ip: '127.0.0.1', // ✅ commonly used
    ...overrides,    // allow test-specific overrides
  } as unknown as Request);

export const mockResponse = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};
