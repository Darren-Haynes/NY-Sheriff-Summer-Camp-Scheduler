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

export default class DataInputHandler {
    dataString: string;
    kidsMap: Map<string, kidsMap>;
    errHandler: DataErrorHandler;
    headerRow: boolean

    constructor(dataString: string) {
        this.dataString = dataString;
        this.kidsMap = new Map();
        this.errHandler = new DataErrorHandler
        this.headerRow = false;
        this.createKidsMap();
    }

    createKidsMap(): void {
        const lines: string[] = this.dataString.split('\n');
        if (lines[0].includes('Last Name')) {
            lines.shift();
            this.headerRow = true
        }
        lines.pop() // last line is an empty string we don't want
        const campData = lines.map(line => line.split(/\t/))
        const errorFree = this.errHandler.numOfFields(campData, this.headerRow)
        campData.forEach(line => {
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

class DataErrorHandler {
    /*
    This class checks for errors in the user's inputted data.
    Misformatted data will cause bugs and troubles.
    */
    errMessages: string[];

    constructor() {
        this.errMessages = []
    }

    numOfFields(campData: string[][], headerRow: boolean): boolean {
        // User Data should only have 9 columns
        let i: number;
        headerRow ? i = 0 : i = 1;
        for (i; i < campData.length; i++) {
            if (campData[i].length != 9) { this.errMessages.push("Line ${i}: ${campData[i]}") }
        }
        return (this.errMessages.length === 0)
    }
}
