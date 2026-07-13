export interface KidsColumnIndices {
  firstNameCol: number;
  lastNameCol: number;
  landActivity1Col: number;
  landActivity2Col: number;
  landActivity3Col: number;
  waterActivity1Col: number;
  waterActivity2Col: number;
  waterActivity3Col: number;
}

export const UNSET_COLUMN = -1;

/**
 * Scans a header row and finds the column index for each field needed to
 * build a kid's activity choices, matched by keyword rather than fixed
 * position. This lets the same detection logic work regardless of column
 * order, and is shared between the Excel file parser (`excel-parser.ts`,
 * where `headerCells` is ExcelJS's 1-indexed `row.values`) and the pasted
 * text parser (`text-parser.ts`, where `headerCells` is a plain 0-indexed
 * array from splitting a line on tabs). The returned indices simply mirror
 * whichever indexing convention `headerCells` used.
 */
export function findKidsColumnIndices(headerCells: unknown[]): KidsColumnIndices {
  const indices: KidsColumnIndices = {
    firstNameCol: UNSET_COLUMN,
    lastNameCol: UNSET_COLUMN,
    landActivity1Col: UNSET_COLUMN,
    landActivity2Col: UNSET_COLUMN,
    landActivity3Col: UNSET_COLUMN,
    waterActivity1Col: UNSET_COLUMN,
    waterActivity2Col: UNSET_COLUMN,
    waterActivity3Col: UNSET_COLUMN,
  };

  headerCells.forEach((cell, i) => {
    if (typeof cell !== 'string') {
      return;
    }
    const cellContent = cell.toLowerCase();
    // Since client worksheet uploads are not always perfect, add a check for
    // "first" and "last" as well, since sometimes the word "name" is omitted.
    if (cellContent.includes('first name') || cellContent.includes('first')) {
      indices.firstNameCol = i;
    } else if (cellContent.includes('last name') || cellContent.includes('last')) {
      indices.lastNameCol = i;
    } else if (cellContent.includes('l1')) {
      indices.landActivity1Col = i;
    } else if (cellContent.includes('l2')) {
      indices.landActivity2Col = i;
    } else if (cellContent.includes('l3')) {
      indices.landActivity3Col = i;
    } else if (cellContent.includes('w1')) {
      indices.waterActivity1Col = i;
    } else if (cellContent.includes('w2')) {
      indices.waterActivity2Col = i;
    } else if (cellContent.includes('w3')) {
      indices.waterActivity3Col = i;
    }
  });

  return indices;
}

/**
 * Returns true only if every field in `indices` was matched to a column.
 * Used to detect whether a row is actually a recognizable header row.
 */
export function hasAllKidsColumns(indices: KidsColumnIndices): boolean {
  return Object.values(indices).every(value => value !== UNSET_COLUMN);
}
