import path from 'path';
import { describe, expect, test } from 'vitest';
import extractKidsChoicesData from '../../src/main/excel-parser';
import { DataErrorHandler, KidsChoices } from '../../src/main/dataInput';

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
      'Row 6; duplicate name - David Jones',
      'Row 7; duplicate name - David Jones',
      'Row 17; duplicate name - Nancy Thomas',
      'Row 18; duplicate name - Nancy Thomas',
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

  describe('DataInput Execution Gap Target Cleanups', () => {

    test('Exercises KidsChoices map creation (Lines 26-41)', () => {
      // Requires a structured 8-element row array structure to prevent out-of-bounds mapping
      const mockData = [
        ['John', 'Doe', 'arch', 'hike', 'art', 'swim', 'sail', 'kayak']
      ];

      const choices = new KidsChoices(mockData);
      expect(choices.kidsMap.has('Doe John')).toBe(true);
      expect(choices.kidsMap.get('Doe John')?.land1).toBe('arch');
    });

    test('Exercises malformed row counts, duplicate names, and error lists', () => {
      // Craft a highly malformed dataset array matrix to hit all remaining targets at once
      const brokenCampData = [
        // 1. Trigger too few kids error (< 50 kids overall)

        // 2. Trigger numOfFields length error (Lines 103-111) -> Array length is 3 instead of 9
        ['Short', 'Row', 'Invalid'],

        // 3. Trigger wrongActivity & duplicate Choice
        ['Alice', 'Smith', 'BadSport', 'BadSport', 'L3', 'W1', 'W2', 'W3', 'Extra'],

        // 4. Trigger duplicateName error branches -> Twin instances
        ['John', 'Doe', 'L1', 'L2', 'L3', 'W1', 'W2', 'W3', 'Extra'],
        ['John', 'Doe', 'L1', 'L2', 'L3', 'W1', 'W2', 'W3', 'Extra']
      ];

      const handler = new DataErrorHandler(brokenCampData);

      // Run evaluations down through the instance targets
      expect(handler.notEnoughKids()).toBe(true);
      expect(handler.tooManyKids()).toBe(false);
      expect(handler.numOfFields()).toBe(true);
      expect(handler.wrongActivity()).toBe(true);
      expect(handler.duplicateChoice()).toBe(true);
      expect(handler.duplicateName()).toBe(true);

      // Force compilation execution down through lines 179-223 packaging blocks
      const processedErrors = handler.getErrorList();

      // Structural integrity validations
      expect(processedErrors.length).toBeGreaterThan(0);

      // Ensure specific sub-headers compiled and ran successfully
      const headers = processedErrors.map(e => e.header);
      expect(headers).toContain('THERE ARE NOT ENOUGH KIDS SCHEDULED FOR THE CAMP');
      expect(headers).toContain('THE FOLLOWING ROWS HAVE TOO FEW OR TOO MANY COLUMNS');
      expect(headers).toContain('THE FOLLOWING FIELDS CONTAIN INCORRECT ACTIVITY NAMES');
      expect(headers).toContain('THE FOLLOWING KIDS HAVE CHOSEN THE SAME ACTIVITY TWICE');
      expect(headers).toContain('THE FOLLOWING KIDS HAVE THE SAME NAME');
    });

    test('Exercises the upper boundary condition constraint loop', () => {
      // Generate an oversized array containing 150 dummy records to force lines 93-98 coverage
      const oversizedData = Array.from({ length: 150 }, () => [
        'First', 'Last', 'L1', 'L2', 'L3', 'W1', 'W2', 'W3', 'Extra'
      ]);

      const handler = new DataErrorHandler(oversizedData);
      expect(handler.tooManyKids()).toBe(true);

      const errors = handler.getErrorList();
      expect(errors[0].header).toBe('THERE ARE TOO MANY KIDS SCHEDULED FOR THE CAMP');
    });
  });
});
