import { Activities } from './activities';
import { KidsDataType, ErrorData } from '../types/dataInput-types';

// `campData` rows are always normalized (by excel-parser.ts / text-parser.ts,
// regardless of the source spreadsheet's actual layout) to:
// [firstName, lastName, land1, land2, land3, water1, water2, water3].
// These positions are therefore stable across both spreadsheet formats the
// app supports, unlike the source spreadsheet's own column numbers, which
// differ between formats and shouldn't be hardcoded/reported to the user.
const ACTIVITIES_START_COL = 2;
const ACTIVITIES_END_COL = 8;
const ACTIVITY_COLUMNS: { index: number; label: string; acts: string[] }[] = [
  { index: 2, label: 'L1', acts: Activities.landActs },
  { index: 3, label: 'L2', acts: Activities.landActs },
  { index: 4, label: 'L3', acts: Activities.landActs },
  { index: 5, label: 'W1', acts: Activities.waterActs },
  { index: 6, label: 'W2', acts: Activities.waterActs },
  { index: 7, label: 'W3', acts: Activities.waterActs },
];

export class KidsChoices {
  campData: string[][];
  kidsMap: Map<string, KidsDataType>;

  constructor(data: string[][]) {
    this.campData = data;
    this.kidsMap = new Map();
    this.createKidsMap();
  }

  createKidsMap(): void {
    this.campData.forEach(line => {
      const kidData: KidsDataType = {
        land1: line[2],
        land2: line[3],
        land3: line[4],
        water1: line[5],
        water2: line[6],
        water3: line[7],
      };
      this.kidsMap.set(line[1] + ' ' + line[0], kidData);
    });
  }
}

export class DataErrorHandler {
  /**
   * This class checks for errors in the user's inputted data.
   * Misformatted data will cause bugs and troubles.
   */
  numOfFieldsError: string[];
  fieldsErrorHeader: string;
  activityError: string[];
  activityErrorHeader: string;
  duplicateChoiceError: string[];
  duplicateChoiceErrorHeader: string;
  duplicateNameError: string[];
  duplicateNameErrorHeader: string;
  notEnoughKidsError: string[];
  notEnoughKidsHeader: string;
  tooManyKidsError: string[];
  tooManyKidsHeader: string;
  campData: string[][];

  constructor(data: string[][]) {
    this.campData = data;
    this.numOfFieldsError = [];
    this.fieldsErrorHeader = `The Following rows have too few or too many columns`;
    this.activityError = [];
    this.activityErrorHeader = `The Following Fields Contain Incorrect Activity Names`;
    this.duplicateChoiceError = [];
    this.duplicateChoiceErrorHeader = `The Following kids have chosen the same activity twice`;
    this.duplicateNameError = [];
    this.duplicateNameErrorHeader = `The Following kids have the same name`;
    this.notEnoughKidsError = [];
    this.notEnoughKidsHeader = `There are not enough kids scheduled for the camp`;
    this.tooManyKidsError = [];
    this.tooManyKidsHeader = `There are too many kids scheduled for the camp`;
  }

  notEnoughKids(): boolean {
    if (this.campData.length < 50) {
      this.notEnoughKidsError.push(
        `The number of kids scheduled for camp is ${this.campData.length}, but 50 or more are required`
      );
    }
    return this.notEnoughKidsError.length !== 0;
  }

  tooManyKids(): boolean {
    if (this.campData.length > 146) {
      this.tooManyKidsError.push(
        `The number of kids scheduled for camp is ${this.campData.length}, but 146 or less are required`
      );
    }
    return this.tooManyKidsError.length !== 0;
  }

  numOfFields(): boolean {
    /**
     * All rows in user data should be of length 9.
     */
    for (let i = 0; i < this.campData.length; i++) {
      //TODO: Add info to user which cells are in excess of 9 in a row
      if (this.campData[i].length != 9) {
        let s = JSON.stringify(this.campData[i]);
        s = this.campData[i].join(',').replace(/[[]?null/g, 'Empty Cell');
        this.numOfFieldsError.push(`Line ${i + 1}: ${s}`);
      }
    }
    return this.numOfFieldsError.length !== 0;
  }

  #wrongActivity(acts: string[], rowNum: number, index: number, label: string, row: any): void {
    // campData never includes a header row (excel-parser.ts and
    // text-parser.ts both strip it before this class ever sees the data),
    // so the displayed row number is always just rowNum + 1.
    const rowNumOffset: number = rowNum + 2;
    if (!row[index]) {
      const errorMsg = `Row ${rowNumOffset}; column ${label} -- NO SPORT EMPTY CELL`;
      this.activityError.push(errorMsg);
    } else if (!acts.includes(row[index].toLowerCase())) {
      const errorMsg = `Row ${rowNumOffset}; column ${label} -- ${row[index]}`;
      this.activityError.push(errorMsg);
    }
  }

  wrongActivity(): boolean {
    /**
     *Check that activity shortnames in user data are correct.
     */
    this.campData.forEach((row, rowNum) => {
      ACTIVITY_COLUMNS.forEach(({ index, label, acts }) => {
        this.#wrongActivity(acts, rowNum, index, label, row);
      });
    });
    return this.activityError.length !== 0;
  }

  duplicateChoice(): boolean {
    /**
     * Check that no activity is chosen more than once.
     */
    this.campData.forEach((row, rowNum) => {
      const choices = row.slice(ACTIVITIES_START_COL, ACTIVITIES_END_COL);
      const uniqueChoices = new Set(choices);
      if (choices.length !== uniqueChoices.size) {
        const errorMsg = `Row ${rowNum + 1}; duplicate choice - ${choices.join(', ')}`;
        this.duplicateChoiceError.push(errorMsg);
      }
    });
    return this.duplicateChoiceError.length !== 0;
  }

  /**
   * Check that there are no duplicate kids names.
   */
  duplicateName(): boolean {
    const nameMap = new Map();
    this.campData.forEach((row, rowNum) => {
      const name = row[0].trim() + row[1].trim();
      if (nameMap.has(name)) {
        const errorMsg1 = `Row ${rowNum + 2}; duplicate name - ${row[0].trim()} ${row[1].trim()}`;
        const errorMsg2 = `Row ${nameMap.get(name) + 2}; duplicate name - ${row[0].trim()} ${row[1].trim()}`;
        this.duplicateNameError.push(errorMsg2);
        this.duplicateNameError.push(errorMsg1);
      }
      nameMap.set(name, rowNum);
    });
    return this.duplicateNameError.length !== 0;
  }

  getErrorList(): ErrorData[] {
    /**
     * Return list of all errors found. Each list item is an object that contains
     * a header that describes the type of error and then an enumerated list of
     * all errors found for that category of error.
     */
    const errorList: ErrorData[] = [];

    if (this.notEnoughKidsError.length !== 0) {
      const notEnoughKidsObj: ErrorData = {
        header: this.notEnoughKidsHeader.toUpperCase(),
        errorList: this.notEnoughKidsError,
      };
      errorList.push(notEnoughKidsObj);
    }
    if (this.tooManyKidsError.length !== 0) {
      const tooManyKidsObj: ErrorData = {
        header: this.tooManyKidsHeader.toUpperCase(),
        errorList: this.tooManyKidsError,
      };
      errorList.push(tooManyKidsObj);
    }
    if (this.numOfFieldsError.length !== 0) {
      const fieldsObj: ErrorData = {
        header: this.fieldsErrorHeader.toUpperCase(),
        errorList: this.numOfFieldsError,
      };
      errorList.push(fieldsObj);
    }
    if (this.activityError.length !== 0) {
      const activityObj: ErrorData = {
        header: this.activityErrorHeader.toUpperCase(),
        errorList: this.activityError,
      };
      errorList.push(activityObj);
    }
    if (this.duplicateChoiceError.length !== 0) {
      const duplicateChoiceObj: ErrorData = {
        header: this.duplicateChoiceErrorHeader.toUpperCase(),
        errorList: this.duplicateChoiceError,
      };
      errorList.push(duplicateChoiceObj);
    }
    if (this.duplicateNameError.length !== 0) {
      const duplicateNameObj: ErrorData = {
        header: this.duplicateNameErrorHeader.toUpperCase(),
        errorList: this.duplicateNameError,
      };
      errorList.push(duplicateNameObj);
    }
    return errorList;
  }
}
