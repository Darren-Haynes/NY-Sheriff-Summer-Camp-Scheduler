import { vi, describe, beforeAll, afterAll, test, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import { Kids } from '../../src/main/kids';
import { Schedule } from '../../src/main/schedule';

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
      const scheduler = new Schedule(kids, 'waterFirst');
      const statsOk = scheduler.runAlgo();

      expect(typeof statsOk).toBe('boolean');
      expect(scheduler.schedule.size).toBe(kids.count);

      if (expectedKidCount !== null) {
        expect(kids.count).toBe(expectedKidCount);
      }

      for (const name of kids.names) {
        const kd = scheduler.schedule.get(name);

        expect(kd).toBeDefined();
        expect(kd!.timeSlots).toBeDefined();
        expect(Object.prototype.hasOwnProperty.call(kd!.timeSlots, 'water9am')).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(kd!.timeSlots, 'water10am')).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(kd!.timeSlots, 'land9am')).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(kd!.timeSlots, 'land10am')).toBe(true);
      }
    });
  });
});
