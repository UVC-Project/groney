import { vi } from 'vitest';

vi.mock('nodemailer', () => {
  return {
    default: {
      createTransport: vi.fn(() => ({
        sendMail: vi.fn(() => Promise.resolve()),
      })),
    },
  };
});
