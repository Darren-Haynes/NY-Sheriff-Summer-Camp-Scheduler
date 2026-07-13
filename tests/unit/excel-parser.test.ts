import path from 'path';
import { describe, expect, test } from 'vitest';
import extractKidsChoicesData from '../../src/main/excel-parser';

describe('extractKidsChoicesData', () => {
  test('finds the campers data by header content across a multi-sheet workbook', async () => {
    const fixturePath = path.join(__dirname, '../../e2e/fixtures/new-format/success-117-kids.xlsx');

    const data = await extractKidsChoicesData(fixturePath);

    // The workbook has 14+ unrelated sheets (NO SHOWS, bus lists, per-county
    // staging sheets, etc.) - make sure we actually found real camper rows
    // and not, say, the "NO SHOWS" sheet (which would yield near-empty rows).
    expect(data.length).toBeGreaterThan(100);

    const [firstName, lastName, land1, land2, land3, water1, water2, water3] = data[0];
    expect(firstName).toBe('Lucas');
    expect(lastName).toBe('Heidrich');
    expect([land1, land2, land3]).toEqual(['arch', 'hike', 'bball']);
    expect([water1, water2, water3]).toEqual(['swim', 'sail', 'fish']);

    // Every row should have a non-empty name and all 6 activity choices,
    // confirming we're reading from the right sheet/columns throughout.
    data.forEach(row => {
      expect(row).toHaveLength(8);
      row.forEach(cell => expect(cell).not.toBe(''));
    });
  });
});
