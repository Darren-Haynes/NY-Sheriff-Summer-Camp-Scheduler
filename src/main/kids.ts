import { KidsData } from '../types/kids-types';

/**
Kids class contains the key data for each of the kids in the camp
*/
export class Kids {
  inputData: string;
  inputDataArr: Array<string>;
  col: Array<string>;
  names: Array<string>;
  data: KidsData;

  /**
   *
   * @param inputData a string of all the Kids choices
   */
  constructor(inputData: string) {
    this.data = new Map();
    this.inputData = inputData;
    this.createKidsMap();
    this.names = Array.from(this.data.keys());
  }

  /**
   * Create a map of kids and their choices and time slots
   * @returns void
   */
  private createKidsMap(): void {
    const inputDataArr = this.inputData.split('\n');
    inputDataArr.pop(); // remove last empty line
    inputDataArr.shift(); // remove spreadsheet header
    inputDataArr.forEach((line: string) => {
      const col = line.split('\t');
      const name = col[0] + ' ' + col[1];
      this.data.set(name, {
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

  private countChoices(): void {
    this.data.forEach(kid => {
      const choices = kid.choices;
      const timeSlots = kid.timeSlots;
      const landChoices = [choices.land1, choices.land2, choices.land3];
      const waterChoices = [choices.water1, choices.water2, choices.water3];
      const landCounts = landChoices.reduce((acc, choice) => {
        if (choice === 'Y') return acc + 1;
        return acc;
      }, 0);
      const waterCounts = waterChoices.reduce((acc, choice) => {
        if (choice === 'Y') return acc + 1;
        return acc;
      }, 0);
      timeSlots.nineAM = landCounts > 0 ? 'Y' : 'N';
      timeSlots.tenAM = waterCounts > 0 ? 'Y' : 'N';
    });
  }
}
