import { KidsData, WaterActivityCounts, LandActivityCounts } from '../types/kids-types';

/**
Kids class contains the key data for each of the kids in the camp
*/
export class Kids {
  inputData: string;
  inputDataArr: Array<string>;
  col: Array<string>;
  names: Array<string>;
  data: KidsData;
  totalKidsCount: number;
  waterActivitiesChoiceCount: WaterActivityCounts;
  landActivitiesChoiceCount: LandActivityCounts;

  /**
   *
   * @param inputData a string of all the Kids choices
   */
  constructor(inputData: string) {
    this.data = new Map();
    this.inputData = inputData;
    this.totalKidsCount = 0;
    this.createKidsData();
    this.names = Array.from(this.data.keys());
    this.waterActivitiesChoiceCount = {
      swim: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      fish: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      canoe: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      snork: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      sail: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      pboard: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      kayak: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    };
    this.landActivitiesChoiceCount = {
      bball: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      vball: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      soc: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      arch: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      art: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      hike: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      cheer: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      pball: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      lax: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      fball: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      yoga: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
      fris: { total: 0, choice1: 0, choice2: 0, choice3: 0 },
    };
    this.countChoices();
  }

  /**
   * Create a map of kids and their choices and time slots
   * @returns void
   */
  private createKidsData(): void {
    const inputDataArr = this.inputData.split('\n');
    inputDataArr.pop(); // remove last empty line
    inputDataArr.shift(); // remove spreadsheet header
    inputDataArr.forEach((line: string) => {
      const col = line.split('\t');
      const name = col[0] + ' ' + col[1];
      this.data.set(name, {
        choices: {
          land1: col[3].toLowerCase(),
          land2: col[4].toLowerCase(),
          land3: col[5].toLowerCase(),
          water1: col[6].toLowerCase(),
          water2: col[7].toLowerCase(),
          water3: col[8].toLowerCase(),
        },
        // TODO: timeSlot are not used, update and use or get rid off them
        timeSlots: {
          land9am: null,
          land10am: null,
          water9am: null,
          water10am: null,
        },
      });
    });
    this.totalKidsCount = inputDataArr.length;
    return;
  }

  private countChoices(): void {
    this.data.forEach(kid => {
      const choices = kid.choices;
      const landChoices = [choices.land1, choices.land2, choices.land3];
      const waterChoices = [choices.water1, choices.water2, choices.water3];
      for (let i = 1; i <= landChoices.length; i++) {
        const choice = landChoices[i - 1];
        this.landActivitiesChoiceCount[choice].total++;
        switch (i) {
          case 1:
            this.landActivitiesChoiceCount[choice].choice1++;
            break;
          case 2:
            this.landActivitiesChoiceCount[choice].choice2++;
            break;
          case 3:
            this.landActivitiesChoiceCount[choice].choice3++;
            break;
        }
      }
      for (let i = 1; i <= waterChoices.length; i++) {
        const choice = waterChoices[i - 1];
        this.waterActivitiesChoiceCount[choice].total++;
        switch (i) {
          case 1:
            this.waterActivitiesChoiceCount[choice].choice1++;
            break;
          case 2:
            this.waterActivitiesChoiceCount[choice].choice2++;
            break;
          case 3:
            this.waterActivitiesChoiceCount[choice].choice3++;
            break;
        }
      }
    });
  }
}
