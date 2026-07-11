import * as Excel from 'exceljs';
import { CellValue } from 'exceljs';
import { findKidsColumnIndices, hasAllKidsColumns, KidsColumnIndices } from './kidsColumnMapper';
import { normalizeActivityName } from './activityAliases';

/**
 * Finds the worksheet that actually contains the kids' activity choice data,
 * regardless of what it's named. A workbook may contain many unrelated
 * sheets (bus lists, no-show lists, per-county staging sheets, etc.), and
 * the client isn't always consistent about naming the sheet we want. The one
 * constant is the header row, so we scan each sheet's first row and pick the
 * first one where every required column (first name, last name, L1-L3,
 * W1-W3) is found.
 *
 * Falls back to the first worksheet if none match, which also covers the
 * original single-sheet workbook format.
 */
function findCampersWorksheet(
  workbook: Excel.Workbook
): { worksheet: Excel.Worksheet; indices: KidsColumnIndices } {
  for (const sheet of workbook.worksheets) {
    const headerValues = sheet.getRow(1).values as CellValue[];
    const indices = findKidsColumnIndices(headerValues);
    if (hasAllKidsColumns(indices)) {
      return { worksheet: sheet, indices };
    }
  }

  const worksheet = workbook.worksheets[0];
  const indices = findKidsColumnIndices(worksheet.getRow(1).values as CellValue[]);
  return { worksheet, indices };
}

/**
 * Extracts the kids' names and activity choices from the Excel file.
 * @param {string} filePath - file dialog path to the Excel file user selected.
 * @returns {Promise<string[][]>} A promise that resolves to a 2D array of strings representing the kids' activity choices.
 */
export default async function extractKidsChoicesData(filePath: string): Promise<string[][]> {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(filePath);

    const { worksheet, indices } = findCampersWorksheet(workbook);
    const {
      firstNameCol,
      lastNameCol,
      landActivity1Col,
      landActivity2Col,
      landActivity3Col,
      waterActivity1Col,
      waterActivity2Col,
      waterActivity3Col,
    } = indices;

    const activityData: string[][] = [];
    let firstName = '';
    let lastName = '';
    let landActivity1 = '';
    let landActivity2 = '';
    let landActivity3 = '';
    let waterActivity1 = '';
    let waterActivity2 = '';
    let waterActivity3 = '';
    worksheet.eachRow({ includeEmpty: false }, function (row) {
      const firstNameCell = row.getCell( firstNameCol );
      if (firstNameCell.type === Excel.ValueType.String) {
        firstName = firstNameCell.value as string;
      }
      const lastNameCell = row.getCell( lastNameCol );
      if (lastNameCell.type === Excel.ValueType.String) {
        lastName = lastNameCell.value as string;
      }
      const landActivity1Cell = row.getCell( landActivity1Col );
      if (landActivity1Cell.type === Excel.ValueType.String) {
        const landActivity = landActivity1Cell.value as string;
        landActivity1 = normalizeActivityName(landActivity)
      }
      const landActivity2Cell = row.getCell( landActivity2Col );
      if (landActivity2Cell.type === Excel.ValueType.String) {
        const landActivity = landActivity2Cell.value as string;
        landActivity2 = normalizeActivityName(landActivity)
      }
      const landActivity3Cell = row.getCell( landActivity3Col );
      if (landActivity3Cell.type === Excel.ValueType.String) {
        const landActivity = landActivity3Cell.value as string;
        landActivity3 = normalizeActivityName(landActivity)
      }
      const waterActivity1Cell = row.getCell( waterActivity1Col );
      if (waterActivity1Cell.type === Excel.ValueType.String) {
        const waterActivity = waterActivity1Cell.value as string;
        waterActivity1 = normalizeActivityName(waterActivity)
      }
      const waterActivity2Cell = row.getCell( waterActivity2Col );
      if (waterActivity2Cell.type === Excel.ValueType.String) {
        const waterActivity = waterActivity2Cell.value as string;
        waterActivity2 = normalizeActivityName(waterActivity)
      }
      const waterActivity3Cell = row.getCell( waterActivity3Col );
      if (waterActivity3Cell.type === Excel.ValueType.String) {
        const waterActivity = waterActivity3Cell.value as string;
        waterActivity3 = normalizeActivityName(waterActivity)
      }
      activityData.push([firstName, lastName, landActivity1, landActivity2, landActivity3, waterActivity1, waterActivity2, waterActivity3]);
    });

    const activityDataWithoutHeader = activityData.slice(1);
    return activityDataWithoutHeader;
}
