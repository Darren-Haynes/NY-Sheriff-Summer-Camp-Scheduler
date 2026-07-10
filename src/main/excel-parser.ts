import * as Excel from 'exceljs';
import { CellValue } from 'exceljs';
import { findKidsColumnIndices } from './kidsColumnMapper';


/**
 * Extracts the kids' names and activity choices from the Excel file.
 * @param {string} filePath - file dialog path to the Excel file user selected.
 * @returns {Promise<string[][]>} A promise that resolves to a 2D array of strings representing the kids' activity choices.
 */
export default async function extractKidsChoicesData(filePath: string): Promise<string[][]> {
    let workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(filePath);
    let worksheet = workbook.worksheets[0];
    const sheetCount = workbook.worksheets.length;
    if (worksheet !== undefined && sheetCount > 1) {
      const targetSheet = workbook.worksheets.find(ws => ws.name.toLowerCase().includes('campers'));
      if (targetSheet) {
        const worksheet = workbook.getWorksheet(targetSheet.name);
      }
    }
    const row = worksheet.getRow(1);
    const values = row.values as CellValue[];
    const {
      firstNameCol,
      lastNameCol,
      landActivity1Col,
      landActivity2Col,
      landActivity3Col,
      waterActivity1Col,
      waterActivity2Col,
      waterActivity3Col,
    } = findKidsColumnIndices(values);

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
        landActivity1 = landActivity.toLowerCase();
      }
      const landActivity2Cell = row.getCell( landActivity2Col );
      if (landActivity2Cell.type === Excel.ValueType.String) {
        const landActivity = landActivity2Cell.value as string;
        landActivity2 = landActivity.toLowerCase();
      }
      const landActivity3Cell = row.getCell( landActivity3Col );
      if (landActivity3Cell.type === Excel.ValueType.String) {
        const landActivity = landActivity3Cell.value as string;
        landActivity3 = landActivity.toLowerCase();
      }
      const waterActivity1Cell = row.getCell( waterActivity1Col );
      if (waterActivity1Cell.type === Excel.ValueType.String) {
        const waterActivity = waterActivity1Cell.value as string;
        waterActivity1 = waterActivity.toLowerCase();
      }
      const waterActivity2Cell = row.getCell( waterActivity2Col );
      if (waterActivity2Cell.type === Excel.ValueType.String) {
        const waterActivity = waterActivity2Cell.value as string;
        waterActivity2 = waterActivity.toLowerCase();
      }
      const waterActivity3Cell = row.getCell( waterActivity3Col );
      if (waterActivity3Cell.type === Excel.ValueType.String) {
        const waterActivity = waterActivity3Cell.value as string;
        waterActivity3 = waterActivity.toLowerCase();
      }
      activityData.push([firstName, lastName, landActivity1, landActivity2, landActivity3, waterActivity1, waterActivity2, waterActivity3]);
    });

    const activityDataWithoutHeader = activityData.slice(1);
    return activityDataWithoutHeader;
}
