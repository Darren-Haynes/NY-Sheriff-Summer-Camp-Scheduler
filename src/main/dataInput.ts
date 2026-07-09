import { Activities } from './activities';
import { KidsDataType, ErrorData } from '../types/dataInput-types';

export class KidsChoices {
  campData: string[][];
  kidsMap: Map<string, KidsDataType>;
  headerRow: boolean;

  constructor(data: string[][], header: boolean) {
    this.campData = data;
    this.kidsMap = new Map();
    this.headerRow = header;
    this.createKidsMap();
  }

  createKidsMap(): void {
    this.campData.forEach(line => {
      const kidData: KidsDataType = {
        land1: line[3],
        land2: line[4],
        land3: line[5],
        water1: line[6],
        water2: line[7],
        water3: line[8],
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
  headerRow: boolean;

  constructor(data: string[][], header: boolean) {
    this.headerRow = header;
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
        this.numOfFieldsError.push(`Line ${i + 2}: ${s}`);
      }
    }
    return this.numOfFieldsError.length !== 0;
  }

  #wrongActivity(acts: string[], rowNum: number, i: number, row: any): void {
    const rowNumOffset: number = this.headerRow ? rowNum + 2 : rowNum + 1;
    if (!row[i]) {
      const errorMsg = `Row ${rowNumOffset}; column ${i} -- NO SPORT EMPTY CELL`;
      this.activityError.push(errorMsg);
    } else if (!acts.includes(row[i].toLowerCase())) {
      const errorMsg = `Row ${rowNumOffset}; column ${i} -- ${row[i]}`;
      this.activityError.push(errorMsg);
    }
  }

  wrongActivity(): boolean {
    /**
     *Check that activity shortnames in user data are correct.
     */
    this.campData.forEach((row, rowNum) => {
      // First check for incorrect land activities
      for (let i = 2; i < 5; i++) {
        this.#wrongActivity(Activities.landActs, rowNum, i, row);
      }
      // Then check for incorrect water activities
      for (let i = 5; i < 8; i++) {
        this.#wrongActivity(Activities.waterActs, rowNum, i, row);
      }
    });
    return this.activityError.length !== 0;
  }

  duplicateChoice(): boolean {
    /**
     * Check that no activity is chosen more than once.
     */
    this.campData.forEach((row, rowNum) => {
      const choices = row.slice(3, 9);
      const uniqueChoices = new Set(choices);
      if (choices.length !== uniqueChoices.size) {
        const errorMsg = `Row ${rowNum + 2}; duplicate choice - ${choices.join(', ')}`;
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

// export function dataParser(data: string) {
//   let header = false;
//   const trimTrailing = data.replace(/[ \t\f\v]+$/g, '');
//   const lines: string[] = trimTrailing.split('\n');
//   if (lines[0].toLowerCase().includes('last name')) {
//     lines.shift();
//     header = true;
//   }
//   lines.pop(); // last line is an empty string we don't want
//   const parsedData = lines.map(line => line.split(/\t/));
//   return {
//     campData: parsedData,
//     headerRow: header,
//   };
// }
