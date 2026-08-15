import { Activities } from './activities';
import { AllActivities, AllowedActivityTimes, AllowedActivityTypes, AllowedTimes, Allowed9and10Only, WaterActivities, LandActivities9am, LandActivities10am } from '../types/schedule-types'
import { WaterActivities0Count, LandActivities9am0Count, LandActivities10am0Count } from '../types/camp-types';
import type { Schedule } from './schedule'
import { UnscheduledKids } from '../types/kids-types';

export class ScheduleChecker {
  schedule: Schedule
  waterTotalCount: number
  landTotalCount: number
  unscheduledKids: UnscheduledKids[]
  water9amActivityTimeSlotsCount: WaterActivities0Count;
  water10amActivityTimeSlotsCount: WaterActivities0Count;
  water9amWaterActivityCount: WaterActivities0Count;
  water10amWaterActivityCount: WaterActivities0Count;
  land9amActivityTimeSlotsCount: LandActivities9am0Count
  land10amActivityTimeSlotsCount: LandActivities10am0Count
  land9amLandActivityCount: LandActivities9am0Count
  land10amLandActivityCount:LandActivities10am0Count

  constructor(schedule: Schedule) {
    this.schedule = schedule
    this.waterTotalCount = 0;
    this.landTotalCount = 0;
    this.unscheduledKids = []; // all kids should be schedule - so this should remain empty for a valid run
    this.water9amActivityTimeSlotsCount = structuredClone(Activities.waterActivities0Count);
    this.water10amActivityTimeSlotsCount = structuredClone(Activities.waterActivities0Count);
    this.water9amWaterActivityCount = structuredClone(Activities.waterActivities0Count);
    this.water10amWaterActivityCount = structuredClone(Activities.waterActivities0Count);
    this.land9amActivityTimeSlotsCount = structuredClone(Activities.land9amActivities0Count);
    this.land10amActivityTimeSlotsCount = structuredClone(Activities.land10amActivities0Count);
    this.land9amLandActivityCount = structuredClone(Activities.land9amActivities0Count);
    this.land10amLandActivityCount = structuredClone(Activities.land10amActivities0Count);
  }

  /**
   * Count how many kids are assigned to each water activity via WaterActivities data.
   * Count how many kids total are assigned to water activities.
   * Add kids to unscheduled list if someone hasn't been scheduled.
   */
  createWaterActivityData(): void {
    for (const activity in this.schedule.water9am) {
      const typedActivity = activity as WaterActivities;
      this.water9amWaterActivityCount[typedActivity] = this.schedule.water9am[typedActivity].length;
    }
    for (const activity in this.schedule.water10am) {
      const typedActivity = activity as WaterActivities;
      this.water10amWaterActivityCount[typedActivity] = this.schedule.water10am[typedActivity].length;
    }
  }

  /**
   * Count how many kids are assigned to each land activity via WaterActivities data.
   * Count how many kids total are assigned to land activities.
   * Add kids to unscheduled list if someone hasn't been scheduled.
   */
  createLandActivityData(): void {
    for (const activity in this.schedule.land9am) {
      const typedActivity = activity as LandActivities9am;
      this.land9amLandActivityCount[typedActivity] = this.schedule.land9am[typedActivity].length;
    }
    for (const activity in this.schedule.land10am) {
      const typedActivity = activity as LandActivities10am;
      this.land10amLandActivityCount[activity] = this.schedule.land10am[typedActivity].length;
    }
  }

  /**
   * Count how many kids are assigned to each water or land activity via timeSlots data.
   * Count how many kids total are assigned to water activities.
   * Add kids to unscheduled list if someone hasn't been scheduled.
   */
  createTimeSlotsData(activityType: AllowedActivityTypes): void {
    for (const name of this.schedule.kids.names) {
      const timeSlots = this.schedule.schedule.get(name);
      if (timeSlots !== undefined) {
        const timeSlotActivityType9am = activityType === 'water' ? timeSlots.timeSlots.water9am : timeSlots.timeSlots.land9am;
        const timeSlotActivityType10am = activityType === 'water' ? timeSlots.timeSlots.water10am : timeSlots.timeSlots.land10am;
        let totalCount = activityType === 'water' ? this.waterTotalCount : this.landTotalCount;
        const timeSlotsCount9am = activityType === 'water' ? this.water9amActivityTimeSlotsCount as WaterActivities0Count : this.land9amActivityTimeSlotsCount as LandActivities9am0Count
        const timeSlotsCount10am = activityType === 'water' ? this.water10amActivityTimeSlotsCount as WaterActivities0Count : this.land10amActivityTimeSlotsCount as LandActivities10am0Count
        if (timeSlotActivityType9am) {
          timeSlotsCount9am[timeSlotActivityType9am] += 1;
          totalCount += 1;
        }
        if (timeSlotActivityType10am) {
          timeSlotsCount10am
            [timeSlotActivityType10am] += 1; totalCount += 1;
        }
        let nullCount = 0;
        if (timeSlots.timeSlots.water9am === null) {
          nullCount += 1;
        }
        if (timeSlots.timeSlots.water10am === null) {
          nullCount += 1;
        }
        if (timeSlots.timeSlots.land9am === null) {
          nullCount += 1;
        }
        if (timeSlots.timeSlots.land10am === null) {
          nullCount += 1;
        }
        if (nullCount === 4) {
          this.unscheduledKids.push({ name: name, timeSlot: timeSlots.timeSlots });
        }
      }
    }
  }

  /**
   * Get the right activityCount object. This function stops us having to create
   * compareEqualObjects() function 4 different times.
   * @param activityType 'water' or 'land'
   * @param activityTime '9am' or '10am'
   * @param objectType 'activityCount' or 'timeSlotsCount'
   * @returns activityCount object
   */
  private getActivityCountObject(
    activityType: AllowedActivityTypes,
    activityTime: Allowed9and10Only,
    objectType: any
    ): any {
    if (activityTime === '9am') {
      if (activityType === 'water') {
        if (objectType === 'activityCount') {
          return this.water9amWaterActivityCount
        } else {
          return this.water9amActivityTimeSlotsCount
        }
      } else {
        if (objectType === 'activityCount') {
          return "tbd"
        }
      }
    }

    if (activityTime === '10am') {
      if (activityType === 'water') {
        if (objectType === 'activityCount') {
          return this.water10amWaterActivityCount
        } else {
          return this.water10amActivityTimeSlotsCount
        }
      } else {
        if (objectType === 'activityCount') {
          return "tbd"
        }
      }
    }
  }

  /**
   * Compare activities counts from the 2 different ways of counting them.
   * @returns {boolean} equalObjects9amWater
   */
  compareEqualObjects(activityType: AllowedActivityTypes, activityTime: Allowed9and10Only): boolean {
    const activityCount = this.getActivityCountObject(activityType, activityTime, 'activityCount')
    const timeSlotsCount = this.getActivityCountObject(activityType, activityTime, 'timeSlotsCount')
    const keys1 = Object.keys(activityCount).sort();
    const keys2 = Object.keys(timeSlotsCount).sort();
    const equalObjects = keys1.every(
      (key, index) =>
        key === keys2[index] &&
        activityCount[key as WaterActivities] ===
        timeSlotsCount[key as WaterActivities]
    );
    return equalObjects
  }

    /**
     * Print activities that have less kids scheduled than the min allowed for that activity, if any.
     * @param {string} activityType - only 2 options: 'land' or 'water'.
     * @param {string} timeSlot - only 2 options -'9am' or '10am'
     * @returns {void}
     */
    checkUnderScheduled(activityType: AllowedActivityTypes, timeSlot: AllowedTimes): boolean {
      const activityTypeTimeSlot = this.schedule.getActivityTypeTimeSlot(activityType, timeSlot);
      const typedActivityTypeTimeSlot = activityTypeTimeSlot as Record<string, string[]>;
      const ranges = activityType === 'land' ? Activities.landRanges : Activities.waterRanges;
      let underScheduled = false;
      for (const activity of Object.keys(typedActivityTypeTimeSlot)) {
        const activityCount = typedActivityTypeTimeSlot[activity].length;
        const minRange = ranges[activity as AllActivities][0];
        if (activityCount < minRange && activityCount > 0) {
          underScheduled = true;
        }
      }
      if (!underScheduled) {
        return true;
      }
      return false;
    }

  /**
   * Checks if kids choices percentages are invalid.
   * If any of the  percentage have been set to -1 previously it means they are invalid.
   * @returns {boolean}
   */
  checkPercentages(): boolean {;
  if (this.schedule.landPercentages.some(x => x  === -1)) {
    return false
  }
    if (this.schedule.waterPercentages.every(x => x === 0) || this.schedule.landPercentages.every(x => x === 0)) {
      return false
    }
    return true
    }

  /**
   * Checks that the number of unscheduled kids and activities matches the number of scheduled kids and activities for a given activity type and time slot.
   * @param {AllowedActivityTypes} activityType - only 2 options: 'land' or 'water'.
   * @param {AllowedTimes} timeSlot - only 2 options: '9am' or '10am'.
   * @returns {boolean} - true if the number of unscheduled kids and activities matches the number of scheduled kids and activities, false otherwise.
   */
  private checkUnscheduledToScheduledActivityTypeTime(
    activityType: AllowedActivityTypes,
    timeSlot: AllowedTimes,
  ): boolean {
    const scheduledTimeNames = this.schedule.getScheduledKidsList(activityType, timeSlot);
    const scheduledActivities = this.schedule.getScheduledActivitiesList(activityType, timeSlot);
    const notScheduledTimeNames = this.schedule.getNotScheduledKidsList(activityType, timeSlot, false);
    const notScheduledActivities = this.schedule.getNotScheduledActivitiesList(activityType, timeSlot);
    if (activityType === 'water') {
      // Unscheduled kids list length and scheduled kids list length should add up to total amount of kids that need to be scheduled
      const scheduledAndNotScheduledCompareToAllNames =
        scheduledTimeNames.length + notScheduledTimeNames.length === this.schedule.kids.count;
      if (!scheduledAndNotScheduledCompareToAllNames) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(
            `Water scheduled names (${scheduledTimeNames.length}) + not scheduled names (${notScheduledTimeNames.length}) does not equal total kids count (${this.schedule.kids.count})`
          );

        }
        return false;
      }
    }

    // The kids names in the unscheduled list should never be found in the scheduled list
    const scheduledKidsInUnscheduleKidsList = scheduledTimeNames.some(name =>
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

  checkUnscheduledToScheduled(): boolean {
    const allScheduleChecks: boolean[] = [
      this.checkUnscheduledToScheduledActivityTypeTime('water', '9am'),
      this.checkUnscheduledToScheduledActivityTypeTime('water', '10am'),
      this.checkUnscheduledToScheduledActivityTypeTime('land', '9am'),
      this.checkUnscheduledToScheduledActivityTypeTime('land', '10am'),
    ];

    const result = allScheduleChecks.every(check => check === true);

    if (!result && process.env.NODE_ENV !== 'production') {
      console.log('Unscheduled kids & activities count to scheduled kids & activities mismatch.');
    }

    return result;
  }
}
