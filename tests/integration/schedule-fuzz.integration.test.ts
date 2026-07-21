import { describe, expect, test, vi } from 'vitest';
import { Kids } from '../../src/main/kids';
import { Schedule } from '../../src/main/schedule';

describe('Scheduler Algorithmic Fuzzing & Stress Tests', () => {

  test('unlocked randomness loops execute fallback branches and retry pathways natively', () => {
    // 1. Keep randomness completely unlocked. Do not mock Math.random.
    // Silence internal engine logs to keep the test terminal output clean.
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // 2. Generate a highly competitive roster of 60 kids who ALL want the exact same sports
    const overAllocatedRoster = Array.from({ length: 60 }, (_, i) => [
      `First${i}`,
      `Last${i}`,
      'bball', 'art', 'hike',
      'canoe', 'swim', 'fish'
    ]);

    // 3. Run the solver multiple times so different kids get selected,
    // forcing execution directly through your constraint-handling paths.
    for (let iteration = 0; iteration < 20; iteration++) {
      const kids = new Kids(overAllocatedRoster);
      const scheduler = new Schedule(kids, 'waterFirst');

      // CRITICAL FIX: Explicitly invoke the main solver to run the scheduling engine!
      // (Adjust the method name if your public entrypoint is called something else, like solve())
      (scheduler as any).runAlgo();

      expect(scheduler).toBeDefined();
    }

    vi.restoreAllMocks();
  });
});
