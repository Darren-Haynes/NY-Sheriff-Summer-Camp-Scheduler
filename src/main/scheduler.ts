class Scheduler {
    mainData: string
    constructor() {
        this.mainData = this.parseData()
    }

    parseData(): string {
        console.log('test log')
        return 'test'
    }
}

const scheduler = new Scheduler()
