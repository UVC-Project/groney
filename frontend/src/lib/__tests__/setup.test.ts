import { describe, it, expect } from 'vitest';

describe('Frontend Setup', () => {
  it('should have TypeScript configured', () => {
    const value: string = 'test';
    expect(value).toBe('test');
  });

  it('should import types correctly', async () => {
    const types = await import('../types');
    expect(types).toBeDefined();
  });
});
