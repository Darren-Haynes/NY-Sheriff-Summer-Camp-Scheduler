import { WaterActivityCounts, LandActivityCounts, KidsChoices } from '../types/kids-types';

/**
Kids class contains the key data for each of the kids in the camp
*/
export class Kids {
  inputData: string[][];
  names: Array<string>;
  count: number;
  waterActivitiesChoiceCount: WaterActivityCounts;
  landActivitiesChoiceCount: LandActivityCounts;
  choices: Record<string, KidsChoices>;

  /**
   *
   * @param inputData a string of all the Kids choices
   */
  constructor(inputData: string[][]) {
    this.inputData = inputData;
    this.names = [];
    this.count = 0;
    this.choices = {};
    this.setKidsData();
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
  private setKidsData(): void {
    for (const entry of this.inputData) {
      const name = entry[0] + ' ' + entry[1];
      this.names.push(name);
      this.count += 1;
      this.choices[name] = {
        land1: entry[2],
        land2: entry[3],
        land3: entry[4],
        water1: entry[5],
        water2: entry[6],
        water3: entry[7],
      };
    }
  }

  private countChoices(): void {
    for (const name in this.choices) {
      const kidsChoices = this.choices[name];
      const landChoices = [kidsChoices.land1, kidsChoices.land2, kidsChoices.land3];
      const waterChoices = [kidsChoices.water1, kidsChoices.water2, kidsChoices.water3];
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
    }
  }
}
