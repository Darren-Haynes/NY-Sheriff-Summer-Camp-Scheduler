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
import { Int } from '../types/num-types';
import { KidsData } from '../types/kids-types';
import {
  AllLandWaterKids9am10am,
  LandKids9am,
  LandKids10am,
  LandRanges9am,
  LandRanges10am,
  WaterRanges,
  WaterKids,
} from '../types/camp-types';

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
  landPercentages: number[];
  waterPercentages: number[];
  algo: string;
  water9am: WaterKids;
  water10am: WaterKids;
  land9am: LandKids9am;
  land10am: LandKids10am;
  isLandFirst: boolean;

  // TODO: see if improvemets can be made using this resouce https://www.freecodecamp.org/news/how-to-use-the-builder-pattern-in-python-a-practical-guide-for-devs/
  constructor(kids: Kids, algo: string) {
    if (!Schedule.ALGOS.includes(algo)) {
      throw new Error(`${algo} is not a supported Camp Scheduler algorithm`);
    }
    this.algo = algo;
    this.kids = kids;
    this.schedule = this.scheduleConstructor();
    this.notScheduled9amWater = this.notScheduledConstructorWater();
    this.notScheduled10amWater = this.notScheduledConstructorWater();
    this.notScheduledAllNamesWater = JSON.parse(JSON.stringify(this.kids.names));
    this.notScheduled9amLand = this.notScheduledConstructorLand(true);
    this.notScheduled10amLand = this.notScheduledConstructorLand(false);
    this.notScheduledAllNamesLand = JSON.parse(JSON.stringify(this.kids.names));
    this.landPercentages = [];
    this.waterPercentages = [];
    this.water9am = JSON.parse(JSON.stringify(Activities.water9am));
    this.water10am = JSON.parse(JSON.stringify(Activities.water10am));
    this.land9am = JSON.parse(JSON.stringify(Activities.land9am));
    this.land10am = JSON.parse(JSON.stringify(Activities.land10am));
    this.scheduled9amWater = { names: [], waterActivities: [] };
    this.scheduled9amLand = { names: [], landActivities: [] };
    this.scheduled10amWater = { names: [], waterActivities: [] };
    this.scheduled10amLand = { names: [], landActivities: [] };
    this.isLandFirst = false;
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
    this.kids.names.forEach(name => {
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
   * and also water activities that have not been scheduled.
   * @returns {NotScheduledWater} e.g {names: ['doe john', 'doe jane'...], waterActivities: ['fish', 'canoe'...]}
   */
  private notScheduledConstructorWater(): NotScheduledWater {
    const notScheduled: NotScheduledWater = {
      names: JSON.parse(JSON.stringify(this.kids.names)),
      waterActivities: JSON.parse(JSON.stringify(Activities.waterActs)),
    };
    return notScheduled;
  }

  /**
   * Create object that contains the names of kids who are not yet scheduled for an activity,
   * and also land activities that have not been scheduled.
   * @returns {NotScheduledLand} e.g {names: ['doe john', 'doe jane'...], landActivities: ['bball', 'hike'...]}
   */
  private notScheduledConstructorLand(nineAM = true): NotScheduledLand {
    const nineOrTen = nineAM
      ? JSON.parse(JSON.stringify(Activities.land9amActs))
      : JSON.parse(JSON.stringify(Activities.land10amActs));
    const notScheduled: NotScheduledLand = {
      names: JSON.parse(JSON.stringify(this.kids.names)),
      landActivities: JSON.parse(JSON.stringify(nineOrTen)),
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
  private scheduledActivityCount(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes,
    showZero: boolean
  ): Map<string, number> {
    let activityTimeSlot =
      activityType === 'water' ? this.water9am : timeSlot === '9am' ? this.land9am : this.land10am;
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
    for (const [activity, names] of Object.entries(activityTimeSlot)) {
      if (!showZero && names.length === 0) {
        continue;
      } else {
        activityCount.set(activity, names.length);
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
  private getActivityTypeTimeSlot(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes
  ): WaterKids | LandKids9am | LandKids10am {
    const activityTimeSlots = [this.water9am, this.water10am, this.land9am, this.land10am];
    let activityTimeSlot = activityTimeSlots[0];
    if (activityType === 'water') {
      if (timeSlot === '9am') {
        activityTimeSlot = activityTimeSlots[0];
      }
      if (timeSlot === '10am') {
        activityTimeSlot = activityTimeSlots[1];
      }
    }
    if (activityType === 'land') {
      if (timeSlot === '9am') {
        activityTimeSlot = activityTimeSlots[2];
      }
      if (timeSlot === '10am') {
        activityTimeSlot = activityTimeSlots[3];
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
  private getScheduledChoicesNames(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes,
    choiceNum: AllowedChoiceNums
  ): string[] {
    const activityTypeTimeSlot = this.getActivityTypeTimeSlot(activityType, timeSlot);

    let choice: string = 'water1';
    if (activityType === 'water') {
      if (choiceNum === 2) {
        choice = 'water2';
      }
      if (choiceNum === 3) {
        choice = 'water3';
      }
    }

    if (activityType === 'land') {
      if (choiceNum === 1) {
        choice = 'land1';
      }
      if (choiceNum === 2) {
        choice = 'land2';
      }
      if (choiceNum === 3) {
        choice = 'land3';
      }
    }

    const namesChoice: string[] = [];
    for (const [activity, names] of Object.entries(activityTypeTimeSlot)) {
      names.forEach(name => {
        const kidData = this.kids.choices[name];
        if (kidData[choice] === activity) {
          namesChoice.push(name);
        }
      });
    }
    return namesChoice;
  }

  /**
   * Get Map of scheduled activities that have more kids than the minimum required.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options: '9am' or '10am'.
   * @returns {Map} - activity plus the number of kids scheduled above the min threshold: e.g {'swim': 3, 'fish': 8, ...}
   */
  private getKidsScheduleAboveMin(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes
  ): Map<string, [number, string[]]> {
    const scheduledAboveMin = new Map<string, [number, string[]]>();
    const activityRange = activityType === 'land' ? Activities.landRanges : Activities.waterRanges;
    const activityTimeSlot = this.getActivityTypeTimeSlot(activityType, timeSlot);
    for (const [activity, names] of Object.entries(activityTimeSlot) as [
      keyof typeof activityTimeSlot,
      string[],
    ][]) {
      if (names.length > activityRange[activity][0]) {
        const aboveMinCount = names.length - activityRange[activity][0];
        scheduledAboveMin.set(activity, [aboveMinCount, names]);
      }
    }
    return scheduledAboveMin;
  }

  /**
   * Get correct range for a given activity type and time slot.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options: '9am' or '10am'.
   * @returns {LandRanges9am | LandRanges10am | WaterRanges} - map of scheduled activities and a count of their available time slots.
   */
  private getRange(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes
  ): LandRanges9am | LandRanges10am | WaterRanges {
    if (activityType === 'land') {
      return timeSlot === '9am' ? Activities.landRanges9am : Activities.landRanges10am;
    }
    return Activities.waterRanges;
  }

  private getInsufficientlyScheduledActivites(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes
  ): AllActivities[] {
    const activities = this.getActivityTypeTimeSlot(activityType, timeSlot);
    const activityRange = this.getRange(activityType, timeSlot);
    let activity: AllActivities = 'arch'; // to appease the types compiler
    let matchingActivities: AllActivities[] = [];
    for (const [activity, names] of Object.entries(activities) as [
      keyof typeof activities,
      string[],
    ][]) {
      const ranges = activityRange[activity];
      if (names.length < activityRange[activity][0] && names.length > 1) {
        matchingActivities.push(activity);
      }
    }
    return matchingActivities;
  }
  /**
   * First return activity that has kids but below the minimum required, else return a random activity that has no kids scheduled.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options: '9am' or '10am'.
   * @returns {AllActivities} - return an activity
   */
  private getActivitiesBelowMin(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes
  ): AllActivities | false {
    const activities = this.getActivityTypeTimeSlot(activityType, timeSlot);
    const activityRange = this.getRange(activityType, timeSlot);
    let activity: AllActivities = 'arch'; // to appease the types compiler
    let matchingActivities: AllActivities[] = [];
    for (const [activity, names] of Object.entries(activities) as [
      keyof typeof activities,
      string[],
    ][]) {
      const ranges = activityRange[activity];
      if (names.length < activityRange[activity][0]) {
        return activity;
      }
    }
    return false;
  }

  /**
   * Get list of all scheduled activities that have available slots for a given activity type and time slot.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options: '9am' or '10am'.
   * @returns {Map<string, number>} - map of scheduled activities and a count of their available time slots.
   */
  private getScheduledActivitiesNotFull(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes
  ): Map<string, number> {
    const scheduledActivities = this.getActivityTypeTimeSlot(activityType, timeSlot);
    const notFullActivities = new Map<string, number>();
    const activityRange = this.getRange(activityType, timeSlot);
    for (const [activity, names] of Object.entries(scheduledActivities) as [
      keyof typeof scheduledActivities,
      string[],
    ][]) {
      if (names.length < activityRange[activity][1] && names.length > 0) {
        notFullActivities.set(activity, activityRange[activity][1] - names.length);
      }
    }
    return new Map([...notFullActivities.entries()].sort((b, a) => a[1] - b[1]));
  }

  /**
   * Get list of all scheduled activities that have all their available slots filled for a given activity type and time slot.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options: '9am' or '10am'.
   * @returns {Map<string, number>} - map of scheduled activities and the count of their full time slots.
   */
  private getScheduledActivitiesFull(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes
  ): Map<string, number> {
    const scheduledActivities = this.getActivityTypeTimeSlot(activityType, timeSlot);
    const fullActivities = new Map<string, number>();
    const activityRange = activityType === 'land' ? Activities.landRanges : Activities.waterRanges;
    for (const [activity, names] of Object.entries(scheduledActivities) as [
      keyof typeof scheduledActivities,
      string[],
    ][]) {
      if (names.length === activityRange[activity][1]) {
        fullActivities.set(activity, activityRange[activity][1]);
      }
    }
    return new Map([...fullActivities.entries()].sort((b, a) => a[1] - b[1]));
  }

  /**
   * Get list of all not scheduled activities for a given activity type and time slot.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options: '9am' or '10am'.
   * @returns {Map<string, number>} - map of not scheduled activities and their remaining slots, e.g {'canoe', 10, 'pboard', 4}
   */
  private getNotScheduledActivities(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes
  ): Map<string, number> {
    const scheduledActivities = this.getActivityTypeTimeSlot(activityType, timeSlot);
    const notScheduledActivities = new Map<string, number>();
    const activityRange = activityType === 'land' ? Activities.landRanges : Activities.waterRanges;
    for (const [activity, names] of Object.entries(scheduledActivities) as [
      keyof typeof scheduledActivities,
      string[],
    ][]) {
      if (names.length === 0) {
        notScheduledActivities.set(activity, activityRange[activity][1]);
      }
    }
    return new Map([...notScheduledActivities.entries()].sort((b, a) => a[1] - b[1]));
  }

  private removeNotChosenActivitiesFromScheduledNotFull(
    activityType: AllowedActivityTypes,
    scheduledNotFull: Map<string, number>,
    notScheduledAllNames: string[]
  ): Map<string, number> {
    const activities = activityType === 'land' ? Schedule.LANDTYPES : Schedule.WATERTYPES;
    const chosenList = new Set<string>();
    for (const name of notScheduledAllNames) {
      for (const activity of activities) {
        if (scheduledNotFull.has(this.kids.choices[name][activity])) {
          if (chosenList.has(this.kids.choices[name][activity])) {
            continue;
          }
          chosenList.add(this.kids.choices[name][activity]);
          if (chosenList.size === scheduledNotFull.size) {
            return scheduledNotFull;
          }
        }
      }
    }
    for (const activity of scheduledNotFull.keys()) {
      if (!chosenList.has(activity)) {
        scheduledNotFull.delete(activity);
      }
    }
    return scheduledNotFull;
  }

  private getAllKidsChoicesByActivityType(
    name: string,
    activityType: AllowedActivityTypes
  ): string[] {
    const activities = activityType === 'land' ? Schedule.LANDTYPES : Schedule.WATERTYPES;
    const choices = this.kids.choices[name];
    const kidsChoices: string[] = new Array();
    for (const activity of activities) {
      kidsChoices.push(choices[activity]);
    }
    return kidsChoices;
  }

  /**
   * Schedule kids who only have a single choice match for the activities that have open slots.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @returns {void}
   */
  private scheduleTheChosen(
    scheduledChosen: Map<string, number>,
    activityType: AllowedActivityTypes,
    timeSlot: Allowed9and10Only
  ): Map<string, string[]> {
    // const notScheduledAllNames = activityType === 'land' ? this.notScheduledAllNamesLand : this.notScheduledAllNamesWater;
    const notScheduledAllNames = this.getNotScheduledKidsList(activityType, timeSlot);
    const chosenList: string[] = [...scheduledChosen.keys()];
    const uniqueChoice = new Map<string, string[]>();
    for (const activity of chosenList) {
      for (const name of notScheduledAllNames) {
        const kidsChoices = this.getAllKidsChoicesByActivityType(name, activityType);
        if (kidsChoices.includes(activity)) {
          const chosenListWithoutCurrentActivity = chosenList.filter(item => item !== activity);
          const kidsChoicesWithoutCurrentActivity = kidsChoices.filter(item => item !== activity);
          const areDisjoint = chosenListWithoutCurrentActivity.every(
            item => !kidsChoicesWithoutCurrentActivity.includes(item)
          );
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
    return uniqueChoice;
  }

  /**
   * Constructs Map of 'land' or 'water' activities that have not been scheduled yet with default count of 0.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @returns {Map} - e.g for water activities: {'swim': 0, 'fish': 0, ...}
   */
  private activityTemplate(
    activityType: AllowedActivityTypes,
    timeSlot: Allowed9and10Only
  ): Map<string, number> {
    const choicesCount = new Map<string, number>();
    const scheduledTimeActivity =
      activityType === 'water'
        ? this.scheduled9amWater.waterActivities
        : timeSlot === '9am'
          ? this.scheduled9amLand.landActivities
          : this.scheduled10amLand.landActivities;
    const activitiesActs =
      activityType === 'water'
        ? Activities.waterActs
        : timeSlot === '9am'
          ? Activities.land9amActs
          : Activities.land10amActs;
    for (const activity of activitiesActs) {
      if (!(scheduledTimeActivity as readonly string[]).includes(activity)) {
        choicesCount.set(activity, 0);
      }
    }
    return choicesCount;
  }

  /**
   * Count how many kids have chosen a specific activity as one of their choices.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} activity - activity such as 'canoe', 'pboard' or 'bball;
   * @returns {number} - simple int of the count
   */
  private howManyToSpareHaveActivityAsAChoice(
    activityType: AllowedActivityTypes,
    activity: LandActivities | WaterActivities,
    kidsToSpare: Map<string, [number, string[]]>
  ): number {
    const ACTIVITY_TYPES = activityType === 'water' ? Schedule.WATERTYPES : Schedule.LANDTYPES;
    let count = 0;
    kidsToSpare.forEach(kids => {
      kids[1].forEach(kid => {
        const theKid = this.kids.choices[kid];
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
  private sortActivitiesByShortfall(
    notScheduledActivities: Map<string, number>,
    activityType: AllowedActivityTypes
  ): Map<string, number> {
    const activityRanges =
      activityType === 'water' ? Activities.waterRanges : Activities.landRanges;
    const shortfallFromMin: Map<string, number> = new Map();
    for (const [activity, count] of notScheduledActivities.entries()) {
      if (activity in activityRanges) {
        const activityMin = activityRanges[activity][0];
        const shortfall = activityMin - count;

        if (shortfall > 0) {
          shortfallFromMin.set(activity, shortfall);
        }
      }
    }
    return new Map([...shortfallFromMin.entries()].sort((b, a) => a[1] - b[1]));
  }

  /**
   * Get the right list of unscheduled kids based on activity type, time slot and
   * whether land or water activities were scheduled first.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options: '9am' or '10am'.
   * @returns {Map} - e.g {'swim': 39, 'fish': 9, ...} how many unscheduled kids chose each activity
   */
  private getNotScheduledKidsList(
    activityType: AllowedActivityTypes,
    timeSlot: Allowed9and10Only,
    algoFirst: boolean = true
  ): string[] {
    if (algoFirst) {
      if (!this.isLandFirst) {
        if (activityType === 'land') {
          return timeSlot === '9am'
            ? this.notScheduled9amLand.names
            : this.notScheduled10amLand.names;
        } else {
          return this.notScheduledAllNamesWater;
        }
      } else {
        if (activityType === 'water') {
          return timeSlot === '9am'
            ? this.notScheduled9amWater.names
            : this.notScheduled10amWater.names;
        } else {
          return this.notScheduledAllNamesLand;
        }
      }
    }
    if (activityType === 'land') {
      return timeSlot === '9am' ? this.notScheduled9amLand.names : this.notScheduled10amLand.names;
    } else {
      return timeSlot === '9am'
        ? this.notScheduled9amWater.names
        : this.notScheduled10amWater.names;
    }
  }

  private getNotScheduledActivitiesList(
    activityType: AllowedActivityTypes,
    timeSlot: Allowed9and10Only
  ): string[] {
    if (activityType === 'land') {
      return timeSlot === '9am'
        ? this.notScheduled9amLand.landActivities
        : this.notScheduled10amLand.landActivities;
    } else {
      return timeSlot === '9am'
        ? this.notScheduled9amWater.waterActivities
        : this.notScheduled10amWater.waterActivities;
    }
  }

  private getScheduledActivitiesList(
    activityType: AllowedActivityTypes,
    timeSlot: Allowed9and10Only
  ): string[] {
    if (activityType === 'land') {
      return timeSlot === '9am'
        ? this.scheduled9amLand.landActivities
        : this.scheduled10amLand.landActivities;
    } else {
      return timeSlot === '9am'
        ? this.scheduled9amWater.waterActivities
        : this.scheduled10amWater.waterActivities;
    }
  }

  private getScheduledKidsList(
    activityType: AllowedActivityTypes,
    timeSlot: Allowed9and10Only
  ): string[] {
    if (activityType === 'land') {
      return timeSlot === '9am' ? this.scheduled9amLand.names : this.scheduled10amLand.names;
    } else {
      return timeSlot === '9am' ? this.scheduled9amWater.names : this.scheduled10amWater.names;
    }
  }

  /**
   * Counts how many times unscheduled kids have chosen a specfic activity.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {number[]} choices - num of choices to count between 1 - 3.
   * @param {string} timeSlot - only 2 options: '9am' or '10am'.
   * @returns {Map} - e.g {'swim': 39, 'fish': 9, ...} how many unscheduled kids chose each activity
   */
  private countActivityChoices(
    activityType: AllowedActivityTypes,
    choices: AllowedChoices,
    timeSlot: AllowedTimes
  ) {
    const ACTIVITY_TYPES = activityType === 'water' ? Schedule.WATERTYPES : Schedule.LANDTYPES;
    const UNSCHEDULED_NAMES = this.getNotScheduledKidsList(activityType, timeSlot);
    const activitiesChoicesCount = this.activityTemplate(activityType, timeSlot);
    for (let i = 0; i < choices.length; i++) {
      UNSCHEDULED_NAMES.forEach(kid => {
        const kidsData = this.kids.choices[kid];
        const activity = kidsData[ACTIVITY_TYPES[choices[i] - 1].toLowerCase()] as string;
        if (activitiesChoicesCount.has(activity)) {
          const currentActivityCount = activitiesChoicesCount.get(activity);
          if (currentActivityCount !== undefined) {
            const newActivityCount = currentActivityCount + 1;
            activitiesChoicesCount.set(activity, newActivityCount);
          }
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
  private getKidsChoice(activityType: AllowedActivityTypes, choiceNum: AllowedChoiceNums): string {
    const ACTIVITY_TYPES = activityType === 'water' ? Schedule.WATERTYPES : Schedule.LANDTYPES;
    return ACTIVITY_TYPES[choiceNum - 1];
  }

  private getTimeSlotConditional(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes
  ): AllowedTimes {
    if (!this.isLandFirst) {
      if (activityType == 'water' && timeSlot === 'both') {
        return this.scheduled9amWater.names.length >= this.notScheduled10amWater.names.length
          ? '10am'
          : '9am';
      }
    }
    return timeSlot;
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
    choiceNum: AllowedChoiceNums,
    timeSlot: AllowedTimes
  ): string[] {
    const choice: string = this.getKidsChoice(activityType, choiceNum);
    const matchedKids: string[] = [];
    const unscheduledKidsNames = this.getNotScheduledKidsList(activityType, timeSlot);
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
   * Filter scheduled activities that are above (but not equal to) minimum capacity,
   * so we can see which activities we can take kids from.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options -'9am' or '10am'
   * @returns {Map<string, number>} - Map of activity names and their number of kids above minimum capacity
   */
  private getActivitiesAboveMin(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes
  ): Map<string, number> {
    const aboveMin = new Map<string, number>();
    const scheduledCount = this.scheduledActivityCount(activityType, timeSlot, false);
    for (const [activity, count] of scheduledCount) {
      const activityMin =
        activityType === 'water'
          ? Activities.waterRanges[activity][0]
          : Activities.landRanges[activity][0];
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
  private getKidsWhoCanReschedule(
    activityType: AllowedActivityTypes,
    activity: LandActivities | WaterActivities,
    timeSlot: AllowedTimes,
    choices: AllowedChoices,
    returnNoMatch: boolean = false
  ): Array<string> {
    let scheduledActivities: Record<string, string[]>;
    if (activityType === 'land') {
      scheduledActivities = timeSlot === '9am' ? this.land9am : this.land10am;
    } else if (activityType === 'water') {
      scheduledActivities = timeSlot === '9am' ? this.water9am : this.water10am;
    } else {
      scheduledActivities = {};
    }
    const activitiesAboveMin = this.getActivitiesAboveMin(activityType, timeSlot);
    const kidsWhoCanReschedule = new Array();
    const kidsWhoCanRescheduleNoMatch = new Array();
    for (const [activityAboveMin, count] of activitiesAboveMin) {
      const scheduledKids = scheduledActivities[activityAboveMin];
      for (const kid of scheduledKids) {
        for (const choice of choices) {
          const kidsData = this.kids.choices[kid];
          const kidsChoice =
            activityType === 'land'
              ? Object.keys(kidsData)[choice - 1]
              : Object.keys(kidsData)[choice + 2];
          if (kidsData[kidsChoice] === activity) {
            kidsWhoCanReschedule.push(kid);
          } else {
            if (activitiesAboveMin.get(activityAboveMin) === 0) {
              continue;
            }
            kidsWhoCanRescheduleNoMatch.push(kid);
            let shortfallCount: number | undefined = activitiesAboveMin.get(activityAboveMin);
            if (shortfallCount !== undefined) {
              activitiesAboveMin.set(activityAboveMin, (shortfallCount -= 1));
            }
          }
        }
      }
    }
    if (returnNoMatch) return kidsWhoCanRescheduleNoMatch;
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
    names.forEach(name => {
      const kid = this.schedule.get(name);
      if (kid !== undefined) {
        kid.timeSlots[activityTimeSlot] = activity as any;
      }
    });
  }

  /**
   * Changes timeSlot and activitiy for kids.
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
      const kidsData = this.schedule.get(name);
      if (kidsData === undefined) continue;
      const oldActivity = kidsData.timeSlots[activityTimeSlot];
      if (oldActivity === null) continue;
      kidsData.timeSlots[activityTimeSlot] = newActivity as any;
      let activityObj: Record<string, string[]>;
      let safeOldActivity: string;

      switch (activityTimeSlot) {
        case 'land9am':
          activityObj = this.land9am;
          safeOldActivity = oldActivity as LandActivities;
          break;
        case 'land10am':
          activityObj = this.land10am;
          safeOldActivity = oldActivity as LandActivities;
          break;
        case 'water9am':
          activityObj = this.water9am;
          safeOldActivity = oldActivity as WaterActivities;
          break;
        case 'water10am':
          activityObj = this.water10am;
          safeOldActivity = oldActivity as WaterActivities;
          break;
        default:
          continue;
      }

      const nameIndex = activityObj[safeOldActivity].indexOf(name);
      if (nameIndex > -1) {
        activityObj[safeOldActivity].splice(nameIndex, 1);
      }
    }
  }

  /**
   * Remove names and activites from notScheduled lists (because they are scheduled)
   * @param {string[]} names - Array of names to be removed from notScheduled lists
   * @param {string} activityType - Type of activity: either 'land' or 'water'
   * @param {string} activity - activity such as "fball", "canoe", "swim"
   * @param {number} timeSlot - '9am' or '10am' or 'both'
   * @returns {void}
   */
  private removeFromNotScheduled(
    names: string[],
    activityType: AllowedActivityTypes,
    activity: LandActivities | WaterActivities,
    timeSlot: AllowedTimes
  ): void {
    if (activityType === 'water') {
      this.removeElementsFromArray(this.notScheduledAllNamesWater, names);
    } else {
      this.removeElementsFromArray(this.notScheduledAllNamesLand, names);
    }

    const slotData = {
      water: {
        '9am': this.notScheduled9amWater,
        '10am': this.notScheduled10amWater,
      },
      land: {
        '9am': this.notScheduled9amLand,
        '10am': this.notScheduled10amLand,
      },
    };

    const targetData = slotData[activityType][timeSlot];
    this.removeElementsFromArray(targetData.names, names);

    const activityList =
      activityType === 'water'
        ? (targetData as typeof this.notScheduled9amWater).waterActivities
        : (targetData as typeof this.notScheduled9amLand).landActivities;

    const activityIdx = activityList.indexOf(activity as any);
    if (activityIdx !== -1) {
      activityList.splice(activityIdx, 1);
    }
  }

  private AddToScheduled(
    names: string[],
    activityType: AllowedActivityTypes,
    activity: LandActivities | WaterActivities,
    timeSlot: AllowedTimes
  ): void {
    if (timeSlot === 'both') {
      this.AddToScheduled(names, activityType, activity, '9am');
      this.AddToScheduled(names, activityType, activity, '10am');
      return;
    }

    const scheduledData = {
      water: {
        '9am': this.scheduled9amWater,
        '10am': this.scheduled10amWater,
      },
      land: {
        '9am': this.scheduled9amLand,
        '10am': this.scheduled10amLand,
      },
    };

    const target = scheduledData[activityType][timeSlot];

    const activityList = activityType === 'water' ? target.waterActivities : target.landActivities;

    if (!activityList.includes(activity as any)) {
      activityList.push(activity as any);
    }

    target.names.push(...names);
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
    maxOrMin: AllowedMaxMin,
    timeSlot: AllowedTimes
  ): void {
    singleMaxActivities.forEach((activity: AllActivities) => {
      const resolvedTimeSlot = this.getTimeSlotConditional(activityType, timeSlot);

      let kidsByActivityChoice: string[] = [];
      if (choiceNum.length > 1) {
        for (let i = 0; i < choiceNum.length; i++) {
          const activityChoices = this.getKidsbyActivityChoice(
            activity,
            activityType,
            choiceNum[i],
            resolvedTimeSlot
          );
          kidsByActivityChoice = kidsByActivityChoice.concat(activityChoices);
        }
      } else {
        kidsByActivityChoice = this.getKidsbyActivityChoice(
          activity,
          activityType,
          choiceNum[0],
          resolvedTimeSlot
        );
      }

      const activityValue = maxOrMin === 'max' ? 1 : 0;
      let activityMaxOrMin: number;

      if (activityType === 'water') {
        const waterActivity = activity as WaterActivities;
        activityMaxOrMin = Activities.waterRanges[waterActivity][activityValue];
      } else {
        const landActivity = activity as LandActivities;
        if (resolvedTimeSlot === '9am') {
          activityMaxOrMin = Activities.landRanges9am[landActivity][activityValue];
        } else {
          activityMaxOrMin = Activities.landRanges10am[landActivity][activityValue];
        }
      }

      let kidsTimeSlot: string[] = [];
      if (maxOrMin === 'max') {
        kidsTimeSlot = this.randomChoices(kidsByActivityChoice, activityMaxOrMin);
      } else {
        kidsTimeSlot = kidsByActivityChoice;
      }

      if (kidsTimeSlot.length < activityMaxOrMin) return;

      const isWater = activityType === 'water';
      const is9am = resolvedTimeSlot === '9am';

      const timeSlotKey = `${activityType}${resolvedTimeSlot}` as
        | 'water9am'
        | 'water10am'
        | 'land9am'
        | 'land10am';

      if (isWater) {
        if (is9am) this.water9am[activity as WaterActivities] = kidsTimeSlot;
        else this.water10am[activity as WaterActivities] = kidsTimeSlot;
      } else {
        if (is9am) this.land9am[activity as LandActivities9am] = kidsTimeSlot;
        else this.land10am[activity as LandActivities10am] = kidsTimeSlot;
      }

      this.removeFromNotScheduled(kidsTimeSlot, activityType, activity, resolvedTimeSlot);
      this.AddToScheduled(kidsTimeSlot, activityType, activity, resolvedTimeSlot);
      this.setKidsTimeSlot(kidsTimeSlot, activity, timeSlotKey);
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
    maxOrMin: AllowedMaxMin,
    timeSlot: AllowedTimes
  ): void {
    doubleMaxActivities.forEach(activity => {
      const resolvedTimeSlot = this.getTimeSlotConditional(activityType, timeSlot);
      const typedActivity = activity as LandActivities | WaterActivities;

      let kidsByActivityChoice: string[] = [];
      if (choiceNum.length > 1) {
        for (let i = 0; i < choiceNum.length; i++) {
          const activityChoices = this.getKidsbyActivityChoice(
            typedActivity,
            activityType,
            choiceNum[i],
            resolvedTimeSlot
          );
          kidsByActivityChoice = kidsByActivityChoice.concat(activityChoices);
        }
      } else {
        kidsByActivityChoice = this.getKidsbyActivityChoice(
          typedActivity,
          activityType,
          choiceNum[0],
          resolvedTimeSlot
        );
      }

      const activityValue = maxOrMin === 'max' ? 1 : 0;
      let activityMaxOrMin: number;

      if (activityType === 'land') {
        const landActivity = activity as LandActivities;
        activityMaxOrMin = Activities.landRanges[landActivity][activityValue];
      } else {
        const waterActivity = activity as WaterActivities;
        activityMaxOrMin = Activities.waterRanges[waterActivity][activityValue];
      }

      let kidsNineAM: string[] = [];
      let kidsTenAM: string[] = [];

      if (maxOrMin === 'max') {
        const randomKids = this.randomChoices(kidsByActivityChoice, activityMaxOrMin * 2);
        kidsNineAM = randomKids.slice(0, activityMaxOrMin);
        kidsTenAM = randomKids.slice(activityMaxOrMin);
      } else if (maxOrMin === 'min') {
        let halfTheKids = Math.ceil(kidsByActivityChoice.length / 2);
        if (
          activityType === 'water' &&
          this.scheduled10amWater.names.length > this.scheduled9amWater.names.length
        ) {
          halfTheKids = Math.ceil(halfTheKids);
        }
        kidsNineAM = kidsByActivityChoice.slice(0, halfTheKids);
        kidsTenAM = kidsByActivityChoice.slice(halfTheKids);
      }

      this.removeFromNotScheduled(kidsNineAM, activityType, typedActivity, '9am');
      this.AddToScheduled(kidsNineAM, activityType, typedActivity, '9am');
      this.removeFromNotScheduled(kidsTenAM, activityType, typedActivity, '10am');
      this.AddToScheduled(kidsTenAM, activityType, typedActivity, '10am');

      if (activityType === 'water') {
        const waterActivity = activity as WaterActivities;
        this.water9am[waterActivity] = kidsNineAM;
        this.water10am[waterActivity] = kidsTenAM;
        this.setKidsTimeSlot(kidsNineAM, waterActivity, 'water9am');
        this.setKidsTimeSlot(kidsTenAM, waterActivity, 'water10am');
      } else {
        const landActivity9am = activity as LandActivities9am;
        const landActivity10am = activity as LandActivities10am;
        this.land9am[landActivity9am] = kidsNineAM;
        this.land10am[landActivity10am] = kidsTenAM;
        this.setKidsTimeSlot(kidsNineAM, landActivity9am, 'land9am');
        this.setKidsTimeSlot(kidsTenAM, landActivity10am, 'land10am');
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
    activity: LandActivities | WaterActivities,
    fromInsufficient: boolean = false
  ): void {
    const randomKids = this.randomChoices(kidsWhoCanReschedule, notScheduledCount);
    const allKidsToSchedule = activityKids.concat(randomKids);
    const activityTimeSlot = (activityType + activityTime) as AllowedActivityTimes;
    this.removeFromNotScheduled(activityKids, activityType, activity, activityTime);
    if (!fromInsufficient) {
      this.AddToScheduled(activityKids, activityType, activity, activityTime);
    }
    this.updateKidsScheduledActivity(randomKids, activity, activityTimeSlot);
    this.setKidsTimeSlot(activityKids, activity, activityTimeSlot);
    if (activityType === 'water') {
      const waterActivity = activity as WaterActivities;
      if (activityTime === '9am') {
        this.water9am[waterActivity] = allKidsToSchedule;
      } else {
        this.water10am[waterActivity] = allKidsToSchedule;
      }
    } else {
      if (activityTime === '9am') {
        const landActivity = activity as LandActivities9am;
        this.land9am[landActivity] = allKidsToSchedule;
      } else {
        const landActivity = activity as LandActivities10am;
        this.land10am[landActivity] = allKidsToSchedule;
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
    const ranges =
      activityType === 'water'
        ? Activities.waterRanges
        : timeSlot === '9am'
          ? Activities.landRanges9am
          : Activities.landRanges10am;
    const minCountQualifier = this.getActivityCountQualifier(maxOrMin, doubleOrSingle);
    for (const [activity, range] of Object.entries(ranges)) {
      const counteChoicesNumber = countedChoices.get(activity);
      if (counteChoicesNumber !== undefined && counteChoicesNumber >= range[minCountQualifier]) {
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
    timeSlot: AllowedTimes
  ): boolean {
    const activitiesAboveSingleMin: string[] = this.getActivities(
      activityType,
      choices,
      maxOrMin,
      'single',
      timeSlot
    );
    if (activitiesAboveSingleMin.length > 0) {
      console.log('Activities above single minimum:', activitiesAboveSingleMin);
      this.scheduleSingleActivities(
        activitiesAboveSingleMin,
        activityType,
        choices,
        maxOrMin,
        timeSlot
      );
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
    timeSlot: AllowedTimes
  ): boolean {
    const activitiesAboveDoubleMin: string[] = this.getActivities(
      activityType,
      choices,
      maxOrMin,
      'double',
      timeSlot
    );
    if (activitiesAboveDoubleMin.length > 0) {
      console.log('Activities above double minimum:', activitiesAboveDoubleMin);
      this.scheduleDoubleActivities(
        activitiesAboveDoubleMin,
        activityType,
        choices,
        maxOrMin,
        timeSlot
      );
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
    timeSlot: AllowedTimes
  ): boolean {
    const activitiesAboveSingleMax: string[] = this.getActivities(
      activityType,
      choices,
      maxOrMin,
      'single',
      timeSlot
    );
    if (activitiesAboveSingleMax.length > 0) {
      console.log('Activities above single maximum:', activitiesAboveSingleMax);
      this.scheduleSingleActivities(
        activitiesAboveSingleMax,
        activityType,
        choices,
        maxOrMin,
        timeSlot
      );
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
    timeSlot: AllowedTimes
  ): boolean {
    const activitiesAboveDoubleMax: string[] = this.getActivities(
      activityType,
      choices,
      maxOrMin,
      'double',
      timeSlot
    );
    if (activitiesAboveDoubleMax.length > 0) {
      console.log('Activities above doulbe maximum:', activitiesAboveDoubleMax);
      this.scheduleDoubleActivities(
        activitiesAboveDoubleMax,
        activityType,
        choices,
        maxOrMin,
        timeSlot
      );
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
    timeSlot: AllowedTimes
  ): boolean {
    let overallSuccess = false;

    for (let i = 1; i <= choices.length; i++) {
      const currentChoices = choices.slice(0, i) as unknown as AllowedChoices;
      let caseSuccess = false;
      const typedActivityType = activityType as AllowedActivityTypes;

      switch (maxOrMinSched) {
        case 'maxOnly':
          caseSuccess = this.scheduleDoubleMax(typedActivityType, currentChoices, 'max', timeSlot);
          if (caseSuccess) console.log(`scheduleDoubleMax ran successfully`);
          break;

        case 'minOnly':
          caseSuccess = this.scheduleDoubleMin(typedActivityType, currentChoices, 'min', timeSlot);
          if (caseSuccess) console.log(`scheduleDoubleMin ran successfully`);
          break;

        case 'bothMinAndMax': {
          // Fix: Wrap this block in curly braces {}
          const maxSuccess = this.scheduleDoubleMax(
            typedActivityType,
            currentChoices,
            'max',
            timeSlot
          );
          const minSuccess = this.scheduleDoubleMin(
            typedActivityType,
            currentChoices,
            'min',
            timeSlot
          );
          caseSuccess = maxSuccess && minSuccess; // Usually you want BOTH to succeed for "both"
          break;
        }
      }

      if (caseSuccess) overallSuccess = true;
    }

    return overallSuccess;
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
    timeSlot: AllowedTimes
  ): boolean {
    let overallSuccess = false;

    for (let i = 1; i <= choices.length; i++) {
      const currentChoices = choices.slice(0, i) as unknown as AllowedChoices;

      let caseSuccess = false;
      const typedActivityType = activityType as AllowedActivityTypes;

      switch (maxOrMinSched) {
        case 'maxOnly':
          caseSuccess = this.scheduleSingleMax(typedActivityType, currentChoices, 'max', timeSlot);
          if (caseSuccess) console.log(`scheduleSingleMax ran successfully`);
          break;

        case 'minOnly':
          caseSuccess = this.scheduleSingleMin(typedActivityType, currentChoices, 'min', timeSlot);
          if (caseSuccess) console.log(`scheduleSingleMin ran successfully`);
          break;

        case 'bothMinAndMax': {
          const maxSuccess = this.scheduleSingleMax(
            typedActivityType,
            currentChoices,
            'max',
            timeSlot
          );
          const minSuccess = this.scheduleSingleMin(
            typedActivityType,
            currentChoices,
            'min',
            timeSlot
          );
          caseSuccess = maxSuccess || minSuccess;
          break;
        }
      }

      if (caseSuccess) overallSuccess = true;
    }

    return overallSuccess;
  }

  /**
   * Get object containing activities that have not yet been scheduled because not enough kids have chosen them.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options -'9am' or '10am'
   * @param {boolean} includeZero - if true, activities that kids haven't chosen will be included in the result.
   * @returns {Object<activity, shortfall from min kids required for activity} - Array of kids names who chose the activity
   */
  private getActivitiesNotEnoughChoices(
    activityType: AllowedActivityTypes,
    timeSlot: Allowed9and10Only,
    includeZero = false
  ): Map<string, number> {
    const notScheduledActivitiesCount = this.countActivityChoices(
      activityType,
      [1, 2, 3],
      timeSlot
    );

    if (!includeZero) {
      const keysToDelete = [];
      for (const [activity, count] of notScheduledActivitiesCount.entries()) {
        if (count === 0) {
          keysToDelete.push(activity);
        }
      }
      // Delete activities with 0 count. This means none of the unscheduled kids have chosen this activity.
      for (const activity of keysToDelete) {
        notScheduledActivitiesCount.delete(activity);
      }
    }

    const shortfall = this.sortActivitiesByShortfall(notScheduledActivitiesCount, activityType);
    return shortfall;
  }

  /**
   * Get kids that are not yet scheduled and have a chosen an activity from an array of activities
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} notScheduledActivities - land or water activities such as 'canoe', 'swim', 'fball' ...
   * @returns {Object<activity, [kids names]} - Array of kids names who chose the activity
   */
  private getNotScheduledKidsBelowMin(
    activityType: AllowedActivityTypes,
    notScheduledActivities: Array<AllActivities>,
    timeSlot: AllowedTimes
  ): object {
    const activityKids: AllLandWaterKids9am10am = {};
    let activity: AllActivities;
    for (activity of notScheduledActivities) {
      activityKids[activity] = [];
      let i: AllowedChoiceNums = 1;
      for (; i <= 3; i++) {
        const kidsActivity = activityKids[activity];
        if (kidsActivity !== undefined) {
          kidsActivity.push(...this.getKidsbyActivityChoice(activity, activityType, i, timeSlot));
        }
      }
    }
    return activityKids;
  }

  private getShortfallCount(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes,
    activity: AllActivities
  ): number {
    const activityTypeTimeSlot = this.getActivityTypeTimeSlot(activityType, timeSlot);
    const range = this.getRange(activityType, timeSlot);

    let typedTimeSlot: string;
    if (activityType === 'water') {
      typedTimeSlot = timeSlot as WaterActivities;
    } else if (activityType === 'land' && timeSlot === '9am') {
      typedTimeSlot = timeSlot as LandActivities9am;
    } else {
      typedTimeSlot = timeSlot as LandActivities10am;
    }

    const targetObj = activityTypeTimeSlot[typedTimeSlot as keyof typeof activityTypeTimeSlot];

    // Fix: Check if targetObj is defined before using 'in' operator
    if (targetObj && this.hasKey(targetObj, activity)) {
      const indexedObj = targetObj as Record<string, { length: number }>;
      return range[activity][0] - indexedObj[activity].length;
    }

    return 0; // Fallback if targetObj is undefined or key doesn't exist
  }

  // Type guard to check if a key exists on an object
  private hasKey<T extends object>(obj: T, key: string | number | symbol): key is keyof T {
    return key in obj;
  }

  private scheduleBelowMinTimeSlot(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes,
    notScheduledActivities: Array<NotScheduledActivities>
  ): Array<NotScheduledActivities> {
    let activity: AllActivities;
    let shortfallCount: number;
    for (const activityObj of notScheduledActivities) {
      if (activityObj.timeSlot === timeSlot) {
        activity = activityObj.activity;
        shortfallCount = activityObj.shortFall;
        const activityKids = this.getNotScheduledKidsBelowMin(activityType, [activity], timeSlot);
        const kidsWhoCanReschedule = this.getKidsWhoCanReschedule(
          activityType,
          activity,
          timeSlot,
          [1, 2, 3]
        );
        if (kidsWhoCanReschedule.length < shortfallCount) {
          break;
        }
        this.scheduleBelowMinActivities(
          kidsWhoCanReschedule,
          shortfallCount,
          activityKids[activity],
          activityType,
          timeSlot,
          activity
        );
        break;
      }
    }
    notScheduledActivities = notScheduledActivities.filter(obj => obj.activity !== activity);
    return notScheduledActivities;
  }

  /**
   * Schedule activities where there are not enough kids to reach the minumum number of kids required.
   * Kids are taken from other activities to reach the minimum number required.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   */
  private scheduleBelowMin(activityType: AllowedActivityTypes, timeSlot: AllowedTimes): void {
    const notScheduledActivitiesCount9am = this.getActivitiesNotEnoughChoices(activityType, '9am');
    const notScheduledActivitiesCount10am = this.getActivitiesNotEnoughChoices(
      activityType,
      '10am'
    );
    let notScheduledActivities: Array<NotScheduledActivities> = [];
    for (const [activity, count] of notScheduledActivitiesCount9am) {
      const activityObj: NotScheduledActivities = {
        activity: activity,
        shortFall: count,
        timeSlot: '9am',
      };
      notScheduledActivities.push(activityObj);
    }
    for (const [activity, count] of notScheduledActivitiesCount10am) {
      const activityObj: NotScheduledActivities = {
        activity: activity,
        shortFall: count,
        timeSlot: '10am',
      };
      notScheduledActivities.push(activityObj);
    }
    while (notScheduledActivities.length > 0) {
      if (activityType === 'water') {
        if (this.scheduled10amWater.names.length >= this.scheduled9amWater.names.length) {
          notScheduledActivities = this.scheduleBelowMinTimeSlot(
            activityType,
            '9am',
            notScheduledActivities
          );
        } else {
          notScheduledActivities = this.scheduleBelowMinTimeSlot(
            activityType,
            '10am',
            notScheduledActivities
          );
        }
      }
      if (activityType === 'land') {
        if (notScheduledActivities[0].timeSlot === '9am') {
          notScheduledActivities = this.scheduleBelowMinTimeSlot(
            activityType,
            '9am',
            notScheduledActivities
          );
        }
        if (notScheduledActivities.length > 0) {
          if (notScheduledActivities[0].timeSlot === '10am') {
            notScheduledActivities = this.scheduleBelowMinTimeSlot(
              activityType,
              '10am',
              notScheduledActivities
            );
          }
        }
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
  private scheduleKids(
    activityType: AllowedActivityTypes,
    activity: WaterActivities | LandActivities,
    timeSlot: AllowedTimes,
    kidsNames: string[]
  ): Int {
    const activityTimeSlot = this.getActivityTypeTimeSlot(activityType, timeSlot);
    const activityRanges =
      activityType === 'water' ? Activities.waterRanges : Activities.landRanges;
    const numOfOpenSlots = activityRanges[activity][1] - activityTimeSlot[activity].length;
    const kidsToSchedule = kidsNames.slice(0, numOfOpenSlots);
    for (const name of kidsToSchedule) {
      activityTimeSlot[activity].push(name);
    }
    this.removeFromNotScheduled(kidsToSchedule, activityType, activity, timeSlot);
    this.AddToScheduled(kidsToSchedule, activityType, activity, timeSlot);
    this.setKidsTimeSlot(kidsToSchedule, activity, activityType + timeSlot);
    // TODO: remove for loop below, it seems to do nothing
    for (const name of kidsToSchedule) {
      const kid = this.schedule.get(name);
    }
    return kidsToSchedule.length;
  }

  /**
   * Add kid to the appropriate not scheduled lists.
   * @param {string} name - name of kid to remove from lists.
   * @param {string} activityType - type of activity to remove from (water or land).
   * @param {string} timeSlot - time slot to remove the kid from (9am or 10am).
   * @returns {void}
   */
  private addKidToNotScheduled(
    name: string,
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes
  ): void {
    const allNames =
      activityType === 'water' ? this.notScheduledAllNamesWater : this.notScheduledAllNamesLand;
    allNames.push(name);
    if (activityType === 'water') {
      if (timeSlot === '9am') {
        this.notScheduled9amWater.names.push(name);
      } else {
        this.notScheduled10amWater.names.push(name);
      }
    }
    if (activityType === 'land') {
      if (timeSlot === '9am') {
        this.notScheduled9amLand.names.push(name);
      } else {
        this.notScheduled10amLand.names.push(name);
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
  private removeKidFromActivity(
    name: string,
    activity: WaterActivities | LandActivities,
    activityType: AllowedActivityTypes,
    timeSlot: Allowed9and10Only
  ): void {
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
  private addKidToActivity(
    name: string,
    activity: WaterActivities | LandActivities,
    activityType: AllowedActivityTypes,
    timeSlot: Allowed9and10Only
  ): void {
    const activityTimeSlot = this.getActivityTypeTimeSlot(activityType, timeSlot);
    activityTimeSlot[activity].push(name);
  }

  /**
   * Wrapper for the methods needed to fully schedule a kid
   * @param {string} name - name of kid to schedule.
   * @param {string} activity - activity to schedule the kid to ('canoe, 'pboard', etc).
   * @param {string} activityType - type of activity to schedule to (water or land).
   * @param {string} timeSlot - time slot to schedule the kid to (9am or 10am).
   * @returns {void}
   */
  private scheduleKid(
    name: string,
    activity: AllActivities,
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes
  ): void {
    this.removeFromNotScheduled([name], activityType, activity, timeSlot);
    this.AddToScheduled([name], activityType, activity, timeSlot);
    this.setKidsTimeSlot([name], activity, activityType + timeSlot);
    this.addKidToActivity(name, activity, activityType, timeSlot);
  }

  private removeKidFromScheduled(
    name: string,
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes
  ): void {
    const scheduledKids = this.getScheduledKidsList(activityType, timeSlot);
    const index = scheduledKids.indexOf(name);
    if (index !== -1) {
      scheduledKids.splice(index, 1);
    }
  }

  /**
   * Wrapper for the methods needed to fully unschedule a kid
   * @param {string} name - name of kid to unschedule.
   * @param {string} activity - activity to unschedule the kid from ('canoe, 'pboard', etc).
   * @param {string} activityType - type of activity to unschedule (water or land).
   * @param {string} timeSlot - time slot to unschedule the kid from (9am or 10am).
   * @returns {void}
   */
  private unScheduleKid(
    name: string,
    activity: WaterActivities | LandActivities,
    activityType: AllowedActivityTypes,
    timeSlot: Allowed9and10Only
  ): void {
    this.setKidsTimeSlot([name], null, activityType + timeSlot);
    this.addKidToNotScheduled(name, activityType, timeSlot);
    this.removeKidFromScheduled(name, activityType, timeSlot);
    this.removeKidFromActivity(name, activity, activityType, timeSlot);
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
    this.unScheduleKid(reScheduleKid, fromActivity, activityType, timeSlot);
    this.scheduleKid(reScheduleKid, toActivity, activityType, timeSlot);
    this.scheduleKid(mainName, activity, activityType, timeSlot);
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
    const notScheduled9am = this.getNotScheduledKidsList(activityType, '9am');
    const notScheduled10am = this.getNotScheduledKidsList(activityType, '10am');
    const scheduledChosenActivities9am = this.removeNotChosenActivitiesFromScheduledNotFull(
      activityType,
      scheduledActivitiesNotFull9am,
      notScheduled9am
    );
    const scheduledChosenActivities10am = this.removeNotChosenActivitiesFromScheduledNotFull(
      activityType,
      scheduledActivitiesNotFull10am,
      notScheduled10am
    );

    // map of activity to array of names e.g. "snork": ["Jones Alice", "Smith Bob"]
    const uniqueChoice9am = this.scheduleTheChosen(
      scheduledChosenActivities9am,
      activityType,
      '9am'
    );
    const uniqueChoice10am = this.scheduleTheChosen(
      scheduledChosenActivities10am,
      activityType,
      '10am'
    );

    let totalKidsCount = 0;
    for (const [activity, names] of uniqueChoice9am) {
      if (uniqueChoice10am.has(activity)) {
        const uniqueNames9am = uniqueChoice9am.get(activity);
        const uniqueNames10am = uniqueChoice10am.get(activity);
        const notInUniqueNames10am = uniqueNames9am.filter(item => !uniqueNames10am.includes(item));
        const notInUniqueNames9am = uniqueNames10am.filter(item => !uniqueNames9am.includes(item));
        if (notInUniqueNames10am.length > 0) {
          const kidsScheduledCount9am = this.scheduleKids(
            activityType,
            activity,
            '9am',
            notInUniqueNames10am
          );
          totalKidsCount += kidsScheduledCount9am;
        }
        if (notInUniqueNames9am.length > 0) {
          const kidsScheduledCount10am = this.scheduleKids(
            activityType,
            activity,
            '10am',
            notInUniqueNames9am
          );
          totalKidsCount += kidsScheduledCount10am;
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
  private scheduleLeastFullByTimeSlot(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes,
    name: string,
    kidsChoices: string[],
    scheduledActivities: Map<string, number>
  ): string {
    let notFullMatch = [];
    for (const choice of kidsChoices) {
      if (scheduledActivities.has(choice)) {
        notFullMatch.push(choice);
      }
    }
    if (notFullMatch.length > 0) {
      notFullMatch = notFullMatch.sort(
        (a, b) => scheduledActivities.get(b) - scheduledActivities.get(a)
      );
    }
    for (const activity of notFullMatch) {
      if (scheduledActivities.get(activity) > 0) {
        const kidsScheduledCount = this.scheduleKids(activityType, notFullMatch[0], timeSlot, [
          name,
        ]);
        return notFullMatch[0];
      }
    }
    return 'no match';
  }

  private scheduleLeastFullLand(
    activityType: AllowedActivityTypes,
    timeSlot: Allowed9and10Only
  ): void {
    const scheduledActivitiesNotFull = this.getScheduledActivitiesNotFull(activityType, timeSlot);
    let notScheduledNames = this.getNotScheduledKidsList(activityType, timeSlot);
    const scheduledChosenActivities = this.removeNotChosenActivitiesFromScheduledNotFull(
      activityType,
      scheduledActivitiesNotFull,
      notScheduledNames
    );
    for (const name of notScheduledNames) {
      const kidsChoices = this.getAllKidsChoicesByActivityType(name, activityType);
      notScheduledNames = this.getNotScheduledKidsList(activityType, timeSlot);
      const matchActivity = this.scheduleLeastFullByTimeSlot(
        activityType,
        timeSlot,
        name,
        kidsChoices,
        scheduledChosenActivities
      );
      if (matchActivity !== 'no match') {
        const activityOpenSlotCount = scheduledChosenActivities.get(matchActivity);
        scheduledChosenActivities.set(matchActivity, activityOpenSlotCount - 1);
      }
    }
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
    // const scheduledChosenActivities9am = this.removeNotChosenActivitiesFromScheduledNotFull(activityType, scheduledActivitiesNotFull9am, this.notScheduledAllNamesWater)
    // const scheduledChosenActivities10am = this.removeNotChosenActivitiesFromScheduledNotFull(activityType, scheduledActivitiesNotFull10am, this.notScheduledAllNamesWater)
    const notScheduled9am = this.getNotScheduledKidsList(activityType, '9am');
    const notScheduled10am = this.getNotScheduledKidsList(activityType, '10am');
    const scheduledChosenActivities9am = this.removeNotChosenActivitiesFromScheduledNotFull(
      activityType,
      scheduledActivitiesNotFull9am,
      notScheduled9am
    );
    const scheduledChosenActivities10am = this.removeNotChosenActivitiesFromScheduledNotFull(
      activityType,
      scheduledActivitiesNotFull10am,
      notScheduled10am
    );

    const notScheduledAllNames =
      activityType === 'water'
        ? [...this.notScheduledAllNamesWater]
        : [...this.notScheduledAllNamesLand];
    for (const name of notScheduledAllNames) {
      const kidsChoices = this.getAllKidsChoicesByActivityType(name, activityType);
      const notScheduled9amNames = this.getNotScheduledKidsList(activityType, '9am');
      const notScheduled10amNames = this.getNotScheduledKidsList(activityType, '10am');
      let currentTimeSlot: Allowed9and10Only = '10am';
      let scheduledChosenActivities = scheduledChosenActivities10am;
      // TODO: Look at the case when water scheduling and 10am names length is > 9am names length
      if (notScheduled9amNames.length >= notScheduled10amNames.length) {
        const matchActivity = this.scheduleLeastFullByTimeSlot(
          activityType,
          currentTimeSlot,
          name,
          kidsChoices,
          scheduledChosenActivities
        );
        if (matchActivity !== 'no match') {
          const activityOpenSlotCount = scheduledChosenActivities9am.get(matchActivity);
          scheduledChosenActivities.set(matchActivity, activityOpenSlotCount - 1);
        } else {
          if (currentTimeSlot === '10am') {
            currentTimeSlot = '9am';
            scheduledChosenActivities = scheduledChosenActivities9am;
          }
          const matchActivity = this.scheduleLeastFullByTimeSlot(
            activityType,
            currentTimeSlot,
            name,
            kidsChoices,
            scheduledChosenActivities
          );
          if (matchActivity !== 'no match') {
            const activityOpenSlotCount = scheduledChosenActivities.get(matchActivity);
            scheduledChosenActivities.set(matchActivity, activityOpenSlotCount - 1);
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
  private getRescheduleMatches(
    names: string[],
    activity: LandActivities | WaterActivities,
    activityType: AllowedActivityTypes,
    timeSlot: Allowed9and10Only,
    choiceNum: 1 | 2 | 3
  ): object {
    const scheduledActivitiesNotFull = this.getScheduledActivitiesNotFull(activityType, timeSlot);
    let fromActivity: LandActivities | WaterActivities;
    let toActivity: LandActivities | WaterActivities;
    for (const name of names) {
      const activityTypeChoice = this.getKidsChoice(activityType, choiceNum);
      const nameChoice = this.kids.choices[name][activityTypeChoice];
      if (nameChoice !== activity && scheduledActivitiesNotFull.has(nameChoice)) {
        return { reScheduleKid: name, fromActivity: activity, toActivity: nameChoice };
      }
    }
    return {};
  }

  private scheduleNoChoicesMatchLand(
    activityType: AllowedActivityTypes,
    timeSlot: Allowed9and10Only
  ): void {
    const notScheduled = timeSlot === '9am' ? this.notScheduled9amLand : this.notScheduled10amLand;
    for (const name of notScheduled.names) {
      const choices = this.getAllKidsChoicesByActivityType(name, activityType);
      let scheduledActivitiesFull = null;
      scheduledActivitiesFull = this.getScheduledActivitiesFull(activityType, timeSlot);
      mainChoiceLoop: for (const choice of choices) {
        if (scheduledActivitiesFull.has(choice)) {
          const activityTypeTimeSlot = this.getActivityTypeTimeSlot(activityType, timeSlot);
          const fullNames = activityTypeTimeSlot[choice];
          for (const choiceNum of [1, 2, 3]) {
            const fullNamesChoices = this.getRescheduleMatches(
              fullNames,
              choice,
              activityType,
              timeSlot,
              choiceNum
            );
            if (fullNamesChoices.hasOwnProperty('reScheduleKid')) {
              const kidToScheduleData = {
                name: name,
                activity: choice,
                activityType: activityType,
                timeSlot: timeSlot,
              };
              this.scheduleNoChoicesMatchesFound(fullNamesChoices, kidToScheduleData);
              break mainChoiceLoop;
            }
          }
        }
      }
    }
  }
  /**
   * Scheduled kids who cannot be scheduled to their chosen activities because no open slots are available.
   * To scheduled them we need to reschedule someone else to make a slot available so that the unscheduled kid(s)
   * can be scheduled to one of their chosen activities.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @returns {void}
   */
  private scheduleNoChoicesMatch(activityType: AllowedActivityTypes): void {
    const notScheduledAllNames =
      activityType === 'land' ? this.notScheduledAllNamesLand : this.notScheduledAllNamesWater;
    const notScheduled9am =
      activityType === 'land' ? this.notScheduled9amLand : this.notScheduled9amWater;
    const notScheduled10am =
      activityType === 'land' ? this.notScheduled10amLand : this.notScheduled10amWater;
    for (const name of notScheduledAllNames) {
      const choices = this.getAllKidsChoicesByActivityType(name, activityType);
      let scheduledActivitiesFull = null;
      let timeSlot: AllowedTimes = '9am';
      if (notScheduled9am.length > notScheduled10am.length) {
        scheduledActivitiesFull = this.getScheduledActivitiesFull(activityType, '9am');
      } else {
        scheduledActivitiesFull = this.getScheduledActivitiesFull(activityType, '10am');
        timeSlot = '10am';
      }
      mainChoiceLoop: for (const choice of choices) {
        if (scheduledActivitiesFull.has(choice)) {
          const activityTypeTimeSlot = this.getActivityTypeTimeSlot(activityType, timeSlot);
          const fullNames = activityTypeTimeSlot[choice];
          for (const choiceNum of [1, 2, 3]) {
            const fullNamesChoices = this.getRescheduleMatches(
              fullNames,
              choice,
              activityType,
              timeSlot,
              choiceNum
            );
            if (fullNamesChoices.hasOwnProperty('reScheduleKid')) {
              const kidToScheduleData = {
                name: name,
                activity: choice,
                activityType: activityType,
                timeSlot: timeSlot,
              };
              this.scheduleNoChoicesMatchesFound(fullNamesChoices, kidToScheduleData);
              break mainChoiceLoop;
            }
          }
        }
      }
    }
  }

  /**
   * Reschedule kids who have been scheduled to an activity but is not enough people to meet
   * the minumim required kids for that activity
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options -'9am' or '10am'
   * @returns {void}
   */
  private scheduleInsufficientlyScheduled(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes
  ): void {
    const insufficientActivities = this.getInsufficientlyScheduledActivites(activityType, timeSlot);
    if (insufficientActivities.length > 0) {
      for (const activity of insufficientActivities) {
        let kidsWhoCanReschedule = this.getKidsWhoCanReschedule(
          activityType,
          activity,
          timeSlot,
          [1, 2, 3],
          true
        );
        if (kidsWhoCanReschedule.length === 0) {
          throw new Error(`${this.kids.count} kids is not enough to run the camp`);
        }
        const shortfallCount = this.getShortfallCount(activityType, timeSlot, activity);
        if (kidsWhoCanReschedule.length > shortfallCount) {
          kidsWhoCanReschedule = this.randomChoices(kidsWhoCanReschedule, shortfallCount);
        }
        const activityTypeTimeSlot = this.getActivityTypeTimeSlot(activityType, timeSlot);
        this.scheduleBelowMinActivities(
          kidsWhoCanReschedule,
          shortfallCount,
          activityTypeTimeSlot[activity],
          activityType,
          timeSlot,
          activity,
          true
        );
      }
    }
  }

  private scheduleSorryNoChoicesTimeSlot(
    name: string,
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes
  ): boolean {
    const scheduledActivitiesNotFull = this.getScheduledActivitiesNotFull(activityType, timeSlot);
    if (scheduledActivitiesNotFull.size === 0) {
      return false;
    }
    const activityList = [...scheduledActivitiesNotFull.keys()];
    const randomActivity = this.randomChoices(activityList, 1)[0];
    this.scheduleKid(name, randomActivity, activityType, timeSlot);
    return true;
  }

  private scheduleSorryNoChoicesLand(activityType: 'land', timeSlot: Allowed9and10Only): void {
    const noChoicesForYou =
      timeSlot === '9am'
        ? [...this.notScheduled9amLand.names]
        : [...this.notScheduled10amLand.names];
    for (const name of noChoicesForYou) {
      if (!this.scheduleSorryNoChoicesTimeSlot(name, activityType, timeSlot)) {
        const activity = this.getActivitiesBelowMin(activityType, timeSlot);
        this.scheduleKid(name, activity, activityType, timeSlot);
      }
    }
    this.scheduleInsufficientlyScheduled(activityType, timeSlot);
  }

  private scheduleSorryNoChoices(activityType: AllowedActivityTypes): void {
    const noChoicesForYou =
      activityType === 'land'
        ? [...this.notScheduledAllNamesLand]
        : [...this.notScheduledAllNamesWater];
    for (const name of noChoicesForYou) {
      const notScheduled9am =
        activityType === 'land' ? this.notScheduled9amLand : this.notScheduled9amWater;
      const notScheduled10am =
        activityType === 'land' ? this.notScheduled10amLand : this.notScheduled10amWater;
      if (notScheduled9am.names.length > notScheduled10am.names.length) {
        if (!this.scheduleSorryNoChoicesTimeSlot(name, activityType, '9am')) {
          const activity = this.getActivitiesBelowMin(activityType, '9am');
          this.scheduleKid(name, activity, activityType, '9am');
        }
      } else {
        if (!this.scheduleSorryNoChoicesTimeSlot(name, activityType, '10am')) {
          const activity = this.getActivitiesBelowMin(activityType, '10am');
          this.scheduleKid(name, activity, activityType, '10am');
        }
      }
    }
    this.scheduleInsufficientlyScheduled(activityType, '9am');
    this.scheduleInsufficientlyScheduled(activityType, '10am');
  }

  /**
   * Print the count of scheduled and not scheduled kids for a given activity type.
   * This reveals if there was correct scheduling for list of names. For e.g the number of
   * kids scheduled for 9am water activities should match those scheduled for 10am land activities.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @returns {void}
   */
  private printNameCounts(activityType: AllowedActivityTypes): void {
    console.log(`\n${activityType.toUpperCase()} LENGTHS TOTALS`);
    console.log('Kids total count / 2 = ', this.kids.count / 2);
    const notScheduledNames9am = this.getNotScheduledKidsList(activityType, '9am', false);
    const scheduledNames9am = this.getScheduledKidsList(activityType, '9am');
    const notScheduledNames10am = this.getNotScheduledKidsList(activityType, '10am', false);
    const scheduledNames10am = this.getScheduledKidsList(activityType, '10am');
    const kidsCount9am =
      activityType === 'water' ? this.kids.count : this.getScheduledKidsList('water', '9am').length;
    const kidsCount10am =
      activityType === 'water'
        ? this.kids.count
        : this.getScheduledKidsList('water', '10am').length;
    const totalNamesLength9am =
      notScheduledNames9am.length + scheduledNames9am.length == kidsCount10am;
    const totalNamesLength10am =
      notScheduledNames10am.length + scheduledNames10am.length == kidsCount9am;
    console.log(
      `${activityType} 9amTotalLength:`,
      totalNamesLength9am,
      '\n${activityType} 10amTotalLength:',
      totalNamesLength10am
    );
    console.log(
      `${activityType} 9am Unscheduled Names Length=`,
      notScheduledNames9am.length,
      `\n${activityType} 9am SCHEDULED Names Length=`,
      scheduledNames9am.length
    );
    console.log(`${activityType} 9am unscheduled plus scheduled = `, totalNamesLength9am);
    console.log(
      `${activityType} 10am Unscheduled Names Length=`,
      notScheduledNames10am.length,
      `\n${activityType} 10am SCHEDULED Names Length=`,
      scheduledNames10am.length
    );
    console.log(`${activityType} 10am unscheduled plus scheduled = `, totalNamesLength10am);
    let totalScheduleCount =
      notScheduledNames9am.length +
      scheduledNames9am.length +
      notScheduledNames10am.length +
      scheduledNames10am.length;
    if (activityType === 'water') totalScheduleCount /= 2;
    console.log(
      `total ${activityType} should be ${this.kids.count}; actual count = `,
      totalScheduleCount
    );
  }

  /**
   * Print activities that have more kids scheduled than the max allowed for that activity, if any.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options -'9am' or '10am'
   * @returns {void}
   */
  private printOverScheduled(activityType: AllowedActivityTypes, timeSlot: AllowedTimes): void {
    const activityTypeTimeSlot = this.getActivityTypeTimeSlot(activityType, timeSlot);
    const ranges = activityType === 'land' ? Activities.landRanges : Activities.waterRanges;
    console.log(`${activityType.toUpperCase()} ${timeSlot.toUpperCase()} OVERSCHEDULED`);
    let overScheduled = false;
    for (const activity of Object.keys(activityTypeTimeSlot)) {
      const activityCount = activityTypeTimeSlot[activity as AllActivities].length;
      const maxRange = ranges[activity as AllActivities][1];
      if (activityCount > maxRange) {
        overScheduled = true;
        console.log(activity, 'has', activityCount, 'kids scheduled, max is', maxRange);
      }
    }
    if (!overScheduled) {
      console.log('No activities over scheduled');
    }
  }

  /**
   * Print activities that have less kids scheduled than the min allowed for that activity, if any.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options -'9am' or '10am'
   * @returns {void}
   */
  private printUnderScheduled(activityType: AllowedActivityTypes, timeSlot: AllowedTimes): void {
    const activityTypeTimeSlot = this.getActivityTypeTimeSlot(activityType, timeSlot);
    const ranges = activityType === 'land' ? Activities.landRanges : Activities.waterRanges;
    console.log(`${activityType.toUpperCase()} ${timeSlot.toUpperCase()} UNDERSCHEDULED`);
    let underScheduled = false;
    for (const activity of Object.keys(activityTypeTimeSlot)) {
      const activityCount = activityTypeTimeSlot[activity as AllActivities].length;
      const minRange = ranges[activity as AllActivities][0];
      if (activityCount < minRange && activityCount > 0) {
        underScheduled = true;
        console.log(activity, 'has', activityCount, 'kids scheduled, min is', minRange);
      }
    }
    if (!underScheduled) {
      console.log('No activities under scheduled');
    }
  }

  /**
   * Print activities that have been scheduled to the wrong activity and time slot, if any.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options -'9am' or '10am'
   * @returns {void}
   */
  private printCorrectActivities(activityType: AllowedActivityTypes, timeSlot: AllowedTimes): void {
    const activityTypeTimeSlot = this.getActivityTypeTimeSlot(activityType, timeSlot);
    const ranges = activityType === 'land' ? Activities.landRanges : Activities.waterRanges;
    console.log(`\nCORRECT ${activityType.toUpperCase()} ${timeSlot.toUpperCase()} ACTIVITIES`);
    const incorrectActivities: AllActivities[] = [];
    for (const activity of Object.keys(activityTypeTimeSlot)) {
      if (!Object.keys(ranges).includes(activity))
        incorrectActivities.push(activity as AllActivities);
    }
    if (incorrectActivities.length > 0)
      console.log(`Incorrect ${activityType} activities: ${incorrectActivities}`);
    else {
      console.log('All correct');
    }
  }

  /**
   * Print unscheduled names and activities.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @param {string} timeSlot - only 2 options -'9am' or '10am'
   * @returns {void}
   */
  private printUnscheduledData(activityType: AllowedActivityTypes): void {
    const notScheduledAllNames =
      activityType === 'land' ? this.notScheduledAllNamesLand : this.notScheduledAllNamesWater;
    const notScheduledNames9am = this.getNotScheduledKidsList(activityType, '9am', false);
    const notScheduledNames10am = this.getNotScheduledKidsList(activityType, '10am', false);
    const notScheduledActivities9am = this.getNotScheduledActivities(activityType, '9am');
    const notScheduledActivities10am = this.getNotScheduledActivities(activityType, '10am');
    console.log(`NOT SCHEDULED ${activityType.toUpperCase()}:`);
    console.log('-------------------');
    console.log(
      `NOT SCHEDULED COUNT ALL NAMES ${activityType.toUpperCase()}: `,
      notScheduledAllNames.length
    );
    console.log(
      `NOT SCHEDULED 9AM ${activityType.toUpperCase()} NAMES: `,
      notScheduledNames9am.length
    );
    console.log(`NOT SCHEDULED 9AM ${activityType.toUpperCase()} ACTIVITIES: `, [
      ...notScheduledActivities9am.keys(),
    ]);
    console.log(
      `NOT SCHEDULED 10AM ${activityType.toUpperCase()} NAMES: `,
      notScheduledNames10am.length
    );
    console.log(`NOT SCHEDULED 10AM ${activityType.toUpperCase()} ACTIVITIES: `, [
      ...notScheduledActivities10am.keys(),
    ]);
    console.log('\n');
  }

  schedulingLog(func_name: string, when: string): void {
    console.log(`\n${when} ${func_name}`);
    this.printUnscheduledData('water');
    this.printUnscheduledData('land');
  }

  private testScheduling(
    activityType: AllowedActivityTypes | 'final log',
    func_name: string
  ): void {
    console.log('\n');
    console.log('______________________________________');
    console.log(`\tENTERING LOGS -- ${activityType}`);
    console.log('--------------------------------------');
    console.log('\tAfter calling', func_name, '\n');

    if (activityType === 'water' || activityType === 'final log') {
      this.printUnscheduledData('water');
    }

    if (activityType === 'land' || activityType === 'final log') {
      this.printUnscheduledData('land');
    }
    // const notScheduledAllNames = activityType === 'water' ? this.notScheduledAllNamesWater : this.notScheduledAllNamesLand;
    const totalKidsCountWater = this.kids.count - this.notScheduledAllNamesWater.length;
    const totalKidsCountLand = this.kids.count - this.notScheduledAllNamesLand.length;

    let waterTotalCount = 0;
    let water9amTotalCount = 0;
    let water10amTotalCount = 0;
    const unscheduleKids = [];
    const water9amActivityCount = {
      fish: 0,
      pboard: 0,
      snork: 0,
      canoe: 0,
      kayak: 0,
      sail: 0,
      swim: 0,
    };
    const water10amActivityCount = {
      fish: 0,
      pboard: 0,
      snork: 0,
      canoe: 0,
      kayak: 0,
      sail: 0,
      swim: 0,
    };
    for (const name of this.kids.names) {
      const timeSlots = this.schedule.get(name);
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
        unscheduleKids.push({ name: name, timeSlot: timeSlots.timeSlots });
      }
    }

    waterTotalCount = water9amTotalCount + water10amTotalCount;

    const water9amActivityCountAlt = {
      fish: 0,
      pboard: 0,
      snork: 0,
      canoe: 0,
      kayak: 0,
      sail: 0,
      swim: 0,
    };
    const water10amActivityCountAlt = {
      fish: 0,
      pboard: 0,
      snork: 0,
      canoe: 0,
      kayak: 0,
      sail: 0,
      swim: 0,
    };
    for (const activity in this.water9am) {
      water9amActivityCountAlt[activity] = this.water9am[activity].length;
    }
    for (const activity in this.water9am) {
      water10amActivityCountAlt[activity] = this.water10am[activity].length;
    }

    const keys1 = Object.keys(water9amActivityCountAlt).sort();
    const keys2 = Object.keys(water9amActivityCount).sort();
    const equalObjects9am = keys1.every(
      (key, index) =>
        key === keys2[index] && water9amActivityCountAlt[key] === water9amActivityCount[key]
    );
    if (activityType === 'water' || activityType === 'final log') {
      if (equalObjects9am) {
        console.log('WATER 9AM objects ARE EQUAL');
      } else {
        console.log('WATER 9AM objects ARE not EQUAL!');
      }
    }

    const keys1a = Object.keys(water10amActivityCountAlt).sort();
    const keys2a = Object.keys(water10amActivityCount).sort();
    const equalObjects10am = keys1a.every(
      (key, index) =>
        key === keys2a[index] && water10amActivityCountAlt[key] === water10amActivityCount[key]
    );
    if (activityType === 'water' || activityType === 'final log') {
      if (equalObjects10am) {
        console.log('WATER 10AM objects ARE EQUAL');
      } else {
        console.log('WATER 10AM objects ARE not EQUAL!');
      }
    }

    let landTotalCount = 0;
    let land9amTotalCount = 0;
    let land10amTotalCount = 0;
    const unscheduleKidsLand = [];
    const land9amActivityCount = { art: 0, hike: 0, bball: 0, cheer: 0, soc: 0, vball: 0, arch: 0 };
    const land10amActivityCount = {
      fris: 0,
      art: 0,
      hike: 0,
      pball: 0,
      fball: 0,
      lax: 0,
      yoga: 0,
      arch: 0,
    };

    for (const name of this.kids.names) {
      const timeSlots = this.schedule.get(name);
      if (timeSlots.timeSlots.land9am) {
        land9amActivityCount[timeSlots.timeSlots.land9am] += 1;
        land9amTotalCount += 1;
      }
      if (timeSlots.timeSlots.land10am) {
        land10amActivityCount[timeSlots.timeSlots.land10am] += 1;
        land10amTotalCount += 1;
      }
      let nullCount = 0;
      for (const time in timeSlots.timeSlots) {
        if (timeSlots.timeSlots[time] === null) {
          nullCount += 1;
        }
      }
      if (nullCount === 4) {
        unscheduleKids.push({ name: name, timeSlot: timeSlots.timeSlots });
      }
    }

    landTotalCount = land9amTotalCount + land10amTotalCount;

    const land9amActivityCountAlt = {
      art: 0,
      hike: 0,
      bball: 0,
      cheer: 0,
      soc: 0,
      vball: 0,
      arch: 0,
    };
    const land10amActivityCountAlt = {
      fris: 0,
      art: 0,
      hike: 0,
      pball: 0,
      fball: 0,
      lax: 0,
      yoga: 0,
      arch: 0,
    };
    for (const activity in this.land9am) {
      land9amActivityCountAlt[activity] = this.land9am[activity].length;
    }
    for (const activity in this.land10am) {
      land10amActivityCountAlt[activity] = this.land10am[activity].length;
    }

    const keys1Land = Object.keys(land9amActivityCountAlt).sort();
    const keys2Land = Object.keys(land9amActivityCount).sort();
    const equalObjects9amLand = keys1Land.every(
      (key, index) =>
        key === keys2Land[index] && land9amActivityCountAlt[key] === land9amActivityCount[key]
    );
    if (activityType === 'land' || activityType === 'final log') {
      if (equalObjects9amLand) {
        console.log('LAND 9AM objects ARE EQUAL');
      } else {
        console.log('LAND 9AM objects ARE not EQUAL!');
      }
    }

    const keys1aLand = Object.keys(land10amActivityCountAlt).sort();
    const keys2aLand = Object.keys(land10amActivityCount).sort();
    const equalObjects10amLand = keys1aLand.every(
      (key, index) =>
        key === keys2aLand[index] && land10amActivityCountAlt[key] === land10amActivityCount[key]
    );
    if (activityType === 'land' || activityType === 'final log') {
      if (equalObjects10amLand) {
        console.log('LAND 10AM objects ARE EQUAL');
      } else {
        console.log('LAND 10AM objects ARE not EQUAL!');
      }
    }

    if (activityType === 'water' || activityType === 'final log') {
      this.printNameCounts('water');
    }

    if (activityType === 'land' || activityType === 'final log') {
      this.printNameCounts('land');
    }

    if (activityType === 'water' || activityType === 'final log') {
      this.printCorrectActivities('water', '9am');
      this.printCorrectActivities('water', '10am');
    }
    if (activityType === 'land' || activityType === 'final log') {
      this.printCorrectActivities('land', '9am');
      this.printCorrectActivities('land', '10am');
    }

    if (activityType === 'water' || activityType === 'final log') {
      this.printOverScheduled('water', '9am');
      this.printOverScheduled('water', '10am');
    }
    if (activityType === 'land' || activityType === 'final log') {
      this.printOverScheduled('land', '9am');
      this.printOverScheduled('land', '10am');
    }

    if (activityType === 'water' || activityType === 'final log') {
      this.printUnderScheduled('water', '9am');
      this.printUnderScheduled('water', '10am');
    }
    if (activityType === 'land' || activityType === 'final log') {
      this.printUnderScheduled('land', '9am');
      this.printUnderScheduled('land', '10am');
    }

    if (activityType === 'water' || activityType === 'final log') {
      console.log('\nWater totals:');
      if (waterTotalCount !== totalKidsCountWater) {
        console.log(
          'Water Scheduled # mismatch. this.Kids.timeSlots != this.kids.totalKidsCount: '
        );
        console.log(waterTotalCount, '!==', totalKidsCountWater);
      } else {
        console.log('Land Scheduled # MATCHES: this.Kids.timeSlots == this.kids.totalKidsCount: ');
        console.log(waterTotalCount, '==', totalKidsCountWater);
      }
    }

    if (activityType === 'land' || activityType === 'final log') {
      console.log('\nLand totals:');
      if (landTotalCount !== totalKidsCountLand) {
        console.log(
          '\n\nLand Scheduled # mismatch. this.Kids.timeSlots != this.kids.totalKidsCount: '
        );
        console.log(landTotalCount, '!==', totalKidsCountLand);
      } else {
        console.log('Land Scheduled # MATCHES:  this.Kids.timeSlots == this.kids.totalKidsCount: ');
        console.log(landTotalCount, '==', totalKidsCountLand);
      }
    }

    if (func_name == 'end log') {
      console.log('\nTOTAL KIDS NOT SCHEDULED Water:', this.kids.count - totalKidsCountWater);
      console.log('\nTOTAL KIDS NOT SCHEDULED Land:', this.kids.count - totalKidsCountLand);
      for (const kid of unscheduleKids) {
        console.log(kid);
      }

      const allNotInTarget = this.notScheduled9amWater.names.every(
        element => !this.notScheduled10amWater.names.includes(element)
      );
      console.log(
        'this.notScheduled9amWater.names !== this.notScheduled10amWater.names:',
        allNotInTarget
      );
      const allNamesEmpty = this.notScheduledAllNamesWater.length === 0;
      console.log('this.notScheduledAllNamesWater.length === 0:', allNamesEmpty);
    }

    if (func_name == 'end log') {
      const notFullyScheduledWater9am = this.getInsufficientlyScheduledActivites('water', '9am');
      const notFullyScheduledWater10am = this.getInsufficientlyScheduledActivites('water', '10am');
      const notFullyScheduledLand9am = this.getInsufficientlyScheduledActivites('land', '9am');
      const notFullyScheduledLand10am = this.getInsufficientlyScheduledActivites('land', '10am');
      console.log('NOT FULLY SCHEDULED ACTIVITIES');
      console.log('Water 9am:', notFullyScheduledWater9am);
      console.log('Water 10am:', notFullyScheduledWater10am);
      console.log('Land 9am:', notFullyScheduledLand9am);
      console.log('Land 10am:', notFullyScheduledLand10am);
      console.log('\n\nSCHEDULED LISTS -- FINAL REPORT');
      const oppositesEqualWaterString =
        JSON.stringify(this.notScheduled9amWater.names.sort()) ===
        JSON.stringify(this.scheduled10amWater.names.sort());
      const oppositesEqualWaterString2 =
        JSON.stringify(this.notScheduled9amWater.names.sort()) ===
        JSON.stringify(this.scheduled10amWater.names.sort());
      console.log(
        'STRINGIFY COMPARE WATER notScheduled9amWater.names == scheduled10amWater.names:',
        oppositesEqualWaterString
      );
      console.log(
        'STRINGIFY COMPARE WATER notScheduled10amWater.names == scheduled9amWater.names:',
        oppositesEqualWaterString2
      );

      console.log('\nWater and Land opposite times should equal');
      const EqualWaterString =
        JSON.stringify(this.scheduled9amWater.names.sort()) ===
        JSON.stringify(this.scheduled10amLand.names.sort());
      const EqualWaterString2 =
        JSON.stringify(this.scheduled10amWater.names.sort()) ===
        JSON.stringify(this.scheduled9amLand.names.sort());
      console.log(
        'STRINGIFY COMPARE WATER to LAND this.scheduled9amWater.names == this.scheduled10amLand.names:',
        EqualWaterString
      );
      console.log(
        'STRINGIFY COMPARE WATER to Land this.scheduled10amWater.names == this.scheduled9amLand.names:',
        EqualWaterString2
      );
    }
  }

  /**
   * Tests that the number of unscheduled kids and activities matches the number of scheduled kids and activities for a given activity type and time slot.
   * @param {AllowedActivityTypes} activityType - only 2 options: 'land' or 'water'.
   * @param {AllowedTimes} timeSlot - only 2 options: '9am' or '10am'.
   * @returns {boolean} - true if the number of unscheduled kids and activities matches the number of scheduled kids and activities, false otherwise.
   */
  private testUnscheduledToScheduledActivityTypeTime(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes
  ): boolean {
    const allNames =
      activityType === 'land' ? this.notScheduledAllNamesLand : this.notScheduledAllNamesWater;
    const scheduledTimeNames = this.getScheduledKidsList(activityType, timeSlot);
    const scheduledActivities = this.getScheduledActivitiesList(activityType, timeSlot);
    const notScheduledTimeNames = this.getNotScheduledKidsList(activityType, timeSlot, false);
    const notScheduledActivities = this.getNotScheduledActivitiesList(activityType, timeSlot);
    if (activityType === 'water') {
      // Unscheduled kids list length and scheduled kids list length should add up to total amount of kids that need to be scheduled
      const scheduledAndNotScheduledCompareToAllNames =
        scheduledTimeNames.length + notScheduledTimeNames.length === this.kids.count;
      if (!scheduledAndNotScheduledCompareToAllNames) {
        console.log(
          `Water scheduled names (${scheduledTimeNames.length}) + not scheduled names (${notScheduledTimeNames.length}) does not equal total kids count (${this.kids.count})`
        );
        return false;
      }
    }

    // The kids names in the unscheduled list should never be found in the scheduled list
    const scheduledKidsInUnscheduleKidsList = scheduledTimeNames.every(name =>
      notScheduledTimeNames.includes(name)
    );
    if (scheduledKidsInUnscheduleKidsList) {
      console.log(
        `At least one Scheduled kid (${scheduledTimeNames.length}) is in the unscheduled kids list (${notScheduledTimeNames.length})`
      );
      return false;
    }

    // The kids names in the unscheduled list should never be found in the scheduled list
    const scheduledActivitiesNotInUnscheduleActivitiesList = scheduledActivities.some(name =>
      notScheduledActivities.includes(name)
    );
    if (scheduledActivitiesNotInUnscheduleActivitiesList) {
      console.log(
        `At least one Scheduled activity (${scheduledActivities.length}) is in the unscheduled activities list (${notScheduledActivities.length})`
      );
      return false;
    }
    return true;
  }

  private testUnscheduledToScheduled(): boolean {
    const validScheduleWater9am: boolean = this.testUnscheduledToScheduledActivityTypeTime(
      'water',
      '9am'
    );
    const validScheduleWater10am: boolean = this.testUnscheduledToScheduledActivityTypeTime(
      'water',
      '10am'
    );
    const validScheduleLand9am: boolean = this.testUnscheduledToScheduledActivityTypeTime(
      'land',
      '9am'
    );
    const validScheduleLand10am: boolean = this.testUnscheduledToScheduledActivityTypeTime(
      'land',
      '10am'
    );
    const allScheduleTests: boolean[] = [
      validScheduleWater9am,
      validScheduleWater10am,
      validScheduleLand9am,
      validScheduleLand10am,
    ];
    const result = allScheduleTests.every(test => test === true);
    if (!result) {
      throw new Error(
        'Unscheduled kids & activities count to scheduled kids & activities mismatch.'
      );
    }
    return result;
  }

  /**
   * Get the percentage of kids who got the activity they wanted for their 1st, 2nd, 3rd or no choices.
   * @param {string} activityType - only 2 options: 'land' or 'water'.
   * @returns {void}
   */
  private calculateChoicesPercentages(activityType: AllowedActivityTypes): boolean {
    const firstChoices9am: string[] = this.getScheduledChoicesNames(activityType, '9am', 1);
    const firstChoices10am: string[] = this.getScheduledChoicesNames(activityType, '10am', 1);
    const secondChoices9am: string[] = this.getScheduledChoicesNames(activityType, '9am', 2);
    const secondChoices10am: string[] = this.getScheduledChoicesNames(activityType, '10am', 2);
    const thirdChoices9am: string[] = this.getScheduledChoicesNames(activityType, '9am', 3);
    const thirdChoices10am: string[] = this.getScheduledChoicesNames(activityType, '10am', 3);
    const noChoices: string[] = this.kids.names.filter(
      item =>
        ![
          ...firstChoices9am,
          ...firstChoices10am,
          ...secondChoices9am,
          ...secondChoices10am,
          ...thirdChoices9am,
          ...thirdChoices10am,
        ].includes(item)
    );

    const firstChoicesPercentDecimal =
      ((firstChoices9am.length + firstChoices10am.length) / this.kids.count) * 100;
    const secondChoicesPercentDecimal =
      ((secondChoices9am.length + secondChoices10am.length) / this.kids.count) * 100;
    const thirdChoicesPercentDecimal =
      ((thirdChoices9am.length + thirdChoices10am.length) / this.kids.count) * 100;
    const noChoicesPercentDecimal = (noChoices.length / this.kids.count) * 100;

    const AllPercentages: number[] = [];
    const firstChoicesPercent: number = Math.round(firstChoicesPercentDecimal);
    const firstChoicesRemainder: number = Math.abs(firstChoicesPercentDecimal % 1);
    AllPercentages.push(firstChoicesPercent);
    const secondChoicesPercent: number = Math.round(secondChoicesPercentDecimal);
    const secondChoicesRemainder: number = Math.abs(secondChoicesPercentDecimal % 1);
    AllPercentages.push(secondChoicesPercent);
    const thirdChoicesPercent: number = Math.round(thirdChoicesPercentDecimal);
    const thirdChoicesRemainder: number = Math.abs(thirdChoicesPercentDecimal % 1);
    AllPercentages.push(thirdChoicesPercent);
    const noChoicesPercent: number = Math.round(noChoicesPercentDecimal);
    const noChoicesRemainder: number = Math.abs(noChoicesPercentDecimal % 1);
    AllPercentages.push(noChoicesPercent);

    const totalPercent: number =
      firstChoicesPercent + secondChoicesPercent + thirdChoicesPercent + noChoicesPercent;

    if (totalPercent === 99) {
      let greatestRemainder = firstChoicesRemainder;
      let greatestRemainderIndex = 0;
      let index = 0;
      const AllRemainders: number[] = [
        firstChoicesRemainder,
        secondChoicesRemainder,
        thirdChoicesRemainder,
        noChoicesRemainder,
      ];
      for (const remainder of AllRemainders) {
        // Find the largest remainder so we can add the missing percent to that bucket
        if (remainder > greatestRemainder) {
          greatestRemainder = remainder;
          greatestRemainderIndex = index;
        }
        index++;
      }
      AllPercentages[greatestRemainderIndex] += 1;
    }

    if (totalPercent === 101) {
      let greatestRemainder = firstChoicesRemainder;
      let greatestRemainderIndex = 0;
      let index = 0;
      const AllRemainders: number[] = [
        firstChoicesRemainder,
        secondChoicesRemainder,
        thirdChoicesRemainder,
        noChoicesRemainder,
      ];
      for (const remainder of AllRemainders) {
        if (remainder > greatestRemainder) {
          greatestRemainder = remainder;
          greatestRemainderIndex = index;
        }
        index++;
      }
      AllPercentages[greatestRemainderIndex] -= 1;
      if (
        AllPercentages.reduce((accumulator, currentValue) => accumulator + currentValue, 0) !== 100
      ) {
        throw new Error('Percentages do not add up to 100%');
      }
    }

    if (AllPercentages.length > 4) {
      console.log('take a looksy');
    }

    if (activityType === 'land') {
      this.landPercentages = AllPercentages;
    } else {
      this.waterPercentages = AllPercentages;
    }
    return true;
  }

  /**
   * Get the land and water percentages of scheduled kids.
   * @returns {object}
   */
  private stats(): boolean {
    const landTrue = this.calculateChoicesPercentages('land');
    const waterTrue = this.calculateChoicesPercentages('water');
    return landTrue && waterTrue;
  }

  runAlgo(): boolean {
    this.isLandFirst = false;
    console.log(`${this.algo} algorithm initiated`);
    this.schedulingLog('any scheduling', 'before');

    // SCHEDULE WATER ACTIVITIES
    const waterMethods = [
      this.scheduleDoubles.bind(this), // only water activities can be scheduled as doubles
      this.scheduleSingles.bind(this),
      this.scheduleBelowMin.bind(this),
      this.scheduleUniques.bind(this),
      this.scheduleLeastFull.bind(this),
      this.scheduleNoChoicesMatch.bind(this),
      this.scheduleSorryNoChoices.bind(this),
    ];

    const waterMethodArgs = [
      ['water', [1, 2, 3], 'bothMinAndMax', 'both'],
      ['water', [1, 2, 3], 'bothMinAndMax', 'both'],
      ['water', 'both'],
      ['water'],
      ['water'],
      ['water'],
      ['water'],
    ];

    for (let i = 0; i < waterMethods.length; i++) {
      console.log('ENTERING: ' + waterMethods[i].name + '()');
      waterMethods[i](...waterMethodArgs[i]);
      this.testScheduling('water', waterMethods[i].name + '()');
    }

    // SCHEDULE LAND ACTIVITIES
    this.notScheduled9amLand.names = [...this.scheduled10amWater.names];
    this.notScheduled10amLand.names = [...this.scheduled9amWater.names];

    const landMethods = [
      this.scheduleSingles.bind(this),
      this.scheduleSingles.bind(this),
      this.scheduleBelowMin.bind(this),
      this.scheduleUniques.bind(this),
      this.scheduleLeastFullLand.bind(this),
      this.scheduleLeastFullLand.bind(this),
      this.scheduleNoChoicesMatchLand.bind(this),
      this.scheduleNoChoicesMatchLand.bind(this),
      this.scheduleSorryNoChoicesLand.bind(this),
      this.scheduleSorryNoChoicesLand.bind(this),
    ];

    const landMethodArgs = [
      ['land', [1, 2, 3], 'bothMinAndMax', '9am'],
      ['land', [1, 2, 3], 'bothMinAndMax', '10am'],
      ['land', '9am'],
      ['land'],
      ['land', '9am'],
      ['land', '10am'],
      ['land', '9am'],
      ['land', '10am'],
      ['land', '9am'],
      ['land', '10am'],
    ];

    for (let i = 0; i < landMethods.length; i++) {
      console.log('ENTERING: ' + landMethods[i].name + '()');
      landMethods[i](...landMethodArgs[i]);
      this.testScheduling('land', landMethods[i].name + '()');
    }

    this.testScheduling('final log', 'end log');

    // TODO: use the return results of this.stats() to add to the allScheduleTests checks.this.stats()
    this.stats();
    return this.testUnscheduledToScheduled();
  }
}
