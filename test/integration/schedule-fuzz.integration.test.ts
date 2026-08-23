import { describe, expect, test, vi } from 'vitest';
import { Camp } from '../../src/main/camp';
import { Kids } from '../../src/main/kids';
import { Activities } from '../../src/main/activities';

describe('Scheduler Algorithmic Fuzzing & Stress Tests', () => {

  test('unlocked randomness loops execute fallback branches and retry pathways natively', () => {
    // 1. Mute console outputs during execution to keep the test terminal clean
    vi.spyOn(console, 'log').mockImplementation(() => { });

    // Collect all valid choices to pick from dynamically
    const landOptions = Activities.landActs;
    const waterOptions = Activities.waterActs;

    // 2. Run across multiple iterations using completely different roster sizes and layouts
    // Changing the roster count (e.g., 53, 71, 109 kids) forces fractional percentages
    // that naturally trigger the 99% and 101% remainder rounding engines.
    const uniqueRosterSizes = Array.from({ length: 150 - 50 + 1 }, (_, i) => 50 + i);

    for (const size of uniqueRosterSizes) {
      const chaoticRoster = Array.from({ length: size }, (_, i) => {
        // Randomly decide if this camper creates a duplicate choice scenario
        const isDuplicateCamper = i % 5 === 0;

        const l1 = landOptions[i % landOptions.length];
        const l2 = isDuplicateCamper ? l1 : landOptions[(i + 1) % landOptions.length];
        const l3 = isDuplicateCamper ? l1 : landOptions[(i + 2) % landOptions.length];

        const w1 = waterOptions[i % waterOptions.length];
        const w2 = isDuplicateCamper ? w1 : waterOptions[(i + 1) % waterOptions.length];
        const w3 = isDuplicateCamper ? w1 : waterOptions[(i + 2) % waterOptions.length];

        return [`First${i}`, `Last${i}`, l1, l2, l3, w1, w2, w3];
      });
      const kids = new Kids(chaoticRoster);
      const camp = new Camp(kids);
      const numOfRuns = 20;
      camp.scheduleTheKids(numOfRuns);

      expect(camp.bestSchedule).toBeDefined();
      expect(typeof camp.bestSchedule).toBe('object');
    }
    vi.restoreAllMocks();
  });
});
