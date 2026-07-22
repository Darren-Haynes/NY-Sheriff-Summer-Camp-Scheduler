import * as Excel from 'exceljs';
import path from 'path';
import fs from 'fs';
import { describe, expect, test, vi } from 'vitest';
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
    expect(firstName).toBe('John');
    expect(lastName).toBe('Smith');
    expect([land1, land2, land3]).toEqual(['arch', 'hike', 'bball']);
    expect([water1, water2, water3]).toEqual(['swim', 'sail', 'fish']);

    // Every row should have a non-empty name and all 6 activity choices,
    // confirming we're reading from the right sheet/columns throughout.
    data.forEach(row => {
      expect(row).toHaveLength(8);
      row.forEach(cell => expect(cell).not.toBe(''));
    });
  });

  test('forces the sheet scanner loop to finish completely and drop into the final index fallback branch natively', async () => {
    // 1. Initialize a completely blank workbook containing zero data rows
    const workbook = new Excel.Workbook();

    // Add multiple blank sheets to force the workbook scanner loop to run to complete exhaustion
    workbook.addWorksheet('Empty Staging Log 1');
    workbook.addWorksheet('Empty Staging Log 2');

    // 2. Export the workbook array to a temp staging directory path
    const tempOutputDir = path.join(__dirname, '../fixtures/temp-formats');
    if (!fs.existsSync(tempOutputDir)) {
      fs.mkdirSync(tempOutputDir, { recursive: true });
    }
    const tempFilePath = path.join(tempOutputDir, 'fallback-stress-test.xlsx');
    await workbook.xlsx.writeFile(tempFilePath);

    // 3. Act & Assert
    // Because the sheets are empty, the scanner loop finishes completely, drops into the
    // fallback branch natively, and returns an empty array without an out-of-bounds crash.
    const result = await extractKidsChoicesData(tempFilePath);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);

    // Clean up filesystem footprints cleanly after verification
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  });

  test('handles non-string camper name cells to satisfy cell type branches natively', async () => {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Camper Data');

    // 1. Establish the perfect happy-path headers
    worksheet.getRow(1).values = [
      'First Name', 'Last Name',
      'L1', 'L2', 'L3',
      'W1', 'W2', 'W3'
    ];
    // 2. Row 2: First Name is an integer number (Excel.ValueType.Number), triggering the branch skip
    worksheet.addRow([12345, 'Smith', 'bball', 'art', 'hike', 'swim', 'sail', 'fish']);

    // 3. Row 3: Last Name is missing/null entirely, triggering the other branch skip
    worksheet.addRow(['Jane', null, 'bball', 'art', 'hike', 'swim', 'sail', 'fish']);

    // Export to temporary staging file
    const tempOutputDir = path.join(__dirname, '../fixtures/temp-formats');
    if (!fs.existsSync(tempOutputDir)) {
      fs.mkdirSync(tempOutputDir, { recursive: true });
    }
    const tempFilePath = path.join(tempOutputDir, 'cell-type-stress-test.xlsx');
    await workbook.xlsx.writeFile(tempFilePath);

    // Act
    const result = await extractKidsChoicesData(tempFilePath);

    // Assert structural survival
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);

    // The number 12345 should drop into the fallback empty string branch cleanly
    expect(result[0][0]).toBe('');
    // The null last name should drop into its fallback empty string branch cleanly
    expect(result[1][1]).toBe('');

    // Clean up temporary filesystem artifacts
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  });
});
