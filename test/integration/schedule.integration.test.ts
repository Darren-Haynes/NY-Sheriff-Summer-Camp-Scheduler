import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { Kids } from '../../src/main/kids';
import { Camp  } from '../../src/main/camp';

describe('Schedule integration (small dataset)', () => {
  beforeAll(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('runAlgo completes and schedule map created for each kid', () => {
    const rows = [
      ['John', 'Doe', 'bball', 'art', 'hike', 'canoe', 'swim', 'fish'],
      ['Alice', 'Jones', 'fball', 'pball', 'lax', 'swim', 'canoe', 'kayak'],
      ['Bob', 'Smith', 'art', 'hike', 'cheer', 'fish', 'pboard', 'swim'],
      ['Eve', 'Stone', 'fris', 'art', 'pball', 'kayak', 'pboard', 'swim'],
      ['Tim', 'Brown', 'bball', 'vball', 'soc', 'canoe', 'kayak', 'swim'],
      ['Zoe', 'Lane', 'arch', 'art', 'hike', 'swim', 'canoe', 'fish'],
    ];

    const kids = new Kids(rows);
    const camp = new Camp(kids)
    const numOfRuns = 1000;
    camp.scheduleTheKids(numOfRuns);

    // If not null than then the scheduler ran successfully
    expect(camp.bestSchedule).toBeDefined();
    expect(typeof camp.bestSchedule).toBe('object');

    const scheduler = camp.bestSchedule;
    expect(scheduler?.schedule.size).toBe(kids.count);

    for (const name of kids.names) {
      const kd = scheduler?.schedule.get(name);
      expect(kd).toBeDefined();
      expect(kd!.timeSlots).toBeDefined();
      expect(Object.prototype.hasOwnProperty.call(kd!.timeSlots, 'water9am')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(kd!.timeSlots, 'water10am')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(kd!.timeSlots, 'land9am')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(kd!.timeSlots, 'land10am')).toBe(true);
    }
  }, 20000);
});
