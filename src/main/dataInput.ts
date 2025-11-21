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
    activityError: string[];
    campData: string[][];
    headerRow: boolean;

    constructor(data: string[][], header: boolean) {
        this.headerRow = header;
        this.campData = data;
        this.numOfFieldsError = [];
        this.activityError = [];
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
        if (!acts.includes(row[i].toLowerCase())) {
            const rowNumOffset: number = this.headerRow ? rowNum + 2 : rowNum + 1;
            const errorMsg = `Row ${rowNumOffset}; column ${i} -- ${row[i]}`;
            this.activityError.push(errorMsg);
        }
        console.log(this.activityError);
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
