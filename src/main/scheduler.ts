/**
Wrapper for map that stores all kids attending and their prefered activites.
*/
class Kid {
  kidsMap: Map<
    string,
    {
      land1: string;
      land2: string;
      land3: string;
      water1: string;
      water2: string;
      water3: string;
    }
  >;
  constructor() {
    this.kidsMap = new Map();
  }
}

/**
Main class that schedules the kids to activities.
*/
export class Scheduler {
  inputData: string;
  inputDataArr: Array<string>;
  kids: Kid;
  col: Array<string>;

  constructor(inputData: string) {
    this.inputData = inputData;
    this.kids = new Kid();
  }

  public parseData(): void {
    const inputDataArr = this.inputData.split('\n');
    inputDataArr.pop(); // remove last empty line
    inputDataArr.forEach((line: string) => {
      const col = line.split('\t');
      const name = col[0] + ' ' + col[1];
      this.kids.kidsMap.set(name, {
        land1: col[3],
        land2: col[4],
        land3: col[5],
        water1: col[6],
        water2: col[7],
        water3: col[8],
      });
    });
  }
}
