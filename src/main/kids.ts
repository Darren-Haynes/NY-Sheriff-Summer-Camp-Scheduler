import { WaterActivityCounts, LandActivityCounts, KidsChoices } from '../types/kids-types';

/**
Kids class contains the key data for each of the kids in the camp
*/
export class Kids {
  inputData: string;
  names: Array<string>;
  count: number;
  waterActivitiesChoiceCount: WaterActivityCounts;
  landActivitiesChoiceCount: LandActivityCounts;
  choices: Record<string, KidsChoices>;
  duplicateChoice: boolean;

  /**
   *
   * @param inputData a string of all the Kids choices
   */
  constructor(inputData: string) {
    this.inputData = inputData;
    this.names = [];
    this.count = 0;
    this.choices = {};
    this.duplicateChoice = false;
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

  private detectDuplicateChoices(choice1: string, choice2: string, choice3: string): void {
    if (choice1 === choice2 || choice1 === choice3 || choice2 === choice3) {
      this.duplicateChoice = true;
    }
  }

  /**
   * Create a map of kids and their choices and time slots
   * @returns void
   */
  private setKidsData(): void {
    const inputDataArr = this.inputData.split('\n');
    inputDataArr.pop(); // remove last empty line
    inputDataArr.shift(); // remove spreadsheet header
    inputDataArr.forEach((line: string) => {
      const col = line.split('\t');
      const name = col[0] + ' ' + col[1];
      this.names.push(name);
      this.count += 1;
      const land1choice = col[3].toLowerCase();
      const land2choice = col[4].toLowerCase();
      const land3choice = col[5].toLowerCase();
      const water1choice = col[6].toLowerCase();
      const water2choice = col[7].toLowerCase();
      const water3choice = col[8].toLowerCase();
      if (!this.duplicateChoice) {
        this.detectDuplicateChoices(water1choice, water2choice, water3choice);
      }

      this.choices[name] = {
        land1: land1choice,
        land2: land2choice,
        land3: land3choice,
        water1: water1choice,
        water2: water2choice,
        water3: water3choice,
      };
    });
  }

  private countChoices(): void {
    for (const name in this.choices) {
      const kidsChoice = this.choices[name];
      const landChoices = [kidsChoice.land1, kidsChoice.land2, kidsChoice.land3];
      const waterChoices = [kidsChoice.water1, kidsChoice.water2, kidsChoice.water3];
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
