import {
  findKidsColumnIndices,
  hasAllKidsColumns,
  KidsColumnIndices,
} from './kidsColumnMapper';

// Original single-sheet spreadsheet's column order when pasted with no
// header row: Last Name, First Name, Grade (unused), L1, L2, L3, W1, W2, W3.
const LEGACY_COLUMN_INDICES: KidsColumnIndices = {
  lastNameCol: 0,
  firstNameCol: 1,
  landActivity1Col: 3,
  landActivity2Col: 4,
  landActivity3Col: 5,
  waterActivity1Col: 6,
  waterActivity2Col: 7,
  waterActivity3Col: 8,
};

/**
 * Parses text pasted into the paste box textarea into the same normalized
 * 8-column shape produced by `extractKidsChoicesData` in `excel-parser.ts`:
 * [firstName, lastName, land1, land2, land3, water1, water2, water3]
 *
 * Supports two layouts:
 *  - New format: a header row naming the relevant columns (using the same
 *    header keywords as the Excel parser -- "first name", "last name",
 *    "l1"..."w3"), so columns can appear in any order.
 *  - Legacy format: no header row, columns in the original fixed
 *    Last Name/First Name/Grade/L1-L3/W1-W3 order.
 *
 * @param {string} text - raw tab-separated, newline-delimited text from the paste box.
 * @returns {string[][]} A 2D array of strings representing the kids' activity choices.
 */
export default function parsePastedText(text: string): string[][] {
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.trimEnd())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const rows = lines.map(line => line.split('\t'));

  const headerIndices = findKidsColumnIndices(rows[0]);
  const usingHeader = hasAllKidsColumns(headerIndices);
  const indices = usingHeader ? headerIndices : LEGACY_COLUMN_INDICES;
  const dataRows = usingHeader ? rows.slice(1) : rows;

  return dataRows.map(row => [
    row[indices.firstNameCol] ?? '',
    row[indices.lastNameCol] ?? '',
    (row[indices.landActivity1Col] ?? '').toLowerCase(),
    (row[indices.landActivity2Col] ?? '').toLowerCase(),
    (row[indices.landActivity3Col] ?? '').toLowerCase(),
    (row[indices.waterActivity1Col] ?? '').toLowerCase(),
    (row[indices.waterActivity2Col] ?? '').toLowerCase(),
    (row[indices.waterActivity3Col] ?? '').toLowerCase(),
  ]);
}
