import { Kids } from './kids';
import { Activities } from './activities';
import {
  NotScheduled,
  AllowedTimes,
  AllowedActivityTypes,
  AllowedChoices,
  AllowedMaxMin,
  AllowedDoubleSingle
} from '../types/schedule-types';
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
   * Get the right Activities object based on the activity type and time slot.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options: '9am' or '10am'.
   * @returns {Activities} - The corresponding Activities object.
   */
  private getActivityTimeSlot(activityType: AllowedActivityTypes, timeSlot: AllowedTimes) {
    const activityTimeSlots = [this.water9am, this.water10am, this.land9am, this.land10am];
    let activityTimeSlot = activityTimeSlots[0];
    if (activityType === 'water') {
      if (timeSlot === '9am') {
        activityTimeSlot = activityTimeSlots[0]
      }
        if (timeSlot === '10am') {
          activityTimeSlot = activityTimeSlots[1]
      }
    }
    if (activityType === 'land') {
      if (timeSlot === '9am') {
        activityTimeSlot = activityTimeSlots[2]
      }
        if (timeSlot === '10am') {
          activityTimeSlot = activityTimeSlots[3]
      }
    }
    return activityTimeSlot;
  }

  /**
   * Get Map of scheduled activities that have more kids than the minimum required.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options: '9am' or '10am'.
   * @returns {Map} - activity plus the number of kids schedule above the min threshold: e.g {'swim': 3, 'fish': 8, ...}
   */
  private getScheduledAboveMin(activityType: AllowedActivityTypes, timeSlot: AllowedTimes) {
    const scheduledAboveMin = new Map<string, number>();
    const activityRanges = [Activities.waterRanges, Activities.landRanges];
    let activityRange = activityRanges[0];

    if (activityType === 'land') {
      activityRange = activityRanges[1];
    }

    const activityTimeSlot = this.getActivityTimeSlot(activityType, timeSlot);
    for (const [activity, names] of Object.entries(activityTimeSlot)) {
      if (names.length > activityRange[activity][0]) {
        const aboveMinCount = names.length - activityRange[activity][0];
        scheduledAboveMin.set(activity, aboveMinCount)
      };
    };
    return scheduledAboveMin;
  }

  /**
   * Constructs Map of 'land' or 'water' activities with default count of 0.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @returns {Map} - e.g for water activities: {'swim': 0, 'fish': 0, ...}
   */
  private activityTemplate(activityType: AllowedActivityTypes): Map<string, number> {
    const choicesCount = new Map<string, number>();
    if (activityType === 'land') {
      const allNotScheduledLandActivities =  [...new Set([...this.notScheduled9am.landActivities, ...this.notScheduled10am.landActivities])];
      Activities.landActs.forEach(activity => {
        if (allNotScheduledLandActivities.includes(activity)) {
          choicesCount.set(activity, 0);
        }
      });
    }
    if (activityType === 'water') {
      const allNotScheduledWaterActivities =  [...new Set([...this.notScheduled9am.waterActivities, ...this.notScheduled10am.waterActivities])];
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
   * @param {number[]} choices - num of choices to count between 1 - 3.
   * @returns {Map} - e.g {'swim': 39, 'fish': 9, ...} how many kids chose each activity
   */
  private countActivityChoices(activityType: AllowedActivityTypes, choices: AllowedChoices) {
    let kidsChoices: [string, string, string] = ['land1', 'land2', 'land3'];
    if (activityType === 'water') {
      kidsChoices = ['water1', 'water2', 'water3'];
    }
    const activitiesChoicesCount = this.activityTemplate(activityType);
    for (let i = 0; i < choices.length; i++) {
      this.notScheduledAllNames.forEach(kid => {
        const kidsData = this.kids.data.get(kid);
        // TODO fix type error
        const activity = kidsData.choices[kidsChoices[choices[i] - 1].toLowerCase();
        if (activitiesChoicesCount.has(activity)) {
          const currentActivityCount = activitiesChoicesCount.get(activity);
          const newActivityCount = currentActivityCount + 1;
          activitiesChoicesCount.set(activity, newActivityCount);
        }
      });
    }
    console.log('ACT CHOICE COUNT');
    console.log(activitiesChoicesCount);
    return activitiesChoicesCount;
  }

  /**
   * Establishes with choice to count out of 6 options: land1, land2, land3, water1, water2, water3
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number[]} ChoiceNum - land or water choice 1, 2 or 3
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
   * Establishes witch choice to count out of 6 options: land1, land2, land3, water1, water2, water3
   * @param {string} activity- land or water activity such as 'canoe', 'swim', 'fball' ...
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number[]} ChoiceNum - kids land or water choice 1st, 2nd or 3rd
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
      if (kidsChoices.choices[choice].toLowerCase() === activity) {
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
      if (timeSlot === '9am') {
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
      if (timeSlot === '10am') {
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
   * Add Kids to the schedule for activities that more kids have chosen than there are openings for either a 9am or 10 timeslots.
   * @param {string[]} singleMaxActivities - The actvities that more kids have chosen than there are timeslots.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number[]} ChoiceNum - kids land or water choice 1st, 2nd or 3rd
   * @returns {void}
   */
  private scheduleSingleActivities(
    singleMaxActivities: string[],
    activityType: AllowedActivityTypes,
    choiceNum: AllowedChoices,
    maxOrMin: AllowedMaxMin
  ): void {
    singleMaxActivities.forEach((activity, idx) => {
      let kidsByActivityChoice: string[] = [];
      if (choiceNum.length > 1) {
        for (let i = 0; i < choiceNum.length; i++) {
          const activityChoices = this.getKidsbyActivityChoice(activity, activityType, choiceNum[i]);
          kidsByActivityChoice = kidsByActivityChoice.concat(activityChoices);
        }
      } else {
        kidsByActivityChoice = this.getKidsbyActivityChoice(activity, activityType, choiceNum);
      }
      const activityValue = (maxOrMin === 'max') ? 1 : 0;
      // TODO: fix type error
      const activityMaxOrMin =
        activityType === 'land'
          ? Activities.landRanges[activity][activityValue]
          : Activities.waterRanges[activity][activityValue];

      let kidsTimeSlot: string[];
      if (maxOrMin === 'max') {
        kidsTimeSlot = this.randomChoices(kidsByActivityChoice, activityMaxOrMin);
      }
      if (maxOrMin === 'min') {
        kidsTimeSlot = kidsByActivityChoice
      }

      if (activityType === 'water') {
        let timeSlot = '9am';
        if (this.notScheduled10am.names.length >= this.notScheduled9am.names.length) {
          timeSlot = '10am';
        }
        if (timeSlot === '9am') {
          this.water9am[activity] = kidsTimeSlot;
          this.removeScheduled(kidsTimeSlot, activityType, activity, '9am');
        }
        if (timeSlot === '10am') {
          this.water10am[activity] = kidsTimeSlot;
          this.removeScheduled(kidsTimeSlot, activityType, activity, '10am');
        }
      }

      if (activityType === 'land') {
        let timeSlot = '9am';
        if (Activities.landRanges[activity][2] === 2) {
          if (this.notScheduled10am.names.length >= this.notScheduled9am.names.length) {
            timeSlot = '10am';
          }
        }
        if (Activities.landRanges[activity][2] === 1) {
            timeSlot = '10am';
        }
        if (timeSlot === '9am') {
          this.land9am[activity] = kidsTimeSlot;
          this.removeScheduled(kidsTimeSlot, activityType, activity, '9am');
        }
        if (timeSlot === '10am') {
          this.land10am[activity] = kidsTimeSlot;
          this.removeScheduled(kidsTimeSlot, activityType, activity, '10am');
        }
      }
    });
}

  /**
   * Add Kids to the schedule for activities that more kids have chosen than there are openings for both 9am and 10am timeslots
   * @param {string[]} doubleMaxActivities - The actvities that more kids have chosen than there are timeslots.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number[]} ChoiceNum - kids land or water choice 1st, 2nd or 3rd
   * @returns {void}
   */
  private scheduleDoubleActivities(
    doubleMaxActivities: string[],
    activityType: AllowedActivityTypes,
    choiceNum: AllowedChoices,
    maxOrMin: AllowedMaxMin
  ): void {
    doubleMaxActivities.forEach((activity,idx) => {
      let kidsByActivityChoice: string[] = [];
      if (choiceNum.length > 1) {
        for (let i = 0; i < choiceNum.length; i++) {
          const activityChoices = this.getKidsbyActivityChoice(activity, activityType, choiceNum[i]);
          kidsByActivityChoice = kidsByActivityChoice.concat(activityChoices);
        }
      } else {
        kidsByActivityChoice = this.getKidsbyActivityChoice(activity, activityType, choiceNum);
      }
      const activityValue = maxOrMin ? 1 : 0;
      // TODO: fix type error
      const activityMaxOrMin =
        activityType === 'land'
          ? Activities.landRanges[activity][activityValue]
          : Activities.waterRanges[activity][activityValue];

      let kidsNineAM: string[];
      let kidsTenAM: string[];

      if (maxOrMin === 'max') {
        const randomKids = this.randomChoices(kidsByActivityChoice, activityMaxOrMin * 2);
        kidsNineAM = randomKids.slice(0, activityMaxOrMin);
        kidsTenAM = randomKids.slice(activityMaxOrMin);
      }

      if (maxOrMin === 'min') {
        let halfTheKids = kidsByActivityChoice.length / 2;
        // If there are more kids not scheduled for 9am than 10am, this helps keep equal numbers of kids between AM and PM activities.
        if (this.notScheduled9am.names.length > this.notScheduled10am.names.length) {
          halfTheKids = Math.ceil(halfTheKids);
        }
        kidsNineAM = kidsByActivityChoice.slice(0, halfTheKids);
        kidsTenAM = kidsByActivityChoice.slice(halfTheKids);
      }

      this.removeScheduled(kidsNineAM, activityType, activity, '9am');
      this.removeScheduled(kidsTenAM, activityType, activity, '10am');

      // TODO: fix type error
      if (activityType === 'water') {
        this.water9am[activity] = kidsNineAM;
        this.water10am[activity] = kidsTenAM;
      }
      if (activityType === 'land') {
        this.land9am[activity] = kidsNineAM;
        this.land10am[activity] = kidsTenAM;
      }
    });
  }

  /**
   * Some activities only happen at 9am or 10am - the rest happen at both time slots. Hence 'single' or 'double'.
   * Whether the activity is single or double, min or max refers to the min and max amount of kids allowed per activity.
   * This function returns the number of kids allowed per activity based on the activity type, whether it's single or double, and whether it's max or min.
   * Well actually it doesn't return the actual number of kids min or max but an array index that references the actual number.
   * @param {string}  maxOrMin - 'max' or 'min'
   * @param {string} doubleOrSingle - 'double' or 'single'
   * @returns {number} - The array index that references the actual number of kids min or max.
   */
  private getActivityCountQualifier(
    maxOrMin: AllowedMaxMin,
    doubleOrSingle: AllowedDoubleSingle
  ): number {
    if (doubleOrSingle === 'double') {
      return maxOrMin === 'max' ? 4 : 3;
    }
    if (doubleOrSingle === 'single') {
      return maxOrMin === 'max' ? 1 : 0;
    }
    throw new Error('Invalid doubleOrSingle value');
  }

  /**
   * Get list of activities that are above the max or min count for both time slots.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number[]} choices - num of choices to count in any combo of 1 thru 3: [[1], [2], [3], [1, 2], [1, 2], [1, 3], [1, 2, 3]]
   * @param {string}  maxOrMin - true = doubleMax, false = doubleMin
   * @returns {string[]} - returns list of activities: "['fish', 'canoe',...]"
   */
  private getActivities(
    activityType: AllowedActivityTypes,
    choices: AllowedChoices,
    maxOrMin: AllowedMaxMin,
    doubleOrSingle: AllowedDoubleSingle
  ): string[] {
    const countedChoices = this.countActivityChoices(activityType, choices);
    const qualifiedActivities: string[] = [];
    const ranges = activityType === 'land' ? Activities.landRanges : Activities.waterRanges;
    const minCountQualifier = this.getActivityCountQualifier(maxOrMin, doubleOrSingle);
    for (const [activity, range] of Object.entries(ranges)) {
      if (countedChoices.get(activity) > range[minCountQualifier]) {
        qualifiedActivities.push(activity);
      }
    }
    return qualifiedActivities;
  }

  runAlgo(): string {
    console.log(`${this.algo} algorithm initiated`);

    // 1st run: Check if kid's first choice totals are greater than both 9am & 10am water timeslots available..
    let activitiesAboveDoubleMax: string[] = this.getActivities('water', [1], 'max', 'double');
    //... and fully schedule both time slots if this is the case.
    console.log('Double above max in WaterFirst algo: ', activitiesAboveDoubleMax);
    if (activitiesAboveDoubleMax.length > 0) {
      this.scheduleDoubleActivities(activitiesAboveDoubleMax, 'water', [1], 'max');
    }

    // 2nd run: Check if kid's first choice totals are greater than both 9am & 10am water timeslots minimum requiremqnts available..
    let activitiesAboveDoubleMin: string[] = this.getActivities('water', [1], 'min', 'double');
    //... and fully schedule both time slots if this is the case.
    console.log('Double above min in WaterFirst algo: ', activitiesAboveDoubleMin);
    if (activitiesAboveDoubleMin.length > 0) {
      this.scheduleDoubleActivities(activitiesAboveDoubleMin, 'water', [1], 'min');
    }

    // 3rd run: Check if kid's first plus second choice totals are greater than both 9am & 10am water timeslots available..
    activitiesAboveDoubleMax = this.getActivities('water', [1, 2], 'max', 'double');
    //... and fully schedule both time slots if this is the case.
    console.log(
      'Double above max -- 1st+2nd choices in WaterFirst algo: ',
      activitiesAboveDoubleMax
    );
    if (activitiesAboveDoubleMax.length > 0) {
      console.log('Entering Double MAX 1st+2nd choices');
      this.scheduleDoubleActivities(activitiesAboveDoubleMax, 'water', [1, 2], 'max');
    }

    // 4th run: Check if kid's first plus second choice totals are greater than both 9am & 10am water timeslots minimum requiremqnts available..
    activitiesAboveDoubleMin = this.getActivities('water', [1, 2], 'min', 'double');
    //... and fully schedule both time slots if this is the case.
    console.log(
      'Double above min -- 1st+2nd choices in WaterFirst algo: ',
      activitiesAboveDoubleMin
    );
    if (activitiesAboveDoubleMin.length > 0) {
      this.scheduleDoubleActivities(activitiesAboveDoubleMin, 'water', [1, 2], 'min');
    }

    // 5th run: Check if kid's first plus second plus third choice totals are greater than both 9am & 10am water timeslots available..
    activitiesAboveDoubleMax = this.getActivities('water', [1, 2, 3], 'max', 'double');
    //... and fully schedule both time slots if this is the case.
    console.log(
      'Double above max -- 1st+2nd choices in WaterFirst algo: ',
      activitiesAboveDoubleMax
    );
    if (activitiesAboveDoubleMax.length > 0) {
      console.log('Entering Double MAX 1st+2nd choices');
      this.scheduleDoubleActivities(activitiesAboveDoubleMax, 'water', [1, 2, 3], 'max');
    }

    // 6th run: Check if kid's first plus second plus third choice totals are greater than both 9am & 10am water timeslots minimum requiremqnts available..
    activitiesAboveDoubleMin = this.getActivities('water', [1, 2, 3], 'min', 'double');
    //... and fully schedule both time slots if this is the case.
    console.log(
      'Double above min -- 1st+2nd choices in WaterFirst algo: ',
      activitiesAboveDoubleMin
    );
    if (activitiesAboveDoubleMin.length > 0) {
      this.scheduleDoubleActivities(activitiesAboveDoubleMin, 'water', [1, 2, 3], 'min');
    }

    // 7th run: Check if kid's first choice totals are greater than both 9am & 10am water timeslots available..
    let activitiesAboveSingleMax = this.getActivities('water', [1], 'max', 'single');
    //... and schedule a single time slots if this is the case.
    console.log(
      'Single above max -- 1st+2nd+3rd choices in WaterFirst algo: ',
      activitiesAboveSingleMax
    );
    console.log('NO Single MAX 1st choices activities');
    if (activitiesAboveSingleMax.length > 0) {
      console.log('Entering Single MAX 1st+2nd+3rd choices');
      this.scheduleSingleActivities(activitiesAboveSingleMax, 'water', [1], 'max');
    }

    // 8th run: Check if kid's first choice totals are greater than both 9am & 10am water timeslots available..
    let activitiesAboveSingleMin = this.getActivities('water', [1], 'min', 'single');
    //... and schedule a single time slot if this is the case.
    console.log(
      'Single above min -- 1st choices in WaterFirst algo: ',
      activitiesAboveSingleMin
    );
    console.log('NO Single MIN 1st choices activities');
    if (activitiesAboveSingleMin.length > 0) {
      console.log('Entering Single MIN 1st choices');
      this.scheduleSingleActivities(activitiesAboveSingleMin, 'water', [1], 'min');
    }

    // 9th run: Check if kid's first plus second choice totals are greater than both 9am & 10am water timeslots available..
    activitiesAboveSingleMax = this.getActivities('water', [1, 2], 'max', 'single');
    //... and schedule a single time slot if this is the case.
    console.log(
      'Single above max -- 1st+2nd choices in WaterFirst algo: ',
      activitiesAboveSingleMax
    );
    console.log('NO Single MAX 1st+2nd choices activities');
    if (activitiesAboveSingleMax.length > 0) {
      console.log('Entering Single MAX 1st+2nd choices');
      this.scheduleSingleActivities(activitiesAboveSingleMax, 'water', [1, 2], 'max');
    }

    // 10th run: Check if kid's first plus second choice totals are greater than both 9am & 10am water timeslots available..
    activitiesAboveSingleMin = this.getActivities('water', [1, 2], 'min', 'single');
    //... and schedule a single time slot if this is the case.
    console.log(
      'Single above min -- 1st+2nd choices in WaterFirst algo: ',
      activitiesAboveSingleMin
    );
    console.log('NO Single MIN 1st and 2nd choices activities');
    if (activitiesAboveSingleMin.length > 0) {
      console.log('Entering Single MIN 1st+2nd choices');
      this.scheduleSingleActivities(activitiesAboveSingleMin, 'water', [1, 2], 'min');
    }

    // 11th run: Check if kid's first plus second plus third choice totals are greater than both 9am & 10am water timeslots available..
    activitiesAboveSingleMax = this.getActivities('water', [1, 2, 3], 'max', 'single');
    //... and schedule a single time slot if this is the case.
    console.log(
      'Single above max -- 1st+2nd+3rd choices in WaterFirst algo: ',
      activitiesAboveSingleMax
    );
    console.log('NO Single MAX 1st+2nd+3rd choices activities');
    if (activitiesAboveSingleMax.length > 0) {
      console.log('Entering Single MAX 1st+2nd+3rd choices');
      this.scheduleSingleActivities(activitiesAboveSingleMax, 'water', [1, 2, 3], 'max');
    }

    // 12th run: Check if kid's first plus second plus third choice totals are greater than both 9am & 10am water timeslots available..
    activitiesAboveSingleMin = this.getActivities('water', [1, 2, 3], 'min', 'single');
    //... and schedule a single time slot if this is the case.
    console.log(
      'Single above min -- 1st+2nd+3rd choices in WaterFirst algo: ',
      activitiesAboveSingleMin
    );
    console.log('NO Single MIN 1st choices activities');
    if (activitiesAboveSingleMin.length > 0) {
      console.log('Entering Single MIN 1st+2nd+3rd choices');
      this.scheduleSingleActivities(activitiesAboveSingleMin, 'water', [1, 2, 3], 'min');
    }

    console.log(this.water9am);
    console.log(this.water10am);
    console.log(this.notScheduledAllNames.length);
    console.log(this.notScheduled9am.names.length);
    console.log(this.notScheduled10am.names.length);
    return 'success';
  }
}
