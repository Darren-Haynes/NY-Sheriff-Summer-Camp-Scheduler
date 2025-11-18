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
    land1: string
    land2: string
    land3: string
    water1: string
    water2: string
    water3: string
}

export default class DataInputHandler {
    dataString: string;
    kidsMap: Map<string, kidsMap>

    constructor(dataString: string) {
        this.dataString = dataString;
        this.kidsMap = new Map();
        this.createKidsMap()
    }

    createKidsMap(): void {
        const lines: string[] = this.dataString.split('\n')
        if (lines[0].includes('Last Name')) { lines.shift() }
        lines.forEach(line => {
            const entries = line.split(/\s+/);
            const kidData: kidsDataType = { land1: entries[3], land2: entries[4], land3: entries[5], water1: entries[6], water2: entries[7], water3: entries[8] }
            this.kidsMap.set(entries[1] + " " + entries[0], kidData)
        })
    }
}
