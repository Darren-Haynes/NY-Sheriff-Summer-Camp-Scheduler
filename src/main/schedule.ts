import { Kids } from './kids';
import { Activities } from './activities';
import { ActivityArgs } from '../types/schedule-types';

/**
Main class that schedules the kids to activities.
*/
export class Schedule {
  inputData: string;
  kids: Kids;
  notScheduled: Array<string>;
  algo: string;

  private static readonly ALGOS: string[] = ['waterFirst'];
  private static readonly LANDWATER: string[] = ['water', 'land'];

  constructor(inputData: string, algo: string) {
    if (!Schedule.ALGOS.includes(algo)) {
      throw new Error(`${algo} is not a supported Camp Scheduler algorithm`);
    }
    this.inputData = inputData;
    this.algo = algo;
    this.kids = new Kids(this.inputData);
    this.notScheduled = this.kids.names;
  }

  /**
   * Constructs Map of 'land' or 'water' activities with default count of 0.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @returns {Map} - e.g for water activities: {'swim': 0, 'fish': 0, ...}
   */
  private activityTemplate(activityType: string): Map<string, number> {
    const choicesCount = new Map<string, number>();
    if (activityType === 'land') {
      Activities.landActs.forEach(activity => {
        choicesCount.set(activity, 0);
      });
    } else if (activityType === 'water') {
      Activities.waterActs.forEach(activity => {
        choicesCount.set(activity, 0);
      });
    } else {
      throw new Error(`Unsupported argument ${activityType}`);
    }
    return choicesCount;
  }
  /**
   * Counts how many times kids have chosen a specfic activity.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number} numOfChoices - num of choices to count between 1 - 3.
   * @returns {Map} - e.g {'swim': 39, 'fish': 9, ...} how many kids chose each activity
   */
  private countActivityChoices(activityType: string, numOfChoices: number) {
    this.choicesAndActivityValueChecks(numOfChoices, activityType);
    let kidsChoices: string[] = ['land1', 'land2', 'land3'];
    if (activityType === 'water') {
      kidsChoices = ['water1', 'water2', 'water3'];
    }
    const activitiesChoicesCount = this.activityTemplate(activityType);
    for (let i = 0; i < numOfChoices; i++) {
      this.notScheduled.forEach(kid => {
        const kidsData = this.kids.data.get(kid);
        const activity = kidsData.choices[kidsChoices[i]].toLowerCase();
        const currentActivityCount = activitiesChoicesCount.get(activity);
        const newActivityCount = currentActivityCount + 1;
        activitiesChoicesCount.set(activity, newActivityCount);
      });
    }
    console.log('ALright butty');
    console.log(activitiesChoicesCount);
    return activitiesChoicesCount;
  }

  /**
   * Checks for valid activity type and that choice are in the correct range 1-3
   * Throws error if checks fail.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number} numOfChoices - num of choices to count between 1 - 3.
   * @returns void
   */
  private choicesAndActivityValueChecks(numOfChoices: number, activityType: string): void {
    if (typeof numOfChoices === 'number' && numOfChoices % 1 !== 0) {
      throw new Error('Only an integers with range of 1 to 3 permitted');
    }
    if (numOfChoices > 3 || numOfChoices < 1) {
      throw new Error(`${numOfChoices} is outside the allowed range 1 to 3.`);
    }
    if (!Schedule.LANDWATER.includes(activityType)) {
      throw new Error("'land' and 'water' are the only acccepted keyword arguments");
    }
  }

  /**
   * Establishes with choice to count out of 6 options: land1, land2, land3, water1, water2, water3
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number} ChoiceNum - land or water choice 1, 2 or 3
   * @returns {string} - returns specific activity choice such as 'land1' or 'water3' etc.
   */
  // TODO: choiceNum argument may cause a bug. The original argument passed in is called
  // numOfChoices which refers to the number of choices between 1 or 2 or 3 total choices.
  // However choiceNum refers to a specific choice, specifically land1, land2, land3, water...
  private getKidsChoice(activityType: string, choiceNum: number): string {
    if (activityType === 'land') {
      const landChoices = ['land1', 'land2', 'land3'];
      return landChoices[choiceNum - 1];
    }
    if (activityType === 'water') {
      const waterChoices = ['water1', 'water2', 'water3'];
      return waterChoices[choiceNum - 1];
    }
    throw new Error("Invalid activity type. Type needs to be 'land' or 'water'.");
  }

  /**
   * Establishes with choice to count out of 6 options: land1, land2, land3, water1, water2, water3
   * @param {string} activity- land or water activity such as 'canoe', 'swim', 'fball' ...
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number} ChoiceNum - land or water choice 1, 2 or 3
   * @returns {string[]} - Array of kids names who chose the activity
   */

  private getKidsbyActivityChoice(
    activity: string,
    activityType: string,
    choiceNum: number
  ): string[] {
    const choice: string = this.getKidsChoice(activityType, choiceNum);
    const matchedKids: string[] = [];
    this.notScheduled.forEach(name => {
      const kidsChoices = this.kids.data.get(name);
      if (kidsChoices.choices[choice] === activity) {
        matchedKids.push(name);
      }
    });
    return matchedKids;
  }

  private scheduleDoubleMaxActivities(
    doubleMaxActivities: string[],
    activityType: string,
    choiceNum: number
  ): void {
    console.log(doubleMaxActivities);
    doubleMaxActivities.forEach(activity => {
      const kidsByActivityChoice = this.getKidsbyActivityChoice(activity, activityType, choiceNum);
    });
  }

  /**
   * Some activities could have been chosen by more kids than the activity can support for
   * both 9am and 10am time slots. The 'DoubleMax' meaning that both time slots are maxed out.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number} numOfChoices - num of choices to count: 1, 2 or 3
   * @returns {string[]} - returns list of activities: "['fish', 'canoe',...]"
   */

  private getDoubleMaxActivities({
    activityType = 'land',
    numOfChoices = 1,
  }: ActivityArgs): string[] {
    this.choicesAndActivityValueChecks(numOfChoices, activityType);
    const countedChoices = this.countActivityChoices(activityType, numOfChoices);
    const activitiesAboveDoubleMax: string[] = [];
    for (const [activity, range] of Object.entries(Activities.waterRanges)) {
      if (countedChoices.get(activity) > range[4]) {
        activitiesAboveDoubleMax.push(activity);
      }
    }
    this.scheduleDoubleMaxActivities(activitiesAboveDoubleMax, activityType, numOfChoices);
    return activitiesAboveDoubleMax;
  }

  runAlgo(): string {
    console.log(`${this.algo} algorithm initiated`);
    const doubleMax1Activities: string[] = this.getDoubleMaxActivities({
      activityType: 'water',
    });
    return doubleMax1Activities.toString();
  }
}
