import { WaterActivityCounts, LandActivityCounts, KidsChoices } from '../types/kids-types';
import { Int } from '../types/num-types';

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
   * Get the column indices for the names and activities columns based on the header row.
   * @param {string} headerRow - header row of spreadsheet.
   * @returns {Int[]} - Array of column indices for names and activities.
   */
  private getNamesAndActivitiesColumns(headerRow: string): Int[] {
    const columns = headerRow.split('\t');
    let firstName = -1 as Int;
    let lastName = -1 as Int;
    let waterActivity1 = -1 as Int;
    let waterActivity2 = -1 as Int;
    let waterActivity3 = -1 as Int;
    let landActivity1 = -1 as Int;
    let landActivity2 = -1 as Int;
    let landActivity3 = -1 as Int;
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i].toLowerCase();
      if (column.includes('first name')) {
        firstName = i as Int;
      } else if (column.includes('last name')) {
        lastName = i as Int;
      } else if (column === 'w1') {
        waterActivity1 = i as Int;
      } else if (column === 'w2') {
        waterActivity2 = i as Int;
      } else if (column === 'w3') {
        waterActivity3 = i as Int;
      } else if (column === 'l1') {
        landActivity1 = i as Int;
      } else if (column === 'l2') {
        landActivity2 = i as Int;
      } else if (column === 'l3') {
        landActivity3 = i as Int;
      }
    }
    return [
      firstName,
      lastName,
      waterActivity1,
      waterActivity2,
      waterActivity3,
      landActivity1,
      landActivity2,
      landActivity3,
    ];
  }

  /**
   * Create a map of kids and their choices and time slots
   * @returns void
   */
  private setKidsData(): void {
    const inputDataArr = this.inputData.split('\n');
    const headerRow = inputDataArr.shift();
    if (!headerRow) return;
    const [
      firstName,
      lastName,
      waterActivity1,
      waterActivity2,
      waterActivity3,
      landActivity1,
      landActivity2,
      landActivity3,
    ] = this.getNamesAndActivitiesColumns(headerRow);
    inputDataArr.pop(); // remove last empty line

    inputDataArr.forEach((line: string) => {
      const col = line.split('\t');
      const name = col[firstName] + ' ' + col[lastName];
      this.names.push(name);
      this.count += 1;
      const land1choice = col[landActivity1].toLowerCase();
      const land2choice = col[landActivity2].toLowerCase();
      const land3choice = col[landActivity3].toLowerCase();
      const water1choice = col[waterActivity1].toLowerCase();
      const water2choice = col[waterActivity2].toLowerCase();
      const water3choice = col[waterActivity3].toLowerCase();
      if (!this.duplicateChoice) {
        this.detectDuplicateChoices(water1choice, water2choice, water3choice);
        this.detectDuplicateChoices(land1choice, land2choice, land3choice);
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
