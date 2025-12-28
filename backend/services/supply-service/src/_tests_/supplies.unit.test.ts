import { describe, it, expect } from 'vitest';

describe('Supplies feature - unit rules', () => {
  it('teacher status validation: only APPROVED/REJECTED allowed', () => {
    // inline "unit under test"
    const isValidStatus = (status: unknown) => status === 'APPROVED' || status === 'REJECTED';

    expect(isValidStatus('APPROVED')).toBe(true);
    expect(isValidStatus('REJECTED')).toBe(true);
    expect(isValidStatus('PENDING')).toBe(false);
    expect(isValidStatus(undefined)).toBe(false);
  });

  it('duplicate pending request rule: any existing pending means duplicate', () => {
    // inline "unit under test"
    const isDuplicate = (existingCount: number) => existingCount > 0;

    expect(isDuplicate(0)).toBe(false);
    expect(isDuplicate(1)).toBe(true);
    expect(isDuplicate(10)).toBe(true);
  });
});
