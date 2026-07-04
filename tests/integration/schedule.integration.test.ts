import { vi } from 'vitest';
import { Kids } from '../../src/main/kids';
import { Schedule } from '../../src/main/schedule';

const HEADER =
  ['First', 'Last', 'X', 'Land1', 'Land2', 'Land3', 'Water1', 'Water2', 'Water3'].join('\t') + '\n';

describe('Schedule integration (small dataset)', () => {
  beforeAll(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('runAlgo completes and schedule map created for each kid', () => {
    const rows = [
      ['John', 'Doe', '', 'bball', 'art', 'hike', 'canoe', 'swim', 'fish'],
      ['Alice', 'Jones', '', 'fball', 'pball', 'lax', 'swim', 'canoe', 'kayak'],
      ['Bob', 'Smith', '', 'art', 'hike', 'cheer', 'fish', 'pboard', 'swim'],
      ['Eve', 'Stone', '', 'fris', 'art', 'pball', 'kayak', 'pboard', 'swim'],
      ['Tim', 'Brown', '', 'bball', 'vball', 'soc', 'canoe', 'kayak', 'swim'],
      ['Zoe', 'Lane', '', 'arch', 'art', 'hike', 'swim', 'canoe', 'fish'],
    ];
    const input = HEADER + rows.map(r => r.join('\t')).join('\n') + '\n';

    const kids = new Kids(input);
    const scheduler = new Schedule(kids, 'waterFirst');
    const statsOk = scheduler.runAlgo();
    expect(typeof statsOk).toBe('boolean');

    expect(scheduler.schedule.size).toBe(kids.count);

    for (const name of kids.names) {
      const kd = scheduler.schedule.get(name);
      expect(kd).toBeDefined();
      expect(kd!.timeSlots).toBeDefined();
      expect(Object.prototype.hasOwnProperty.call(kd!.timeSlots, 'water9am')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(kd!.timeSlots, 'water10am')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(kd!.timeSlots, 'land9am')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(kd!.timeSlots, 'land10am')).toBe(true);
    }
  }, 20000);
});
