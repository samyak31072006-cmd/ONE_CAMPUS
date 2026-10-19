import { describe, it, expect } from 'vitest';

describe('Bunk and Catch-Up Calculation Engine', () => {
  it('correctly calculates bunks available when attendance is above target', () => {
    // 25 attended out of 30 eligible => 83.33%
    // Target = 75% (0.75)
    // 25 / 0.75 - 30 = 33.333 - 30 = 3.333 => floor = 3 bunks
    const A = 25;
    const T = 30;
    const pTarget = 0.75;

    const bunks = Math.max(0, Math.floor(A / pTarget - T));
    expect(bunks).toBe(3);

    // Verify after 3 bunks: 25 / 33 = 75.75% >= 75%
    expect(A / (T + 3)).toBeGreaterThanOrEqual(0.75);
    // Verify after 4 bunks: 25 / 34 = 73.52% < 75%
    expect(A / (T + 4)).toBeLessThan(0.75);
  });

  it('correctly calculates consecutive classes needed to attend when below target', () => {
    // 14 attended out of 20 eligible => 70.0%
    // Target = 75% (0.75)
    // (0.75 * 20 - 14) / (1 - 0.75) = (15 - 14) / 0.25 = 1 / 0.25 = 4 classes
    const A = 14;
    const T = 20;
    const pTarget = 0.75;

    const needed = Math.max(1, Math.ceil((pTarget * T - A) / (1 - pTarget)));
    expect(needed).toBe(4);

    // Verify after 4 classes attended: (14 + 4) / (20 + 4) = 18 / 24 = 75.0%
    expect((A + 4) / (T + 4)).toBeCloseTo(0.75, 4);
    // Verify after 3 classes: (14 + 3) / (20 + 3) = 17 / 23 = 73.91% < 75%
    expect((A + 3) / (T + 3)).toBeLessThan(0.75);
  });

  it('handles custom targets like 80%, 85%, 90%', () => {
    const A = 25;
    const T = 30;

    // Target 80%: 25 / 0.8 - 30 = 31.25 - 30 = 1.25 => floor = 1 bunk
    expect(Math.floor(A / 0.8 - T)).toBe(1);

    // Target 85%: 25 / 0.85 - 30 = 29.41 - 30 = -0.58 => need to attend classes
    // (0.85 * 30 - 25) / (1 - 0.85) = (25.5 - 25) / 0.15 = 0.5 / 0.15 = 3.33 => ceil = 4 classes
    expect(Math.ceil((0.85 * T - A) / (1 - 0.85))).toBe(4);
  });
});
