import { Kids } from './kids';
import { Activities } from './activities';
import {
  NotScheduled,
  AllowedTimes,
  Allowed9and10Only,
  AllowedActivityTypes,
  AllowedActivityTimes,
  AllowedChoices,
  AllowedMaxMin,
  AllowedMaxMinSched,
  AllowedDoubleSingle,
  AllowedChoiceNums,
  LandActivities,
  WaterActivities,
} from '../types/schedule-types';
import { LandKidsAM, LandKidsPM, WaterKids } from '../types/camp-types';

/**
Main class that schedules the kids to activities.
*/
export class Schedule {
  inputData: string;
  kids: Kids;
  notScheduled9amWater: NotScheduled;
  notScheduled10amWater: NotScheduled;
  notScheduledAllNamesWater: string[];
  notScheduled9amLand: NotScheduled;
  notScheduled10amLand: NotScheduled;
  notScheduledAllNamesLand: string[];
  algo: string;
  water9am: WaterKids;
  water10am: WaterKids;
  land9am: LandKidsAM;
  land10am: LandKidsPM;

  private static readonly ALGOS: string[] = ['waterFirst'];
  private static readonly LANDWATER: string[] = ['water', 'land'];
  private static readonly LANDTYPES: string[] = ['land1', 'land2', 'land3'];
  private static readonly WATERTYPES: string[] = ['water1', 'water2', 'water3'];

  // TODO: see if improvemets can be made using this resouce https://www.freecodecamp.org/news/how-to-use-the-builder-pattern-in-python-a-practical-guide-for-devs/
  constructor(inputData: string, algo: string) {
    if (!Schedule.ALGOS.includes(algo)) {
      throw new Error(`${algo} is not a supported Camp Scheduler algorithm`);
    }
    this.inputData = inputData;
    this.algo = algo;
    this.kids = new Kids(this.inputData);
    this.notScheduled9amWater = this.notScheduledConstructor(true);
    this.notScheduled10amWater = this.notScheduledConstructor(false);
    this.notScheduledAllNamesWater = structuredClone(this.kids.names);
    this.notScheduled9amLand = this.notScheduledConstructor(true);
    this.notScheduled10amLand = this.notScheduledConstructor(false);
    this.notScheduledAllNamesLand = structuredClone(this.kids.names);
    this.water9am = Activities.water9am;
    this.water10am = Activities.water10am;
    this.land9am = Activities.land9am;
    this.land10am = Activities.land10am;
  }

  /**
   * Create object that contains the names of kids who are not yet scheduled for an activity,
   * and also land or water activities that have not been scheduled.
   * @param {boolean} nineAm - true if the time slot is 9am, false if it's 10am.
   * @returns {NotScheduled} e.g {names: ['doe john', 'doe jane'...], landActivities: ['fball', 'arch'...], waterActivities: ['fish', 'canoe'...]}
   */
  private notScheduledConstructor(nineAM = true): NotScheduled {
    const nineOrTen = nineAM
      ? structuredClone(Activities.land9amActs)
      : structuredClone(Activities.land10amActs);
    const notScheduled: NotScheduled = {
      names: structuredClone(this.kids.names),
      landActivities: structuredClone(nineOrTen),
      waterActivities: structuredClone(Activities.waterActs),
    };
    return notScheduled;
  }

  /**
   * Get a map of how many kids are scheduled to each activity for given activity type and time slot.
   * There are 4 total options base on the parameters: land9am, land10am, water9am, water10am.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options: '9am' or '10am'.
   * @param {boolean} showZero - whether to include activities with zero kids scheduled.
   * @returns {Map<string, number>} a map of the how many kids are scheduled to each activity.
   */
  private scheduledActivityCount(activityType: AllowedActivityTypes, timeSlot: AllowedTimes, showZero: boolean): Map<string, number> {
    let activityTimeSlot = activityType === 'water' ? this.water9am : timeSlot === '9am' ? this.land9am : this.land10am;
    if (activityType === 'water') {
      if (timeSlot === '10am') {
        activityTimeSlot = this.water10am;
      }
    }
    if (activityType === 'land') {
      if (timeSlot === '10am') {
        activityTimeSlot = this.land10am;
      }
    }

    const activityCount = new Map<string, number>();
    for (const activity in activityTimeSlot) {
      if (!showZero && activityTimeSlot[activity].length === 0) {
          continue;
      } else {
          activityCount.set(activity, activityTimeSlot[activity].length);
      }
    }
    return activityCount;
  }

  /**
   * Get the right Activities object based on the activity type and time slot.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options: '9am' or '10am'.
   * @returns {Activities} - The corresponding Activities object.
   */
  private getActivityTypeTimeSlot(activityType: AllowedActivityTypes, timeSlot: AllowedTimes): WaterKids | LandKidsAM | LandKidsPM {
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
   * Get an array of all the scheduled kids names who got their choice for a specific choice number.
   * e.g if we are looking at choiceNum 1 and 'kevin' was actually scheduled to his first choice, then he is added to the array
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options: '9am' or '10am'.
   * @param {number} choiceNum - only 3 choice options: 1, 2, or 3.
   * @returns {string[]} - Array of all scheduled kids names who got their choice for a specific choice number, for specific activity type and time slot.
   */
  private getScheduledChoicesNames(activityType: AllowedActivityTypes, timeSlot: AllowedTimes, choiceNum: AllowedChoiceNums): string[] {
    const activityTypeTimeSlot = this.getActivityTypeTimeSlot(activityType, timeSlot);

    let choice: string = 'water1';
    if (activityType === 'water') {
      if (choiceNum === 2) {
        choice = 'water2'
      }
      if (choiceNum === 3) {
        choice = 'water3'
      }
    }

    if (activityType === 'land') {
      if (choiceNum === 1) {
        choice = 'land1'
      }
      if (choiceNum === 2) {
        choice = 'land2'
      }
      if (choiceNum === 3) {
        choice = 'land3'
      }
    }

    const namesChoice: string[] = [];
    for (const [activity, names] of Object.entries(activityTypeTimeSlot)) {
      names.forEach((name) => {
        const kidData = this.kids.data.get(name)
        if (kidData.choices[choice] === activity) {
          namesChoice.push(name);
        }
      })
      };
    return namesChoice
  }

  /**
   * Get Map of scheduled activities that have more kids than the minimum required.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options: '9am' or '10am'.
   * @returns {Map} - activity plus the number of kids scheduled above the min threshold: e.g {'swim': 3, 'fish': 8, ...}
   */
  private getKidsScheduleAboveMin(activityType: AllowedActivityTypes, timeSlot: AllowedTimes): Map<string, [number, string[]]> {
    const scheduledAboveMin = new Map<string, [number, string[]]>();
    const activityRange = activityType === 'land' ? Activities.landRanges : Activities.waterRanges
    const activityTimeSlot = this.getActivityTypeTimeSlot(activityType, timeSlot);
    for (const [activity, names] of Object.entries(activityTimeSlot)) {
      if (names.length > activityRange[activity][0]) {
        const aboveMinCount = names.length - activityRange[activity][0];
        scheduledAboveMin.set(activity, [aboveMinCount, names])
      };
    };
    return scheduledAboveMin;
  }

  /**
   * Constructs Map of 'land' or 'water' activities that have not been scheduled yet with default count of 0.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @returns {Map} - e.g for water activities: {'swim': 0, 'fish': 0, ...}
   */
  private activityTemplate(activityType: AllowedActivityTypes, timeSlot: Allowed9and10Only): Map<string, number> {
    const choicesCount = new Map<string, number>();
    if (activityType === 'land') {
      let notScheduledLandActivities: string[]
      if (timeSlot === "9am") {
        notScheduledLandActivities = [...new Set([...this.notScheduled9amWater.landActivities])];
      } else if (timeSlot === "10am") {
        notScheduledLandActivities = [...new Set([...this.notScheduled10amWater.landActivities])];
      } else {
        notScheduledLandActivities = [...new Set([...this.notScheduled9amWater.landActivities, ...this.notScheduled10amWater.landActivities])];
      }
      Activities.landActs.forEach(activity => {
        if (notScheduledLandActivities.includes(activity)) {
          choicesCount.set(activity, 0);
        }
      });
    }
    if (activityType === 'water') {
      let notScheduledWaterActivities: string[]
      if (timeSlot === "9am") {
        notScheduledWaterActivities = [...new Set([...this.notScheduled9amWater.waterActivities])];
      } else if (timeSlot === "10am") {
        notScheduledWaterActivities = [...new Set([...this.notScheduled10amWater.waterActivities])];
      } else {
        notScheduledWaterActivities = [...new Set([...this.notScheduled9amWater.waterActivities, ...this.notScheduled10amWater.landActivities])];
      }
      Activities.waterActs.forEach(activity => {
        if (notScheduledWaterActivities.includes(activity)) {
          choicesCount.set(activity, 0);
        }
      });
    }
    return choicesCount;
  }

  /**
   * Count how many kids have chosen a specific activity as one of their choices.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} activity - activity such as 'canoe', 'pboard' or 'bball;
   * @returns {number} - simple int of the count
   */
  private howManyToSpareHaveActivityAsAChoice(activityType: AllowedActivityTypes, activity: LandActivities | WaterActivities, kidsToSpare: Map<string, [number, string[]]>): number {
    const ACTIVITY_TYPES = activityType === 'water' ? Schedule.WATERTYPES : Schedule.LANDTYPES;
    let count = 0;
    kidsToSpare.forEach(kids => {
      kids[1].forEach(kid => {
        const theKid = this.kids.data.get(kid)
        for (const [kidActivityType, kidActivity] of Object.entries(theKid.choices)) {
          if (ACTIVITY_TYPES.includes(kidActivityType)) {
            if (kidActivity === activity) {
              count += 1;
            }
          }
        }
      });
    });
    return count;
  }

  /**
   * Sorts activities by shortfall from minimum requirement.
   * @param {Map<string,number>} notScheduledActivites - num of choices to count between 1 - 3.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @returns {Map<string, number>} - e.g {'swim': 3, 'fish': 2, ...}
   */
  private sortActivitiesByShortfall(notScheduledActivities: Map<string, number>, activityType: AllowedActivityTypes): Map<string, number> {
    const activityRanges = activityType === 'water' ? Activities.waterRanges : Activities.landRanges;
    const shortfallFromMin: Map<string, number> = new Map();
    notScheduledActivities.forEach((activityCount, activity) => {
      const activityMin = activityRanges[activity][0];
      if (activityMin - activityCount > 0) {
        shortfallFromMin.set(activity, activityMin - activityCount);
      }
    });
    return new Map([...shortfallFromMin.entries()].sort((a, b) => a[1] - b[1]));
  }

  /**
   * Counts how many times unscheduled kids have chosen a specfic activity.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number[]} choices - num of choices to count between 1 - 3.
   * @param {string} timeSlot - only 2 options: '9am' or '10am'.
   * @returns {Map} - e.g {'swim': 39, 'fish': 9, ...} how many unscheduled kids chose each activity
   */
  private countActivityChoices(activityType: AllowedActivityTypes, choices: AllowedChoices, timeSlot: AllowedTimes) {
    const ACTIVITY_TYPES = activityType === 'water' ? Schedule.WATERTYPES : Schedule.LANDTYPES;
    const UNSCHEDULED_NAMES = activityType === 'water' ? this.notScheduledAllNamesWater : this.notScheduledAllNamesLand;
    const activitiesChoicesCount = this.activityTemplate(activityType, timeSlot);
    for (let i = 0; i < choices.length; i++) {
      UNSCHEDULED_NAMES.forEach(kid => {
        const kidsData = this.kids.data.get(kid);
        // TODO fix type error
        const activity = kidsData.choices[ACTIVITY_TYPES[choices[i] - 1].toLowerCase();
        if (activitiesChoicesCount.has(activity)) {
          const currentActivityCount = activitiesChoicesCount.get(activity);
          const newActivityCount = currentActivityCount + 1;
          activitiesChoicesCount.set(activity, newActivityCount);
        }
      });
    }
    return activitiesChoicesCount;
  }

  /**
   * Establishes which choice to count out of 6 options: land1, land2, land3, water1, water2, water3
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number[]} ChoiceNum - land or water choice 1, 2 or 3
   * @returns {string} - returns specific activity choice such as 'land1' or 'water3' etc.
   */
  // TODO: choiceNum argument may cause a bug. The original argument passed in is called
  // numOfChoices which refers to the number of choices between 1 or 2 or 3 total choices.

  private getKidsChoice(activityType: AllowedActivityTypes, choiceNum: AllowedChoiceNums): string {
    const ACTIVITY_TYPES = activityType === 'water' ? Schedule.WATERTYPES : Schedule.LANDTYPES;
      return ACTIVITY_TYPES[choiceNum - 1];
  }

  /**
   * Get an array of kids who have chosen a specific activity from their 1st, 2nd or 3rd choice.
   * @param {string} activity- land or water activity such as 'canoe', 'swim', 'fball' ...
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number[]} ChoiceNum - kids land or water choice 1st, 2nd or 3rd
   * @returns {string[]} - Array of kids names who chose the activity
   */
  private getKidsbyActivityChoice(
    activity: LandActivities | WaterActivities,
    activityType: AllowedActivityTypes,
    choiceNum: AllowedChoiceNums
  ): string[] {
    const choice: string = this.getKidsChoice(activityType, choiceNum);
    const matchedKids: string[] = [];
    const unscheduledKidsNames = activityType === 'land' ? this.notScheduledAllNamesLand : this.notScheduledAllNamesWater;
    unscheduledKidsNames.forEach(name => {
      const kidsChoices = this.kids.data.get(name);
      // TODO: fix type error
      if (kidsChoices.choices[choice].toLowerCase() === activity) {
        matchedKids.push(name);
      }
    });
    return matchedKids;
  }

  /**
   * Filter scheduled activities that are below (but not equal to) max capacity,
   * so we can see which activities we can add more kids to.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options -'9am' or '10am'
   * @returns {Map<string, number>} - Map of activity names and their number open slots
   */
  private getActivitiesBelowMax(activityType: AllowedActivityTypes, timeSlot: AllowedTimes): Map<string, number> {
    const openSlots = new Map<string, number>();
    const scheduledCount = this.scheduledActivityCount(activityType, timeSlot, false)
    for (const [activity, count] of scheduledCount) {
      const activityMax = Activities.waterRanges[activity][1]
      if (count < activityMax) {
        openSlots.set(activity, activityMax - count);
      }
    }
    return openSlots;
  }

  /**
   * Filter scheduled activities that are above (but not equal to) minimum capacity,
   * so we can see which activities we can take kids from.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options -'9am' or '10am'
   * @returns {Map<string, number>} - Map of activity names and their number of kids above minimum capacity
   */
  private getActivitiesAboveMin(activityType: AllowedActivityTypes, timeSlot: AllowedTimes): Map<string, number> {
    const aboveMin = new Map<string, number>();
    const scheduledCount = this.scheduledActivityCount(activityType, timeSlot, false)
    for (const [activity, count] of scheduledCount) {
      const activityMin = activityType === 'water' ? Activities.waterRanges[activity][0] : Activities.landRanges[activity][0];
      if (count > activityMin) {
        aboveMin.set(activity, count - activityMin);
      }
    }
    return aboveMin;
  }

  /**
   * Get kids who can be rescheduled for a specific activity and time slot.
   * This will be kids that are scheduled to an activity that is above the minimum count
   * for an activty and can spare kids.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options -'9am' or '10am'
   * @param {number[]} choices - num of choices to count in any combo of 1 thru 3: [[1], [2], [3], [1, 2], [1, 2], [1, 3], [1, 2, 3]]
   * @returns {string[]} - array of kids names who can be rescheduled
   */
  private getKidsWhoCanReschedule(activityType: AllowedActivityTypes, activity: LandActivities | WaterActivities, timeSlot: AllowedTimes, choices: AllowedChoices): Array<string> {
    let scheduledActivities = null;
    if (activityType === 'land') {
      scheduledActivities = timeSlot === '9am' ? this.land9am : this.land10am
    } else if (activityType === 'water') {
      scheduledActivities = timeSlot === '9am' ? this.water9am : this.water10am
    }
    const activitiesAboveMin = this.getActivitiesAboveMin(activityType, timeSlot)
    const kidsWhoCanReschedule = new Array;
    for (const [activityAboveMin, count] of activitiesAboveMin) {
      const scheduledKids = scheduledActivities[activityAboveMin]
      for (const kid of scheduledKids) {
        for (const choice of choices) {
          const kidsData = this.kids.data.get(kid)
          const kidsChoices = kidsData.choices
          const kidsChoice = activityType === 'land' ? Object.keys(kidsChoices)[choice - 1] : Object.keys(kidsChoices)[choice + 2]
          if (kidsChoices[kidsChoice] === activity) {
            kidsWhoCanReschedule.push(kid)
          }
        }
      }
    }
    return kidsWhoCanReschedule;
  }

  /**
   * Get random selection of elements from an Array.
   * If more kids want to attend an activity than there are slots, we need to randomly choose from them to
   * to avoid any selection bias.
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

  private removeElementsFromArray(arr: string[], elementsToRemove: string[]): void {
    const setOfElementsToRemove = new Set(elementsToRemove);
    for (let i = arr.length - 1; i >= 0; i--) {
      if (setOfElementsToRemove.has(arr[i])) {
        arr.splice(i, 1);
      }
    }
  }

  /**
   * Set activity for kids' time slot.
   * @param {string[]} names - Array of kid names to set activity for.
   * @param {string} activity - activity such as "fball", "canoe", "swim"
   * @param {number} activityTimeSlot - integers 9 and 10 only, representing 9am or 10am
   * @returns {void}
   */
  private setKidsTimeSlot(
    names: string[],
    activity: LandActivities | WaterActivities,
    activityTimeSlot: AllowedActivityTimes
  ): void {
    names.forEach((name) => {
      const kid = this.kids.data.get(name)
      kid.timeSlots[activityTimeSlot] = activity;
    });
  }

  /**
   * Set activity for kids' time slot.
   * @param {string} name - kids name in format "<last> <first>" e.g "Jones Tom"
   * @returns {object} - Object with time slot as key and activity as value
   */
  const getAssignedActivities(name: string[]): object {
    const kidsData = this.kids.data.get(name)
    const kidsAssignedActivities = {};
    for (const timeSlot in kidsData.timeSlots) {
      if (kidsData.timeSlots[timeSlot] !== null) {
        kidsAssignedActivities[timeSlot] = kidsData.timeSlots[timeSlot]
      }
    }
    return kidsAssignedActivities
  }

  /**
   * Remove names and activites from notScheduled lists (because they are scheduled)
   * @param {string[]} names - Array of names to be removed from notScheduled lists
   * @param {string} activityType - Type of activity: either 'land' or 'water'
   * @param {string} activity - activity such as "fball", "canoe", "swim"
   * @param {number} timeSlot - integers 9 and 10 only, representing 9am or 10am
   * @returns {void}
   */
  private removeScheduled(
    names: string[],
    activityType: string,
    activity: LandActivities | WaterActivities,
    timeSlot: AllowedTimes
  ): void {
    // TODO: fix all type errors within this method
    this.removeElementsFromArray(this.notScheduledAllNamesWater, names);
      // Remove names and activities from 9am timeslots
    if (timeSlot === '9am') {
      this.removeElementsFromArray(this.notScheduled9amWater.names, names);
      if (activityType === 'water') {
        const activityIdx = this.notScheduled9amWater.waterActivities.indexOf(activity)
        this.notScheduled9amWater.waterActivities.splice(activityIdx, 1)
      }
      if (activityType === 'land') {
        const activityIdx = this.notScheduled9amWater.landActivities.indexOf(activity)
        this.notScheduled9amWater.landActivities.splice(activityIdx, 1)
      }
    }
      // Remove names and activities from 10am timeslots
      if (timeSlot === '10am') {
        this.removeElementsFromArray(this.notScheduled10amWater.names, names);
      if (activityType === 'land') {
        const activityIdx = this.notScheduled10amWater.landActivities.indexOf(activity)
        this.notScheduled10amWater.landActivities.splice(activityIdx, 1)
      }
      if (activityType === 'water') {
        const activityIdx = this.notScheduled10amWater.waterActivities.indexOf(activity)
        this.notScheduled10amWater.waterActivities.splice(activityIdx, 1)
      }
    }
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
        kidsByActivityChoice = this.getKidsbyActivityChoice(activity, activityType, choiceNum[0]);
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
        // if (kidsTimeSlot.length >gcc Activities.)
        kidsTimeSlot = kidsByActivityChoice
      }

      if (activityType === 'water') {
        const timeSlot = this.notScheduled10amWater.names.length >= this.notScheduled9amWater.names.length ? '10am' : '9am';
        if (timeSlot === '9am') {
          this.water9am[activity] = kidsTimeSlot;
          this.removeScheduled(kidsTimeSlot, activityType, activity, '9am');
          this.setKidsTimeSlot(kidsTimeSlot, activity, 'water9am')
        }
        if (timeSlot === '10am') {
          this.water10am[activity] = kidsTimeSlot;
          this.removeScheduled(kidsTimeSlot, activityType, activity, '10am');
          this.setKidsTimeSlot(kidsTimeSlot, activity, 'water10am')
        }
      }

      if (activityType === 'land') {
        const timeSlot = this.notScheduled10amWater.names.length >= this.notScheduled9amWater.names.length ? '10am' : '9am';
        if (timeSlot === '9am') {
          this.land9am[activity] = kidsTimeSlot;
          this.removeScheduled(kidsTimeSlot, activityType, activity, '9am');
          this.setKidsTimeSlot(kidsTimeSlot, activity, 'land9am')
        }
        if (timeSlot === '10am') {
          this.land10am[activity] = kidsTimeSlot;
          this.removeScheduled(kidsTimeSlot, activityType, activity, '10am');
          this.setKidsTimeSlot(kidsTimeSlot, activity, 'land10am')
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
        kidsByActivityChoice = this.getKidsbyActivityChoice(activity, activityType, choiceNum[0]);
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
        if (this.notScheduled9amWater.names.length > this.notScheduled10amWater.names.length) {
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
        this.setKidsTimeSlot(kidsNineAM, activity, 'water9am')
        this.setKidsTimeSlot(kidsTenAM, activity, 'water10am')
      }
      if (activityType === 'land') {
        this.land9am[activity] = kidsNineAM;
        this.land10am[activity] = kidsTenAM;
        this.setKidsTimeSlot(kidsNineAM, activity, 'land9am')
        this.setKidsTimeSlot(kidsTenAM, activity, 'land10am')
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
    doubleOrSingle: AllowedDoubleSingle,
    timeSlot: AllowedTimes
  ): string[] {
    const countedChoices = this.countActivityChoices(activityType, choices, timeSlot);
    const qualifiedActivities: string[] = [];
    const ranges = activityType === 'land' ? Activities.landRanges : Activities.waterRanges;
    const minCountQualifier = this.getActivityCountQualifier(maxOrMin, doubleOrSingle);
    for (const [activity, range] of Object.entries(ranges)) {
      if (countedChoices.get(activity) >= range[minCountQualifier]) {
        qualifiedActivities.push(activity);
      }
    }
    return qualifiedActivities;
  }

  /**
   * Schedule activities where kids choices are enough to
   * fulfill at least the bare minumim required numbers for a single timeslot.
   * single time slots but not enough to max out both timeslots.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number[]} choices - num of choices to count in any combo of 1 thru 3: [[1], [2], [3], [1, 2], [1, 2], [1, 3], [1, 2, 3]]
   * @param {string}  maxOrMin - true = doubleMax, false = doubleMin
   * @returns {boolean} true if activities were scheduled, false if not enough kids chose the activity
   */
  private scheduleSingleMin(
    activityType: AllowedActivityTypes,
    choices: AllowedChoices,
    maxOrMin: AllowedMaxMin,
  ): boolean {
    const activitiesAboveSingleMin: string[] = this.getActivities(activityType, choices, maxOrMin, 'single', 'both');
    if (activitiesAboveSingleMin.length > 0) {
      console.log('Activities above single minimum:', activitiesAboveSingleMin);
      this.scheduleSingleActivities(activitiesAboveSingleMin, activityType, choices, maxOrMin);
      return true;
    }
    return false;
  }

  /**
   * Schedule activities that are in both 9am and 10am and enough kids have chosen them to
   * fulfill the bare minimum numbers required for that activity.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number[]} choices - num of choices to count in any combo of 1 thru 3: [[1], [2], [3], [1, 2], [1, 2], [1, 3], [1, 2, 3]]
   * @param {string}  maxOrMin - true = doubleMax, false = doubleMin
   * @returns {boolean} true if activities were scheduled, false if not enough kids chose the activity
   */
  private scheduleDoubleMin(
    activityType: AllowedActivityTypes,
    choices: AllowedChoices,
    maxOrMin: AllowedMaxMin,
  ): boolean {
    const activitiesAboveDoubleMin: string[] = this.getActivities(activityType, choices, maxOrMin, 'double', 'both');
    if (activitiesAboveDoubleMin.length > 0) {
      console.log('Activities above double minimum:', activitiesAboveDoubleMin);
      this.scheduleDoubleActivities(activitiesAboveDoubleMin, activityType, choices, maxOrMin);
      return true;
    }
    return false;
  }

  /**
   * Schedule activities where there are more kids who have chosen them than there are open slots for a
   * single time slots but not enough to max out both timeslots.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number[]} choices - num of choices to count in any combo of 1 thru 3: [[1], [2], [3], [1, 2], [1, 2], [1, 3], [1, 2, 3]]
   * @param {string}  maxOrMin - true = doubleMax, false = doubleMin
   * @returns {boolean} true if activities were scheduled, false if not enough kids chose the activity
   */
  private scheduleSingleMax(
    activityType: AllowedActivityTypes,
    choices: AllowedChoices,
    maxOrMin: AllowedMaxMin,
  ): boolean {
    const activitiesAboveSingleMax: string[] = this.getActivities(activityType, choices, maxOrMin, 'single', 'both');
    if (activitiesAboveSingleMax.length > 0) {
      console.log('Activities above single maximum:', activitiesAboveSingleMax);
      this.scheduleSingleActivities(activitiesAboveSingleMax, activityType, choices, maxOrMin);
      return true;
    }
    return false;
  }

  /**
   * Schedule activities that are in both 9am and 10am and more kids have chosen them than there are open slots
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number[]} choices - num of choices to count in any combo of 1 thru 3: [[1], [2], [3], [1, 2], [1, 2], [1, 3], [1, 2, 3]]
   * @param {string}  maxOrMin - true = doubleMax, false = doubleMin
   * @returns {boolean} true if activities were scheduled, false if not enough kids chose the activity
   */
  private scheduleDoubleMax(
    activityType: AllowedActivityTypes,
    choices: AllowedChoices,
    maxOrMin: AllowedMaxMin,
  ): boolean {
    const activitiesAboveDoubleMax: string[] = this.getActivities(activityType, choices, maxOrMin, 'double', 'both');
    if (activitiesAboveDoubleMax.length > 0) {
      console.log('Activities above doulbe maximum:', activitiesAboveDoubleMax);
      this.scheduleDoubleActivities(activitiesAboveDoubleMax, activityType, choices, maxOrMin);
      return true;
    }
    return false;
  }

  /**
   * Precursor to scheduleDoubleMax and scheduleDoubleMin methods.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number[]} choices - num of choices to count in any combo of 1 thru 3: [[1], [2], [3], [1, 2], [1, 2], [1, 3], [1, 2, 3]]
   * @param {string}  maxOrMinSched - 3 options: 'maxOnly', 'minOnly', 'bothMinAndMax'
   * @returns {boolean} true if 1 or more activities were scheduled, false if not activity is schedule.
   */
  private scheduleDoubles(
    activityType: AllowedActivityTypes,
    choices: AllowedChoices,
    maxOrMinSched: AllowedMaxMinSched,
  ): boolean {
    // TODO - remove line below and the console.log logic below that relies on it.
    let result = false;
    for (let i = 1; i < choices.length + 1; i++) {
      switch (maxOrMinSched) {
        case 'maxOnly':
        result = this.scheduleDoubleMax(activityType, choices.slice(0, i), 'max')
        if (result) {
          console.log(`this.scheduleDoubleMax(${activityType}, ${choices.slice(0, i)}, 'max') ran successfully`)
        }
        case 'minOnly':
        result = this.scheduleDoubleMin(activityType, choices.slice(0, i), 'min')
        if (result) {
          console.log(`this.scheduleDoubleMin($${activityType}, ${choices.slice(0, i)}, 'min' ran successfully`)
        }
        case 'bothMinAndMax':
        result = this.scheduleDoubleMax(activityType, choices.slice(0, i), 'max')
        if (result) {
          console.log(`this.scheduleDoubleMax(${activityType}, ${choices.slice(0, i)}, 'max') ran successfully`)
        }
        result = this.scheduleDoubleMin(activityType, choices.slice(0, i), 'min')
        if (result) {
          console.log(`this.scheduleDoubleMin($${activityType}, ${choices.slice(0, i)}, 'min' ran successfully`)
        }
      }
    }
    return result;
  }

/**
  * Precursor to scheduleSingleMax and scheduleSinlgeMin methods.
  * @param {string} activityType - only 2 options: 'land' or 'water'.
  * @param {number[]} choices - num of choices to count in any combo of 1 thru 3: [[1], [2], [3], [1, 2], [1, 2], [1, 3], [1, 2, 3]]
  * @param {string}  maxOrMinSched - 3 options: 'maxOnly', 'minOnly', 'bothMinAndMax'
  * @returns {boolean} true if 1 or more activities were scheduled, false if not activity is schedule.
  */
  private scheduleSingles(
    activityType: AllowedActivityTypes,
    choices: AllowedChoices,
    maxOrMinSched: AllowedMaxMinSched,
  ): boolean {
    // TODO - remove line below and the console.log logic below that relies on it.
    let result = false;
    for (let i = 1; i < choices.length + 1; i++) {
      switch (maxOrMinSched) {
        case 'maxOnly':
        result = this.scheduleSingleMax(activityType, choices.slice(0, i), 'max')
        if (result) {
          console.log(`this.scheduleSingleMax(${activityType}, ${choices.slice(0, i)}, 'max') ran successfully`)
        }
        case 'minOnly':
        result = this.scheduleSingleMin(activityType, choices.slice(0, i), 'min')
        if (result) {
          console.log(`this.scheduleSingleMin($${activityType}, ${choices.slice(0, i)}, 'min' ran successfully`)
        }
        case 'bothMinAndMax':
        result = this.scheduleSingleMax(activityType, choices.slice(0, i), 'max')
        if (result) {
          console.log(`this.scheduleSingleMax(${activityType}, ${choices.slice(0, i)}, 'max') ran successfully`)
        }
        result = this.scheduleSingleMin(activityType, choices.slice(0, i), 'min')
        if (result) {
          console.log(`this.scheduleSingleMin($${activityType}, ${choices.slice(0, i)}, 'min' ran successfully`)
        }
      }
    }
    return false;
  }

  private scheduleBelowMin(activityType: AllowedActivityTypes): void {
    const unscheduledActivitiesCount = this.countActivityChoices(activityType, [1, 2, 3], '9am')
    let keysToDelete = []
    for (const [activity, count] of unscheduledActivitiesCount.entries()) {
      if (count === 0) {
        keysToDelete.push(activity)
      }
    }
    // Delete activities with 0 count. This means none of the unscheduled kids have chosen this activity at 9am.
    for (const activity of keysToDelete) {
      unscheduledActivitiesCount.delete(activity)
    }

    const activityKids = {};
    for (const [activity, count] of unscheduledActivitiesCount) {
      console.log("HELLO THERE BUTTY", unscheduledActivitiesCount)
      console.log(activity)
      activityKids[activity] = []
      for (let i = 1; i <= 3; i++) {
        activityKids[activity].push(...this.getKidsbyActivityChoice(activity, activityType, i))
      }
    }
    console.log("ACTIVITY KIDS", activityKids)
    const kidsWhoCanReschedule = this.getKidsWhoCanReschedule('water', 'swim', '9am', [1, 2, 3]);
    console.log("KIDS WHO CAN RESCUDULE: ", kidsWhoCanReschedule)
  }

  private printDebugView(activityType: AllowedActivityTypes, detailed: boolean = false): void {
    const notScheduled9am = activityType === 'water' ? this.notScheduled9amWater : this.notScheduled9amLand;
    const notScheduled10am = activityType === 'water' ? this.notScheduled10amWater : this.notScheduled10amLand;
    const activityProperty = activityType === 'water' ? 'waterActivities' : 'landActivities';
    const notScheduledAllNames = activityType === 'water' ? this.notScheduledAllNamesWater : this.notScheduledAllNamesLand;
    console.log(`\n%%%${'-'.repeat(40)}%%%`)
    console.log(`BEGINNING OF ${activityType.toUpperCase()} VIEW SCHEDULE`);
    console.log(`TOTAL KIDS COUNT: `, this.kids.totalKidsCount);

    // activityType === 'water' ? console.log(this.water9am) : console.log(this.land9am);
    // activityType === 'water' ? console.log(this.water10am) : console.log(this.land10am);

    console.log('Kids left to schedule ', notScheduledAllNames.length);
    console.log(`Kids left to schedule for 9am ${activityType}: `, notScheduled9am.names.length - (this.kids.totalKidsCount / 2);
    console.log(`Kids left to schedule for 10am ${activityType}: `, notScheduled10am.names.length - (this.kids.totalKidsCount / 2));
    // console.log(`Kids count that are scheduled for ${activityType} at 9am:`, this.scheduledActivityCount(activityType, '9am', false))
    // console.log(`Kids count that are scheduled for ${activityType} at 10am:`, this.scheduledActivityCount(activityType, '10am', false))

    const filtered9am = this.countActivityChoices(activityType, [1, 2, 3], '9am')
    const filtered10am = this.countActivityChoices(activityType, [1, 2, 3], '10am')
    const shortfall9am = this.sortActivitiesByShortfall(filtered9am, activityType)
    const shortfall10am = this.sortActivitiesByShortfall(filtered10am, activityType)

    const scheudledBelowMax9am = this.getActivitiesBelowMax(activityType, '9am');
    const scheudledBelowMax10am = this.getActivitiesBelowMax(activityType, '10am');

    let kidsWhoCanReschedule = [];
    console.log(`\n\n${'*'.repeat(30)}`)
    console.log("***9AM SHORTFALL activities***")
    console.log(`Shortfall so far 9am ${activityType}: `, shortfall9am);
    console.log('Unscheduled 9am kids and their choices:', this.notScheduledAllNamesWater)
    console.log(`9am ${activityType} schedule below max: `, scheudledBelowMax9am);
    for (const [activity] of shortfall9am) {
      kidsWhoCanReschedule = this.getKidsWhoCanReschedule('water', activity, '9am', [1, 2, 3]);
      console.log("Activity to rescedule to:", activity)
      console.log("Kids who can reschedule:", kidsWhoCanReschedule)
    }
    console.log(`\n\n${'*'.repeat(30)}`)
    console.log("***10AM SHORTFALL activities***")
    console.log(`Shortfall so far 10am ${activityType}: `, shortfall10am);
    console.log(`10am ${activityType} schedule below max: `, scheudledBelowMax10am);
    for (const [activity] of shortfall10am) {
      kidsWhoCanReschedule = this.getKidsWhoCanReschedule('water', activity, '10am', [1, 2, 3]);
      console.log("Activity to rescedule to:", activity)
      console.log("Kids who can reschedule:", kidsWhoCanReschedule)
    }

    console.log("TIMESLOTS")
    let scheduledCount = 0;
    for (const name of this.kids.names) {
      const timeSlots = this.kids.data.get(name)
      for (const time in timeSlots.timeSlots) {
        if (timeSlots.timeSlots[time] !== null) {
          scheduledCount += 1;
          // console.log(name, time, timeSlots.timeSlots[time])
        }
      }
    }

    console.log("\nthis.kids.data.get(name).timeSlots Count:", scheduledCount)
    const totalKidsCount = this.kids.totalKidsCount - notScheduledAllNames.length
    if (scheduledCount !== totalKidsCount) {
      console.log("Scheduled # mismatch. this.Kids.timeSlots != this.kids.totalKidsCount: ")
      console.log(scheduledCount, "!==", totalKidsCount, "\n")
    }

    if (detailed) {
      for (const name of this.kids.names) {
        const result = this.getAssignedActivities(name)
        if (Object.keys(result).length > 0) {
          console.log(name, this.getAssignedActivities(name))
        }
      }
    }

    console.log("\n")
    console.log(`END OF ${activityType.toUpperCase()} VIEW SCHEDULE\n`);
    console.log(`${'-'.repeat(40)}`)
}

  runAlgo(): string {
    console.log(`${this.algo} algorithm initiated`);
    this.scheduleDoubles('water', [1, 2, 3], 'bothMinAndMax')
    this.scheduleSingles('water', [1, 2, 3], 'bothMinAndMax')
    this.scheduleBelowMin('water')

    this.printDebugView('land')
    this.printDebugView('water', true)
    return 'success'; }
  }
