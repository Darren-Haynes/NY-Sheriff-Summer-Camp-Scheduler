import path from 'path';
import { describe, expect, test } from 'vitest';
import extractKidsChoicesData from '../../src/main/excel-parser';
import { DataErrorHandler } from '../../src/main/dataInput';

/**
 * These tests run DataErrorHandler's pre-check methods against real fixture
 * spreadsheets (the same files used for manual testing via the app's file
 * dialog), rather than hand-built campData arrays. Each fixture is named for
 * the single error condition it's meant to trigger, so each test also
 * confirms the fixture doesn't unexpectedly trip any of the other checks.
 */
const newFormatFixture = (name: string) =>
  path.join(__dirname, '../../e2e/fixtures/new-format', name);

describe('DataErrorHandler (original spreadsheet format fixtures)', () => {
  test('notEnoughKids() flags a roster with fewer than 50 kids (error-49-kids.xlsx)', async () => {
    const data = await extractKidsChoicesData(newFormatFixture('error-49-kids.xlsx'));
    expect(data.length).toBe(49);

    const dataErrors = new DataErrorHandler(data);

    expect(dataErrors.notEnoughKids()).toBe(true);
    expect(dataErrors.notEnoughKidsError).toEqual([
      'The number of kids scheduled for camp is 49, but 50 or more are required',
    ]);

    // Sanity check: this fixture should only trip notEnoughKids, not the other checks.
    expect(dataErrors.tooManyKids()).toBe(false);
    expect(dataErrors.wrongActivity()).toBe(false);
    expect(dataErrors.duplicateName()).toBe(false);
  });

  test('tooManyKids() flags a roster with more than 146 kids (error-147-kids.xlsx)', async () => {
    const data = await extractKidsChoicesData(newFormatFixture('error-147-kids.xlsx'));
    expect(data.length).toBe(147);

    const dataErrors = new DataErrorHandler(data);

    expect(dataErrors.tooManyKids()).toBe(true);
    expect(dataErrors.tooManyKidsError).toEqual([
      'The number of kids scheduled for camp is 147, but 146 or less are required',
    ]);

    // Sanity check: this fixture should only trip tooManyKids, not the other checks.
    expect(dataErrors.notEnoughKids()).toBe(false);
    expect(dataErrors.wrongActivity()).toBe(false);
    expect(dataErrors.duplicateName()).toBe(false);
  });

  test('duplicateName() flags kids who appear twice in the roster (error-duplicate-names.xlsx)', async () => {
    const data = await extractKidsChoicesData(newFormatFixture('error-duplicate-names.xlsx'));
    expect(data.length).toBe(117);

    const dataErrors = new DataErrorHandler(data);

    expect(dataErrors.duplicateName()).toBe(true);
    expect(dataErrors.duplicateNameError).toEqual([
      'Row 18; duplicate name - Patrick Lee',
      'Row 19; duplicate name - Patrick Lee',
      'Row 43; duplicate name - Cali Head',
      'Row 44; duplicate name - Cali Head',
    ]);
  });

  test('wrongActivity() flags incorrect activities in the roster (error-wrong-activities.xlsx)', async () => {
    const data = await extractKidsChoicesData(newFormatFixture('error-wrong-activities.xlsx'));
    expect(data.length).toBe(117);

    const dataErrors = new DataErrorHandler(data);

    expect(dataErrors.wrongActivity()).toBe(true);
    expect(dataErrors.activityError).toEqual([
      'Row 81; column W1 -- praying',
      'Row 97; column L2 -- flying',
      'Row 103; column L3 -- diving',
    ]);

    // Sanity check: this fixture should only trip wrongActivity, not the other checks.
    expect(dataErrors.notEnoughKids()).toBe(false);
    expect(dataErrors.tooManyKids()).toBe(false);
    expect(dataErrors.duplicateName()).toBe(false);
  });

  test('wrongActivity() flags missing activities in the roster (error-missing-activities.xlsx)', async () => {
    const data = await extractKidsChoicesData(newFormatFixture('error-missing-activities.xlsx'));
    expect(data.length).toBe(117);

    const dataErrors = new DataErrorHandler(data);

    expect(dataErrors.wrongActivity()).toBe(true);
    expect(dataErrors.activityError).toEqual([
      'Row 3; column L1 -- NO SPORT EMPTY CELL',
      'Row 4; column W1 -- NO SPORT EMPTY CELL',
      'Row 5; column L2 -- NO SPORT EMPTY CELL',
      'Row 6; column W2 -- NO SPORT EMPTY CELL',
      'Row 7; column L3 -- NO SPORT EMPTY CELL',
      'Row 8; column W3 -- NO SPORT EMPTY CELL',
    ]);

    // Sanity check: this fixture should only trip wrongActivity, not the other checks.
    expect(dataErrors.notEnoughKids()).toBe(false);
    expect(dataErrors.tooManyKids()).toBe(false);
    expect(dataErrors.duplicateName()).toBe(false);
  });
});
