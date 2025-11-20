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
    /*
        This class checks for errors in the user's inputted data.
        Misformatted data will cause bugs and troubles.
        */
    numOfFieldsError: string[];
    campData: string[][];
    headerRow: boolean;

    constructor(data: string[][], header: boolean) {
        this.headerRow = header;
        this.campData = data;
        this.numOfFieldsError = []
    }

    numOfFields(): boolean {
        // User Data should only have 9 columns
        for (let i = 0; i < this.campData.length; i++) {
            if (this.campData[i].length != 9) {
                this.numOfFieldsError.push(`Line ${i + 2}: ${this.campData[i]}`);
            }
        }
        return this.numOfFieldsError.length !== 0;
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
