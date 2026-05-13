import { Kids } from './kids';
import { Activities } from './activities';
import {
  NotScheduledLand,
  NotScheduledWater,
  NotScheduledActivities,
  AllActivities,
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
  LandActivities9am,
  LandActivities10am,
  ScheduledActivities,
  ScheduledLand9am,
  ScheduledLand10am,
  ScheduledWater,
  WaterOnly,
} from '../types/schedule-types';
import { Int } from '../types/basic-types';
import { KidsData } from '@src/types/kids-types';
import { LandKidsAM, LandKidsPM, LandRanges, WaterKids } from '../types/camp-types';

/**
Main class that schedules the kids to activities.
* @param {KidsData} Kids - Kids class that contains basic data about the kids attending camp
* @param {string} algo - name of algo that is being run to schedule kids
*/
export class Schedule {
  inputData: string;
  kids: Kids;
  schedule: KidsData;
  notScheduled9amWater: NotScheduledWater;
  notScheduled10amWater: NotScheduledWater;
  notScheduledAllNamesWater: string[];
  notScheduled9amLand: NotScheduledLand;
  notScheduled10amLand: NotScheduledLand;
  notScheduledAllNamesLand: string[];
  scheduled9amWater: ScheduledWater;
  scheduled9amLand: ScheduledLand9am;
  scheduled10amWater: ScheduledWater;
  scheduled10amLand: ScheduledLand10am;
  algo: string;
  water9am: WaterKids;
  water10am: WaterKids;
  land9am: LandKidsAM;
  land10am: LandKidsPM;


  // TODO: see if improvemets can be made using this resouce https://www.freecodecamp.org/news/how-to-use-the-builder-pattern-in-python-a-practical-guide-for-devs/
  constructor(kids: Kids, algo: string) {
    if (!Schedule.ALGOS.includes(algo)) {
      throw new Error(`${algo} is not a supported Camp Scheduler algorithm`);
    }
    this.algo = algo;
    this.kids = kids
    this.schedule = this.scheduleConstructor();
    this.notScheduled9amWater = this.notScheduledConstructor(true);
    this.notScheduled10amWater = this.notScheduledConstructor(false);
    this.notScheduledAllNamesWater = structuredClone(this.kids.names);
    this.notScheduled9amLand = this.notScheduledConstructor(true);
    this.notScheduled10amLand = this.notScheduledConstructor(false);
    this.notScheduledAllNamesLand = structuredClone(this.kids.names);
    this.water9am = structuredClone(Activities.water9am);
    this.water10am = structuredClone(Activities.water10am);
    this.land9am = structuredClone(Activities.land9am);
    this.land10am = structuredClone(Activities.land10am);
    this.scheduled9amWater = {names: [], waterActivities: []}
    this.scheduled9amLand = {names: [], landActivities: []}
    this.scheduled10amWater = {names: [], waterActivities: []}
    this.scheduled10amLand = {names: [], landActivities: []}
  }

  private static readonly ALGOS: string[] = ['waterFirst'];
  private static readonly LANDWATER: string[] = ['water', 'land'];
  private static readonly LANDTYPES: string[] = ['land1', 'land2', 'land3'];
  private static readonly WATERTYPES: string[] = ['water1', 'water2', 'water3'];

  /**
   * Create map: keys are kids names and values are the time slots they can be scheduled for.
   * @param {boolean} nineAm - true if the time slot is 9am, false if it's 10am.
   * @returns {NotScheduled} e.g {names: ['doe john', 'doe jane'...], landActivities: ['fball', 'arch'...], waterActivities: ['fish', 'canoe'...]}
   */
  private scheduleConstructor(): KidsData {
    const schedule: KidsData = new Map();
    this.kids.names.forEach((name) => {
      schedule.set(name, {
        timeSlots: {
          water9am: null,
          water10am: null,
          land9am: null,
          land10am: null,
        },
      });
    });
    return schedule;
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
        const kidData = this.kids[name]
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
    * Get list of all scheduled activities that have available slots for a given activity type and time slot.
    * @param {string} activityType - only 2 options: 'land' or 'water'.
    * @param {string} timeSlot - only 2 options: '9am' or '10am'.
    * @returns {Map<string, number>} - map of scheduled activities and a count of their available time slots.
    */
  private getScheduledActivitiesNotFull(activityType: AllowedActivityTypes, timeSlot: AllowedTimes): Map<string, number> {
    const scheduledActivities = this.getActivityTypeTimeSlot(activityType, timeSlot);
    const notFullActivities = new Map<string, number>();
    const activityRange = activityType === 'land' ? Activities.landRanges : Activities.waterRanges;
    for (const [activity, names] of Object.entries(scheduledActivities)) {
      if (names.length < activityRange[activity][1] && names.length > 0) {
        notFullActivities.set(activity, activityRange[activity][1] - names.length);
      };
    };
    return new Map([...notFullActivities.entries()].sort((b, a) => a[1] - b[1]));
  }

  /**
    * Get list of all scheduled activities that have all their available slots filled for a given activity type and time slot.
    * @param {string} activityType - only 2 options: 'land' or 'water'.
    * @param {string} timeSlot - only 2 options: '9am' or '10am'.
    * @returns {Map<string, number>} - map of scheduled activities and the count of their full time slots.
    */
  private getScheduledActivitiesFull(activityType: AllowedActivityTypes, timeSlot: AllowedTimes): Map<string, number> {
    const scheduledActivities = this.getActivityTypeTimeSlot(activityType, timeSlot);
    const fullActivities = new Map<string, number>();
    const activityRange = activityType === 'land' ? Activities.landRanges : Activities.waterRanges;
    for (const [activity, names] of Object.entries(scheduledActivities)) {
      if (names.length === activityRange[activity][1]) {
        fullActivities.set(activity, activityRange[activity][1]);
      };
    };
    return new Map([...fullActivities.entries()].sort((b, a) => a[1] - b[1]));
  }

  /**
    * Get list of all not scheduled activities for a given activity type and time slot.
    * @param {string} activityType - only 2 options: 'land' or 'water'.
    * @param {string} timeSlot - only 2 options: '9am' or '10am'.
    * @returns {Map<string, number>} - map of not scheduled activities and their remaining slots, e.g {'canoe', 10, 'pboard', 4}
    */
  private getNotScheduledActivities(activityType: AllowedActivityTypes, timeSlot: AllowedTimes): Map<string, number> {
    const scheduledActivities = this.getActivityTypeTimeSlot(activityType, timeSlot);
    const notScheduledActivities = new Map<string, number>();
    const activityRange = activityType === 'land' ? Activities.landRanges : Activities.waterRanges;
    for (const [activity, names] of Object.entries(scheduledActivities)) {
      if (names.length === 0) {
        notScheduledActivities.set(activity, activityRange[activity][1]);
      };
    };
    return new Map([...notScheduledActivities.entries()].sort((b, a) => a[1] - b[1]));
  }

  private removeNotChosenActivitiesFromScheduledNotFull(activityType: AllowedActivityTypes, scheduledNotFull: Map<string, number>, notScheduledAllNames: string[]): Map<string, number>{
    const activities = activityType === 'land' ? Schedule.LANDTYPES : Schedule.WATERTYPES;
    const chosenList: string[] = new Array
    for (const name of notScheduledAllNames) {
      for (const activity of activities) {
        if (scheduledNotFull.has(this.kids.choices[name][activity])) {
          if (chosenList.includes(this.kids.choices[name][activity])) {
            continue
          }
          chosenList.push(this.kids.choices[name][activity])
        }
      }
    }
    for (const activity of scheduledNotFull.keys()) {
      if (!chosenList.includes(activity)) {
        scheduledNotFull.delete(activity)
      }
    }
    return scheduledNotFull;
  }

  private getAllKidsChoicesByActivityType(name: string,activityType: AllowedActivityTypes): string[] {
    const activities = activityType === 'land' ? Schedule.LANDTYPES : Schedule.WATERTYPES;
    const choices = this.kids.choices[name];
    const kidsChoices: string[] = new Array
    for (const activity of activities) {
      kidsChoices.push(choices[activity])
    }
    return kidsChoices
  }

  private scheduleTheChosen(scheduledChosen: Map<string, number>, activityType: AllowedActivityTypes): Map<string, string[]> {
    const activities = activityType === 'land' ? Schedule.LANDTYPES : Schedule.WATERTYPES;
    const notScheduledAllNames = activityType === 'land' ? this.notScheduledAllNamesLand : this.notScheduledAllNamesWater;
    const chosenList: string[] = [...scheduledChosen.keys()];
    const uniqueChoice = new Map<string, string[]>();
    for (const activity of chosenList) {
      for (const name of notScheduledAllNames) {
        const kidsChoices = this.getAllKidsChoicesByActivityType(name, activityType);
        if (kidsChoices.includes(activity)) {
          const chosenListWithoutCurrentActivity = chosenList.filter(item => item !== activity);
          const kidsChoicesWithoutCurrentActivity = kidsChoices.filter(item => item !== activity);
          const areDisjoint = chosenListWithoutCurrentActivity.every(item => !kidsChoicesWithoutCurrentActivity.includes(item));
          if (areDisjoint) {
            if (uniqueChoice.has(activity)) {
              uniqueChoice.set(activity, [...uniqueChoice.get(activity)!, name]);
            } else {
              uniqueChoice.set(activity, [name]);
            }
          }
        }
      }
    }
    return uniqueChoice
  }

  /**
   * Constructs Map of 'land' or 'water' activities that have not been scheduled yet with default count of 0.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @returns {Map} - e.g for water activities: {'swim': 0, 'fish': 0, ...}
   */
  private activityTemplate(activityType: AllowedActivityTypes, timeSlot: Allowed9and10Only): Map<string, number> {
    const choicesCount = new Map<string, number>();
    const scheduledTimeActivity = activityType === "water" ? this.scheduled9amWater.waterActivities : timeSlot === "9am" ? this.scheduled9amLand.landActivities : this.scheduled10amLand.landActivities;
    const activitiesActs = activityType === 'water' ? Activities.waterActs : timeSlot === '9am' ? Activities.land9amActs : Activities.land10amActs;
    activitiesActs.forEach(activity => {
      if (!scheduledTimeActivity.includes(activity)) {
        choicesCount.set(activity, 0);
      }
    });
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
    return new Map([...shortfallFromMin.entries()].sort((b, a) => a[1] - b[1]));
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
        const kidsData = this.kids.choices[kid]
        // TODO fix type error
        const activity = kidsData[ACTIVITY_TYPES[choices[i] - 1].toLowerCase();
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
      const kidsChoices = this.kids.choices[name];
      // TODO: fix type error
      if (kidsChoices[choice].toLowerCase() === activity) {
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
    const scheduledCount = Schedule.scheduledActivityCount(activityType, timeSlot, false)
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
   * @param {string} activity - activity such as "fball", "canoe", "swim"
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
          const kidsData = this.kids.choices[kid]
          const kidsChoice = activityType === 'land' ? Object.keys(kidsData)[choice - 1] : Object.keys(kidsData)[choice + 2]
          if (kidsData[kidsChoice] === activity) {
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

  /**
   * Remove all items in one string array from another string array.
   * @param {string[]} arr - the Array to remove elements from
   * @param {string[]} elementsToRemove - the Array with the elements to remove
   * @returns {void}
   */
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
      const kid = this.schedule.get(name)
      kid.timeSlots[activityTimeSlot] = activity;
    });
  }

  /**
   * Set activity for kids' time slot.
   * @param {string} name - kids name in format "<last> <first>" e.g "Jones Tom"
   * @returns {object} - Object with time slot as key and activity as value
   */
  const getAssignedActivities(name: string[]): object {
    const kidsData = this.schedule.get(name)
    const kidsAssignedActivities = {};
    for (const timeSlot in kidsData.timeSlots) {
      if (kidsData.timeSlots[timeSlot] !== null) {
        kidsAssignedActivities[timeSlot] = kidsData.timeSlots[timeSlot];
      }
    }
    return kidsAssignedActivities
  }

  /**
   * Set activity for kids' time slot.
   * @param {string[]} names - kids that are getting moved from one timeslot activity to another.
   * @param {string} newActivity - new activity to assign to kids
   * @param {string} activityTimeSlot - time slot to update (e.g. 'land9am', 'water10am')
   * @returns {void}
   */
  private updateKidsScheduledActivity(
    names: string[],
    newActivity: LandActivities | WaterActivities,
    activityTimeSlot: AllowedActivityTimes
  ): void {
    for (const name of names) {
      const kidsData = this.schedule.get(name)
      const oldActivity = kidsData.timeSlots[activityTimeSlot]
      kidsData.timeSlots[activityTimeSlot] = newActivity
      let activityObj = null;
      switch (activityTimeSlot) {
        case 'land9am':
          activityObj = this.land9am
          break
        case 'land10am':
          activityObj = this.land10am
          break
        case 'water9am':
          activityObj = this.water9am
          break
        case 'water10am':
          activityObj = this.water10am
          break
      }
      const nameIndex = activityObj[oldActivity].indexOf(name)
      activityObj[oldActivity].splice(nameIndex, 1)
    }
  }

  /**
   * Remove names and activites from notScheduled lists (because they are scheduled)
   * @param {string[]} names - Array of names to be removed from notScheduled lists
   * @param {string} activityType - Type of activity: either 'land' or 'water'
   * @param {string} activity - activity such as "fball", "canoe", "swim"
   * @param {number} timeSlot - integers 9 and 10 only, representing 9am or 10am
   * @returns {void}
   */
  private removeFromNotScheduled(
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
        if (activityIdx !== -1) {
          this.notScheduled9amWater.waterActivities.splice(activityIdx, 1)
        }
      }
      if (activityType === 'land') {
        const activityIdx = this.notScheduled9amWater.landActivities.indexOf(activity)
        if (activityIdx !== -1) {
          this.notScheduled9amWater.landActivities.splice(activityIdx, 1)
        }
      }
    }
      // Remove names and activities from 10am timeslots
      if (timeSlot === '10am') {
        this.removeElementsFromArray(this.notScheduled10amWater.names, names);
      if (activityType === 'land') {
        const activityIdx = this.notScheduled10amWater.landActivities.indexOf(activity)
        if (activityIdx !== -1) {
          this.notScheduled10amWater.landActivities.splice(activityIdx, 1)
        }
      }
      if (activityType === 'water') {
        const activityIdx = this.notScheduled10amWater.waterActivities.indexOf(activity)
        if (activityIdx !== -1) {
          this.notScheduled10amWater.waterActivities.splice(activityIdx, 1)
        }
      }
    }
  }

  private AddToScheduled(
    names: string[],
    activityType: AllowedActivityTypes,
    activity: LandActivities | WaterActivities,
    timeSlot: AllowedTimes
  ): void {
    if (activityType === 'water') {
      if (timeSlot === '9am') {
        if (!this.scheduled9amWater.waterActivities.includes(activity)) {
          this.scheduled9amWater.waterActivities.push(activity)
        }
        this.scheduled9amWater.names.push(...names)
      } else {
        if (!this.scheduled10amWater.waterActivities.includes(activity)) {
          this.scheduled10amWater.waterActivities.push(activity)
        }
        this.scheduled10amWater.names.push(...names)
      }
    }
    if (activityType === 'land') {
      if (timeSlot === '9am') {
        if (!this.scheduled9amLand.landActivities.includes(activity)) {
          this.scheduled9amLand.landActivities.push(activity)
        }
        this.scheduled9amLand.names.push(...names)
      } else {
        if (!this.scheduled10amLand.landActivities.includes(activity)) {
          this.scheduled10amLand.landActivities.push(activity)
        }
        this.scheduled10amLand.names.push(...names)
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
    singleMaxActivities.forEach((activity: AllActivities, idx) => {
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
          this.removeFromNotScheduled(kidsTimeSlot, activityType, activity, '9am');
          this.AddToScheduled(kidsTimeSlot, activityType, activity, '9am')
          this.setKidsTimeSlot(kidsTimeSlot, activity, 'water9am')
        }
        if (timeSlot === '10am') {
          this.water10am[activity] = kidsTimeSlot;
          this.removeFromNotScheduled(kidsTimeSlot, activityType, activity, '10am');
          this.AddToScheduled(kidsTimeSlot, activityType, activity, '10am')
          this.setKidsTimeSlot(kidsTimeSlot, activity, 'water10am')
        }
      }

      if (activityType === 'land') {
        const timeSlot = this.notScheduled10amWater.names.length >= this.notScheduled9amWater.names.length ? '10am' : '9am';
        if (timeSlot === '9am') {
          this.land9am[activity] = kidsTimeSlot;
          this.removeFromNotScheduled(kidsTimeSlot, activityType, activity, '9am');
          this.AddToScheduled(kidsTimeSlot, activityType, activity, '10am')
          this.setKidsTimeSlot(kidsTimeSlot, activity, 'land9am')
        }
        if (timeSlot === '10am') {
          this.land10am[activity] = kidsTimeSlot;
          this.removeFromNotScheduled(kidsTimeSlot, activityType, activity, '10am');
          this.AddToScheduled(kidsTimeSlot, activityType, activity, '10am')
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

      this.removeFromNotScheduled(kidsNineAM, activityType, activity, '9am');
      this.AddToScheduled(kidsNineAM, activityType, activity, '9am')
      this.removeFromNotScheduled(kidsTenAM, activityType, activity, '10am');
      this.AddToScheduled(kidsTenAM, activityType, activity, '10am')

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
   * Add Kids to the schedule for activities that don't have enough kids to fufill the minumim number required.
   * Kids are taken from other activities to reach the minimum number required.
   * @param {string[]} kidsWhoCanReschedule - list of kids who can be taken from other schedule activities.
   * @param {number[]} notScheduledCount - number of kids needed to be taken from other activities to reach the minimum number required.
   * @param {string[]} activityKids - non-scheduled kids that are getting scheduled to the activity.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} activityTime - only 2 options expected: '9am', '10am'.
   * @param {string} activity - land or water activity such as 'canoe', 'swim', 'fball', etc.
   * @returns {void}
   */
  private scheduleBelowMinActivities(
    kidsWhoCanReschedule: string[],
    notScheduledCount: number,
    activityKids: string[],
    activityType: AllowedActivityTypes,
    activityTime: AllowedTimes,
    activity: LandActivities | WaterActivities
  ): void {
    const randomKids = this.randomChoices(kidsWhoCanReschedule, notScheduledCount)
    const allKidsToSchedule = activityKids.concat(randomKids)
    const activityTimeSlot = activityType + activityTime
    this.removeFromNotScheduled(activityKids, activityType, activity, activityTime)
    this.AddToScheduled(activityKids, activityType, activity, activityTime)
    this.updateKidsScheduledActivity(randomKids, activity, activityTimeSlot)
    this.setKidsTimeSlot(activityKids, activity, activityTimeSlot)
    if (activityType === 'water') {
      if (activityTime === '9am') {
        this.water9am[activity] = allKidsToSchedule;
      } else {
        this.water10am[activity] = allKidsToSchedule;
      }
    } else {
      if (activityTime === '9am') {
        this.land9am[activity] = allKidsToSchedule;
      } else {
        this.land10am[activity] = allKidsToSchedule;
      }
    }
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
    activityType: WaterOnly,
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

  /**
   * Get object containing activities that have not yet been scheduled and how many kids have chosen each activity.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options -'9am' or '10am'
   * @param {boolean} includeZero - if true, activities that kids haven't chosen will be included in the result.
   * @returns {Object<activity, shortfall from min kids required for activity} - Array of kids names who chose the activity
   */
  private getActivitiesBelowMin(activityType: AllowedActivityTypes, timeSlot: Allowed9and10Only, includeZero=false): Map<LandActivities | WaterActivities, number> {
    const notScheduledActivitiesCount
      = this.countActivityChoices(activityType, [1, 2, 3], timeSlot)

    if (!includeZero) {
      let keysToDelete = []
      for (const [activity, count] of notScheduledActivitiesCount
        .entries()) {
        if (count === 0) {
          keysToDelete.push(activity)
        }
      }
      // Delete activities with 0 count. This means none of the unscheduled kids have chosen this activity.
      for (const activity of keysToDelete) {
        notScheduledActivitiesCount
          .delete(activity)
      }
    }

    const shortfall = this.sortActivitiesByShortfall(notScheduledActivitiesCount, activityType)
    return shortfall
  }

  /**
   * Get kids that are not yet scheduled and have a chosen an activity from an array of activities
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} notScheduledActivities - land or water activities such as 'canoe', 'swim', 'fball' ...
   * @returns {Object<activity, [kids names]} - Array of kids names who chose the activity
   */
  private getNotScheduledKidsBelowMin(activityType: AllowedActivityTypes, notScheduledActivities: Array<LandActivities | WaterActivities>): Object {
    const activityKids = {};
    for (const activity of notScheduledActivities) {
      activityKids[activity] = []
      for (let i = 1; i <= 3; i++) {
        activityKids[activity].push(...this.getKidsbyActivityChoice(activity, activityType, i))
      }
    }
    return activityKids
  }

  private scheduleBelowMinTimeSlot(activityType: AllowedActivityTypes, timeSlot: AllowedTimes, notScheduledActivities: Array<NotScheduledActivities>): Array<NotScheduledActivities> {
    let activity: AllActivities
    let shortfallCount: number;
    for (const activityObj of notScheduledActivities) {
      if (activityObj.timeSlot === timeSlot) {
        activity = activityObj.activity
        shortfallCount = activityObj.shortFall
        break
      }
    if (!activity) {
      continue
    }
    const activityKids = this.getNotScheduledKidsBelowMin(activityType, [activity]);
    const kidsWhoCanReschedule= this.getKidsWhoCanReschedule(activityType, activity, timeSlot, [1, 2, 3]);
    this.scheduleBelowMinActivities(kidsWhoCanReschedule, shortfallCount, activityKids[activity], activityType, timeSlot, activity)
    }
    notScheduledActivities = notScheduledActivities.filter(obj => obj.activity !== activity);
    return notScheduledActivities
  }

  /**
   * Schedule activities where there are not enough kids to reach the minumum number of kids required.
   * Kids are taken from other activities to reach the minimum number required.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   */
  private scheduleBelowMin(activityType: AllowedActivityTypes): void {
    const notScheduledActivitiesCount9am = this.getActivitiesBelowMin(activityType, '9am');
    const notScheduledActivitiesCount10am = this.getActivitiesBelowMin(activityType, '10am');
    let notScheduledActivities: Array<NotScheduledActivities> = [];
    for (const [activity, count] of notScheduledActivitiesCount9am) {
      const activityObj: NotScheduledActivities = { activity: activity, shortFall: count, timeSlot: '9am'}
      notScheduledActivities.push(activityObj)
    }
    for (const [activity, count] of notScheduledActivitiesCount10am) {
      const activityObj: NotScheduledActivities = { activity: activity, shortFall: count, timeSlot: '10am'}
      notScheduledActivities.push(activityObj)
    }
    while (notScheduledActivities.length > 0) {
      if (this.notScheduled9amWater.names.length >= this.notScheduled10amWater.names.length) {
        notScheduledActivities = this.scheduleBelowMinTimeSlot(activityType, '9am', notScheduledActivities)
      } else {
        notScheduledActivities = this.scheduleBelowMinTimeSlot(activityType, '10am', notScheduledActivities)
      }
    }
  }

  /**
    * Schedule kids for a given activity type and time slot.
    * @param {string} activityType - only 2 options: 'land' or 'water'.
    * @param {string} activity - land or water activities such as 'canoe', 'kayak', 'fball', etc.
    * @param {string} timeSlot - only 2 options: '9am' or '10am'.
    * @param {string[]} kidsNames - array of the kids to schedule for the given activity.
    * @returns {Int} - number of kids scheduled for the given activity.
    */
  private scheduleKids(activityType: AllowedActivityTypes, activity: WaterActivities | LandActivities, timeSlot: AllowedTimes, kidsNames: string[]): Int {
    const activityTimeSlot = this.getActivityTypeTimeSlot(activityType, timeSlot);
    const activityRanges = activityType === 'water' ? Activities.waterRanges : Activities.landRanges;
    const numOfOpenSlots = activityRanges[activity][1] - activityTimeSlot[activity].length;
    const kidsToSchedule = kidsNames.slice(0, numOfOpenSlots);
    for (const name of kidsToSchedule) {
      activityTimeSlot[activity].push(name)
    }
    this.removeFromNotScheduled(kidsToSchedule, activityType, activity, timeSlot);
    this.AddToScheduled(kidsToSchedule, activityType, activity, timeSlot)
    this.setKidsTimeSlot(kidsToSchedule, activity, activityType + timeSlot)
    for (const name of kidsToSchedule) {
      const kid = this.schedule.get(name)
    }
    return kidsToSchedule.length
  }

  /**
    * Add kid to the appropriate not scheduled lists.
    * @param {string} name - name of kid to remove from lists.
    * @param {string} activityType - type of activity to remove from (water or land).
    * @param {string} timeSlot - time slot to remove the kid from (9am or 10am).
    * @returns {void}
    */
  private addKidToNotScheduled(name: string, activityType: AllowedActivityTypes, timeSlot: AllowedTimes): void {
    const allNames = activityType === 'water' ? this.notScheduledAllNamesWater : this.notScheduledAllNamesLand;
    allNames.push(name);
    if (activityType === 'water') {
      if (timeSlot === '9am') {
        this.notScheduled9amWater.names.push(name)
      } else {
        this.notScheduled10amWater.names.push(name)
      }
    }
    if (activityType === 'land') {
      if (timeSlot === '9am') {
        this.notScheduled9amLand.names.push(name)
      } else {
        this.notScheduled10amLand.names.push(name)
      }
    }
  }

  /**
    * Remove kid from an activity time slot (which is an array of kids names) e.g 'this.water9am['canoe']' of 'this.land10am['pboard']'
    * @param {string} name - name of kid to remove from activity..
    * @param {string} activity - activity to remove the kid from ('canoe, 'pboard', etc).
    * @param {string} activityType - type of activity to remove from (water or land).
    * @param {string} timeSlot - time slot to remove the kid from (9am or 10am).
    * @returns {void}
    */
  private removeKidFromActivity(name: string, activity: WaterActivities | LandActivities, activityType: AllowedActivityTypes, timeSlot: Allowed9and10Only): void {
    const activityTimeSlot = this.getActivityTypeTimeSlot(activityType, timeSlot);
    const index = activityTimeSlot[activity].indexOf(name);
    if (index !== -1) {
      activityTimeSlot[activity].splice(index, 1);
    }
  }

  /**
    * Add kid to an activity time slot (which is an array of kids names) e.g 'this.water9am['canoe']' of 'this.land10am['pboard']'
    * @param {string} name - name of kid to add to activity.
    * @param {string} activity - activity to schedule the kid to ('canoe, 'pboard', etc).
    * @param {string} activityType - type of activity to schedule to (water or land).
    * @param {string} timeSlot - time slot to schedule the kid to (9am or 10am).
    * @returns {void}
    */
  private addKidToActivity(name: string, activity: WaterActivities | LandActivities, activityType: AllowedActivityTypes, timeSlot: Allowed9and10Only): void {
    const activityTimeSlot = this.getActivityTypeTimeSlot(activityType, timeSlot);
    activityTimeSlot[activity].push(name)
  }

  /**
    * Wrapper for the methods needed to fully schedule a kid
    * @param {string} name - name of kid to schedule.
    * @param {string} activity - activity to schedule the kid to ('canoe, 'pboard', etc).
    * @param {string} activityType - type of activity to schedule to (water or land).
    * @param {string} timeSlot - time slot to schedule the kid to (9am or 10am).
    * @returns {void}
    */
  private scheduleKid(name: string, activity: WaterActivities | LandActivities, activityType: AllowedActivityTypes, timeSlot: AllowedTimes): void {
    this.removeFromNotScheduled([name], activityType, activity, timeSlot);
    this.AddToScheduled([name], activityType, activity, timeSlot)
    this.setKidsTimeSlot([name], activity, activityType + timeSlot)
    this.addKidToActivity(name, activity, activityType, timeSlot)
  }

  /**
    * Wrapper for the methods needed to fully unschedule a kid
    * @param {string} name - name of kid to unschedule.
    * @param {string} activity - activity to unschedule the kid from ('canoe, 'pboard', etc).
    * @param {string} activityType - type of activity to unschedule (water or land).
    * @param {string} timeSlot - time slot to unschedule the kid from (9am or 10am).
    * @returns {void}
    */
  private unScheduleKid(name: string, activity: WaterActivities | LandActivities, activityType: AllowedActivityTypes, timeSlot: Allowed9and10Only): void {
    this.setKidsTimeSlot([name], null, activityType + timeSlot)
    this.addKidToNotScheduled(name, activityType, timeSlot)
    this.removeKidFromActivity(name, activity, activityType, timeSlot)
  }

  /**
    * Wrapper method for scheduling kids from a no choices match scenario.
    * @param {object} reScheduleData - data for re-scheduling a kid.
    * @param {object} kidtoScheduleData - data for the scheduling (not resheduling) a kid.
    * @returns {void}
    */
  private scheduleNoChoicesMatchesFound(reScheduleData: Object, kidtoScheduleData: Object): void {
    const { reScheduleKid, fromActivity, toActivity } = reScheduleData;
    const { name: mainName, activity, activityType, timeSlot } = kidtoScheduleData;
    this.unScheduleKid(reScheduleKid, fromActivity, activityType, timeSlot)
    this.scheduleKid(reScheduleKid, toActivity, activityType, timeSlot)
    this.scheduleKid(mainName, activity, activityType, timeSlot)
  }

  /**
    * Schedule kids who only have a single choice match for the activities that have open slots.
    * Since they only have one option available, it's better to schedule them first than schedule kids with multiple choices.
    * If we schedule the kids with multiple choices first, they could take the slot that the kids who only have a single choice could have taken.
    * @param {string} activityType - only 2 options: 'land' or 'water'.
    * @returns {void}
    */
  private scheduleUniques(activityType: AllowedActivityTypes): void {
    const scheduledActivitiesNotFull9am = this.getScheduledActivitiesNotFull(activityType, '9am');
    const scheduledActivitiesNotFull10am = this.getScheduledActivitiesNotFull(activityType, '10am');
    const scheduledChosenActivities9am = this.removeNotChosenActivitiesFromScheduledNotFull('water', scheduledActivitiesNotFull9am, this.notScheduledAllNamesWater)
    const scheduledChosenActivities10am = this.removeNotChosenActivitiesFromScheduledNotFull('water', scheduledActivitiesNotFull10am, this.notScheduledAllNamesWater)

    // map of activity to array of names e.g. "snork": ["Jones Alice", "Smith Bob"]
    const uniqueChoice9am = this.scheduleTheChosen(scheduledChosenActivities9am, 'water')
    const uniqueChoice10am = this.scheduleTheChosen(scheduledChosenActivities10am, 'water')

    let totalKidsCount = 0
    for (const [activity, names] of uniqueChoice9am) {
      if (uniqueChoice10am.has(activity)) {
        const uniqueNames9am = uniqueChoice9am.get(activity)
        const uniqueNames10am = uniqueChoice10am.get(activity)
        const notInUniqueNames10am = uniqueNames9am.filter(item => !uniqueNames10am.includes(item));
        const notInUniqueNames9am = uniqueNames10am.filter(item => !uniqueNames9am.includes(item));
        if (notInUniqueNames10am.length > 0) {
          const kidsScheduledCount9am = this.scheduleKids('water', activity, '9am', notInUniqueNames10am)
          totalKidsCount += kidsScheduledCount9am
        }
        if (notInUniqueNames9am.length > 0) {
          const kidsScheduledCount10am = this.scheduleKids('water', activity, '10am', notInUniqueNames9am)
          totalKidsCount += kidsScheduledCount10am
        }
      }
    }
  }

  /**
    * Helper method for scheduleLeastFull() that divides scheduling into 9am and 10am slots.
    * @param {string} activityType - only 2 options: 'land' or 'water'.
    * @param {string} timeSlot - only 2 options: '9am' or '10am'.
    * @param {string} name - name of the kid to schedule.
    * @param {string[]} kidsChoices - array of the kids 3 choices, either 3 land or 3 water activities.
    * @param {Map<string, number>} scheduledActivities - map of scheduled activities and their remaining slots, e.g {'canoe', 2, 'kayak', 1}
    * @returns {string} - the activity that the kid was scheulded to or "no match" if kids choices are not available.
    */
  private scheduleLeastFullByTimeSlot(activityType: AllowedActivityTypes, timeSlot: AllowedTimes, name: string, kidsChoices: string[], scheduledActivities: Map<string, number>): string {
    let notFullMatch = []
    for (const choice of kidsChoices) {
      if (scheduledActivities.has(choice)) {
        notFullMatch.push(choice)
      }
    }
    if (notFullMatch.length > 0) {
      notFullMatch = notFullMatch.sort((a, b) => scheduledActivities.get(b) - scheduledActivities.get(a));
    }
    for (const activity of notFullMatch) {
      if (scheduledActivities.get(activity) > 0) {
        const kidsScheduledCount = this.scheduleKids(activityType, notFullMatch[0], timeSlot, [name])
        return notFullMatch[0]
      }
    }
    return "no match"
  }

  /**
    * When scheduling kids to scheduled activities with open slots, match the kids to the activities
    * with the most open slots first. This helps schedule the most amount of kids because if we schedule
    * a kid to an activity that only has one open slot first (and not one that has multiple open slots)
    * then that will eliminate the ability to schedule another kid to that activity.
    * @param {string} activityType - only 2 options: 'land' or 'water'.
    * @returns {void}
    */
  private scheduleLeastFull(activityType: AllowedActivityTypes): void {
    const scheduledActivitiesNotFull9am = this.getScheduledActivitiesNotFull(activityType, '9am');
    const scheduledActivitiesNotFull10am = this.getScheduledActivitiesNotFull(activityType, '10am');
    const scheduledChosenActivities9am = this.removeNotChosenActivitiesFromScheduledNotFull('water', scheduledActivitiesNotFull9am, this.notScheduledAllNamesWater)
    const scheduledChosenActivities10am = this.removeNotChosenActivitiesFromScheduledNotFull('water', scheduledActivitiesNotFull10am, this.notScheduledAllNamesWater)

    const notScheduledAllNames = activityType === 'water' ? [...this.notScheduledAllNamesWater] : [...this.notScheduledAllNamesLand];
    for (const name of notScheduledAllNames) {
      const kidsChoices = this.getAllKidsChoicesByActivityType(name, activityType);
      if (this.notScheduled9amWater.names.length >= this.notScheduled10amWater.names.length) {
        const matchActivity = this.scheduleLeastFullByTimeSlot(activityType, '9am', name, kidsChoices, scheduledChosenActivities9am)
        if (matchActivity !== "no match") {
          const activityOpenSlotCount = scheduledChosenActivities9am.get(matchActivity)
          scheduledChosenActivities9am.set(matchActivity, activityOpenSlotCount - 1)
        } else {
          const matchActivity = this.scheduleLeastFullByTimeSlot(activityType, '10am', name, kidsChoices, scheduledChosenActivities10am)
          if (matchActivity !== "no match") {
            const activityOpenSlotCount = scheduledChosenActivities10am.get(matchActivity)
            scheduledChosenActivities10am.set(matchActivity, activityOpenSlotCount - 1)
          }
        }
      } else {
        const matchActivity = this.scheduleLeastFullByTimeSlot(activityType, '10am', name, kidsChoices, scheduledChosenActivities10am)
        if (matchActivity !== "no match") {
          const activityOpenSlotCount = scheduledChosenActivities10am.get(matchActivity)
          scheduledChosenActivities10am.set(matchActivity, activityOpenSlotCount - 1)
        } else {
          const matchActivity = this.scheduleLeastFullByTimeSlot(activityType, '9am', name, kidsChoices, scheduledChosenActivities9am)
          if (matchActivity !== "no match") {
            const activityOpenSlotCount = scheduledChosenActivities9am.get(matchActivity)
            scheduledChosenActivities9am.set(matchActivity, activityOpenSlotCount - 1)
          }
        }
      }
    }
  }

  /**
    * Find a kid who can be rescheduled from their current activity to a different activity but still an activiy that is one of their choices.
    * @param {string[]} names - list of names of kids to search through.
    * @param {LandActivities | WaterActivities} activity - current activity of the kid to reschedule.
    * @param {string} activityType - only 2 options: 'land' or 'water'.
    * @param {Allowed9and10Only} timeSlot - only 2 options: '9am' or '10am'.
    * @param {1 | 2 | 3} choiceNum - the choice number of the activity to reschedule to.
    * @returns {object} - an object containing the name of the kid who can be rescheduled and the activity they will be rescheduled to, or empty if no match.
    */
  private getRescheduleMatches(names: string[], activity: LandActivities | WaterActivities, activityType: AllowedActivityTypes, timeSlot: Allowed9and10Only, choiceNum: 1 | 2 | 3): object {
    const scheduledActivitiesNotFull = this.getScheduledActivitiesNotFull(activityType, timeSlot);
    let fromActivity: LandActivities | WaterActivities
    let toActivity: LandActivities | WaterActivities
    for (const name of names) {
      const activityTypeChoice = this.getKidsChoice(activityType, choiceNum)
      const nameChoice = this.kids.choices[name][activityTypeChoice]
      if (nameChoice !== activity && scheduledActivitiesNotFull.has(nameChoice)) {
        return {reScheduleKid: name, fromActivity: activity, toActivity: nameChoice}
      }
    }
    return {}
  }

  /**
    * Scheduled kids who cannot be scheduled to their chosen activities because no open slots are available.
    * To scheduled them we need to reschedule someone else to make a slot available so that the unscheduled kid(s)
    * can be scheduled to one of their chosen activities.
    * @param {string} activityType - only 2 options: 'land' or 'water'.
    * @returns {void}
    */
  private scheduleNoChoicesMatch(activityType: AllowedActivityTypes): void {
    const notScheduledAllNames = activityType === 'land' ? this.notScheduledAllNamesLand : this.notScheduledAllNamesWater
    const notScheduled9am = activityType === 'land' ? this.notScheduled9amLand : this.notScheduled9amWater
    const notScheduled10am = activityType === 'land' ? this.notScheduled10amLand : this.notScheduled10amWater
    for (const name of notScheduledAllNames) {
      const choices = this.getAllKidsChoicesByActivityType(name, activityType)
      let scheduledActivitiesFull = null;
      let timeSlot = '9am';
      if (notScheduled9am.length > notScheduled10am.length) {
        scheduledActivitiesFull = this.getScheduledActivitiesFull(activityType, '9am');
        } else {
        scheduledActivitiesFull= this.getScheduledActivitiesFull(activityType, '10am');
        timeSlot = '10am';
      }
      mainChoiceLoop:
      for (const choice of choices) {
        if (scheduledActivitiesFull.has(choice)) {
          const fullNames = timeSlot === '9am' ? this.water9am[choice] : this.water10am[choice]
          for (const choiceNum of [1, 2, 3]) {
            const fullNamesChoices = this.getRescheduleMatches(fullNames, choice, activityType, timeSlot, choiceNum)
            if (fullNamesChoices.hasOwnProperty('reScheduleKid')) {
              const kidToScheduleData = {name: name, activity: choice, activityType: activityType, timeSlot: timeSlot}
              this.scheduleNoChoicesMatchesFound(fullNamesChoices, kidToScheduleData)
              break mainChoiceLoop
            }
          }
        }
      }
    }
  }

  private scheduleSorryNoChoicesTimeSlot(name: string, activityType: AllowedActivityTypes, timeSlot: AllowedTimes): boolean {
    const scheduledActivitiesNotFull = this.getScheduledActivitiesNotFull(activityType, timeSlot)
    if (scheduledActivitiesNotFull.size === 0) {return false}
    innerloop:
    for (const activity of scheduledActivitiesNotFull.keys()) {
      this.scheduleKid(name, activity, activityType, timeSlot);
      break innerloop
    }
    return true
  }

  private scheduleSorryNoChoices(activityType: AllowedActivityTypes): void {
    const noChoicesForYou = activityType === 'land' ? [...this.notScheduledAllNamesLand] : [...this.notScheduledAllNamesWater]
    for (const name of noChoicesForYou) {
      const notScheduled9am = activityType === 'land' ? this.notScheduled9amLand : this.notScheduled9amWater
      const notScheduled10am = activityType === 'land' ? this.notScheduled10amLand : this.notScheduled10amWater
      if (notScheduled9am.names.length > notScheduled10am.names.length) {
        if (!this.scheduleSorryNoChoicesTimeSlot(name, activityType, '9am')) {
          this.scheduleSorryNoChoicesTimeSlot(name, activityType, '10am')
        }
      } else {
        if (!this.scheduleSorryNoChoicesTimeSlot(name, activityType, '10am')) {
          this.scheduleSorryNoChoicesTimeSlot(name, activityType, '9am')
        }
      }
    }
  }

  /**
    * For not scheduled kids, find activities that are already scheduled but have open slots and then attempt
    * to schedule the kids to these open slots if the activities match thier choices.
    * @param {string} activityType - only 2 options: 'land' or 'water'.
    * @returns {void}
    */
  private scheduleNotFull(activityType: AllowedActivityTypes): void {
    this.scheduleUniques(activityType)
    this.scheduleLeastFull(activityType)
  }

  schedulingLog(func_name: string, when: string): void {
    console.log(`\n${when} ${func_name}`)
    const notScheduledAllNames = 'water' === 'water' ? this.notScheduledAllNamesWater : this.notScheduledAllNamesLand;
    console.log("NOT SCHEDULED COUNT ALL NAMES WATER: ", notScheduledAllNames.length)
    console.log("NOT SCHEDULED 9AM WATER NAMES: ", this.notScheduled9amWater.names.length)
    console.log("NOT SCHEDULED 9AM WATER ACTIVITIS: ", this.notScheduled9amWater.waterActivities)
    console.log("NOT SCHEDULED 10AM WATER: ", this.notScheduled10amWater.names.length)
    console.log("NOT SCHEDULED 10AM WATER ACTIVITIS: ", this.notScheduled10amWater.waterActivities)
    console.log("\n")
  }

  private testScheduling(activityType: AllowedActivityTypes, func_name: string): void {
    const notScheduledAllNames = activityType === 'water' ? this.notScheduledAllNamesWater : this.notScheduledAllNamesLand;
    const totalKidsCount = this.kids.count - notScheduledAllNames.length

    console.log("TEST SCHEDULING: ", func_name)
    console.log("WATER TIMESLOTS")
    let waterTotalCount = 0;
    let water9amTotalCount = 0;
    let water10amTotalCount = 0;
    const unscheduleKids = []
    const water9amActivityCount = { 'fish': 0, 'pboard': 0, 'snork': 0, 'canoe': 0, 'kayak': 0, 'sail': 0, 'swim': 0 };
    const water10amActivityCount = { 'fish': 0, 'pboard': 0, 'snork': 0, 'canoe': 0, 'kayak': 0, 'sail': 0, 'swim': 0 };
    for (const name of this.kids.names) {
      const timeSlots = this.schedule.get(name)
      if (timeSlots.timeSlots.water9am) {
        water9amActivityCount[timeSlots.timeSlots.water9am] += 1;
        water9amTotalCount += 1;
      }
      if (timeSlots.timeSlots.water10am) {
        water10amActivityCount[timeSlots.timeSlots.water10am] += 1;
        water10amTotalCount += 1;
      }
      let nullCount = 0;
      for (const time in timeSlots.timeSlots) {
        if (timeSlots.timeSlots[time] === null) {
          nullCount += 1;
        }
      }
      if (nullCount === 4) {
        unscheduleKids.push({ name: name, timeSlot: timeSlots.timeSlots })
      }
    }

    waterTotalCount = water9amTotalCount + water10amTotalCount;
    console.log("9am this.kids.names(get) count:", water9amActivityCount)
    console.log("10am this.kids.names(get) count:", water10amActivityCount)

    const water9amActivityCountAlt = { 'fish': 0, 'pboard': 0, 'snork': 0, 'canoe': 0, 'kayak': 0, 'sail': 0, 'swim': 0 };
    const water10amActivityCountAlt = { 'fish': 0, 'pboard': 0, 'snork': 0, 'canoe': 0, 'kayak': 0, 'sail': 0, 'swim': 0 };
    for (const activity in this.water9am) {
      water9amActivityCountAlt[activity] = this.water9am[activity].length;
    }
    for (const activity in this.water9am) {
      water10amActivityCountAlt[activity] = this.water10am[activity].length;
    }
    console.log("9am this.water9am count ALT:", water9amActivityCountAlt)
    console.log("10am this.water10am count ALT:", water10amActivityCountAlt)

    // Check if water9amActivityCountAlt and water9amActivityCount are equal
    const keys1 = Object.keys(water9amActivityCountAlt).sort();
    const keys2 = Object.keys(water9amActivityCount).sort();
    const equalObjects9am =  keys1.every((key, index) =>
        key === keys2[index] && water9amActivityCountAlt[key] === water9amActivityCount[key]
      );

    console.log("\nARE OBJECTS EQUAL?")
    if (equalObjects9am) {
      console.log("9AM objects THEY ARE EQAUL yaaay")
    } else {
      console.log("9AM objects THEY ARE not EQUAL!!!")
    }

    const keys1a = Object.keys(water10amActivityCountAlt).sort();
    const keys2a = Object.keys(water10amActivityCount).sort();
    const equalObjects10am =  keys1a.every((key, index) =>
        key === keys2a[index] && water10amActivityCountAlt[key] === water10amActivityCount[key]
      );

    if (equalObjects10am) {
      console.log("10AM objects THEY ARE EQAUL yaaay")
    } else {
      console.log("10AM objects THEY ARE not EQUAL!!!")
    }
    console.log("\n")

    if (waterTotalCount !== totalKidsCount) {
      console.log("\n\nScheduled # mismatch. this.Kids.timeSlots != this.kids.totalKidsCount: ")
      console.log(waterTotalCount, "!==", totalKidsCount, "\n")
    } else {
      console.log("Scheduled # MATCHES YAY. this.Kids.timeSlots == this.kids.totalKidsCount: ")
      console.log(waterTotalCount, "==", totalKidsCount, "\n\n")
    }

    if (func_name == 'end log') {
      console.log('TOTAL KIDS NOT SCHEDULED:', this.kids.count - totalKidsCount)
      for (const kid of unscheduleKids) {
        console.log(kid)
      }

      const allNotInTarget = this.notScheduled9amWater.names.every(element => !this.notScheduled10amWater.names.includes(element));
      console.log("this.notScheduled9amWater.names !== this.notScheduled10amWater.names:", allNotInTarget);
      const allNamesEmpty = this.notScheduledAllNamesWater.length === 0
      console.log("this.notScheduledAllNamesWater.length === 0:", allNamesEmpty);
    }

    console.log("SCHEDULED LISTS")
    const oppositesEqualWater = this.notScheduled9amWater.names.every(element => this.scheduled10amWater.names.includes(element));
    console.log("this.notScheduled9amWater.names === this.Scheduled10amWater.names:", oppositesEqualWater);
    const oppositesEqualWater2 = this.notScheduled10amWater.names.every(element => this.scheduled9amWater.names.includes(element));
    console.log("this.notScheduled10amWater.names === this.Scheduled9amWater.names:", oppositesEqualWater2);
  }

  runAlgo(): string {
    console.log(`${this.algo} algorithm initiated`);
    this.schedulingLog('any scheduling', 'before')

    const methods = [
      this.scheduleDoubles.bind(this), // only water activities can be scheduled as doubles
      this.scheduleSingles.bind(this),
      this.scheduleBelowMin.bind(this),
      this.scheduleNotFull.bind(this),
      this.scheduleNoChoicesMatch.bind(this),
      this.scheduleSorryNoChoices.bind(this)
    ];
    const methodArgs = [
      ['water', [1, 2, 3], 'bothMinAndMax'],
      ['water', [1, 2, 3], 'bothMinAndMax'],
      ['water'],
      ['water'],
      ['water'],
      ['water'],
    ];

    for (let i = 0; i < methods.length; i++) {
      console.log("ENTERING: " + methods[i].name + "()")
      methods[i](...methodArgs[i])
      this.schedulingLog(methods[i].name + "()", 'after')
      this.testScheduling('water', methods[i].name + "()")
    }

    this.testScheduling('water', 'end log')
    return 'Algo complete';
  }
}
