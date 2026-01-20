import { vi } from 'vitest';

export const prisma = {
  user: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  
  passwordResetToken: {
    deleteMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
  
  class: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },

  classUser: {
    create: vi.fn(),
  },

  mascot: {
    create: vi.fn(),
    updateMany: vi.fn(),
  },

  authLog: {
    create: vi.fn(),
  },

  $transaction: vi.fn(),
};
