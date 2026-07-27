import { describe, expect, test } from 'vitest';
import { Activities } from '../../src/main/activities';

describe('Activities ranges sanity checks', () => {
  test('waterRanges min and max values are reasonable', () => {
    let totalMin = 0;
    let totalMax = 0;
    for (const r of Object.values(Activities.waterRanges)) {
      totalMin += r[0];
      totalMax += r[1];
    }
    // Sanity: max should be >= min and > 0
    expect(totalMax).toBeGreaterThanOrEqual(totalMin);
    expect(totalMin).toBeGreaterThan(0);
  });

  test('landRanges overall sanity', () => {
    let landMin = 0;
    let landMax = 0;
    for (const r of Object.values(Activities.landRanges)) {
      landMin += r[0];
      landMax += r[1];
    }
    expect(landMax).toBeGreaterThanOrEqual(landMin);
    expect(landMin).toBeGreaterThan(0);
  });
});
