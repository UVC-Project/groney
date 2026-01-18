import { vi } from 'vitest';

/**
 * GLOBAL EMAIL KILL SWITCH
 * This prevents ALL real emails in ALL tests
 */
vi.mock('nodemailer', () => {
  return {
    default: {
      createTransport: vi.fn(() => ({
        sendMail: vi.fn(() => Promise.resolve()),
      })),
    },
  };
});
