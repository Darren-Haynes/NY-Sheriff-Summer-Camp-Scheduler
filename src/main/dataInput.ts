import { landActs, waterActs } from './activityNames';
// Parse data inputted by user, and check input for errors.

interface kidsMap {
    land1: string;
    land2: string;
    land3: string;
    water1: string;
    water2: string;
    water3: string;
}

interface kidsDataType {
    land1: string;
    land2: string;
    land3: string;
    water1: string;
    water2: string;
    water3: string;
}

interface errorData {
    header: string;
    errorList: string[]
}

export class KidsChoices {
    campData: string[][];
    kidsMap: Map<string, kidsMap>;
    headerRow: boolean;

    constructor(data: string[][], header: boolean) {
        this.campData = data;
        this.kidsMap = new Map();
        this.headerRow = header;
        this.createKidsMap();
    }

    createKidsMap(): void {
        this.campData.forEach(line => {
            const kidData: kidsDataType = {
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
    campData: string[][];
    headerRow: boolean;

    constructor(data: string[][], header: boolean) {
        this.headerRow = header;
        this.campData = data;
        this.numOfFieldsError = [];
        this.fieldsErrorHeader = `The Following rows have too few or too many columns`
        this.activityError = [];
        this.activityErrorHeader = `The Following Fields Contain Incorrect Activity Names`
    }

    numOfFields(): boolean {
        /**
         * All rows in user data should be of length 9.
         */
        for (let i = 0; i < this.campData.length; i++) {
            if (this.campData[i].length != 9) {
                this.numOfFieldsError.push(`Line ${i + 2}: ${this.campData[i]}`);
            }
        }
        return this.numOfFieldsError.length !== 0;
    }

    #wrongActivity(acts: string[], rowNum: number, i: number, row: any): void {
        const rowNumOffset: number = this.headerRow ? rowNum + 2 : rowNum + 1;
        if (!row[i]) {
            const errorMsg = `Row ${rowNumOffset}; column ${i} -- NO SPORT EMPTY CELL`;
            this.activityError.push(errorMsg);
        }
        else if (!acts.includes(row[i].toLowerCase())) {
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
            for (let i = 3; i < 6; i++) {
                this.#wrongActivity(landActs, rowNum, i, row);
            }
            // Then check for incorrect water activities
            for (let i = 6; i < 9; i++) {
                this.#wrongActivity(waterActs, rowNum, i, row);
            }
        });
        return this.activityError.length !== 0;
    }
    getErrorList(): errorData[] {
        /**
         * Return list of all errors found. Each list item is an object that contains
         * a header that describes the type of error and then an enumerated list of
         * all errors found for that category of error.
         */
        const errorList: errorData[] = []
        if (this.numOfFieldsError.length !== 0) {
            const fieldsObj: errorData = {
                header: this.fieldsErrorHeader,
                errorList: this.numOfFieldsError
            }
            errorList.push(fieldsObj)
        }
        if (this.activityError.length !== 0) {
            const activityObj: errorData = {
                header: this.activityErrorHeader,
                errorList: this.activityError
            }
            errorList.push(activityObj)
        }
        return errorList
    }
}

export function dataParser(data: string) {
    let header = false;
    const lines: string[] = data.split('\n');
    if (lines[0].includes('Last Name')) {
        lines.shift();
        header = true;
    }
    lines.pop(); // last line is an empty string we don't want
    const parsedData = lines.map(line => line.split(/\t/));
    return {
        campData: parsedData,
        headerRow: header,
    };
}
