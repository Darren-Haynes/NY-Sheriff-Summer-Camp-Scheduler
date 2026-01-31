import { Kids } from './kids';
import { Activities } from './activities';
import { ActivityArgs, NotScheduled, AllowedTimes } from '../types/schedule-types';
import { LandKidsAM, LandKidsPM, WaterKids } from '../types/camp-types';

/**
Main class that schedules the kids to activities.
*/
export class Schedule {
  inputData: string;
  kids: Kids;
  notScheduled9am: NotScheduled;
  notScheduled10am: NotScheduled;
  notScheduledAllNames: string[];
  algo: string;
  water9am: WaterKids;
  water10am: WaterKids;
  land9am: LandKidsAM;
  land10am: LandKidsPM;

  private static readonly ALGOS: string[] = ['waterFirst'];
  private static readonly LANDWATER: string[] = ['water', 'land'];

  // TODO: see if improvemets can be made using this resouce https://www.freecodecamp.org/news/how-to-use-the-builder-pattern-in-python-a-practical-guide-for-devs/
  constructor(inputData: string, algo: string) {
    if (!Schedule.ALGOS.includes(algo)) {
      throw new Error(`${algo} is not a supported Camp Scheduler algorithm`);
    }
    this.inputData = inputData;
    this.algo = algo;
    this.kids = new Kids(this.inputData);
    this.notScheduled9am = this.notScheduledConstructor(true);
    this.notScheduled10am = this.notScheduledConstructor(false);
    this.notScheduledAllNames = this.kids.names;
    this.water9am = Activities.water9am;
    this.water10am = Activities.water10am;
    this.land9am = Activities.land9am;
    this.land10am = Activities.land10am;
  }

  private notScheduledConstructor(nineAM = true): NotScheduled {
    const nineOrTen = nineAM
      ? structuredClone(Activities.land9amActs)
      : structuredClone(Activities.land10amActs);
    const notScheduled: NotScheduled = {
      names: this.kids.names,
      landActivities: structuredClone(nineOrTen),
      waterActivities: structuredClone(Activities.waterActs),
    };
    return notScheduled;
  }

  /**
   * Constructs Map of 'land' or 'water' activities with default count of 0.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @returns {Map} - e.g for water activities: {'swim': 0, 'fish': 0, ...}
   */
  private activityTemplate(activityType: string): Map<string, number> {
    const choicesCount = new Map<string, number>();
    if (activityType === 'land') {
      const allNotScheduledLandActivities = this.notScheduled9am.landActivities.concat(
        this.notScheduled10am.landActivities
      );
      Activities.landActs.forEach(activity => {
        if (allNotScheduledLandActivities.includes(activity)) {
          choicesCount.set(activity, 0);
        }
      });
    }
    if (activityType === 'water') {
      const allNotScheduledWaterActivities = this.notScheduled9am.waterActivities.concat(
        this.notScheduled10am.waterActivities
      );
      Activities.waterActs.forEach(activity => {
        if (allNotScheduledWaterActivities.includes(activity)) {
          choicesCount.set(activity, 0);
        }
      });
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
    let kidsChoices: [string, string, string] = ['land1', 'land2', 'land3'];
    if (activityType === 'water') {
      kidsChoices = ['water1', 'water2', 'water3'];
    }
    const activitiesChoicesCount = this.activityTemplate(activityType);
    for (let i = 0; i < numOfChoices; i++) {
      this.notScheduledAllNames.forEach(kid => {
        const kidsData = this.kids.data.get(kid);
        // TODO fix type error
        const activity = kidsData.choices[kidsChoices[i]].toLowerCase();
        const currentActivityCount = activitiesChoicesCount.get(activity);
        const newActivityCount = currentActivityCount + 1;
        activitiesChoicesCount.set(activity, newActivityCount);
      });
    }
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
   * @param {number} ChoiceNum - kids land or water choice 1st, 2nd or 3rd
   * @returns {string[]} - Array of kids names who chose the activity
   */
  private getKidsbyActivityChoice(
    activity: string,
    activityType: string,
    choiceNum: number
  ): string[] {
    const choice: string = this.getKidsChoice(activityType, choiceNum);
    const matchedKids: string[] = [];
    this.notScheduledAllNames.forEach(name => {
      const kidsChoices = this.kids.data.get(name);
      // TODO: fix type error
      if (kidsChoices.choices[choice] === activity) {
        matchedKids.push(name);
      }
    });
    return matchedKids;
  }

  /**
   * Get random selection of elements from an Array.
   * @param {string[]} arr - the Array to take a random selection from
   * @param {number} numOfItems - the total number of random elements to return
   * @returns {string[]} - the Array of random selected elements
   */
  private randomChoices(arr: string[], numOfItems: number): string[] {
    if (numOfItems > arr.length) {
      throw new Error('Random choice selection cannot be greater than list length.');
    }
    const randomSort = arr.sort(() => Math.random() - 0.5);
    return randomSort.slice(0, numOfItems);
  }

  /**
   * Remove names and activites from notScheduled lists
   * @param {string[]} names - Array of names to be removed from notScheduled lists
   * @param {string} activityType - Type of activity: either 'land' or 'water'
   * @param {string} activity - activity such as "fball", "canoe", "swim"
   * @param {number} timeSlot - integers 9 and 10 only, representing 9am or 10am
   * @returns {void}
   */
  private removeScheduled(
    names: string[],
    activityType: string,
    activity: string,
    timeSlot: AllowedTimes
  ): void {
    // TODO: fix all type errors within this method
    names.forEach(name => {
      // Remove names from master not scheduled names list
      this.notScheduledAllNames = this.notScheduledAllNames.filter(name2 => name2 != name);
      // Remove names and activities from 9am timeslots
      if (timeSlot === 9) {
        this.notScheduled9am.names = this.notScheduled9am.names.filter(name2 => name2 != name);
        if (activityType === 'land') {
          this.notScheduled9am.landActivities = this.notScheduled9am.landActivities.filter(
            activity2 => activity2 != activity
          );
        }
        if (activityType === 'water') {
          this.notScheduled9am.waterActivities = this.notScheduled9am.waterActivities.filter(
            activity2 => activity2 != activity
          );
        }
      }

      // Remove names and activities from 9am timeslots
      if (timeSlot === 10) {
        this.notScheduled10am.names = this.notScheduled10am.names.filter(name2 => name2 != name);
      }
      if (activityType === 'land') {
        this.notScheduled10am.landActivities = this.notScheduled10am.landActivities.filter(
          activity2 => activity2 != activity
        );
      }
      if (activityType === 'water') {
        this.notScheduled10am.waterActivities = this.notScheduled10am.waterActivities.filter(
          activity2 => activity2 != activity
        );
      }
    });
  }

  /**
   * Add Kids to the schedule for activities that more kids have chosen than there are timeslots.
   * @param {string[]} doubleMaxActivities - The actvities that more kids have chosen than there are timeslots.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number} ChoiceNum - kids land or water choice 1st, 2nd or 3rd
   * @returns {void}
   */
  private scheduleDoubleActivities(
    doubleMaxActivities: string[],
    activityType: string,
    choiceNum: number,
    isMax: boolean
  ): void {
    doubleMaxActivities.forEach(activity => {
      const kidsByActivityChoice = this.getKidsbyActivityChoice(activity, activityType, choiceNum);
      const activityValue = isMax ? 1 : 0;
      // TODO: fix type error
      const activityMaxOrMin =
        activityType === 'land'
          ? Activities.landRanges[activity][activityValue]
          : Activities.waterRanges[activity][activityValue];

      if (isMax) {
        const randomKids = this.randomChoices(kidsByActivityChoice, activityMaxOrMin * 2);
        const kidsNineAM = randomKids.slice(0, activityMaxOrMin);
        const kidsTenAM = randomKids.slice(activityMaxOrMin);
        this.removeScheduled(kidsNineAM, activityType, activity, 9);
        this.removeScheduled(kidsTenAM, activityType, activity, 10);
        // TODO: fix type error
        if (activityType === 'water') {
          this.water9am[activity] = kidsNineAM;
          this.water10am[activity] = kidsTenAM;
        }
        if (activityType === 'land') {
          this.land9am[activity] = kidsNineAM;
          this.land10am[activity] = kidsTenAM;
        }
      }
    });
  }

  /**
   * Some activities could have been chosen by more kids than the activity can support for
   * both 9am and 10am time slots. The 'DoubleMax' meaning that both time slots are maxed out.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number} numOfChoices - num of choices to count: 1, 2 or 3.
   * @param {boolean}  - true = doubleMax, false = doubleMin
   * @returns {string[]} - returns list of activities: "['fish', 'canoe',...]"
   */
  private getDoubleActivities({
    activityType = 'land',
    numOfChoices = 1,
    isMax = true,
  }: ActivityArgs): string[] {
    this.choicesAndActivityValueChecks(numOfChoices, activityType);
    const countedChoices = this.countActivityChoices(activityType, numOfChoices);
    const activitiesAboveDouble: string[] = [];
    const ranges = activityType === 'land' ? Activities.landRanges : Activities.waterRanges;
    const maxType = isMax ? 4 : 3;
    for (const [activity, range] of Object.entries(ranges)) {
      if (countedChoices.get(activity) > range[maxType]) {
        activitiesAboveDouble.push(activity);
      }
    }
    return activitiesAboveDouble;
  }

  runAlgo(): string {
    console.log(`${this.algo} algorithm initiated`);

    // 1st: Check if kid's first choice totals are greater than both 9am & 10am water timeslots available..
    const activitiesAboveDoubleMax: string[] = this.getDoubleActivities({
      activityType: 'water',
    });
    //... and fully schedule both time slots if this is the case.
    console.log('Double above max in Water First algo: ', activitiesAboveDoubleMax);
    if (activitiesAboveDoubleMax.length > 0) {
      this.scheduleDoubleActivities(activitiesAboveDoubleMax, 'water', 1, true);
    }

    // 2nd: Check if kid's first choice totals are greater than both 9am & 10am water timeslots minimum requiremqnts available..
    const activitiesAboveDoubleMin: string[] = this.getDoubleActivities({
      activityType: 'water',
    });
    //... and fully schedule both time slots if this is the case.
    console.log('Double above min in Water First algo: ', activitiesAboveDoubleMin);
    if (activitiesAboveDoubleMin.length > 0) {
      this.scheduleDoubleActivities(activitiesAboveDoubleMin, 'water', 1, false);
    }

    return 'success';
  }
}
