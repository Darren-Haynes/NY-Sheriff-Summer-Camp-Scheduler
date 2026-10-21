import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Kids } from '../../src/main/kids';
import { Schedule } from '../../src/main/schedule';

/**
 * calculateChoicesPercentages rounds each bucket (1st / 2nd / 3rd / no choice) to a whole
 * percent. Rounding can make the total 99 or 101, so the bucket with the largest remainder is
 * nudged by one to make the total exactly 100. These tests pin that behavior down.
 */

const row = (first: string, last: string) => [first, last, 'bball', 'art', 'hike', 'canoe', 'swim', 'fish'];

/**
 * Build a Schedule where the given names were scheduled with their 1st / 2nd / 3rd land choice
 * (all at 9am); every other kid counts as "no choice".
 */
const scheduleWithChoices = (
  totalKids: number,
  chosen: { first: string[]; second: string[]; third: string[] }
) => {
  const rows = Array.from({ length: totalKids }, (_, i) => row(`Kid${i}`, 'X'));
  const schedule = new Schedule(new Kids(rows), 'waterFirst');
  const byChoice = [chosen.first, chosen.second, chosen.third];
  const internals = schedule as unknown as {
    getScheduledChoicesNames: (type: string, timeSlot: string, choiceNum: number) => string[];
  };
  vi.spyOn(internals, 'getScheduledChoicesNames').mockImplementation(
    (_type, timeSlot, choiceNum) => (timeSlot === '9am' ? [...byChoice[choiceNum - 1]] : [])
  );
  return schedule;
};

describe('Schedule.calculateChoicesPercentages rounding', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('adds the missing percent to the largest remainder when the rounded total is 99', () => {
    // 3 kids: 1 first, 1 second, 1 third, 0 no choice -> 33.33% each -> 33+33+33+0 = 99.
    const schedule = scheduleWithChoices(3, {
      first: ['Kid0 X'],
      second: ['Kid1 X'],
      third: ['Kid2 X'],
    });

    expect((schedule as any).calculateChoicesPercentages('land')).toBe(true);

    expect(schedule.landPercentages).toEqual([34, 33, 33, 0]);
    expect(schedule.landPercentages.reduce((sum, p) => sum + p, 0)).toBe(100);
  });

  test('removes the extra percent from the largest remainder when the rounded total is 101', () => {
    // 6 kids: 1 first, 1 second, 1 third, 3 no choice -> 16.7+16.7+16.7+50 -> 17+17+17+50 = 101.
    const schedule = scheduleWithChoices(6, {
      first: ['Kid0 X'],
      second: ['Kid1 X'],
      third: ['Kid2 X'],
    });

    expect((schedule as any).calculateChoicesPercentages('land')).toBe(true);

    expect(schedule.landPercentages).toEqual([16, 17, 17, 50]);
    expect(schedule.landPercentages.reduce((sum, p) => sum + p, 0)).toBe(100);
  });

  test('leaves percentages alone when they already total 100', () => {
    // 4 kids: 1 first, 1 second, 1 third, 1 no choice -> 25% each.
    const schedule = scheduleWithChoices(4, {
      first: ['Kid0 X'],
      second: ['Kid1 X'],
      third: ['Kid2 X'],
    });

    expect((schedule as any).calculateChoicesPercentages('land')).toBe(true);

    expect(schedule.landPercentages).toEqual([25, 25, 25, 25]);
  });
});
