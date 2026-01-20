import { landActs, waterActs } from './activities';

/**
Camp class contains the core data for running the NY Sherrif's Summer Camp
*/
export default class Camp {
  inputData: string;
  inputDataArr: Array<string>;
  col: Array<string>;
  landActs: Array<string>;
  waterActs: Array<string>;
  kids: Map<
    string,
    {
      choices: {
        land1: string;
        land2: string;
        land3: string;
        water1: string;
        water2: string;
        water3: string;
      };
      timeSlots: {
        land9am: boolean | null;
        nineAM: string | null;
        tenAM: string | null;
      };
    }
  >;

  /**
   *
   * @param inputData a string of all the Kids choices
   */
  constructor(inputData: string) {
    this.inputData = inputData;
    this.kids = new Map();
    this.createKidsMap();
    this.landActs = landActs;
    this.waterActs = waterActs;
  }

  /**
   * Create a map of kids and their choices and time slots
   * @returns void
   */
  private createKidsMap(): void {
    const inputDataArr = this.inputData.split('\n');
    inputDataArr.pop(); // remove last empty line
    inputDataArr.forEach((line: string) => {
      const col = line.split('\t');
      const name = col[0] + ' ' + col[1];
      this.kids.set(name, {
        choices: {
          land1: col[3],
          land2: col[4],
          land3: col[5],
          water1: col[6],
          water2: col[7],
          water3: col[8],
        },
        timeSlots: {
          land9am: null,
          nineAM: null,
          tenAM: null,
        },
      });
    });
    return;
  }
}
