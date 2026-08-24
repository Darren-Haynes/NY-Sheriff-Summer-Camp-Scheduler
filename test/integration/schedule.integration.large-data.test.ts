import { vi, describe, beforeAll, afterAll, test, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import { Camp } from '../../src/main/camp';
import { Kids } from '../../src/main/kids';

// 1. FIXED: Corrected "tests" to "test" to perfectly align with your actual directory layout
const FIXTURE_GROUPS = [
  { dirPath: 'test/integration/fixtures/success-data', label: 'SUCCESS_DATA' },
];

describe('Schedule integration (Dynamic Dataset Suites)', () => {
  beforeAll(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
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

    test(`Algorithm Run [${label}] -> ${file}`, () => {
      // 2. FIXED: Use standard native require for synchronous runtime file processing inside Vitest
      const moduleData = require(fullModulePath);

      const rowsKey = Object.keys(moduleData).find(key => Array.isArray(moduleData[key]));
      if (!rowsKey) {
        throw new Error(`Could not find exported row array inside module: ${file}`);
      }

      const rows = moduleData[rowsKey] as string[][];

      const kids = new Kids(rows);
      const camp = new Camp(kids);
      const numOfRuns = 1000;
      camp.scheduleTheKids(numOfRuns);

      // If not null than then the scheduler ran successfully
      expect(camp.bestSchedule).toBeDefined();
      expect(typeof camp.bestSchedule).toBe('object');
      // Total number of runs should be at minumum equal to numOfRuns we passed.
      // If any of those 20 are unsuccessfully than an additional run will occur
      expect(camp.allRuns.length).toBeGreaterThanOrEqual(numOfRuns);

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
