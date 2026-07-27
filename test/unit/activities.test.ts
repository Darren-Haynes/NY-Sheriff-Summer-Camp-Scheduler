import { describe, expect, test } from 'vitest';
import { Activities } from '../../src/main/activities';

describe('Activities constants', () => {
  test('activity lists contain expected sample activities', () => {
    expect(Array.isArray(Activities.landActs)).toBe(true);
    expect(Activities.landActs).toContain('art');
    expect(Activities.landActs).toContain('bball');
    expect(Array.isArray(Activities.waterActs)).toBe(true);
    expect(Activities.waterActs).toContain('swim');
    expect(Activities.waterActs).toContain('canoe');
  });

  test('land9amActs and land10amActs are subsets of landActs', () => {
    for (const a of Activities.land9amActs) {
      expect(Activities.landActs).toContain(a);
    }
    for (const a of Activities.land10amActs) {
      expect(Activities.landActs).toContain(a);
    }
  });

  test('water ranges entries have expected length and numeric values', () => {
    // waterRanges values should be arrays (length 5: min, max, slotFlag, doubleMin, doubleMax)
    for (const [activity, range] of Object.entries(Activities.waterRanges)) {
      expect(Array.isArray(range)).toBe(true);
      expect(range.length).toBeGreaterThanOrEqual(3);
      range.forEach(value => expect(typeof value).toBe('number'));
    }
  });

  test('land ranges entries have expected structure (min/max/... )', () => {
    for (const [activity, range] of Object.entries(Activities.landRanges)) {
      expect(Array.isArray(range)).toBe(true);
      expect(range.length).toBeGreaterThanOrEqual(3);
      expect(typeof range[0]).toBe('number'); // min
      expect(typeof range[1]).toBe('number'); // max
    }

    // spot check 9am/10am specific maps exist and contain numeric ranges
    for (const [activity, range] of Object.entries(Activities.landRanges9am)) {
      expect(Array.isArray(range)).toBe(true);
      expect(range.length).toBeGreaterThanOrEqual(2);
      range.forEach(v => expect(typeof v).toBe('number'));
    }
    for (const [activity, range] of Object.entries(Activities.landRanges10am)) {
      expect(Array.isArray(range)).toBe(true);
      expect(range.length).toBeGreaterThanOrEqual(2);
      range.forEach(v => expect(typeof v).toBe('number'));
    }
  });

  test('initial activity pools are empty arrays', () => {
    for (const a of Activities.waterActs) {
      // @ts-ignore runtime check
      expect(Array.isArray(Activities.water9am[a])).toBe(true);
      // @ts-ignore
      expect(Activities.water9am[a].length).toBe(0);
      // @ts-ignore
      expect(Array.isArray(Activities.water10am[a])).toBe(true);
      // @ts-ignore
      expect(Activities.water10am[a].length).toBe(0);
    }

    for (const a of Activities.land9amActs) {
      // @ts-ignore
      expect(Array.isArray(Activities.land9am[a])).toBe(true);
      // @ts-ignore
      expect(Activities.land9am[a].length).toBe(0);
    }
    for (const a of Activities.land10amActs) {
      // @ts-ignore
      expect(Array.isArray(Activities.land10am[a])).toBe(true);
      // @ts-ignore
      expect(Activities.land10am[a].length).toBe(0);
    }
  });

  test('Activities object is frozen (immutable)', () => {
    expect(Object.isFrozen(Activities)).toBe(true);
  });
});
