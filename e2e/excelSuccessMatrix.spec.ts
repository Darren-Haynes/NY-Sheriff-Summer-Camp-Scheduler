import { test, expect } from './fixtures';
import path from 'path';
import fs from 'fs';

test.describe.configure({ mode: 'serial' });

const FIXTURE_GROUPS = [
  { dirPath: 'e2e/fixtures/original-format', label: 'ORIGINAL_FORMAT' },
  { dirPath: 'e2e/fixtures/new-format', label: 'NEW_FORMAT' }
];

function parseAllCampersBySlot(text: string): Record<string, Set<string>> {
  const slots: Record<string, Set<string>> = {
    water9am: new Set<string>(),
    water10am: new Set<string>(),
    land9am: new Set<string>(),
    land10am: new Set<string>()
  };

  let currentSlot: string | null = null;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    if (lowerLine.startsWith('water 9am')) {
      currentSlot = 'water9am';
      continue;
    } else if (lowerLine.startsWith('water 10am')) {
      currentSlot = 'water10am';
      continue;
    } else if (lowerLine.startsWith('land 9am')) {
      currentSlot = 'land9am';
      continue;
    } else if (lowerLine.startsWith('land 10am')) {
      currentSlot = 'land10am';
      continue;
    }

    if (!currentSlot || lowerLine === 'no kids scheduled') {
      continue;
    }

    if (/^[a-z0-9]+\s+\d+$/i.test(line)) {
      continue;
    }

    const campers = line.split(',').map(c => c.trim()).filter(c => c.length > 0);
    for (const camper of campers) {
      if (camper.length > 1) {
        slots[currentSlot].add(camper);
      }
    }
  }

  return slots;
}

FIXTURE_GROUPS.forEach(({ dirPath, label }) => {
  const resolvedDir = path.resolve(process.cwd(), dirPath);
  if (!fs.existsSync(resolvedDir)) return;

  const excelFiles = fs.readdirSync(resolvedDir).filter(file => file.startsWith('success') && file.endsWith('.xlsx'));

  excelFiles.forEach(file => {
    // Isolate 2-3 digit headcount strings while ignoring solitary layout numbers like '1st'
    const countMatch = file.match(/\b(\d{2,3})\b/);
    const expectedKidCount = countMatch ? parseInt(countMatch[1], 10) : null;

    test(`Excel Success Matrix [${label}] -> ${file}`, async ({ appContext }) => {
      test.setTimeout(60000);

      const { electronApp, electronWindow } = appContext;
      const fullSpreadsheetPath = path.join(resolvedDir, file);

      await electronWindow.waitForTimeout(700);

      await electronApp.evaluate(async ({ dialog }, filePath) => {
        dialog.showOpenDialog = async () => {
          return { canceled: false, filePaths: [filePath] };
        };
        dialog.showSaveDialog = async () => {
          return { canceled: false, filePath: './mock_output.xlsx' };
        };
      }, fullSpreadsheetPath);

      const uploadButton = electronWindow.locator('#upload-btn');
      await expect(uploadButton).toBeAttached();
      await uploadButton.click({ force: true });

      const timetableContainer = electronWindow.locator('#text-box');
      await expect(timetableContainer).toBeAttached({ timeout: 45000 });

      const rawResultsText = await timetableContainer.innerText();
      const parsedSchedules = parseAllCampersBySlot(rawResultsText);

      const water9amCampers = parsedSchedules.water9am;
      const water10amCampers = parsedSchedules.water10am;
      const land9amCampers = parsedSchedules.land9am;
      const land10amCampers = parsedSchedules.land10am;

      // Invariants
      expect(water9amCampers).toEqual(land10amCampers);
      expect(water10amCampers).toEqual(land9amCampers);

      if (expectedKidCount !== null) {
        const absoluteUniqueEnrollment = new Set([...water9amCampers, ...water10amCampers]);
        expect(absoluteUniqueEnrollment.size).toBe(expectedKidCount);
      }
    });
  });
});
