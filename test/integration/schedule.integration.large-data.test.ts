import { vi, describe, beforeAll, afterAll, test, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import { Camp } from '../../src/main/camp';
import { Kids } from '../../src/main/kids';
import { Schedule } from '../../src/main/schedule';
import { seededRandom } from '../helpers/seeded-random';

// 1. FIXED: Corrected "tests" to "test" to perfectly align with your actual directory layout
const FIXTURE_GROUPS = [
  { dirPath: 'test/integration/fixtures/success-data', label: 'SUCCESS_DATA' },
];

describe('Schedule integration (Dynamic Dataset Suites)', () => {
  beforeAll(() => {
    // Seeded (not constant) randomness: every run differs, but the whole suite stays deterministic.
    vi.spyOn(Math, 'random').mockImplementation(seededRandom(20240607));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  // Collect files early to guarantee synchronous loops execute visibility blocks
  const targetSuites = FIXTURE_GROUPS.flatMap(({ dirPath, label }) => {
    const resolvedDir = path.resolve(process.cwd(), dirPath);

    if (!fs.existsSync(resolvedDir)) {
      // Throw explicitly rather than failing silently to alert on configuration typos
      throw new Error(`Directory path target not found: ${resolvedDir}`);
    }

    return fs.readdirSync(resolvedDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => ({
        file,
        label,
        fullModulePath: path.join(resolvedDir, file)
      }));
  });

  // Standard flat iteration block to safely announce tests to Vitest's discovery runner
  targetSuites.forEach(({ file, label, fullModulePath }) => {
    const countMatch = file.match(/\b(\d{2,3})\b/);
    const expectedKidCount = countMatch ? parseInt(countMatch[1], 10) : null;

    test(`Algorithm Run [${label}] -> ${file}`, async () => {
      const moduleData = await import(fullModulePath);

      const rowsKey = Object.keys(moduleData).find(key => Array.isArray(moduleData[key]));
      if (!rowsKey) {
        throw new Error(`Could not find exported row array inside module: ${file}`);
      }

      const rows = moduleData[rowsKey] as string[][];

      const kids = new Kids(rows);
      const camp = new Camp(kids);
      const numOfRuns = 1000;
      camp.scheduleTheKids(numOfRuns);

      // The scheduler must find at least one valid schedule. Camp stops after numOfRuns failed
      // attempts, so on tight rosters (e.g. 50 kids, where most random runs are invalid) it can
      // legitimately finish with fewer than numOfRuns valid runs.
      expect(camp.bestSchedule).not.toBeNull();
      expect(camp.allRuns.length).toBeGreaterThan(0);
      expect(camp.allRuns.length).toBeLessThanOrEqual(numOfRuns);

      // The chosen schedule must be as good as any run that was available.
      const noChoiceTotal = (run: Schedule): number =>
        run.waterPercentages[3] + run.landPercentages[3];
      const lowestAvailable = Math.min(...camp.allRuns.map(noChoiceTotal));
      expect(noChoiceTotal(camp.bestSchedule as Schedule)).toBe(lowestAvailable);

      if (expectedKidCount !== null) {
        expect(kids.count).toBe(expectedKidCount);
      }

      const scheduler = camp.bestSchedule;

      for (const name of kids.names) {
        const kd = scheduler?.schedule.get(name);

        expect(kd).toBeDefined();
        expect(kd!.timeSlots).toBeDefined();
        expect(Object.prototype.hasOwnProperty.call(kd!.timeSlots, 'water9am')).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(kd!.timeSlots, 'water10am')).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(kd!.timeSlots, 'land9am')).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(kd!.timeSlots, 'land10am')).toBe(true);
      }

      expect(scheduler?.landPercentages.length).toBe(4)
      expect(scheduler?.waterPercentages.length).toBe(4)
      const landSum = scheduler?.landPercentages.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      const waterSum = scheduler?.waterPercentages.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      expect(landSum).toBe(100)
      expect(waterSum).toBe(100)
    });
  });
});
