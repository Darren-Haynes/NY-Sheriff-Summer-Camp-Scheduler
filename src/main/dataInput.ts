// Parse data inputted by user, and check input for errors.

interface DataInput {
    dataString: string;
    isPasteBox: boolean;
}

export default class DataInputHandler implements DataInput {
    dataString: string;
    isPasteBox: boolean;
    constructor(dataString: string, isPasteBox: boolean) {
        this.dataString = dataString;
        this.isPasteBox = isPasteBox;
    }

    printMessage(): void { console.log("Message is here") }
}
